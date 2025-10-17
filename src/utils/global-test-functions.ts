// ✅ Funções globais para teste (disponíveis no console do browser)
import { createTestCorretores, clearTestData } from './create-test-corretores';

// ✅ Função para criar dados de teste via console
const criarCorretoresTeste = async () => {
  console.log('🚀 Iniciando criação de corretores de teste via console...');
  try {
    const results = await createTestCorretores();
    console.log('✅ Corretores criados com sucesso!');
    console.table(results);
    return results;
  } catch (error) {
    console.error('❌ Erro ao criar corretores:', error);
    throw error;
  }
};

// ✅ Função para limpar dados de teste via console
const limparDadosTeste = async () => {
  console.log('🧹 Limpando dados de teste via console...');
  try {
    await clearTestData();
    console.log('✅ Dados limpos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// ✅ Função para listar credenciais de teste
const listarCredenciaisTeste = () => {
  console.log('📋 Credenciais de teste disponíveis:');
  const credenciais = [
    { nome: 'João Silva Santos', login: 'joao.silva', email: 'joao.silva@imobiliaria.com', senha: '1234' },
    { nome: 'Maria Oliveira Costa', login: 'maria.oliveira', email: 'maria.oliveira@imobiliaria.com', senha: '1234' },
    { nome: 'Pedro Rodrigues Lima', login: 'pedro.rodrigues', email: 'pedro.rodrigues@imobiliaria.com', senha: '1234' },
    { nome: 'Ana Paula Ferreira', login: 'ana.paula', email: 'ana.paula@imobiliaria.com', senha: '1234' },
    { nome: 'Carlos Eduardo Santos', login: 'carlos.eduardo', email: 'carlos.eduardo@imobiliaria.com', senha: '1234' },
  ];
  
  console.table(credenciais);
  console.log('💡 Use estas credenciais completas em /corretor-login');
  return credenciais;
};

// ✅ Função para testar login de corretor
const testarLoginCorretor = (login: string, email: string, senha: string) => {
  console.log(`🔐 Testando login: ${login} / ${email} / ${senha}`);
  console.log('💡 Acesse /corretor-login e use estas credenciais completas');
  return { login, email, senha };
};

// ✅ Função para abrir página de teste
const abrirTesteCorretor = () => {
  window.open('/corretor-login', '_blank');
  console.log('🚀 Página de login de corretor aberta em nova aba');
};

const abrirAdminTeste = () => {
  window.open('/admin-test-data', '_blank');
  console.log('🚀 Página de administração de dados de teste aberta em nova aba');
};

// ✅ Expor funções globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).criarCorretoresTeste = criarCorretoresTeste;
  (window as any).limparDadosTeste = limparDadosTeste;
  (window as any).listarCredenciaisTeste = listarCredenciaisTeste;
  (window as any).testarLoginCorretor = testarLoginCorretor;
  (window as any).abrirTesteCorretor = abrirTesteCorretor;
  (window as any).abrirAdminTeste = abrirAdminTeste;
  
  // ✅ Log de ajuda
  console.log(`
🧪 FUNÇÕES DE TESTE DISPONÍVEIS NO CONSOLE:

📝 Dados de Teste:
  • criarCorretoresTeste() - Cria 5 corretores fictícios
  • limparDadosTeste() - Remove todos os dados de teste
  • listarCredenciaisTeste() - Mostra credenciais disponíveis

🔐 Teste de Login:
  • testarLoginCorretor('joao.silva', 'joao.silva@imobiliaria.com', '1234') - Testa login específico
  • abrirTesteCorretor() - Abre página de login em nova aba

🛠️ Administração:
  • abrirAdminTeste() - Abre página de administração de dados

💡 Exemplo de uso:
  criarCorretoresTeste().then(() => abrirTesteCorretor())
  `);
}

export {
  criarCorretoresTeste,
  limparDadosTeste,
  listarCredenciaisTeste,
  testarLoginCorretor,
  abrirTesteCorretor,
  abrirAdminTeste,
};
