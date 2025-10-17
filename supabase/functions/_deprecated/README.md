# 📦 Deprecated Functions

**Data:** 14 de Outubro de 2025  
**Motivo:** Substituídas por métodos mais modernos

---

## evolution-polling/

**Status:** ❌ OBSOLETO  
**Substituído por:** evolution-webhook  
**Motivo:** Webhook é instantâneo e mais confiável

### Por que foi deprecado:

```
Polling (antigo):
- Pergunta API a cada 60s
- Atraso de até 60 segundos
- Retornava 404 nesta Evolution API
- Formato v1 (obsoleto)
- Gasta recursos

Webhook (novo):
- Recebe instantaneamente (2-3s)
- Formato v2 (oficial)
- Funciona perfeitamente
- Profissional
- Eficiente
```

### Arquivos:
- `index.ts` - Polling básico
- `index-standalone.ts` - Versão standalone com IA
- `index-with-ai.ts` - Versão com integração IA
- `CODIGO_LIMPO_COPIAR.ts` - Versão final limpa

**Não use esses arquivos!** Use `evolution-webhook` instead.

---

**Mantidos apenas para referência histórica.**





