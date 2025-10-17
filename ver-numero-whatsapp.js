// ============================================================
// 📱 VER NÚMERO DO WHATSAPP CONECTADO
// ============================================================
// Cole no console (F12) para ver qual WhatsApp está conectado
// ============================================================

(async function verNumeroWhatsApp() {
  console.clear();
  console.log('📱 VERIFICANDO WHATSAPP CONECTADO...\n');
  console.log('='.repeat(60));
  
  // Obter token
  let authData = localStorage.getItem('sb-bxtuynqauqasigcbocbm-auth-token');
  if (!authData) authData = sessionStorage.getItem('sb-bxtuynqauqasigcbocbm-auth-token');
  
  if (!authData) {
    console.log('❌ ERRO: Faça login primeiro!');
    console.log('   http://127.0.0.1:3006/auth');
    return;
  }
  
  const token = JSON.parse(authData).access_token;
  const user = JSON.parse(authData).user;
  
  console.log('✅ Usuário logado:', user.email);
  console.log('');
  
  // Buscar config do WhatsApp
  const res = await fetch(
    'https://bxtuynqauqasigcbocbm.supabase.co/rest/v1/whatsapp_config?status=eq.conectado&select=*',
    {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNjAyODUsImV4cCI6MjA1MzczNjI4NX0.kB5pPaKQBV3ztJJu0pu7aQUVKhQ2lGW6eYBvV3pDTXo',
        'Authorization': 'Bearer ' + token
      }
    }
  );
  
  const configs = await res.json();
  
  if (!configs || configs.length === 0) {
    console.log('❌ NENHUM WHATSAPP CONECTADO');
    console.log('');
    console.log('💡 AÇÕES:');
    console.log('   1. Vá em: http://127.0.0.1:3006/gerente-whatsapp-final');
    console.log('   2. Clique em "Conectar WhatsApp"');
    console.log('   3. Escaneie o QR Code');
    console.log('   4. Execute este script novamente');
    return;
  }
  
  console.log('✅ WHATSAPP(S) CONECTADO(S):');
  console.log('='.repeat(60));
  
  for (const config of configs) {
    console.log('');
    console.log('📱 INSTÂNCIA:', config.instance_name);
    console.log('   Status:', config.status);
    console.log('   Criado em:', new Date(config.created_at).toLocaleString('pt-BR'));
    
    // Tentar buscar info da Evolution API
    try {
      const evolutionRes = await fetch(
        `https://api.urbanautobot.com/instance/connectionState/${config.instance_name}`,
        {
          headers: {
            'apikey': Deno?.env?.get?.('EVOLUTION_API_KEY') || 'sua-api-key'
          }
        }
      );
      
      if (evolutionRes.ok) {
        const evolutionData = await evolutionRes.json();
        if (evolutionData.instance?.ownerJid) {
          const phoneNumber = evolutionData.instance.ownerJid.replace('@s.whatsapp.net', '');
          console.log('   📞 Número:', phoneNumber);
          console.log('   👤 Nome:', evolutionData.instance.profileName || 'Não disponível');
        }
      }
    } catch (e) {
      console.log('   📞 Número: (Use Evolution API para ver)');
    }
    
    console.log('');
    console.log('💡 PARA TESTAR:');
    console.log('   Envie mensagem DO SEU CELULAR para este WhatsApp:');
    console.log('   "Olá! Procuro apartamento de 3 quartos até 800k com urgência!"');
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('='.repeat(60));
  console.log('');
  console.log('1️⃣ ABRIR DASHBOARD DE LEADS:');
  console.log('   http://127.0.0.1:3006/gerente-todos-leads');
  console.log('');
  console.log('2️⃣ ENVIAR MENSAGEM DE TESTE:');
  console.log('   Do seu celular para o WhatsApp conectado');
  console.log('   Exemplo: "Apartamento 3 quartos Zona Sul 800k urgente"');
  console.log('');
  console.log('3️⃣ AGUARDAR PROCESSAMENTO:');
  console.log('   Até 30 segundos (polling automático)');
  console.log('   Ou clique em "Buscar Mensagens" para buscar agora');
  console.log('');
  console.log('4️⃣ VERIFICAR LEAD CRIADO:');
  console.log('   Recarregue o dashboard de leads');
  console.log('   Procure por seu nome/telefone');
  console.log('   Veja score, observações e sugestão de resposta');
  console.log('');
  console.log('📖 GUIA COMPLETO:');
  console.log('   TESTE_WHATSAPP_REAL.md');
  
})();










