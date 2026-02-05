import { AxiosError, AxiosResponse } from 'axios';
import type { ValidationErrorResponse, ValidationErrorCode } from './types/authentication.types';
/**
 * Classe de erro customizada para a API de assinatura digital
 */
export declare class ApiError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly response?: AxiosResponse;
    readonly request?: any;
    readonly code?: string;
    readonly errors?: string[];
    readonly timestamp: string;
    readonly rateLimitLimit?: number;
    readonly rateLimitRemaining?: number;
    readonly rateLimitReset?: number;
    constructor(message: string, status?: number, statusText?: string, response?: AxiosResponse, request?: any, code?: string, errors?: string[], rateLimit?: {
        limit?: number;
        remaining?: number;
        reset?: number;
    });
    /**
     * Cria uma instância de ApiError a partir de um AxiosError
     */
    static fromAxiosError(axiosError: AxiosError): ApiError;
    /**
     * Verifica se o erro é de autenticação (401)
     */
    isAuthenticationError(): boolean;
    /**
     * Verifica se o erro é de autorização (403)
     */
    isAuthorizationError(): boolean;
    /**
     * Verifica se o erro é de recurso não encontrado (404)
     */
    isNotFoundError(): boolean;
    /**
     * Verifica se o erro é de validação (400, 422)
     */
    isValidationError(): boolean;
    /**
     * Verifica se o erro é de rate limiting (429)
     */
    isRateLimitError(): boolean;
    /**
     * Verifica se o erro é do servidor (5xx)
     */
    isServerError(): boolean;
    /**
     * Verifica se o erro é de rede
     */
    isNetworkError(): boolean;
    /**
     * Verifica se o erro é temporário e pode ser tentado novamente
     */
    isRetryable(): boolean;
    /**
     * 🆕 Verifica se o erro é de validação de documento
     *
     * Erros de validação ocorrem quando a imagem é rejeitada antes
     * do processamento AI (validação pré-upload).
     *
     * @returns true se for erro de validação de imagem
     *
     * @example
     * ```typescript
     * try {
     *   await client.authentication.uploadDocument(authReqId, { file });
     * } catch (error) {
     *   if (error.isDocumentValidationError()) {
     *     console.error('Imagem rejeitada:', error.message);
     *   }
     * }
     * ```
     */
    isDocumentValidationError(): boolean;
    /**
     * 🆕 Extrai ValidationErrorResponse do erro
     *
     * Retorna os detalhes estruturados do erro de validação,
     * incluindo mensagem amigável e dica de como corrigir.
     *
     * @returns Objeto ValidationErrorResponse ou null se não for erro de validação
     *
     * @example
     * ```typescript
     * try {
     *   await client.authentication.uploadDocument(authReqId, { file });
     * } catch (error) {
     *   const validationError = error.getValidationError();
     *   if (validationError) {
     *     console.error('Erro:', validationError.message);
     *     console.log('Dica:', validationError.humanTip);
     *     console.log('Pode retentar:', validationError.canRetry);
     *
     *     if (validationError.metadata) {
     *       console.log('Detalhes:', validationError.metadata);
     *     }
     *   }
     * }
     * ```
     */
    getValidationError(): ValidationErrorResponse | null;
    /**
     * Retorna uma representação JSON do erro
     */
    toJSON(): object;
    /**
     * Retorna uma representação string detalhada do erro
     */
    toString(): string;
    /**
     * Cria um erro de validação
     */
    static validationError(message: string, errors?: string[]): ApiError;
    /**
     * Cria um erro de autenticação
     */
    static authenticationError(message?: string): ApiError;
    /**
     * Cria um erro de autorização
     */
    static authorizationError(message?: string): ApiError;
    /**
     * Cria um erro de recurso não encontrado
     */
    static notFoundError(resource: string): ApiError;
    /**
     * Cria um erro de rate limiting
     */
    static rateLimitError(message?: string): ApiError;
    /**
     * 🆕 Cria um erro de validação de documento
     *
     * Factory method para criar erros de validação de imagem/documento.
     *
     * @param code - Código de erro de validação
     * @param message - Mensagem de erro
     * @param humanTip - Dica amigável de como corrigir
     * @param metadata - Metadados adicionais (tamanho, dimensões, etc)
     * @returns ApiError configurado como erro de validação
     *
     * @example
     * ```typescript
     * const error = ApiError.documentValidationError(
     *   'IMAGE_TOO_SMALL',
     *   'A resolução da imagem é muito baixa (mínimo 640x480).',
     *   'Use uma câmera de melhor qualidade ou aumente a resolução da foto.',
     *   { fileSize: 245678, dimensions: { width: 320, height: 240 } }
     * );
     * ```
     */
    static documentValidationError(code: ValidationErrorCode, message: string, humanTip: string, metadata?: any): ApiError;
}
//# sourceMappingURL=ApiError.d.ts.map