# 🔧 CORRIGIR ERRO - Ação 'create' não existe

## ❌ Erro Atual
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

## ✅ Diagnóstico
- **Problema**: Frontend está chamando ação `create` que não existe na Edge Function
- **Ações disponíveis**: `test`, `connect`, `disconnect`
- **Solução**: Usar ação `connect` em vez de `create`

---

## 🔧 CORREÇÃO

### **PASSO 1: Verificar Edge Function**
A Edge Function `whatsapp-connect` tem as seguintes ações:
- ✅ `test` - Testa se a função está funcionando
- ✅ `connect` - Cria instância e obtém QR Code (ação unificada)
- ✅ `disconnect` - Desconecta a instância

### **PASSO 2: Corrigir Frontend**
O frontend deve usar a ação `connect` em vez de `create`:

```typescript
// ❌ INCORRETO (ação que não existe)
const response = await supabase.functions.invoke('whatsapp-connect', {
  body: {
    action: 'create',  // ← Esta ação não existe
    instanceName: 'empresa-whatsapp'
  }
});

// ✅ CORRETO (ação que existe)
const response = await supabase.functions.invoke('whatsapp-connect', {
  body: {
    action: 'connect',  // ← Esta ação existe e faz tudo
    instanceName: 'empresa-whatsapp'
  }
});
```

### **PASSO 3: Ação `connect` faz tudo**
A ação `connect` já faz:
- ✅ Verifica se instância existe
- ✅ Cria instância se necessário
- ✅ Obtém QR Code
- ✅ Salva no banco de dados

---

## 🧪 TESTAR CORREÇÃO

### **PASSO 4: Testar Edge Function**
1. **Frontend** → `/gerente/whatsapp`
2. **Clique** "🔍 Test Edge Function"
3. **Resultado esperado**: ✅ SUCCESS

### **PASSO 5: Testar Conexão**
1. **Clique** "Conectar WhatsApp" (que usa ação `connect`)
2. **QR Code** deve aparecer

---

## 🎯 RESULTADO ESPERADO

### **Após Corrigir:**
```
✅ Frontend usando ação correta
✅ Edge Function responde corretamente
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ QR Code aparece
✅ Sistema funcionando perfeitamente
```

---

## 🎉 CONCLUSÃO

**O problema é que o frontend está chamando uma ação que não existe!**

**Use a ação `connect` que já faz tudo que é necessário!** 🚀

**Após corrigir, o sistema funcionará perfeitamente!** ✅





