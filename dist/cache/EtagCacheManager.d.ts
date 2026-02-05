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
export declare class EtagCacheManager {
    private cache;
    private readonly options;
    constructor(options?: EtagCacheOptions);
    /**
     * Armazena ETag e dados no cache
     *
     * @param url - URL do recurso (sem baseURL, ex: '/api/v1/documents/123')
     * @param etag - ETag recebido do servidor
     * @param data - Dados do recurso para cachear
     * @param maxAge - maxAge do Cache-Control em segundos (opcional)
     * @param lastModified - Header Last-Modified (opcional)
     */
    set<T = any>(url: string, etag: string, data: T, maxAge?: number, lastModified?: string): void;
    /**
     * Recupera entrada de cache se ainda válida
     *
     * @param url - URL do recurso
     * @returns Entrada de cache ou null se expirado/não encontrado
     */
    get<T = any>(url: string): EtagCacheEntry<T> | null;
    /**
     * Invalida cache de uma URL específica
     *
     * @param url - URL do recurso
     */
    invalidate(url: string): void;
    /**
     * Invalida cache de URLs que correspondem a um padrão
     *
     * @param pattern - Regex ou string para match
     */
    invalidatePattern(pattern: string | RegExp): void;
    /**
     * Limpa todo o cache
     */
    clear(): void;
    /**
     * Retorna estatísticas do cache
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate?: number;
    };
    /**
     * Remove entradas expiradas (limpeza manual)
     * Útil para ser chamado periodicamente
     */
    cleanup(): number;
}
//# sourceMappingURL=EtagCacheManager.d.ts.map