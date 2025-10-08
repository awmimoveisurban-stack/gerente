-- Inserir leads de exemplo para o corretor teste
DO $$
DECLARE
  corretor_user_id uuid;
BEGIN
  -- Buscar o user_id do corretor
  SELECT user_id INTO corretor_user_id 
  FROM public.profiles 
  WHERE email = 'corretor@teste.com' 
  LIMIT 1;

  -- Inserir leads apenas se o corretor existir
  IF corretor_user_id IS NOT NULL THEN
    INSERT INTO public.leads (
      user_id,
      nome,
      telefone,
      email,
      status,
      imovel_interesse,
      valor_interesse,
      observacoes,
      corretor
    ) VALUES
      (
        corretor_user_id,
        'João Silva',
        '(11) 99999-1111',
        'joao.silva@email.com',
        'novo',
        'Apartamento 3 quartos',
        450000,
        'Interessado em imóvel na zona sul',
        'Corretor Teste'
      ),
      (
        corretor_user_id,
        'Maria Santos',
        '(11) 99999-2222',
        'maria.santos@email.com',
        'contato_realizado',
        'Casa 4 quartos',
        750000,
        'Procura casa com quintal',
        'Corretor Teste'
      ),
      (
        corretor_user_id,
        'Pedro Oliveira',
        '(11) 99999-3333',
        'pedro.oliveira@email.com',
        'qualificado',
        'Cobertura',
        1200000,
        'Cliente VIP, pronto para comprar',
        'Corretor Teste'
      ),
      (
        corretor_user_id,
        'Ana Costa',
        '(11) 99999-4444',
        'ana.costa@email.com',
        'negociacao',
        'Apartamento 2 quartos',
        350000,
        'Em negociação de valores',
        'Corretor Teste'
      ),
      (
        corretor_user_id,
        'Carlos Mendes',
        '(11) 99999-5555',
        'carlos.mendes@email.com',
        'visita_agendada',
        'Casa 3 quartos',
        580000,
        'Visita agendada para próxima semana',
        'Corretor Teste'
      );
  END IF;
END $$;