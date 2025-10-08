# 🔧 CORRIGIR SUPABASE CLIENT

## 📊 Problema Identificado
- ❌ **Supabase client**: Não encontrado
- ❌ **Causa**: Frontend não está configurado corretamente
- ❌ **Resultado**: Token não é armazenado

---

## 🚀 SOLUÇÃO IMEDIATA

### **PASSO 1: Configurar Arquivo .env (5 minutos)**

#### **1.1. Renomear arquivo**
```bash
# Renomear o arquivo
mv env-template.txt .env
```

#### **1.2. Verificar conteúdo do .env**
```
VITE_SUPABASE_PROJECT_ID="bxtuynqauqasigcbocbm"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o"
VITE_SUPABASE_URL="https://bxtuynqauqasigcbocbm.supabase.co"
EVOLUTION_API_URL="https://api.urbanautobot.com"
EVOLUTION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
```

#### **1.3. Reiniciar servidor**
```bash
# Parar o servidor (Ctrl+C)
# Reiniciar o servidor
npm run dev
# ou
yarn dev
```

### **PASSO 2: Verificar Configuração (5 minutos)**

Execute no console do navegador:
```javascript
// Cole o conteúdo de verificar-configuracao-supabase.js
```

### **PASSO 3: Verificar Importação do Supabase**

#### **3.1. Verificar arquivo de configuração**
1. **Abra** o arquivo de configuração do Supabase
2. **Verifique** se está importando corretamente
3. **Verifique** se as variáveis estão sendo usadas

#### **3.2. Exemplo de configuração correta**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### **PASSO 4: Testar Configuração (5 minutos)**

#### **4.1. Verificar se Supabase client foi criado**
```javascript
// Execute no console:
if (window.supabase) {
  console.log('✅ Supabase client encontrado');
  console.log('URL:', window.supabase.supabaseUrl);
  console.log('Key:', window.supabase.supabaseKey?.substring(0, 20) + '...');
} else {
  console.log('❌ Supabase client não encontrado');
}
```

#### **4.2. Testar autenticação**
```javascript
// Execute no console:
if (window.supabase) {
  window.supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.log('❌ Erro:', error);
    } else if (session) {
      console.log('✅ Sessão ativa:', session.user?.email);
      console.log('Token:', session.access_token?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Nenhuma sessão ativa');
    }
  });
}
```

---

## 🧪 SCRIPTS DE TESTE

### **Teste Completo**
```javascript
// Cole no console:
async function testSupabaseConfig() {
  // Verificar client
  if (!window.supabase) {
    console.log('❌ Supabase client não encontrado');
    return;
  }
  
  // Verificar sessão
  const { data: { session }, error } = await window.supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Erro:', error);
  } else if (session) {
    console.log('✅ Sessão ativa:', session.user?.email);
    
    // Testar Edge Function
    const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'test' })
    });
    
    console.log('Edge Function Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } else {
    console.log('⚠️ Nenhuma sessão ativa');
  }
}
testSupabaseConfig();
```

---

## 🔧 TROUBLESHOOTING

### **Se arquivo .env não funcionar:**
1. **Verifique** se está na raiz do projeto
2. **Verifique** se as variáveis estão corretas
3. **Reinicie** o servidor

### **Se Supabase client não for criado:**
1. **Verifique** se o Supabase está sendo importado
2. **Verifique** se há erros no console
3. **Verifique** se as dependências estão instaladas

### **Se autenticação não funcionar:**
1. **Verifique** se as credenciais estão corretas
2. **Verifique** se o sistema de auth está funcionando
3. **Faça logout** e login novamente

---

## 🎯 RESULTADO ESPERADO

### **Após Corrigir:**
```
✅ Arquivo .env configurado
✅ Supabase client inicializado
✅ Sessão ativa encontrada
✅ Token válido
✅ Edge Function funcionando
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Configure** o arquivo .env
2. **Reinicie** o servidor
3. **Execute** a verificação
4. **Teste** a Edge Function

**Configure o arquivo .env primeiro e reinicie o servidor!** 🔧
