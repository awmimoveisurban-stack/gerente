-- =====================================================
-- SISTEMA DE AUTOMAÇÃO - REGRAS E REDISTRIBUIÇÃO
-- Criado: 2025-10-12
-- Objetivo: Automação de redistribuição de leads e regras de performance
-- =====================================================

-- ============================================
-- 1. TABELA DE REGRAS DE AUTOMAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  
  -- Condições (JSON)
  condicoes JSONB NOT NULL, -- Ex: {"tipo": "score_baixo", "threshold": 50, "periodo_dias": 30}
  
  -- Ações (JSON)
  acoes JSONB NOT NULL, -- Ex: {"tipo": "redistribuir", "para_corretor": "melhor_score"}
  
  -- Prioridade
  prioridade INTEGER DEFAULT 1, -- 1 = baixa, 2 = média, 3 = alta
  
  -- Controle
  executacoes INTEGER DEFAULT 0,
  ultima_execucao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_ativo ON public.automation_rules(ativo);
CREATE INDEX IF NOT EXISTS idx_automation_rules_prioridade ON public.automation_rules(prioridade DESC);

COMMENT ON TABLE public.automation_rules IS 'Regras de automação configuráveis';


-- ============================================
-- 2. TABELA DE LOG DE AUTOMAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  rule_nome TEXT,
  
  -- Lead afetado
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Ação executada
  acao_tipo TEXT NOT NULL,
  acao_detalhes JSONB DEFAULT '{}'::jsonb,
  
  -- Resultado
  sucesso BOOLEAN DEFAULT false,
  erro_mensagem TEXT,
  
  -- Controle
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_id ON public.automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_lead_id ON public.automation_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed_at ON public.automation_logs(executed_at DESC);

COMMENT ON TABLE public.automation_logs IS 'Log de execuções de automação';


-- ============================================
-- 3. FUNCTION: REDISTRIBUIR LEAD AUTOMATICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION public.redistribuir_lead_automatico(
  p_lead_id UUID,
  p_motivo TEXT DEFAULT 'Redistribuição automática'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead RECORD;
  v_melhor_corretor RECORD;
  v_resultado JSONB;
BEGIN
  -- Buscar lead
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead não encontrado'
    );
  END IF;
  
  -- Encontrar melhor corretor disponível
  -- Critérios: menor carga de leads ativos + melhor score de qualidade
  SELECT 
    cp.user_id,
    cp.corretor_nome,
    cp.score_qualidade,
    cp.leads_ativos
  INTO v_melhor_corretor
  FROM public.v_corretor_performance cp
  WHERE cp.user_id != v_lead.atribuido_a -- Diferente do corretor atual
    AND cp.leads_ativos < 20 -- Não está sobrecarregado
  ORDER BY 
    cp.score_qualidade DESC,
    cp.leads_ativos ASC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nenhum corretor disponível'
    );
  END IF;
  
  -- Atualizar lead
  UPDATE public.leads
  SET 
    atribuido_a = v_melhor_corretor.user_id,
    updated_at = NOW()
  WHERE id = p_lead_id;
  
  -- Registrar interação
  INSERT INTO public.lead_interactions (
    lead_id,
    user_id,
    tipo,
    conteudo,
    metadata
  ) VALUES (
    p_lead_id,
    v_melhor_corretor.user_id,
    'lead_atribuido',
    p_motivo,
    jsonb_build_object(
      'corretor_anterior', v_lead.atribuido_a,
      'corretor_novo', v_melhor_corretor.user_id,
      'automatico', true
    )
  );
  
  -- Atualizar stats dos corretores
  IF v_lead.atribuido_a IS NOT NULL THEN
    PERFORM public.atualizar_corretor_stats(v_lead.atribuido_a);
  END IF;
  PERFORM public.atualizar_corretor_stats(v_melhor_corretor.user_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'lead_id', p_lead_id,
    'corretor_anterior', v_lead.atribuido_a,
    'corretor_novo', v_melhor_corretor.user_id,
    'corretor_nome', v_melhor_corretor.corretor_nome,
    'motivo', p_motivo
  );
END;
$$;

COMMENT ON FUNCTION public.redistribuir_lead_automatico IS 'Redistribui lead para o melhor corretor disponível';


