import { z } from 'zod';
export type EnvelopeStatus = 'draft' | 'active' | 'running' | 'completed' | 'canceled' | 'expired';
export type DocumentStatus = 'draft' | 'running' | 'completed' | 'canceled' | 'closed';
export type SignerStatus = 'pending' | 'signed' | 'rejected' | 'canceled';
export type NotificationChannel = 'email' | 'sms' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sending' | 'sent' | 'delivered' | 'failed' | 'retryScheduled';
export type AuthenticationMethod = 'emailToken' | 'emailOtp' | 'whatsappToken' | 'smsToken' | 'smsOtp' | 'ipAddress' | 'geolocation' | 'officialDocument' | 'selfieWithDocument' | 'addressProof' | 'selfie';
export type QualificationType = 'parte' | 'testemunha' | 'other' | 'gestor' | 'diretor' | 'funcionario' | 'fornecedor' | 'cliente' | 'estudante' | 'professor' | 'coordenador' | 'orientador';
export type DocumentType = 'cpf' | 'cnpj' | 'rg' | 'cnh' | 'passport' | 'other';
export declare enum LetterheadPosition {
    BACKGROUND = "BACKGROUND",// Atrás do conteúdo (papel timbrado tradicional)
    OVERLAY = "OVERLAY"
}
export type LetterheadApplyTo = 'ALL' | 'FIRST' | 'FIRST_LAST';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}
export declare const ApiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    message: z.ZodOptional<z.ZodString>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export interface ClientConfig {
    baseURL: string;
    accessToken?: string;
    apiKey?: string;
    timeout?: number;
    /** Habilitar cache local de ETags (padrão: false) */
    enableEtagCache?: boolean;
    /** Opções de configuração do cache de ETags */
    etagCacheOptions?: {
        /** TTL padrão em milissegundos (padrão: 300000 = 5min) */
        defaultTtl?: number;
        /** Tamanho máximo do cache (padrão: 500) */
        maxSize?: number;
        /** Habilitar logging (padrão: false) */
        debug?: boolean;
    };
}
/**
 * Opções para requisições com suporte a ETags
 */
export interface RequestOptions {
    /**
     * ETag para enviar no header If-None-Match (GET)
     * Usado para validação condicional: se o recurso não mudou, retorna 304 Not Modified
     */
    ifNoneMatch?: string;
    /**
     * ETag para enviar no header If-Match (PUT/PATCH/DELETE)
     * Usado para optimistic locking: só permite modificação se o recurso está na versão esperada
     * Retorna 412 Precondition Failed se houver conflito
     */
    ifMatch?: string;
    /**
     * Usar cache local de ETags (se habilitado no cliente)
     * Se true e houver ETag cacheado, será enviado automaticamente
     * @default true
     */
    useCache?: boolean;
}
/**
 * Resposta enriquecida com metadados de cache
 */
export interface CachedResponse<T> {
    /**
     * Dados do recurso
     */
    data: T;
    /**
     * ETag recebido do servidor
     */
    etag?: string;
    /**
     * Header Last-Modified recebido
     */
    lastModified?: string;
    /**
     * Se os dados vieram do cache local (304 Not Modified)
     */
    fromCache: boolean;
    /**
     * Timestamp de expiração do cache (se aplicável)
     */
    expiresAt?: number;
}
export interface OrganizationSettings {
    id: string;
    organizationId: string;
    defaultPublicVerification: boolean;
    defaultPublicDownload: boolean;
    stampTemplate?: StampTemplate;
    stampPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    organizationName?: string;
    organizationLogoUrl?: string;
    organizationWebsite?: string;
    /** Estratégia de assinatura digital (VISUAL_ONLY, PADES_EACH, PADES_FINAL, HYBRID, HYBRID_SEALED) */
    signatureStrategy: 'VISUAL_ONLY' | 'PADES_EACH' | 'PADES_FINAL' | 'HYBRID' | 'HYBRID_SEALED';
    /** ID do certificado digital padrão da organização (para selos automáticos) */
    defaultCertificateId?: string;
    /** Requer PAdES para todos os signatários (force all) */
    requirePadesForAll: boolean;
    /** Aplicar PAdES automaticamente usando senha armazenada (automação) */
    padesAutoApply: boolean;
    /** URL público do papel timbrado (PNG) */
    letterheadImageUrl?: string;
    /** S3 key do papel timbrado */
    letterheadImageKey?: string;
    /** Aplicar papel timbrado automaticamente em documentos */
    useLetterhead: boolean;
    /** Opacidade do papel timbrado (0-100). Menor valor = mais transparente */
    letterheadOpacity: number;
    /** Posição do papel timbrado: BACKGROUND (atrás) ou OVERLAY (na frente) */
    letterheadPosition: LetterheadPosition;
    /** Páginas onde aplicar o timbrado (ALL, FIRST, FIRST_LAST) */
    letterheadApplyToPages: LetterheadApplyTo;
    createdAt: string;
    updatedAt: string;
}
export interface StampTemplate {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    showLogo?: boolean;
    showQRCode?: boolean;
    fontSize?: number;
}
/**
 * Credenciais de login
 */
