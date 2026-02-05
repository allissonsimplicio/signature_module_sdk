/**
 * Gerenciador de cache local de ETags no SDK
 *
 * Armazena ETags recebidos do servidor para uso em requisições condicionais,
 * permitindo que o SDK economize largura de banda ao receber 304 Not Modified.
 *
 * Funcionalidades:
 * - Armazenamento em memória de ETags por URL
 * - Expiração automática baseada em maxAge do Cache-Control
 * - Suporte a invalidação manual
 * - Thread-safe (Map nativo do JavaScript)
 *
 * @example
 * const cache = new EtagCacheManager();
 *
 * // Armazenar ETag recebido
 * cache.set('/api/v1/documents/123', {
 *   etag: '"abc123"',
 *   data: documentData,
 *   expiresAt: Date.now() + 300000, // 5 minutos
 * });
 *
 * // Recuperar para próxima requisição
 * const cached = cache.get('/api/v1/documents/123');
 * if (cached) {
 *   // Enviar If-None-Match: "abc123"
 * }
 */

/**
 * Entrada de cache com ETag e dados associados
 */
export interface EtagCacheEntry<T = any> {
  /**
   * ETag recebido do servidor (ex: "abc123" ou W/"abc123")
   */
  etag: string;

  /**
   * Dados do recurso cacheados
   */
  data: T;

  /**
   * Timestamp de quando o cache expira (milissegundos)
   */
  expiresAt: number;

  /**
   * Header Last-Modified recebido (opcional)
   */
  lastModified?: string;

  /**
   * URL completa do recurso
   */
  url: string;
}

/**
 * Opções para configurar o cache de ETags
 */
export interface EtagCacheOptions {
  /**
   * TTL padrão em milissegundos (se não houver maxAge no Cache-Control)
   * @default 300000 (5 minutos)
   */
  defaultTtl?: number;

  /**
   * Tamanho máximo do cache (número de entradas)
   * @default 500
   */
  maxSize?: number;

  /**
   * Habilitar logging de debug
   * @default false
   */
  debug?: boolean;
}

export class EtagCacheManager {
  private cache: Map<string, EtagCacheEntry>;
  private readonly options: Required<EtagCacheOptions>;

  constructor(options: EtagCacheOptions = {}) {
    this.cache = new Map();
    this.options = {
      defaultTtl: options.defaultTtl ?? 300000, // 5 minutos
      maxSize: options.maxSize ?? 500,
      debug: options.debug ?? false,
    };
  }

  /**
   * Armazena ETag e dados no cache
   *
   * @param url - URL do recurso (sem baseURL, ex: '/api/v1/documents/123')
   * @param etag - ETag recebido do servidor
   * @param data - Dados do recurso para cachear
   * @param maxAge - maxAge do Cache-Control em segundos (opcional)
   * @param lastModified - Header Last-Modified (opcional)
   */
  set<T = any>(
    url: string,
    etag: string,
    data: T,
    maxAge?: number,
    lastModified?: string,
  ): void {
    // Calcular expiração
    const ttl = maxAge ? maxAge * 1000 : this.options.defaultTtl;
    const expiresAt = Date.now() + ttl;

    // Se cache está cheio, remover entrada mais antiga
    if (this.cache.size >= this.options.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);

        if (this.options.debug) {
          console.log(`[EtagCache] Evicted oldest entry: ${firstKey}`);
        }
      }
    }

    this.cache.set(url, {
      etag,
      data,
      expiresAt,
      lastModified,
      url,
    });

    if (this.options.debug) {
      console.log(
        `[EtagCache] Cached ${url} with ETag ${etag} (expires in ${ttl}ms)`,
      );
    }
  }

  /**
   * Recupera entrada de cache se ainda válida
   *
   * @param url - URL do recurso
   * @returns Entrada de cache ou null se expirado/não encontrado
   */
  get<T = any>(url: string): EtagCacheEntry<T> | null {
    const entry = this.cache.get(url) as EtagCacheEntry<T> | undefined;

    if (!entry) {
      if (this.options.debug) {
        console.log(`[EtagCache] Cache miss for ${url}`);
      }
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      if (this.options.debug) {
        console.log(`[EtagCache] Expired entry for ${url}`);
      }
      return null;
    }

    if (this.options.debug) {
      console.log(`[EtagCache] Cache hit for ${url}: ${entry.etag}`);
    }

    return entry;
  }

  /**
   * Invalida cache de uma URL específica
   *
   * @param url - URL do recurso
   */
  invalidate(url: string): void {
    this.cache.delete(url);
    if (this.options.debug) {
      console.log(`[EtagCache] Invalidated ${url}`);
    }
  }

  /**
   * Invalida cache de URLs que correspondem a um padrão
   *
   * @param pattern - Regex ou string para match
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const url of this.cache.keys()) {
      if (regex.test(url)) {
        this.cache.delete(url);
        count++;
      }
    }

    if (this.options.debug) {
      console.log(`[EtagCache] Invalidated ${count} entries matching ${pattern}`);
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    if (this.options.debug) {
      console.log(`[EtagCache] Cleared ${size} entries`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
    };
  }

  /**
   * Remove entradas expiradas (limpeza manual)
   * Útil para ser chamado periodicamente
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [url, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(url);
        removed++;
      }
    }

    if (this.options.debug && removed > 0) {
      console.log(`[EtagCache] Cleaned up ${removed} expired entries`);
    }

    return removed;
  }
}
