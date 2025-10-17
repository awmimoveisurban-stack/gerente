// ============================================================================
// SCRIPT: LIMPEZA ULTRA AGRESSIVA DE CACHE - EXECUTAR IMEDIATAMENTE
// Execute este script no console do navegador (F12) - COPIE E COLE TUDO
// ============================================================================

console.log('🚨 LIMPEZA ULTRA AGRESSIVA INICIADA...');

// 1. PARAR TODOS OS TIMERS E INTERVALOS
console.log('⏹️ Parando todos os timers...');
for (let i = 1; i < 10000; i++) {
  clearTimeout(i);
  clearInterval(i);
}

// 2. LIMPAR TODOS OS STORAGES COMPLETAMENTE
console.log('🗑️ Limpando storages...');
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storages limpos');
} catch (e) {
  console.log('⚠️ Erro ao limpar storages:', e);
}

// 3. LIMPAR TODOS OS ITENS MANUALMENTE
console.log('🔍 Limpando itens manualmente...');
const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
allKeys.forEach(key => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  } catch (e) {
    console.log(`⚠️ Erro ao remover ${key}:`, e);
  }
});

// 4. LIMPAR COOKIES
console.log('🍪 Limpando cookies...');
document.cookie.split(";").forEach(cookie => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
});

// 5. LIMPAR INDEXEDDB
console.log('🗄️ Limpando IndexedDB...');
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
      console.log(`✅ IndexedDB deletado: ${db.name}`);
    });
  }).catch(e => console.log('⚠️ Erro IndexedDB:', e));
}

// 6. FORÇAR LIMPEZA DE CACHE DO NAVEGADOR
console.log('🌐 Forçando limpeza de cache...');
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`✅ Cache deletado: ${name}`);
    });
  }).catch(e => console.log('⚠️ Erro cache:', e));
}

// 7. VERIFICAR SE AINDA HÁ DADOS
setTimeout(() => {
  console.log('🔍 Verificação final...');
  const remainingKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  
  if (remainingKeys.length === 0) {
    console.log('✅ TODOS OS STORAGES ESTÃO LIMPOS!');
  } else {
    console.log('⚠️ Ainda há dados:', remainingKeys);
    remainingKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removido novamente: ${key}`);
      } catch (e) {}
    });
  }
  
  // 8. FORÇAR RECARREGAMENTO COMPLETO
  console.log('🔄 RECARREGANDO PÁGINA EM 2 SEGUNDOS...');
  setTimeout(() => {
    window.location.href = window.location.href;
  }, 2000);
}, 1000);

console.log('✅ LIMPEZA ULTRA AGRESSIVA CONCLUÍDA!');
