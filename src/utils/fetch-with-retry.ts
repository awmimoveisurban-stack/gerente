/**
 * Fetch com retry exponencial e timeout
 *
 * @param url - URL da API
 * @param options - Opções do fetch
 * @param maxRetries - Número máximo de tentativas (padrão: 3)
 * @param timeoutMs - Timeout em milissegundos (padrão: 10000)
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  timeoutMs = 10000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries}: ${url}`);

      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Se sucesso ou erro do cliente (4xx), retornar imediatamente
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        if (response.ok) {
          console.log(`✅ Sucesso na tentativa ${attempt + 1}`);
        }
        return response;
      }

      // Se erro de servidor (5xx), tentar novamente
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      lastError = error;

      // Se erro de timeout
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Timeout (${timeoutMs}ms) na tentativa ${attempt + 1}`);
      } else {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou:`, error.message);
      }

      // Se não for a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`⏱️ Aguardando ${delay}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Se todas as tentativas falharam
  console.error(`❌ Todas as ${maxRetries} tentativas falharam`);
  throw lastError || new Error('Todas as tentativas falharam');
}




