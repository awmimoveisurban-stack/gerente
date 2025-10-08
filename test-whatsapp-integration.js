// =====================================================
// SCRIPT DE TESTE - INTEGRAÇÃO WHATSAPP
// =====================================================

console.log('🧪 Iniciando teste da integração WhatsApp...');

// Função para obter instância do Supabase
function getSupabase() {
  // Tentar diferentes formas de acessar o Supabase
  if (typeof window.supabase !== 'undefined') {
    return window.supabase;
  }
  
  // Tentar acessar via React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const reactRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.get(1);
    if (reactRoot) {
      // Buscar por Supabase no contexto React
      const fiber = reactRoot.getCurrentFiber();
      if (fiber) {
        // Implementar busca recursiva por Supabase
        function findSupabase(fiberNode) {
          if (!fiberNode) return null;
          
          if (fiberNode.type && typeof fiberNode.type === 'function') {
            try {
              const component = fiberNode.type;
              if (component.name === 'AuthProvider' || component.name === 'SupabaseProvider') {
                return fiberNode.memoizedProps?.supabase || null;
              }
            } catch (e) {
              // Ignorar erros
            }
          }
          
          return findSupabase(fiberNode.child) || findSupabase(fiberNode.sibling);
        }
        
        return findSupabase(fiber);
      }
    }
  }
  
  return null;
}

// Função para testar a Edge Function
async function testWhatsAppEdgeFunction() {
  try {
    console.log('🔍 Testando Edge Function whatsapp-connect...');
    
    // Obter instância do Supabase
    const supabase = getSupabase();
    if (!supabase) {
      console.log('❌ Supabase não encontrado - navegue para uma página que use Supabase primeiro');
      return false;
    }
    
    // Testar ação 'test'
    const testResponse = await supabase.functions.invoke('whatsapp-connect', {
      body: {
        action: 'test'
      }
    });
    
    console.log('📊 Resposta do teste:', testResponse);
    
    if (testResponse.error) {
      console.error('❌ Erro no teste:', testResponse.error);
      return false;
    }
    
    if (testResponse.data?.success) {
      console.log('✅ Edge Function funcionando corretamente!');
      return true;
    } else {
      console.log('⚠️ Edge Function retornou success: false');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar Edge Function:', error);
    return false;
  }
}

// Função para testar conexão com Evolution API
async function testEvolutionAPI() {
  try {
    console.log('🔍 Testando conexão com Evolution API...');
    
    const supabase = getSupabase();
    if (!supabase) {
      console.log('❌ Supabase não encontrado');
      return false;
    }
    
    const response = await supabase.functions.invoke('whatsapp-connect', {
      body: {
        action: 'status'
      }
    });
    
    console.log('📊 Resposta do status:', response);
    
    if (response.error) {
      console.error('❌ Erro ao verificar status:', response.error);
      return false;
    }
    
    if (response.data?.success) {
      console.log('✅ Conexão com Evolution API funcionando!');
      console.log('📱 Status atual:', response.data.status);
      return true;
    } else {
      console.log('⚠️ Falha na verificação de status');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar Evolution API:', error);
    return false;
  }
}

// Função para testar criação de instância
async function testCreateInstance() {
  try {
    console.log('🔍 Testando criação de instância...');
    
    const supabase = getSupabase();
    if (!supabase) {
      console.log('❌ Supabase não encontrado');
      return false;
    }
    
    const response = await supabase.functions.invoke('whatsapp-connect', {
      body: {
        action: 'connect'
      }
    });
    
    console.log('📊 Resposta da conexão:', response);
    
    if (response.error) {
      console.error('❌ Erro ao conectar:', response.error);
      return false;
    }
    
    if (response.data?.success) {
      console.log('✅ Instância criada/conectada com sucesso!');
      
      if (response.data.qrcode) {
        console.log('📱 QR Code gerado com sucesso!');
        console.log('🔗 Comprimento do QR Code:', response.data.qrcode.length);
      } else {
        console.log('⚠️ QR Code não foi gerado');
      }
      
      return true;
    } else {
      console.log('⚠️ Falha na criação/conexão da instância');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar criação de instância:', error);
    return false;
  }
}

// Função principal de teste
async function runWhatsAppTests() {
  console.log('🚀 Iniciando bateria de testes WhatsApp...');
  
  const results = {
    edgeFunction: false,
    evolutionAPI: false,
    createInstance: false
  };
  
  // Teste 1: Edge Function
  console.log('\n📋 Teste 1: Edge Function');
  results.edgeFunction = await testWhatsAppEdgeFunction();
  
  // Teste 2: Evolution API
  console.log('\n📋 Teste 2: Evolution API');
  results.evolutionAPI = await testEvolutionAPI();
  
  // Teste 3: Criação de Instância (apenas se os anteriores passaram)
  if (results.edgeFunction && results.evolutionAPI) {
    console.log('\n📋 Teste 3: Criação de Instância');
    results.createInstance = await testCreateInstance();
  } else {
    console.log('\n⏭️ Pulando Teste 3: Pré-requisitos não atendidos');
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL:');
  console.log('==================');
  console.log(`✅ Edge Function: ${results.edgeFunction ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Evolution API: ${results.evolutionAPI ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Criação Instância: ${results.createInstance ? 'PASSOU' : 'FALHOU'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! WhatsApp está funcionando perfeitamente!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima para detalhes.');
  }
  
  return results;
}

// Executar testes
runWhatsAppTests().catch(console.error);

console.log('🔍 Script de teste carregado. Execute runWhatsAppTests() para rodar os testes.');
