// ============================================================================
// SCRIPT: LIMPEZA COMPLETA E FORÇADA DE CACHE - URGENTE
// Execute este script no console do navegador (F12)
// ============================================================================

console.log('🧹 INICIANDO LIMPEZA COMPLETA E FORÇADA...');

// 1. Limpar TODOS os storages
function clearAllStorages() {
  console.log('🗑️ Limpando todos os storages...');
  
  // Limpar localStorage completamente
  localStorage.clear();
  console.log('✅ localStorage limpo');
  
  // Limpar sessionStorage completamente
  sessionStorage.clear();
  console.log('✅ sessionStorage limpo');
  
  // Limpar IndexedDB se existir
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
        console.log(`✅ IndexedDB deletado: ${db.name}`);
      });
    });
  }
}

// 2. Limpar cookies relacionados
function clearCookies() {
  console.log('🍪 Limpando cookies...');
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
  });
  console.log('✅ Cookies limpos');
}

// 3. Executar limpeza completa
clearAllStorages();
clearCookies();

// 4. Verificar se ainda há dados
setTimeout(() => {
  console.log('🔍 Verificando se ainda há dados...');
  const remainingKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  
  if (remainingKeys.length === 0) {
    console.log('✅ Todos os storages estão limpos!');
  } else {
    console.log('⚠️ Ainda há dados:', remainingKeys);
  }
  
  // 5. Forçar recarregamento
  console.log('🔄 Recarregando página em 3 segundos...');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}, 1000);
