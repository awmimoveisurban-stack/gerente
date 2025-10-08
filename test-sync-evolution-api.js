// Teste de sincronização com Evolution API
async function testEvolutionAPISync() {
  console.log('🧪 Testando sincronização com Evolution API...');
  
  try {
    // 1. Verificar instâncias na Evolution API
    console.log('\n📋 1. Verificando instâncias na Evolution API...');
    
    const response = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Instâncias encontradas:', data.length);
    
    // 2. Buscar instância do usuário atual
    console.log('\n📋 2. Buscando instância do usuário atual...');
    
    if (!window.supabase) {
      console.log('❌ Supabase client não encontrado');
      return;
    }
    
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    // Gerar nome da instância
    const userEmail = user.email;
    if (!userEmail) {
      console.log('❌ Email não encontrado');
      return;
    }
    
    const cleanEmail = userEmail
      .toLowerCase()
      .replace('@', '-')
      .replace(/\./g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 40);
    
    const instanceName = `Usuario-${cleanEmail}`;
    console.log('🔧 Nome da instância:', instanceName);
    
    // 3. Verificar se a instância existe na Evolution API
    console.log('\n📋 3. Verificando se a instância existe na Evolution API...');
    
    const instanceExists = data.find(inst => inst.name === instanceName);
    
    if (instanceExists) {
      console.log('✅ Instância encontrada na Evolution API:');
      console.log('  - Nome:', instanceExists.name);
      console.log('  - Status:', instanceExists.connectionStatus);
      console.log('  - ID:', instanceExists.id);
      console.log('  - Criado em:', instanceExists.createdAt);
      
      // 4. Verificar status no sistema local
      console.log('\n📋 4. Verificando status no sistema local...');
      
      const localResponse = await window.supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'status',
          instanceName: instanceName
        }
      });
      
      if (localResponse.data?.success) {
        console.log('✅ Status local:', localResponse.data.status);
        
        // 5. Comparar status
        console.log('\n📋 5. Comparando status...');
        
        const evolutionStatus = instanceExists.connectionStatus;
        const localStatus = localResponse.data.status;
        
        console.log('Evolution API Status:', evolutionStatus);
        console.log('Sistema Local Status:', localStatus);
        
        if (evolutionStatus === localStatus) {
          console.log('✅ Status sincronizado!');
        } else {
          console.log('⚠️ Status dessincronizado!');
          console.log('💡 Execute "Verificar Status" no sistema para sincronizar');
        }
        
      } else {
        console.log('❌ Erro ao verificar status local:', localResponse.error);
      }
      
    } else {
      console.log('❌ Instância NÃO encontrada na Evolution API');
      console.log('💡 Isso indica que a instância foi removida externamente');
      console.log('💡 O sistema deve detectar isso automaticamente na próxima verificação');
      
      // Listar todas as instâncias para debug
      console.log('\n📋 Todas as instâncias disponíveis:');
      data.forEach((inst, index) => {
        console.log(`  ${index + 1}. ${inst.name} - ${inst.connectionStatus}`);
      });
    }
    
    console.log('\n🎯 RESULTADO DO TESTE:');
    console.log('=====================');
    if (instanceExists) {
      console.log('✅ Instância existe na Evolution API');
      console.log('✅ Status:', instanceExists.connectionStatus);
    } else {
      console.log('❌ Instância NÃO existe na Evolution API');
      console.log('⚠️ Sistema deve atualizar status para desconectado');
    }
    
  } catch (error) {
    console.log('❌ Erro durante teste:', error);
  }
}

// Executar teste
testEvolutionAPISync();
