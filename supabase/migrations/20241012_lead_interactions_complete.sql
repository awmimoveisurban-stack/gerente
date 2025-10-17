-- =====================================================
-- SISTEMA DE MONITORAMENTO DE CORRETORES - COMPLETO
-- Criado: 2025-10-12
-- Objetivo: Rastrear TODAS as interações com leads
-- =====================================================

-- ============================================
-- 1. TABELA DE INTERAÇÕES (HISTÓRICO COMPLETO)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Corretor responsável (null = sistema)
  tipo TEXT NOT NULL CHECK (tipo IN (
    'lead_criado',
    'lead_atribuido',
    'mensagem_enviada',
    'mensagem_recebida',
    'status_alterado',
    'observacao_adicionada',
    'whatsapp_respondido',
    'ligacao_realizada',
    'email_enviado',
    'visita_agendada',
    'proposta_enviada',
    'negociacao_iniciada',
    'lead_convertido',
    'lead_perdido'
  )),
  conteudo TEXT, -- Texto da mensagem, observação, etc
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados extras (ex: de/para status, score anterior, etc)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_user_id ON public.lead_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_tipo ON public.lead_interactions(tipo);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON public.lead_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_user ON public.lead_interactions(lead_id, user_id);

COMMENT ON TABLE public.lead_interactions IS 'Registra TODAS as interações com leads para análise de performance';
COMMENT ON COLUMN public.lead_interactions.tipo IS 'Tipo da interação (mensagem, status, etc)';
COMMENT ON COLUMN public.lead_interactions.metadata IS 'Dados extras em JSON (flexível para futuros recursos)';


-- ============================================
-- 2. TABELA DE ESTATÍSTICAS DE CORRETOR (CACHE)
-- ============================================
-- Armazena métricas calculadas para evitar queries pesadas
CREATE TABLE IF NOT EXISTS public.corretor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Métricas básicas
  total_leads INTEGER DEFAULT 0,
  leads_ativos INTEGER DEFAULT 0,
  leads_convertidos INTEGER DEFAULT 0,
  leads_perdidos INTEGER DEFAULT 0,
  
  -- Performance
  taxa_conversao DECIMAL(5,2) DEFAULT 0, -- Ex: 75.50%
  tempo_medio_primeira_resposta INTEGER DEFAULT 0, -- Em minutos
  tempo_medio_fechamento INTEGER DEFAULT 0, -- Em horas
  
  -- Qualidade
  score_qualidade INTEGER DEFAULT 0, -- 0-100
  total_interacoes INTEGER DEFAULT 0,
  leads_sem_resposta INTEGER DEFAULT 0, -- Leads abandonados >24h
  
  -- Financeiro
  valor_total_vendido DECIMAL(15,2) DEFAULT 0,
  ticket_medio DECIMAL(15,2) DEFAULT 0,
  
  -- Controle
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corretor_stats_user_id ON public.corretor_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_corretor_stats_score ON public.corretor_stats(score_qualidade DESC);
CREATE INDEX IF NOT EXISTS idx_corretor_stats_conversao ON public.corretor_stats(taxa_conversao DESC);

COMMENT ON TABLE public.corretor_stats IS 'Cache de estatísticas de corretores (atualizado via triggers)';


-- ============================================
-- 3. VIEW PARA PERFORMANCE EM TEMPO REAL
-- ============================================
CREATE OR REPLACE VIEW public.v_corretor_performance AS
SELECT 
  u.id as user_id,
  u.email,
  p.nome as corretor_nome,
  
  -- Contadores
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.status NOT IN ('convertido', 'perdido') THEN l.id END) as leads_ativos,
  COUNT(DISTINCT CASE WHEN l.status = 'convertido' THEN l.id END) as leads_convertidos,
  COUNT(DISTINCT CASE WHEN l.status = 'perdido' THEN l.id END) as leads_perdidos,
  
  -- Taxa de conversão
  CASE 
    WHEN COUNT(DISTINCT l.id) > 0 THEN 
      ROUND((COUNT(DISTINCT CASE WHEN l.status = 'convertido' THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id)::DECIMAL) * 100, 2)
    ELSE 0 
  END as taxa_conversao,
  
  -- Tempo médio de primeira resposta (em minutos)
  ROUND(AVG(
    CASE 
      WHEN primeira_resposta.created_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (primeira_resposta.created_at - l.created_at)) / 60
      ELSE NULL
    END
  )::numeric, 0)::integer as tempo_medio_primeira_resposta,
  
  -- Financeiro
  COALESCE(SUM(CASE WHEN l.status = 'convertido' THEN l.valor_interesse ELSE 0 END), 0) as valor_total_vendido,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN l.status = 'convertido' THEN l.id END) > 0 THEN
      ROUND(SUM(CASE WHEN l.status = 'convertido' THEN l.valor_interesse ELSE 0 END) / COUNT(DISTINCT CASE WHEN l.status = 'convertido' THEN l.id END), 2)
    ELSE 0
  END as ticket_medio,
  
  -- Stats do cache (se existir)
  cs.score_qualidade,
  cs.leads_sem_resposta,
  cs.ultima_atualizacao as stats_atualizadas_em

FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.leads l ON l.atribuido_a = u.id
LEFT JOIN LATERAL (
  SELECT li.created_at
  FROM public.lead_interactions li
  WHERE li.lead_id = l.id 
    AND li.user_id = u.id
    AND li.tipo IN ('mensagem_enviada', 'whatsapp_respondido', 'ligacao_realizada')
  ORDER BY li.created_at ASC
  LIMIT 1
) primeira_resposta ON true
LEFT JOIN public.corretor_stats cs ON cs.user_id = u.id

WHERE p.cargo = 'corretor'
GROUP BY u.id, u.email, p.nome, cs.score_qualidade, cs.leads_sem_resposta, cs.ultima_atualizacao;

COMMENT ON VIEW public.v_corretor_performance IS 'View com performance em tempo real de cada corretor';


-- ============================================
-- 4. FUNCTION: CALCULAR SCORE DE QUALIDADE
-- ============================================
CREATE OR REPLACE FUNCTION public.calcular_score_qualidade(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score INTEGER := 0;
  v_tempo_resposta INTEGER;
  v_taxa_conversao DECIMAL;
  v_leads_abandonados INTEGER;
  v_total_leads INTEGER;
  v_frequencia_followup DECIMAL;
BEGIN
  -- Buscar dados do corretor
  SELECT 
    tempo_medio_primeira_resposta,
    taxa_conversao,
    leads_sem_resposta,
    total_leads
  INTO v_tempo_resposta, v_taxa_conversao, v_leads_abandonados, v_total_leads
  FROM public.v_corretor_performance
  WHERE user_id = p_user_id;
  
  -- Se não tem leads, score = 0
  IF v_total_leads IS NULL OR v_total_leads = 0 THEN
    RETURN 0;
  END IF;
  
  -- 1. VELOCIDADE DE RESPOSTA (30 pontos)
  -- Menos de 15min = 30pts, 15-30min = 25pts, 30-60min = 20pts, 1-2h = 15pts, 2-4h = 10pts, >4h = 5pts
  v_score := v_score + CASE
    WHEN v_tempo_resposta IS NULL THEN 0
    WHEN v_tempo_resposta <= 15 THEN 30
    WHEN v_tempo_resposta <= 30 THEN 25
    WHEN v_tempo_resposta <= 60 THEN 20
    WHEN v_tempo_resposta <= 120 THEN 15
    WHEN v_tempo_resposta <= 240 THEN 10
    ELSE 5
  END;
  
  -- 2. TAXA DE CONVERSÃO (35 pontos)
  -- >80% = 35pts, 70-80% = 30pts, 60-70% = 25pts, 50-60% = 20pts, 40-50% = 15pts, <40% = 10pts
  v_score := v_score + CASE
    WHEN v_taxa_conversao >= 80 THEN 35
    WHEN v_taxa_conversao >= 70 THEN 30
    WHEN v_taxa_conversao >= 60 THEN 25
    WHEN v_taxa_conversao >= 50 THEN 20
    WHEN v_taxa_conversao >= 40 THEN 15
    ELSE 10
  END;
  
  -- 3. LEADS ABANDONADOS (25 pontos) - PENALIDADE
  -- 0 abandonados = 25pts, 1-2 = 20pts, 3-5 = 15pts, 6-10 = 10pts, >10 = 5pts
  v_score := v_score + CASE
    WHEN v_leads_abandonados = 0 THEN 25
    WHEN v_leads_abandonados <= 2 THEN 20
    WHEN v_leads_abandonados <= 5 THEN 15
    WHEN v_leads_abandonados <= 10 THEN 10
    ELSE 5
  END;
  
  -- 4. ATIVIDADE/ENGAJAMENTO (10 pontos)
  -- Baseado na frequência de interações
  SELECT 
    CASE 
      WHEN COUNT(*) >= v_total_leads * 5 THEN 10 -- 5+ interações por lead
      WHEN COUNT(*) >= v_total_leads * 3 THEN 8
      WHEN COUNT(*) >= v_total_leads * 2 THEN 6
      WHEN COUNT(*) >= v_total_leads THEN 4
      ELSE 2
    END
  INTO v_frequencia_followup
  FROM public.lead_interactions
  WHERE user_id = p_user_id
    AND tipo IN ('mensagem_enviada', 'whatsapp_respondido', 'ligacao_realizada', 'observacao_adicionada');
  
  v_score := v_score + COALESCE(v_frequencia_followup, 0);
  
  -- Garantir que está entre 0-100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$;

COMMENT ON FUNCTION public.calcular_score_qualidade IS 'Calcula score de qualidade (0-100) baseado em métricas de performance';


-- ============================================
-- 5. FUNCTION: ATUALIZAR STATS DO CORRETOR
-- ============================================
CREATE OR REPLACE FUNCTION public.atualizar_corretor_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Buscar dados da view
  SELECT * INTO v_stats
  FROM public.v_corretor_performance
  WHERE user_id = p_user_id;
  
  IF v_stats IS NULL THEN
    RETURN;
  END IF;
  
  -- Calcular score de qualidade
  DECLARE
    v_score INTEGER;
  BEGIN
    v_score := public.calcular_score_qualidade(p_user_id);
  END;
  
  -- Upsert na tabela de stats
  INSERT INTO public.corretor_stats (
    user_id,
    total_leads,
    leads_ativos,
    leads_convertidos,
    leads_perdidos,
    taxa_conversao,
    tempo_medio_primeira_resposta,
    score_qualidade,
    valor_total_vendido,
    ticket_medio,
    leads_sem_resposta,
    ultima_atualizacao
  ) VALUES (
    p_user_id,
    v_stats.total_leads,
    v_stats.leads_ativos,
    v_stats.leads_convertidos,
    v_stats.leads_perdidos,
    v_stats.taxa_conversao,
    COALESCE(v_stats.tempo_medio_primeira_resposta, 0),
    public.calcular_score_qualidade(p_user_id),
    v_stats.valor_total_vendido,
    v_stats.ticket_medio,
    COALESCE(v_stats.leads_sem_resposta, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    leads_ativos = EXCLUDED.leads_ativos,
    leads_convertidos = EXCLUDED.leads_convertidos,
    leads_perdidos = EXCLUDED.leads_perdidos,
    taxa_conversao = EXCLUDED.taxa_conversao,
    tempo_medio_primeira_resposta = EXCLUDED.tempo_medio_primeira_resposta,
    score_qualidade = EXCLUDED.score_qualidade,
    valor_total_vendido = EXCLUDED.valor_total_vendido,
    ticket_medio = EXCLUDED.ticket_medio,
    leads_sem_resposta = EXCLUDED.leads_sem_resposta,
    ultima_atualizacao = NOW();
END;
$$;

COMMENT ON FUNCTION public.atualizar_corretor_stats IS 'Atualiza cache de estatísticas do corretor';


-- ============================================
-- 6. TRIGGERS PARA AUTO-REGISTRO DE INTERAÇÕES
-- ============================================

-- Trigger: Quando lead é criado
CREATE OR REPLACE FUNCTION public.trigger_lead_criado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.lead_interactions (
    lead_id,
    user_id,
    tipo,
    conteudo,
    metadata
  ) VALUES (
    NEW.id,
    NEW.atribuido_a,
    'lead_criado',
    'Lead criado no sistema',
    jsonb_build_object(
      'origem', NEW.origem,
      'score', NEW.score,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_criado ON public.leads;
CREATE TRIGGER trg_lead_criado
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_lead_criado();


-- Trigger: Quando status do lead muda
CREATE OR REPLACE FUNCTION public.trigger_lead_status_alterado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.lead_interactions (
      lead_id,
      user_id,
      tipo,
      conteudo,
      metadata
    ) VALUES (
      NEW.id,
      NEW.atribuido_a,
      'status_alterado',
      'Status alterado de ' || OLD.status || ' para ' || NEW.status,
      jsonb_build_object(
        'status_anterior', OLD.status,
        'status_novo', NEW.status
      )
    );
    
    -- Atualizar stats do corretor
    IF NEW.atribuido_a IS NOT NULL THEN
      PERFORM public.atualizar_corretor_stats(NEW.atribuido_a);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_status_alterado ON public.leads;
CREATE TRIGGER trg_lead_status_alterado
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trigger_lead_status_alterado();


-- Trigger: Quando lead é atribuído/reatribuído
CREATE OR REPLACE FUNCTION public.trigger_lead_atribuido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.atribuido_a IS DISTINCT FROM NEW.atribuido_a THEN
    INSERT INTO public.lead_interactions (
      lead_id,
      user_id,
      tipo,
      conteudo,
      metadata
    ) VALUES (
      NEW.id,
      NEW.atribuido_a,
      'lead_atribuido',
      'Lead atribuído ao corretor',
      jsonb_build_object(
        'corretor_anterior', OLD.atribuido_a,
        'corretor_novo', NEW.atribuido_a
      )
    );
    
    -- Atualizar stats dos corretores envolvidos
    IF OLD.atribuido_a IS NOT NULL THEN
      PERFORM public.atualizar_corretor_stats(OLD.atribuido_a);
    END IF;
    IF NEW.atribuido_a IS NOT NULL THEN
      PERFORM public.atualizar_corretor_stats(NEW.atribuido_a);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_atribuido ON public.leads;
CREATE TRIGGER trg_lead_atribuido
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  WHEN (OLD.atribuido_a IS DISTINCT FROM NEW.atribuido_a)
  EXECUTE FUNCTION public.trigger_lead_atribuido();


-- ============================================
-- 7. RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corretor_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Gerentes veem tudo
CREATE POLICY "Gerentes veem todas interações"
  ON public.lead_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.cargo = 'gerente'
    )
  );

-- Policy: Corretores veem apenas suas interações
CREATE POLICY "Corretores veem suas interações"
  ON public.lead_interactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Corretores podem inserir suas interações
CREATE POLICY "Corretores inserem suas interações"
  ON public.lead_interactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Gerentes veem todas as stats
CREATE POLICY "Gerentes veem todas stats"
  ON public.corretor_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.cargo = 'gerente'
    )
  );

-- Policy: Corretores veem apenas suas stats
CREATE POLICY "Corretores veem suas stats"
  ON public.corretor_stats
  FOR SELECT
  USING (user_id = auth.uid());


-- ============================================
-- 8. FUNÇÃO AUXILIAR: DETECTAR LEADS ABANDONADOS
-- ============================================
CREATE OR REPLACE FUNCTION public.detectar_leads_abandonados(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Contar leads sem resposta há mais de 24h
  SELECT COUNT(DISTINCT l.id)
  INTO v_count
  FROM public.leads l
  WHERE l.atribuido_a = p_user_id
    AND l.status NOT IN ('convertido', 'perdido')
    AND l.created_at < NOW() - INTERVAL '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_interactions li
      WHERE li.lead_id = l.id
        AND li.user_id = p_user_id
        AND li.tipo IN ('mensagem_enviada', 'whatsapp_respondido', 'ligacao_realizada')
    );
  
  RETURN COALESCE(v_count, 0);
END;
$$;

COMMENT ON FUNCTION public.detectar_leads_abandonados IS 'Detecta leads sem resposta há mais de 24h';


-- ============================================
-- 9. INICIALIZAR STATS PARA CORRETORES EXISTENTES
-- ============================================
DO $$
DECLARE
  v_corretor RECORD;
BEGIN
  FOR v_corretor IN 
    SELECT u.id
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE p.cargo = 'corretor'
  LOOP
    PERFORM public.atualizar_corretor_stats(v_corretor.id);
  END LOOP;
END $$;


-- ============================================
-- 10. GRANTS (PERMISSÕES)
-- ============================================
GRANT SELECT ON public.lead_interactions TO authenticated;
GRANT INSERT ON public.lead_interactions TO authenticated;
GRANT SELECT ON public.corretor_stats TO authenticated;
GRANT SELECT ON public.v_corretor_performance TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_score_qualidade TO authenticated;
GRANT EXECUTE ON FUNCTION public.atualizar_corretor_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.detectar_leads_abandonados TO authenticated;


-- =====================================================
-- ✅ MIGRAÇÃO COMPLETA!
-- 
-- O QUE FOI CRIADO:
-- ✅ Tabela lead_interactions (histórico completo)
-- ✅ Tabela corretor_stats (cache de métricas)
-- ✅ View v_corretor_performance (tempo real)
-- ✅ Function calcular_score_qualidade (0-100)
-- ✅ Function atualizar_corretor_stats (cache)
-- ✅ Function detectar_leads_abandonados
-- ✅ Triggers automáticos (criação, status, atribuição)
-- ✅ RLS policies (segurança)
-- ✅ Inicialização de dados existentes
-- =====================================================








