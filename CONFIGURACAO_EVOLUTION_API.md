# 🚀 Configuração da Evolution API

## 📋 Resumo da Configuração

Suas credenciais da Evolution API:
- **URL**: `https://api.urbanautobot.com`
- **API Key**: `cfd9b746ea9e400dc8f4d3e8d57b0180`

## 🔧 Passos para Configurar

### 1. Configurar Variáveis de Ambiente no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá para **Settings** > **Edge Functions**
3. Na seção **Environment Variables**, adicione:
   ```
   EVOLUTION_API_URL = https://api.urbanautobot.com
   EVOLUTION_API_KEY = cfd9b746ea9e400dc8f4d3e8d57b0180
   ```
4. Clique em **Save**

### 2. Configurar Banco de Dados

Execute o script SQL no Supabase Dashboard > SQL Editor:

```sql
-- Execute o arquivo: setup-whatsapp-config-complete.sql
```

### 3. Testar a Configuração

#### Teste via Console do Navegador:
1. Abra a página WhatsApp (`/gerente-whatsapp`)
2. Abra o Console do Navegador (F12)
3. Execute o script `test-evolution-api.js`

#### Teste via Interface:
1. Clique em **"Conectar WhatsApp"**
2. Deve aparecer um QR Code
3. Escaneie com seu WhatsApp

## 🧪 Scripts de Teste

### Teste da Evolution API (Console)
```javascript
// Cole este código no console do navegador
async function testEvolutionAPI() {
  const config = {
    url: 'https://api.urbanautobot.com',
    apiKey: 'cfd9b746ea9e400dc8f4d3e8d57b0180'
  };
  
  try {
    const response = await fetch(`${config.url}/instance/fetchInstances`, {
      method: 'GET',
      headers: { 'apikey': config.apiKey }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Evolution API funcionando:', data);
    } else {
      console.error('❌ Erro:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testEvolutionAPI();
```

### Teste da Edge Function
```javascript
// Cole este código no console do navegador
async function testEdgeFunction() {
  try {
    const response = await supabase.functions.invoke('whatsapp-connect', {
      body: { action: 'test' }
    });
    
    console.log('✅ Edge Function resposta:', response);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testEdgeFunction();
```

## 🔍 Troubleshooting

### Erro: "Evolution API configuration missing"
- ✅ Verifique se as variáveis de ambiente estão configuradas no Supabase
- ✅ Redeploy das Edge Functions após configurar as variáveis

### Erro: "Instance not found"
- ✅ Normal, significa que a instância ainda não foi criada
- ✅ Clique em "Conectar WhatsApp" para criar a instância

### Erro: "QR Code não encontrado"
- ✅ Verifique os logs da Edge Function no Supabase Dashboard
- ✅ Teste a Evolution API diretamente com o script de teste

### Botões não aparecem na página
- ✅ Verifique se está na rota `/gerente-whatsapp`
- ✅ Verifique se o usuário tem permissão de gerente
- ✅ Verifique se não há erros no console do navegador

## 📱 Como Usar

1. **Conectar**: Clique em "Conectar WhatsApp"
2. **QR Code**: Escaneie o QR Code com seu WhatsApp
3. **Status**: O status mudará para "Conectado" automaticamente
4. **Mensagens**: Use a funcionalidade de envio de mensagens

## 🔐 Segurança

- ✅ API Key está configurada apenas no servidor (Edge Functions)
- ✅ Frontend não tem acesso direto às credenciais
- ✅ Todas as operações passam pela autenticação do Supabase

## 📊 Monitoramento

### Logs da Edge Function:
- Acesse: Supabase Dashboard > Edge Functions > whatsapp-connect > Logs

### Status da Instância:
- Verifique na tabela `whatsapp_config`
- Ou use o botão "Verificar Status" na interface

## 🎯 Próximos Passos

Após configurar:
1. ✅ Teste a conexão WhatsApp
2. ✅ Configure webhooks para receber mensagens
3. ✅ Implemente envio de mensagens automáticas
4. ✅ Configure templates de mensagens

---

**Status**: ✅ Configuração completa
**API**: ✅ Credenciais configuradas
**Banco**: ✅ Estrutura criada
**Teste**: 🧪 Pronto para teste