export interface AuthCredentials {
    email: string;
    password: string;
}
/**
 * Tokens JWT retornados pela API
 */
export interface AuthTokens {
    /** Access token JWT (curta duração, ~15min) */
    accessToken: string;
    /** Refresh token (longa duração, ~7 dias) */
    refreshToken: string;
    /** Tempo de expiração do access token em segundos */
    expiresIn: number;
}
/**
 * Resposta de login
 * Retornada por POST /auth/login
 */
export interface AuthResponse {
    /** Informações do usuário autenticado */
    user: {
        id: string;
        email: string;
        name: string;
        organizationId: string;
        role: string;
    };
    /** Tokens JWT */
    tokens: AuthTokens;
}
/**
 * Resposta de refresh token
 * Retornada por POST /auth/refresh
 */
export interface RefreshTokenResponse {
    /** Novo access token JWT */
    accessToken: string;
    /** Novo refresh token */
    refreshToken: string;
    /** Tempo de expiração do novo access token em segundos */
    expiresIn: number;
}
/**
 * Input para refresh token
 */
export interface RefreshTokenInput {
    /** Refresh token para renovar */
    refreshToken: string;
}
/**
 * Input para logout
 */
export interface LogoutInput {
    /** Refresh token a ser revogado */
    refreshToken: string;
}
/**
 * Informações do usuário
 */
export interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    role?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Resposta de GET /auth/me
 */
export interface CurrentUserResponse {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    role: string;
    createdAt: string;
}
export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    /** @deprecated Use page instead */
    currentPage?: number;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta?: PaginationMeta;
}
export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface FileInfo {
    name: string;
    size: number;
    type: string;
    content?: string;
}
export declare const FileInfoSchema: z.ZodObject<{
    name: z.ZodString;
    size: z.ZodNumber;
    type: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export interface Timestamps {
    createdAt: string;
    updatedAt: string;
}
export interface BaseFilters {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PreviewOptions {
    width?: number;
    height?: number;
    page?: number;
    format?: 'png' | 'jpg';
}
/**
 * @deprecated Preview deve ser obtido via documents.preview() + PDF.js
 */
export interface PreviewResponse {
    previewUrl: string;
    expiresAt: string;
}
export interface ZipGenerationStatus {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
    downloadUrl?: string;
    expiresAt?: string;
    errorMessage?: string;
}
/**
 * Status geral de um componente do sistema
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
/**
 * Informações sobre a saúde de uma dependência
 */
export interface DependencyHealth {
    /** Status da dependência */
    status: HealthStatus;
    /** Tempo de resposta em milissegundos */
    responseTime: number;
    /** Última vez que foi verificado */
    lastChecked: string;
    /** Mensagem de erro (se houver) */
    error?: string;
}
/**
 * Métricas do pool de conexões do banco de dados
 */
export interface DatabaseMetrics {
    connectionPool?: {
        /** Conexões ativas */
        active: number;
        /** Conexões ociosas */
        idle: number;
        /** Total de conexões no pool */
        total: number;
    };
}
/**
 * Métricas do storage (S3)
 */
export interface StorageMetrics {
    /** Nome do bucket S3 */
    bucketName?: string;
    /** Região AWS */
    region?: string;
}
/**
 * Métricas de memória do processo
 */
export interface MemoryMetrics {
    /** Memória usada em bytes */
    used: number;
    /** Memória total em bytes */
    total: number;
    /** Percentual de memória usada */
    percentage: number;
    /** Heap usado em bytes */
    heapUsed: number;
    /** Heap total em bytes */
    heapTotal: number;
}
/**
 * Health check completo do sistema
 * Retornado por GET /health
 */
export interface HealthCheck {
    /** Status geral do sistema */
    status: HealthStatus;
    /** Timestamp ISO 8601 da verificação */
    timestamp: string;
    /** Tempo de uptime do processo em segundos */
    uptime: number;
    /** Versão da aplicação */
    version: string;
    /** Ambiente de execução */
    environment: string;
    /** Status das dependências */
    dependencies: {
        /** Banco de dados PostgreSQL */
        database: DependencyHealth & DatabaseMetrics;
        /** Storage S3 */
        storage: DependencyHealth & StorageMetrics;
        /** Cache Redis */
        cache: DependencyHealth;
        /** Fila de jobs (Bull) */
        queue: DependencyHealth;
    };
    /** Métricas de recursos do sistema */
    metrics: {
        /** Métricas de memória */
        memory: MemoryMetrics;
        /** Uso de CPU em segundos */
        cpu: number;
    };
}
/**
 * Readiness probe para Kubernetes
 * Retornado por GET /health/ready
 */
export interface ReadinessStatus {
    /** Sistema pronto para receber requisições */
    ready: boolean;
    /** Status code HTTP (503 se not ready, 200 se ready) */
    statusCode?: number;
}
/**
 * Liveness probe para Kubernetes
 * Retornado por GET /health/live
 */
export interface LivenessStatus {
    /** Processo está vivo */
    alive: boolean;
}
//# sourceMappingURL=common.types.d.ts.map