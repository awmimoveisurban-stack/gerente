/**
 * Fetch with timeout utility
 * Previne requests infinitos que travam a UI
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // ms
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options; // 30s default

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(
        `Tempo esgotado após ${timeout / 1000}s. Verifique sua conexão e tente novamente.`
      );
    }

    throw error;
  }
}



