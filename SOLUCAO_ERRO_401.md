# 🔐 SOLUÇÃO ERRO 401 - Autenticação

## 📊 Problema Identificado
- ✅ **Edge Function**: Existe e está funcionando
- ✅ **Servidor**: Respondendo corretamente
- ❌ **Autenticação**: Erro 401 (Unauthorized)
- ❌ **Causa**: Token de autenticação inválido ou ausente

---

## 🔧 SOLUÇÃO IMEDIATA

### **PASSO 1: Testar Autenticação (2 minutos)**

Execute no console do navegador:
```javascript
// Cole o conteúdo de test-edge-function-with-auth.js
```

### **PASSO 2: Verificar Autenticação (3 minutos)**

#### **2.1. Verificar se está logado**
1. **Acesse** a página do sistema
2. **Verifique** se está logado
3. **Se não estiver**, faça login

#### **2.2. Verificar token no console**
```javascript
// Execute no console:
console.log('Token localStorage:', localStorage.getItem('supabase.auth.token'));
console.log('Token sessionStorage:', sessionStorage.getItem('supabase.auth.token'));

// Se houver Supabase client:
if (window.supabase) {
  window.supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('Session:', session);
  });
}
```

### **PASSO 3: Fazer Login (5 minutos)**

#### **3.1. Se não estiver logado**
1. **Acesse** a página de login
2. **Faça login** com suas credenciais
3. **Verifique** se o token é criado

#### **3.2. Se estiver logado mas token inválido**
1. **Faça logout**
2. **Faça login novamente**
3. **Teste** a Edge Function

---

## 🧪 SCRIPTS DE TESTE

### **Teste de Autenticação**
```javascript
// Cole no console:
async function testAuth() {
  // Verificar token
  const token = localStorage.getItem('supabase.auth.token') || 
                sessionStorage.getItem('supabase.auth.token');
  
  if (token) {
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    
    // Testar Edge Function
    const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'test' })
    });
    
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } else {
    console.log('❌ Nenhum token encontrado');
    console.log('💡 Faça login no sistema');
  }
}
testAuth();
```

### **Teste sem Autenticação**
```javascript
// Cole no console:
async function testNoAuth() {
  const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'test' })
  });
  
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
}
testNoAuth();
```

---

## 🔧 TROUBLESHOOTING

### **Se erro 401 persistir:**
1. **Verifique** se está logado
2. **Renove** o token (logout/login)
3. **Verifique** se o token não expirou

### **Se não conseguir fazer login:**
1. **Verifique** credenciais
2. **Verifique** se o sistema está funcionando
3. **Teste** em modo incógnito

### **Se token existir mas não funcionar:**
1. **Verifique** se o token não expirou
2. **Renove** o token
3. **Verifique** se o token é válido

---

## 🎯 RESULTADO ESPERADO

### **Após Corrigir:**
```
✅ Usuário autenticado
✅ Token válido
✅ Edge Function retorna status 200
✅ Sistema funcionando
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Execute** o teste de autenticação
2. **Faça login** se necessário
3. **Teste** a Edge Function novamente
4. **Configure** WhatsApp se funcionando

**O erro 401 é mais fácil de resolver que o 500! Execute os testes acima.** 🚀
