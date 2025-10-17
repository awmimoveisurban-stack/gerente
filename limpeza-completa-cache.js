// ============================================================================
// SCRIPT JAVASCRIPT: Limpeza completa de cache e forçar novos UUIDs
// Execute este script no console do navegador (F12 > Console)
// ============================================================================

console.log('🧹 Iniciando limpeza completa de cache...');

// 1. Limpar todos os storages
function clearAllStorages() {
  const keys = [
    'global-auth-storage',
    'force-offline-user', 
    'offline-user',
    'urban_crm_session',
    'secure-auth-storage',
    'auth-session',
    'user-session',
    'session-manager',
    'auth-token'
  ];
  
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
    } catch (error) {
      console.log(`⚠️ Erro ao remover ${key}:`, error);
    }
  });
}

// 2. Limpar todos os itens que contenham IDs antigos
function clearOldIds() {
  const oldIds = ['gerente-fixed-id', 'corretor-fixed-id', 'offline-gerente-fixed-id', 'offline-corretor-fixed-id'];
  
  // Limpar localStorage
  Object.keys(localStorage).forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && oldIds.some(id => value.includes(id))) {
        localStorage.removeItem(key);
        console.log(`✅ Removido localStorage: ${key}`);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao verificar localStorage ${key}:`, error);
    }
  });
  
  // Limpar sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    try {
      const value = sessionStorage.getItem(key);
      if (value && oldIds.some(id => value.includes(id))) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removido sessionStorage: ${key}`);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao verificar sessionStorage ${key}:`, error);
    }
  });
}

// 3. Executar limpeza
clearAllStorages();
clearOldIds();

// 4. Verificar se ainda há dados antigos
console.log('🔍 Verificando se ainda há dados antigos...');
const remainingKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
const oldIds = ['gerente-fixed-id', 'corretor-fixed-id', 'offline-gerente-fixed-id', 'offline-corretor-fixed-id'];

remainingKeys.forEach(key => {
  try {
    const localValue = localStorage.getItem(key);
    const sessionValue = sessionStorage.getItem(key);
    
    if (localValue && oldIds.some(id => localValue.includes(id))) {
      console.log(`⚠️ Ainda encontrado em localStorage: ${key}`);
    }
    
    if (sessionValue && oldIds.some(id => sessionValue.includes(id))) {
      console.log(`⚠️ Ainda encontrado em sessionStorage: ${key}`);
    }
  } catch (error) {
    // Ignorar erros
  }
});

// 5. Forçar recarregamento
console.log('🔄 Recarregando página em 2 segundos...');
setTimeout(() => {
  window.location.reload();
}, 2000);

console.log('✅ Limpeza concluída! A página será recarregada automaticamente.');
