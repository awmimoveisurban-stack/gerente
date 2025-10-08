// Teste de conexão com leads
console.log('🔍 Testando conexão com leads...');

// Verificar se o Supabase está carregado
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase carregado');
  
  // Testar consulta básica
  window.supabase
    .from('leads')
    .select('*')
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro ao buscar leads:', error);
      } else {
        console.log('✅ Leads encontrados:', data?.length || 0);
        console.log('📊 Dados:', data);
      }
    });
} else {
  console.log('❌ Supabase não encontrado');
}





