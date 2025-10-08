# ✅ CORREÇÃO: ERRO DE ORDEM DOS HOOKS NO LEADS.TSX

## 🚨 **PROBLEMA IDENTIFICADO:**

A página `leads.tsx` apresentava erro crítico de **ordem dos hooks do React**:

```
Warning: React has detected a change in the order of Hooks called by Leads. 
This will lead to bugs and errors if not fixed.
```

### **❌ Erro Específico:**
```
Uncaught Error: Rendered more hooks than during the previous render.
```

---

## 🔍 **CAUSA RAIZ:**

### **Violação das Regras dos Hooks:**
O hook `useCallback` estava sendo chamado **depois** do `return` condicional:

```typescript
// ❌ INCORRETO - Hook após return condicional
if (loading) {
  return (
    <AppLayout>
      <LeadsLoadingSkeleton />
    </AppLayout>
  );
}

const handleCloseModals = useCallback(() => { // ❌ ERRO: Hook após return
  // ...
}, []);
```

### **Por que isso é um problema:**
1. **Hooks devem sempre ser chamados na mesma ordem** em cada render
2. **Hooks não podem ser chamados condicionalmente** ou após returns
3. **React depende da ordem dos hooks** para manter o estado interno

---

## ✅ **SOLUÇÃO IMPLEMENTADA:**

### **Correção da Ordem dos Hooks:**

```typescript
// ✅ CORRETO - Todos os hooks no topo, antes de qualquer return

export default function Leads() {
  // 1. Estados dos modais
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // ... outros estados

  // 2. Handlers para modais
  const handleAddLead = useCallback(() => {
    setShowAddLeadModal(true);
  }, []);

  // 3. Hook personalizado para filtros
  const {
    filters,
    setSearchTerm,
    setStatusFilter,
    resetFilters,
    filteredLeads,
    handleExportLeads,
    handleViewKanban,
    handleAddLead: handleAddLeadFromHook,
    getStatusCount
  } = useLeadsFilters(leads, handleAddLead);

  // 4. Effects
  useEffect(() => {
    if (location.state?.searchTerm) {
      setGlobalSearchTerm(location.state.searchTerm);
    }
  }, [location.state, setGlobalSearchTerm]);

  useEffect(() => {
    if (globalSearchTerm !== filters.searchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [globalSearchTerm, filters.searchTerm, setSearchTerm]);

  // 5. Memoized calculations
  const metrics = useMemo(() => {
    // ... cálculos
  }, [leads]);

  // 6. TODOS os hooks devem estar ANTES de qualquer return condicional
  const handleCloseModals = useCallback(() => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowCallModal(false);
    setShowEmailModal(false);
    setShowVisitModal(false);
    setShowAddLeadModal(false);
    setSelectedLead(null);
  }, []);

  // 7. AGORA SIM - Loading state após todos os hooks
  if (loading) {
    return (
      <AppLayout>
        <LeadsLoadingSkeleton />
      </AppLayout>
    );
  }

  // 8. Return principal
  return (
    // ... JSX
  );
}
```

---

## 📋 **REGRAS DOS HOOKS DO REACT:**

### **1. ✅ Sempre chame hooks no topo do componente**
```typescript
// ✅ CORRETO
function MyComponent() {
  const [state, setState] = useState(0);
  const memoizedValue = useMemo(() => expensiveCalculation(), []);
  
  if (condition) return <div>Loading...</div>;
  
  return <div>{state}</div>;
}
```

### **2. ❌ Nunca chame hooks condicionalmente**
```typescript
// ❌ INCORRETO
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0); // ❌ Hook condicional
  }
  
  return <div>Content</div>;
}
```

### **3. ❌ Nunca chame hooks após returns**
```typescript
// ❌ INCORRETO
function MyComponent() {
  if (loading) {
    return <div>Loading...</div>; // Return condicional
  }
  
  const [state, setState] = useState(0); // ❌ Hook após return
  return <div>{state}</div>;
}
```

### **4. ✅ Sempre chame hooks na mesma ordem**
```typescript
// ✅ CORRETO
function MyComponent() {
  const [state1, setState1] = useState(0);    // Hook 1
  const [state2, setState2] = useState(0);    // Hook 2
  const memoized = useMemo(() => {}, []);     // Hook 3
  
  if (loading) return <div>Loading...</div>;  // Return após hooks
  
  return <div>{state1}</div>;
}
```

---

## 🎯 **ORDEM CORRETA DOS HOOKS:**

### **1. Estados (`useState`)**
```typescript
const [state1, setState1] = useState(initialValue);
const [state2, setState2] = useState(initialValue);
```

### **2. Contextos (`useContext`)**
```typescript
const contextValue = useContext(MyContext);
```

### **3. Reducers (`useReducer`)**
```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

### **4. Memoização (`useMemo`, `useCallback`)**
```typescript
const memoizedValue = useMemo(() => expensiveCalculation(), [deps]);
const memoizedCallback = useCallback(() => doSomething(), [deps]);
```

### **5. Effects (`useEffect`, `useLayoutEffect`)**
```typescript
useEffect(() => {
  // side effect
}, [deps]);
```

### **6. Refs (`useRef`)**
```typescript
const ref = useRef(null);
```

### **7. Hooks personalizados**
```typescript
const customHookResult = useMyCustomHook();
```

### **8. Returns condicionais**
```typescript
if (loading) return <Loading />;
if (error) return <Error />;
```

### **9. Return principal**
```typescript
return <MainContent />;
```

---

## 🔧 **VERIFICAÇÃO DA CORREÇÃO:**

### **Antes da Correção:**
```typescript
// ❌ Ordem incorreta
if (loading) {
  return <LeadsLoadingSkeleton />; // Return condicional
}
const handleCloseModals = useCallback(() => {}, []); // Hook após return
```

### **Depois da Correção:**
```typescript
// ✅ Ordem correta
const handleCloseModals = useCallback(() => {}, []); // Hook no topo
if (loading) {
  return <LeadsLoadingSkeleton />; // Return após hooks
}
```

---

## 📊 **RESULTADO:**

### **✅ Erro Corrigido:**
- ❌ ~~"Rendered more hooks than during the previous render"~~
- ❌ ~~"React has detected a change in the order of Hooks"~~
- ✅ **Hooks em ordem correta e consistente**
- ✅ **Componente renderiza sem erros**
- ✅ **Performance mantida**

### **✅ Benefícios:**
- 🚀 **Estabilidade** - Sem erros de renderização
- 🚀 **Performance** - Hooks otimizados
- 🚀 **Manutenibilidade** - Código mais limpo
- 🚀 **Debugging** - Mais fácil identificar problemas

---

## 🎓 **LIÇÕES APRENDIDAS:**

### **1. Sempre seguir as Regras dos Hooks:**
- ✅ Hooks sempre no topo
- ✅ Mesma ordem em cada render
- ✅ Nunca condicionalmente
- ✅ Nunca após returns

### **2. Estrutura recomendada:**
```typescript
function MyComponent() {
  // 1. Estados
  // 2. Contextos  
  // 3. Memoização
  // 4. Effects
  // 5. Hooks personalizados
  // 6. Returns condicionais
  // 7. Return principal
}
```

### **3. Ferramentas de debugging:**
- 🔍 **React DevTools** - Inspecionar hooks
- 🔍 **ESLint** - Plugin `eslint-plugin-react-hooks`
- 🔍 **Console warnings** - Avisos de ordem dos hooks

---

**A correção garante que a página `leads.tsx` funcione corretamente sem violar as regras fundamentais dos hooks do React!** 🚀✅





