// 🚀 TESTE FINAL COM TODAS AS CREDENCIAIS
// Execute este script no console do navegador na página /gerente/whatsapp

async function testeFinalComCredenciais() {
  console.log('🚀 TESTE FINAL COMPLETO');
  console.log('📋 Com todas as credenciais configuradas:');
  console.log('   ✅ Supabase URL: https://bxtuynqauqasigcbocbm.supabase.co');
  console.log('   ✅ Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('   ✅ Evolution API URL: https://api.urbanautobot.com');
  console.log('   ✅ Evolution API Key: cfd9b746ea9e400dc8f4d3e8d57b0180');
  console.log('---');
  
  try {
    // 1. Verificar autenticação
    console.log('🔐 1. Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Faça login primeiro em /auth');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);
    console.log('✅ Token válido:', session.access_token ? 'Sim' : 'Não');
    
    // 2. Testar Edge Function básica
    console.log('\n🧪 2. Testando Edge Function básica...');
    const testResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    console.log('📊 Status da resposta:', testResponse.status);
    console.log('📊 Headers:', Object.fromEntries(testResponse.headers.entries()));
    
    const testData = await testResponse.text();
    console.log('📊 Dados da resposta:', testData);
    
    // Interpretar resultado
    if (testResponse.status === 404) {
      console.log('❌ Edge Function não existe (404)');
      console.log('💡 SOLUÇÃO: Criar Edge Function no Dashboard');
      console.log('🔗 https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions');
      console.log('📝 Use o código do arquivo: CONFIGURACAO_COMPLETA_FINAL.md');
      return;
    }
    
    if (testResponse.status === 500) {
      console.log('⚠️ Edge Function existe mas com erro interno (500)');
      console.log('💡 SOLUÇÃO: Verificar Environment Variables');
      console.log('🔧 Adicionar no Dashboard da Edge Function:');
      console.log('   SUPABASE_URL=https://bxtuynqauqasigcbocbm.supabase.co');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      console.log('   EVOLUTION_API_URL=https://api.urbanautobot.com');
      console.log('   EVOLUTION_API_KEY=cfd9b746ea9e400dc8f4d3e8d57b0180');
      return;
    }
    
    if (testResponse.status === 401) {
      console.log('❌ Token inválido (401)');
      console.log('💡 SOLUÇÃO: Verificar Service Role Key');
      return;
    }
    
    if (testResponse.ok) {
      console.log('✅ Edge Function funcionando perfeitamente!');
      
      // 3. Testar conexão WhatsApp
      console.log('\n🔗 3. Testando conexão WhatsApp...');
      const connectResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          instanceName: 'empresa-whatsapp'
        })
      });
      
      console.log('📊 Status da conexão:', connectResponse.status);
      const connectData = await connectResponse.text();
      console.log('📊 Dados da conexão:', connectData);
      
      if (connectResponse.ok) {
        console.log('✅ WhatsApp connection funcionando perfeitamente!');
        console.log('🎉 SISTEMA 100% FUNCIONAL!');
        
        // Verificar se tem QR Code
        try {
          const connectJson = JSON.parse(connectData);
          if (connectJson.qrcode) {
            console.log('📱 QR Code gerado com sucesso!');
            console.log('🔗 QR Code disponível no frontend');
            console.log('📏 Tamanho do QR Code:', connectJson.qrcode.length, 'caracteres');
          }
        } catch (e) {
          console.log('⚠️ Erro ao parsear resposta da conexão');
        }
      } else {
        console.log('⚠️ Problema na conexão WhatsApp');
        console.log('💡 Verificar Evolution API configuration');
        console.log('🔧 Verificar se as credenciais estão corretas:');
        console.log('   URL: https://api.urbanautobot.com');
        console.log('   Key: cfd9b746ea9e400dc8f4d3e8d57b0180');
      }
    } else {
      console.log('❌ Erro inesperado:', testResponse.status);
      console.log('💡 Verificar logs da Edge Function no Dashboard');
    }
    
    // 4. Testar frontend
    console.log('\n🖥️ 4. Testando frontend...');
    try {
      // Verificar se está na página correta
      const currentPath = window.location.pathname;
      console.log('📍 Página atual:', currentPath);
      
      if (currentPath.includes('/gerente/whatsapp')) {
        console.log('✅ Página correta');
        
        // Verificar se tem botão conectar
        const connectButtons = document.querySelectorAll('button');
        const connectButton = Array.from(connectButtons).find(btn => 
          btn.textContent.includes('Conectar') || 
          btn.textContent.includes('WhatsApp') ||
          btn.onclick?.toString().includes('handleConnect')
        );
        
        if (connectButton) {
          console.log('✅ Botão conectar encontrado');
          console.log('💡 Clique no botão para testar a integração completa');
        } else {
          console.log('⚠️ Botão conectar não encontrado');
          console.log('💡 Verificar se o componente está carregado');
        }
      } else {
        console.log('⚠️ Não está na página correta');
        console.log('💡 Navegue para /gerente/whatsapp');
      }
    } catch (e) {
      console.log('⚠️ Erro ao testar frontend:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com internet e Supabase');
  }
}

// Executar teste final
testeFinalComCredenciais();





