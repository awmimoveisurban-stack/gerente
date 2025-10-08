-- Inserir dados de exemplo para tarefas, interações e visitas
DO $$
DECLARE
  corretor_user_id uuid;
  lead_joao_id uuid;
  lead_maria_id uuid;
  lead_pedro_id uuid;
BEGIN
  -- Buscar o user_id do corretor e IDs dos leads
  SELECT user_id INTO corretor_user_id 
  FROM public.profiles 
  WHERE email = 'corretor@teste.com' 
  LIMIT 1;

  -- Buscar IDs dos leads
  SELECT id INTO lead_joao_id FROM public.leads WHERE nome = 'João Silva' AND user_id = corretor_user_id LIMIT 1;
  SELECT id INTO lead_maria_id FROM public.leads WHERE nome = 'Maria Santos' AND user_id = corretor_user_id LIMIT 1;
  SELECT id INTO lead_pedro_id FROM public.leads WHERE nome = 'Pedro Oliveira' AND user_id = corretor_user_id LIMIT 1;

  -- Inserir apenas se o corretor existir
  IF corretor_user_id IS NOT NULL THEN
    
    -- Inserir interações de exemplo
    INSERT INTO public.interactions (user_id, lead_id, tipo, descricao, data_interacao) VALUES
      (corretor_user_id, lead_joao_id, 'ligacao', 'Primeira ligação - cliente demonstrou interesse', now() - interval '2 days'),
      (corretor_user_id, lead_joao_id, 'whatsapp', 'Enviado detalhes do imóvel via WhatsApp', now() - interval '1 day'),
      (corretor_user_id, lead_maria_id, 'email', 'Enviado proposta comercial por email', now() - interval '3 days'),
      (corretor_user_id, lead_maria_id, 'ligacao', 'Retorno da ligação - cliente solicitou visita', now() - interval '1 day'),
      (corretor_user_id, lead_pedro_id, 'visita', 'Visita realizada no imóvel - cliente muito interessado', now() - interval '5 days');

    -- Inserir tarefas de exemplo
    INSERT INTO public.tasks (user_id, lead_id, titulo, descricao, data_vencimento, prioridade, status) VALUES
      (corretor_user_id, lead_joao_id, 'Enviar contrato', 'Preparar e enviar contrato de locação', now() + interval '2 days', 'alta', 'pendente'),
      (corretor_user_id, lead_maria_id, 'Agendar segunda visita', 'Cliente solicitou revisita ao imóvel', now() + interval '3 days', 'alta', 'pendente'),
      (corretor_user_id, lead_pedro_id, 'Follow-up negociação', 'Verificar resposta sobre contraproposta', now() + interval '1 day', 'alta', 'pendente'),
      (corretor_user_id, NULL, 'Atualizar anúncios', 'Revisar e atualizar todos os anúncios online', now() + interval '5 days', 'media', 'pendente'),
      (corretor_user_id, NULL, 'Prospecção novos imóveis', 'Buscar novos imóveis na região central', now() + interval '7 days', 'baixa', 'pendente');

    -- Inserir visitas de exemplo
    INSERT INTO public.visits (user_id, lead_id, data_visita, endereco, status, observacoes) VALUES
      (corretor_user_id, lead_maria_id, now() + interval '2 days' + interval '10 hours', 'Rua das Flores, 123 - Apartamento 45', 'agendada', 'Cliente prefere visita pela manhã'),
      (corretor_user_id, lead_pedro_id, now() - interval '5 days', 'Av. Paulista, 1000 - Cobertura 101', 'realizada', 'Cliente gostou muito, demonstrou forte interesse'),
      (corretor_user_id, lead_joao_id, now() + interval '4 days' + interval '14 hours', 'Rua dos Jardins, 456 - Casa', 'agendada', 'Levar planta do imóvel');

  END IF;
END $$;