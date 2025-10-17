import { useEffect } from 'react';

/**
 * ✅ Console Helper Component
 * 
 * Componente que adiciona funções de teste globais ao console do browser
 * e mostra uma notificação visual quando o console é aberto
 */
export function ConsoleHelper() {
  useEffect(() => {
    // ✅ Função para detectar quando o console é aberto
    const detectConsoleOpen = () => {
      let devtools = {
        open: false,
        orientation: null
      };

      const threshold = 160;

      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            console.log(`
🎉 CONSOLE DE DESENVOLVIMENTO ABERTO!

🧪 FUNÇÕES DE TESTE DISPONÍVEIS:

📝 Dados de Teste:
  • criarCorretoresTeste() - Cria 5 corretores fictícios
  • limparDadosTeste() - Remove todos os dados de teste
  • listarCredenciaisTeste() - Mostra credenciais disponíveis

🔐 Teste de Login:
  • testarLoginCorretor('joao.silva', 'joao.silva@imobiliaria.com', '1234') - Testa login específico
  • abrirTesteCorretor() - Abre página de login em nova aba

🛠️ Administração:
  • abrirAdminTeste() - Abre página de administração de dados

💡 Exemplo de uso completo:
  criarCorretoresTeste().then(() => {
    console.log('✅ Corretores criados!');
    abrirTesteCorretor();
  });

🚀 Para começar rapidamente:
  criarCorretoresTeste()
            `);
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // ✅ Iniciar detecção do console
    detectConsoleOpen();

    // ✅ Adicionar função de ajuda global
    (window as any).ajuda = () => {
      console.log(`
🧪 FUNÇÕES DE TESTE DISPONÍVEIS:

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
    };

    // ✅ Adicionar função de teste rápido
    (window as any).testeRapido = async () => {
      console.log('🚀 Iniciando teste rápido...');
      try {
        await (window as any).criarCorretoresTeste();
        console.log('✅ Dados criados! Abrindo página de teste...');
        (window as any).abrirTesteCorretor();
      } catch (error) {
        console.error('❌ Erro no teste rápido:', error);
      }
    };

    console.log(`
🎯 SISTEMA DE TESTE CARREGADO!

Digite 'ajuda()' para ver todas as funções disponíveis
Digite 'testeRapido()' para criar dados e testar login automaticamente
    `);

  }, []);

  // ✅ Este componente não renderiza nada visualmente
  return null;
}
