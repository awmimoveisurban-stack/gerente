// ============================================================================
// SCRIPT JAVASCRIPT: Limpar cache local e forçar novos UUIDs
// Execute este script no console do navegador (F12 > Console)
// ============================================================================

console.log('🧹 Iniciando limpeza de cache...');

// Limpar todos os storages relacionados à autenticação
const storageKeys = [
  'global-auth-storage',
  'force-offline-user',
  'offline-user',
  'urban_crm_session',
  'secure-auth-storage',
  'auth-session',
  'user-session'
];

storageKeys.forEach(key => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  } catch (error) {
    console.log(`⚠️ Erro ao remover ${key}:`, error);
  }
});

// Limpar todos os itens que contenham "gerente-fixed-id" ou "corretor-fixed-id"
const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
allKeys.forEach(key => {
  try {
    const localValue = localStorage.getItem(key);
    const sessionValue = sessionStorage.getItem(key);
    
    if (localValue && (localValue.includes('gerente-fixed-id') || localValue.includes('corretor-fixed-id'))) {
      localStorage.removeItem(key);
      console.log(`✅ Removido localStorage: ${key}`);
    }
    
    if (sessionValue && (sessionValue.includes('gerente-fixed-id') || sessionValue.includes('corretor-fixed-id'))) {
      sessionStorage.removeItem(key);
      console.log(`✅ Removido sessionStorage: ${key}`);
    }
  } catch (error) {
    console.log(`⚠️ Erro ao verificar ${key}:`, error);
  }
});

// Forçar recarregamento da página para aplicar mudanças
console.log('🔄 Recarregando página...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('✅ Limpeza concluída! A página será recarregada automaticamente.');
