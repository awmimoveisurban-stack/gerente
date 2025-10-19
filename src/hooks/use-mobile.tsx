import { useState, useEffect } from 'react';

// 📱 HOOK PARA DETECTAR DISPOSITIVOS MÓVEIS
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar no carregamento
    checkIsMobile();

    // Escutar mudanças de tamanho
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;