-- ============================================
-- 4. FUNCTION: EXECUTAR REGRA DE AUTOMAÇÃO
-- ============================================
CREATE OR REPLACE FUNCTION public.executar_regra_automacao(p_rule_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule RECORD;
  v_lead RECORD;
  v_resultado JSONB;
  v_leads_afetados INTEGER := 0;
  v_condicao_tipo TEXT;
  v_acao_tipo TEXT;
BEGIN
  -- Buscar regra
  SELECT * INTO v_rule
  FROM public.automation_rules
  WHERE id = p_rule_id
    AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Regra não encontrada ou inativa'
    );
  END IF;
  
  v_condicao_tipo := v_rule.condicoes->>'tipo';
  v_acao_tipo := v_rule.acoes->>'tipo';
  
  -- ========================================
  -- CONDIÇÃO 1: Score baixo do corretor
  -- ========================================
  IF v_condicao_tipo = 'corretor_score_baixo' THEN
    FOR v_lead IN
      SELECT l.*
      FROM public.leads l
      JOIN public.corretor_stats cs ON cs.user_id = l.atribuido_a
      WHERE l.status NOT IN ('convertido', 'perdido')
        AND cs.score_qualidade < (v_rule.condicoes->>'threshold')::INTEGER
      LIMIT 50 -- Limite de segurança
    LOOP
      IF v_acao_tipo = 'redistribuir' THEN
        v_resultado := public.redistribuir_lead_automatico(
          v_lead.id,
          'Automação: Corretor com score baixo'
        );
        
        IF (v_resultado->>'success')::BOOLEAN THEN
          v_leads_afetados := v_leads_afetados + 1;
          
          INSERT INTO public.automation_logs (
            rule_id,
            rule_nome,
            lead_id,
            acao_tipo,
            acao_detalhes,
            sucesso
          ) VALUES (
            p_rule_id,
            v_rule.nome,
            v_lead.id,
            'redistribuir',
            v_resultado,
            true
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  -- ========================================
  -- CONDIÇÃO 2: Lead sem resposta por muito tempo
  -- ========================================
  IF v_condicao_tipo = 'lead_sem_resposta' THEN
    FOR v_lead IN
      SELECT l.*
      FROM public.leads l
      WHERE l.status NOT IN ('convertido', 'perdido')
        AND l.created_at < NOW() - INTERVAL '1 day' * (v_rule.condicoes->>'dias')::INTEGER
        AND NOT EXISTS (
          SELECT 1 FROM public.lead_interactions li
          WHERE li.lead_id = l.id
            AND li.user_id = l.atribuido_a
            AND li.tipo IN ('mensagem_enviada', 'whatsapp_respondido', 'ligacao_realizada')
        )
      LIMIT 50
    LOOP
      IF v_acao_tipo = 'redistribuir' THEN
        v_resultado := public.redistribuir_lead_automatico(
          v_lead.id,
          'Automação: Lead sem resposta por ' || (v_rule.condicoes->>'dias') || ' dias'
        );
        
        IF (v_resultado->>'success')::BOOLEAN THEN
          v_leads_afetados := v_leads_afetados + 1;
          
          INSERT INTO public.automation_logs (
            rule_id,
            rule_nome,
            lead_id,
            acao_tipo,
            acao_detalhes,
            sucesso
          ) VALUES (
            p_rule_id,
            v_rule.nome,
            v_lead.id,
            'redistribuir',
            v_resultado,
            true
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  -- ========================================
  -- CONDIÇÃO 3: Lead quente parado
  -- ========================================
  IF v_condicao_tipo = 'lead_quente_parado' THEN
    FOR v_lead IN
      SELECT l.*
      FROM public.leads l
      WHERE l.status NOT IN ('convertido', 'perdido')
        AND l.score >= 80
        AND l.created_at < NOW() - INTERVAL '1 day' * (v_rule.condicoes->>'dias')::INTEGER
        AND NOT EXISTS (
          SELECT 1 FROM public.lead_interactions li
          WHERE li.lead_id = l.id
            AND li.created_at > NOW() - INTERVAL '1 day' * (v_rule.condicoes->>'dias')::INTEGER
        )
      LIMIT 50
    LOOP
      IF v_acao_tipo = 'redistribuir' THEN
        v_resultado := public.redistribuir_lead_automatico(
          v_lead.id,
          'Automação: Lead QUENTE sem movimento'
        );
        
        IF (v_resultado->>'success')::BOOLEAN THEN
          v_leads_afetados := v_leads_afetados + 1;
          
          INSERT INTO public.automation_logs (
            rule_id,
            rule_nome,
            lead_id,
            acao_tipo,
            acao_detalhes,
            sucesso
          ) VALUES (
            p_rule_id,
            v_rule.nome,
            v_lead.id,
            'redistribuir',
            v_resultado,
            true
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  -- Atualizar estatísticas da regra
  UPDATE public.automation_rules
  SET 
    executacoes = executacoes + 1,
    ultima_execucao = NOW(),
    updated_at = NOW()
  WHERE id = p_rule_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'rule_id', p_rule_id,
    'rule_nome', v_rule.nome,
    'leads_afetados', v_leads_afetados,
    'executado_em', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.executar_regra_automacao IS 'Executa uma regra de automação';


-- ============================================
-- 5. FUNCTION: EXECUTAR TODAS AS REGRAS ATIVAS
-- ============================================
CREATE OR REPLACE FUNCTION public.executar_todas_automacoes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule RECORD;
  v_resultado JSONB;
  v_resultados JSONB[] := ARRAY[]::JSONB[];
  v_total_leads INTEGER := 0;
BEGIN
  FOR v_rule IN
    SELECT *
    FROM public.automation_rules
    WHERE ativo = true
    ORDER BY prioridade DESC, created_at ASC
  LOOP
    v_resultado := public.executar_regra_automacao(v_rule.id);
    v_resultados := array_append(v_resultados, v_resultado);
    v_total_leads := v_total_leads + COALESCE((v_resultado->>'leads_afetados')::INTEGER, 0);
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'regras_executadas', array_length(v_resultados, 1),
    'total_leads_afetados', v_total_leads,
    'resultados', v_resultados,
    'executado_em', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.executar_todas_automacoes IS 'Executa todas as regras de automação ativas';


-- ============================================
-- 6. INSERIR REGRAS PADRÃO
-- ============================================

-- Regra 1: Redistribuir leads de corretores com score < 40
INSERT INTO public.automation_rules (nome, descricao, ativo, condicoes, acoes, prioridade)
VALUES (
  'Redistribuir leads de corretores com baixo desempenho',
  'Quando um corretor tem score < 40, redistribui seus leads ativos para corretores melhores',
  true,
  '{"tipo": "corretor_score_baixo", "threshold": 40}'::jsonb,
  '{"tipo": "redistribuir", "para_corretor": "melhor_score"}'::jsonb,
  3
)
ON CONFLICT DO NOTHING;

-- Regra 2: Redistribuir leads sem resposta por 3 dias
INSERT INTO public.automation_rules (nome, descricao, ativo, condicoes, acoes, prioridade)
VALUES (
  'Redistribuir leads abandonados (3 dias)',
  'Leads sem nenhuma resposta por 3 dias são redistribuídos automaticamente',
  true,
  '{"tipo": "lead_sem_resposta", "dias": 3}'::jsonb,
  '{"tipo": "redistribuir"}'::jsonb,
  2
)
ON CONFLICT DO NOTHING;

-- Regra 3: Redistribuir leads quentes parados por 2 dias
INSERT INTO public.automation_rules (nome, descricao, ativo, condicoes, acoes, prioridade)
VALUES (
  'Redistribuir leads QUENTES parados (2 dias)',
  'Leads com score >= 80 sem movimento por 2 dias são redistribuídos imediatamente',
  true,
  '{"tipo": "lead_quente_parado", "dias": 2}'::jsonb,
  '{"tipo": "redistribuir"}'::jsonb,
  3
)
ON CONFLICT DO NOTHING;


-- ============================================
-- 7. RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Apenas gerentes podem ver/editar regras
CREATE POLICY "Apenas gerentes gerenciam regras"
  ON public.automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.cargo = 'gerente'
    )
  );

-- Gerentes veem todos os logs
CREATE POLICY "Gerentes veem logs"
  ON public.automation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.cargo = 'gerente'
    )
  );


-- ============================================
-- 8. GRANTS
-- ============================================
GRANT SELECT, INSERT, UPDATE ON public.automation_rules TO authenticated;
GRANT SELECT ON public.automation_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.redistribuir_lead_automatico TO authenticated;
GRANT EXECUTE ON FUNCTION public.executar_regra_automacao TO authenticated;
GRANT EXECUTE ON FUNCTION public.executar_todas_automacoes TO authenticated;


-- =====================================================
-- ✅ AUTOMAÇÃO COMPLETA!
-- 
-- PARA EXECUTAR MANUALMENTE:
-- SELECT public.executar_todas_automacoes();
--
-- PARA AGENDAR (CRON):
-- - Executar diariamente às 08:00
-- - URL: https://SEU-PROJETO.supabase.co/functions/v1/run-automation
-- =====================================================








