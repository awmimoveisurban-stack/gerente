# 🔧 CORREÇÃO RÁPIDA - SUPABASE UNDEFINED

## ❌ **ERRO:**
```
ReferenceError: supabase is not defined
```

**Causa**: Você não está na página correta ou o Supabase não foi carregado.

---

## ✅ **SOLUÇÃO RÁPIDA:**

### **PASSO 1: 🌐 Ir para a página correta**
1. **Abra**: http://localhost:3000/gerente/whatsapp
2. **Ou**: http://localhost:3000/auth (para fazer login)

### **PASSO 2: 🔐 Fazer login**
1. **Email**: `gerente@imobiliaria.com`
2. **Senha**: `admin123`
3. **Clique**: "Entrar"

### **PASSO 3: 🧪 Testar novamente**
1. **Pressione**: F12 (abrir console)
2. **Cole**: O script `test-complete-system.js`
3. **Pressione**: Enter

---

## 🚀 **SCRIPT DE TESTE ATUALIZADO:**

```javascript
// 🧪 TESTE COMPLETO DO SISTEMA - VERSÃO ROBUSTA
async function testCompleteSystem() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA');
  
  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      console.log('💡 Verificar se está na página correta');
      console.log('📍 Deve estar em: http://localhost:3000/gerente/whatsapp');
      return;
    }
    
    console.log('✅ Supabase carregado');
    
    // 2. Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Faça login primeiro em /auth');
      return;
    }
    
    console.log('✅ Usuário:', session.user.email);
    
    // 3. Teste Profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro profiles:', profileError);
      console.log('💡 Executar SQL: fix-profiles-simple.sql');
    } else {
      console.log('✅ Profiles OK');
    }
    
    // 4. Teste WhatsApp Config
    const { data: whatsapp, error: whatsappError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('instance_name', 'empresa-whatsapp');
    
    if (whatsappError) {
      console.error('❌ Erro whatsapp_config:', whatsappError);
      console.log('💡 Executar SQL: fix-whatsapp-config-table.sql');
    } else {
      console.log('✅ WhatsApp Config OK');
    }
    
    // 5. Resumo
    if (!profileError && !whatsappError) {
      console.log('🎉 DATABASE CORRIGIDO!');
    } else {
      console.log('⚠️ Executar SQLs de correção');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testCompleteSystem();
```

---

## 🎯 **RESULTADO ESPERADO:**

### **✅ Se estiver na página correta:**
- ✅ **Supabase carregado**
- ✅ **Usuário autenticado**
- ✅ **Testes executados**

### **❌ Se não estiver na página correta:**
- ❌ **Supabase não está carregado**
- ❌ **Ir para página correta**

---

## 🚀 **EXECUTE OS PASSOS ACIMA!**

**O teste funcionará corretamente!** 🎉





