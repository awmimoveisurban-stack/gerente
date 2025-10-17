// ============================================================================
// SCRIPT: LIMPEZA ESPECÍFICA DO ZUSTAND GLOBAL-AUTH-STORAGE
// Execute este script no console do navegador (F12) - COPIE E COLE TUDO
// ============================================================================

console.log('🎯 LIMPEZA ESPECÍFICA DO ZUSTAND INICIADA...');

// 1. Limpar especificamente o global-auth-storage
const storageKeys = [
  'global-auth-storage',
  'global-auth-storage-v2',
  'global-auth-storage-v1',
  'force-offline-user',
  'offline-user',
  'secure-auth-storage',
  'session-manager-storage',
  'auth-session',
  'user-session'
];

console.log('🗑️ Limpando storages específicos...');
storageKeys.forEach(key => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  } catch (e) {
    console.log(`⚠️ Erro ao remover ${key}:`, e);
  }
});

// 2. Limpar todos os itens que contenham IDs antigos
console.log('🔍 Procurando por IDs antigos...');
const oldIds = ['gerente-fixed-id', 'corretor-fixed-id', 'offline-gerente-fixed-id', 'offline-corretor-fixed-id'];

// Verificar localStorage
Object.keys(localStorage).forEach(key => {
  try {
    const value = localStorage.getItem(key);
    if (value && oldIds.some(id => value.includes(id))) {
      localStorage.removeItem(key);
      console.log(`✅ Removido localStorage com ID antigo: ${key}`);
    }
  } catch (e) {
    console.log(`⚠️ Erro ao verificar localStorage ${key}:`, e);
  }
});

// Verificar sessionStorage
Object.keys(sessionStorage).forEach(key => {
  try {
    const value = sessionStorage.getItem(key);
    if (value && oldIds.some(id => value.includes(id))) {
      sessionStorage.removeItem(key);
      console.log(`✅ Removido sessionStorage com ID antigo: ${key}`);
    }
  } catch (e) {
    console.log(`⚠️ Erro ao verificar sessionStorage ${key}:`, e);
  }
});

// 3. Limpar completamente todos os storages
console.log('🧹 Limpeza completa...');
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storages completamente limpos');
} catch (e) {
  console.log('⚠️ Erro na limpeza completa:', e);
}

// 4. Verificar resultado
setTimeout(() => {
  console.log('🔍 Verificação final...');
  const remainingKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  
  if (remainingKeys.length === 0) {
    console.log('✅ TODOS OS STORAGES ESTÃO LIMPOS!');
  } else {
    console.log('⚠️ Ainda há dados:', remainingKeys);
  }
  
  // 5. Forçar recarregamento
  console.log('🔄 RECARREGANDO PÁGINA EM 2 SEGUNDOS...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}, 1000);

console.log('✅ LIMPEZA ESPECÍFICA CONCLUÍDA!');
