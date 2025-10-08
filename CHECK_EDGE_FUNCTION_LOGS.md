# 🔍 VERIFICAR LOGS DA EDGE FUNCTION

## ❌ Problema Persistente
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

## 🔍 VERIFICAR LOGS

---

## 🚀 PASSOS PARA VERIFICAR LOGS

### **PASSO 1: Acessar Logs**
1. **Supabase Dashboard** → Edge Functions
2. **Clique** na função `whatsapp-connect`
3. **Aba "Logs"**

### **PASSO 2: Executar Teste**
1. **Frontend** → "🔍 Test Edge Function"
2. **Voltar** para os logs
3. **Verificar** se aparecem novos logs

### **PASSO 3: Analisar Logs**
**Procure por:**
- ✅ **Logs de sucesso**
- ❌ **Logs de erro**
- ❌ **Stack traces**
- ❌ **Mensagens de erro**

---

## 🔧 PROBLEMAS COMUNS E SOLUÇÕES

### **Se não há logs:**
- ❌ **Edge Function não existe**
- ✅ **Solução**: Criar Edge Function

### **Se há erro de autenticação:**
- ❌ **SUPABASE_SERVICE_ROLE_KEY incorreta**
- ✅ **Solução**: Verificar chave

### **Se há erro de Evolution API:**
- ❌ **AUTHENTICATION_API_KEY incorreta**
- ✅ **Solução**: Verificar chave

### **Se há erro de URL:**
- ❌ **SERVER_URL incorreta**
- ✅ **Solução**: Verificar URL

---

## 🧪 TESTE APÓS CORRIGIR

### **Logs devem mostrar:**
```
✅ Edge Function started
✅ User authenticated
✅ Action received: test
✅ Test successful
```

### **Não deve aparecer:**
```
❌ Error: ...
❌ Failed to ...
❌ Invalid ...
```

---

## 🎯 RESULTADO ESPERADO

### **Após corrigir:**
```
✅ Logs mostram sucesso
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ Sistema funcionando
```

---

## 🎉 CONCLUSÃO

**Verifique os logs para identificar o problema exato!** 🔍

**Após corrigir, o sistema funcionará perfeitamente!** ✅





