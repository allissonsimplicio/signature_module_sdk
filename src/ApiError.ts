import { AxiosError, AxiosResponse } from 'axios';
import type { ValidationErrorResponse, ValidationErrorCode } from './types/authentication.types';

/**
 * Classe de erro customizada para a API de assinatura digital
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly response?: AxiosResponse;
  public readonly request?: any;
  public readonly code?: string;
  public readonly errors?: string[];
  public readonly timestamp: string;
  public readonly rateLimitLimit?: number;
  public readonly rateLimitRemaining?: number;
  public readonly rateLimitReset?: number;

  constructor(
    message: string,
    status: number = 500,
    statusText: string = 'Internal Server Error',
    response?: AxiosResponse,
    request?: any,
    code?: string,
    errors?: string[],
    rateLimit?: { limit?: number; remaining?: number; reset?: number }
  ) {
    super(message);
    
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.request = request;
    this.code = code;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.rateLimitLimit = rateLimit?.limit;
    this.rateLimitRemaining = rateLimit?.remaining;
    this.rateLimitReset = rateLimit?.reset;

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Cria uma instância de ApiError a partir de um AxiosError
   */
  static fromAxiosError(axiosError: AxiosError): ApiError {
    const response = axiosError.response;
    const request = axiosError.request;
    
    let message = axiosError.message;
    let status = 500;
    let statusText = 'Internal Server Error';
    let code = axiosError.code;
    let errors: string[] = [];
    let rateLimit: { limit?: number; remaining?: number; reset?: number } = {};

    if (response) {
      status = response.status;
      statusText = response.statusText;
      
      // Extrai headers de rate limit
      const headers = response.headers;
      if (headers) {
        if (headers['x-ratelimit-limit']) {
          rateLimit.limit = parseInt(headers['x-ratelimit-limit'], 10);
        }
        if (headers['x-ratelimit-remaining']) {
          rateLimit.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
        }
        if (headers['x-ratelimit-reset']) {
          rateLimit.reset = parseInt(headers['x-ratelimit-reset'], 10);
        }
      }
      
      // Tenta extrair informações de erro do corpo da resposta
      if (response.data) {
        if (typeof response.data === 'object') {
          // Formato padrão da API
          if ((response.data as any).message) {
            message = (response.data as any).message;
          }
          
          if ((response.data as any).errors && Array.isArray((response.data as any).errors)) {
            errors = (response.data as any).errors;
          }
          
          if ((response.data as any).error) {
            message = (response.data as any).error;
          }
          
          // Outros formatos possíveis
          if ((response.data as any).detail) {
            message = (response.data as any).detail;
          }
          
          if ((response.data as any).errorDescription) {
            message = (response.data as any).errorDescription;
          }
        } else if (typeof response.data === 'string') {
          message = response.data;
        }
      }
    } else if (request) {
      // Erro de rede ou timeout
      message = 'Erro de rede ou timeout na requisição';
      status = 0;
      statusText = 'Network Error';
    }

    return new ApiError(message, status, statusText, response, request, code, errors, rateLimit);
  }

  /**
   * Verifica se o erro é de autenticação (401)
   */
  isAuthenticationError(): boolean {
    return this.status === 401;
  }

  /**
   * Verifica se o erro é de autorização (403)
   */
  isAuthorizationError(): boolean {
    return this.status === 403;
  }

  /**
   * Verifica se o erro é de recurso não encontrado (404)
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Verifica se o erro é de validação (400, 422)
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Verifica se o erro é de rate limiting (429)
   */
  isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Verifica se o erro é do servidor (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Verifica se o erro é de rede
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.code === 'ECONNABORTED' || this.code === 'ENOTFOUND';
  }

  /**
   * Verifica se o erro é temporário e pode ser tentado novamente
   */
  isRetryable(): boolean {
    return (
      this.isNetworkError() ||
      this.isRateLimitError() ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    );
  }

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
  isDocumentValidationError(): boolean {
    return (
      this.status === 400 &&
      !!(this.code?.startsWith('IMAGE_') ||
       this.code?.includes('FACE') ||
       this.code?.includes('DOC_'))
    );
  }

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
  getValidationError(): ValidationErrorResponse | null {
    if (!this.isDocumentValidationError() || !this.response?.data) {
      return null;
    }

    const data = this.response.data as any;

    // O servidor pode retornar o erro de validação em diferentes formatos
    if (data.message && typeof data.message === 'object') {
      return data.message as ValidationErrorResponse;
    }

    // Fallback: construir a partir dos dados disponíveis
    if (data.code && data.message) {
      return {
        status: 'REJECTED',
        code: data.code as ValidationErrorCode,
        message: data.message,
        humanTip: data.humanTip || data.message,
        canRetry: data.canRetry !== false,
        metadata: data.metadata,
      };
    }

    return null;
  }

  /**
   * Retorna uma representação JSON do erro
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      code: this.code,
      errors: this.errors,
      timestamp: this.timestamp,
      rateLimit: {
        limit: this.rateLimitLimit,
        remaining: this.rateLimitRemaining,
        reset: this.rateLimitReset,
      },
      stack: this.stack,
    };
  }

  /**
   * Retorna uma representação string detalhada do erro
   */
  toString(): string {
    let errorStr = `${this.name}: ${this.message} (${this.status} ${this.statusText})`;
    
    if (this.code) {
      errorStr += ` [${this.code}]`;
    }
    
    if (this.errors && this.errors.length > 0) {
      errorStr += `\nErros de validação:\n${this.errors.map(err => `  - ${err}`).join('\n')}`;
    }
    
    if (this.isRateLimitError() && this.rateLimitReset) {
      const now = Math.floor(Date.now() / 1000);
      const resetIn = Math.max(0, this.rateLimitReset - now);
      errorStr += `\nRate Limit: Limit=${this.rateLimitLimit}, Remaining=${this.rateLimitRemaining}, Resets in ${resetIn}s`;
    }

    return errorStr;
  }

  /**
   * Cria um erro de validação
   */
  static validationError(message: string, errors: string[] = []): ApiError {
    return new ApiError(message, 400, 'Bad Request', undefined, undefined, 'VALIDATION_ERROR', errors);
  }

  /**
   * Cria um erro de autenticação
   */
  static authenticationError(message: string = 'Token de autenticação inválido ou expirado'): ApiError {
    return new ApiError(message, 401, 'Unauthorized', undefined, undefined, 'AUTHENTICATION_ERROR');
  }

  /**
   * Cria um erro de autorização
   */
  static authorizationError(message: string = 'Acesso negado'): ApiError {
    return new ApiError(message, 403, 'Forbidden', undefined, undefined, 'AUTHORIZATION_ERROR');
  }

  /**
   * Cria um erro de recurso não encontrado
   */
  static notFoundError(resource: string): ApiError {
    return new ApiError(`${resource} não encontrado`, 404, 'Not Found', undefined, undefined, 'NOT_FOUND_ERROR');
  }

  /**
   * Cria um erro de rate limiting
   */
  static rateLimitError(message: string = 'Muitas requisições. Tente novamente mais tarde.'): ApiError {
    return new ApiError(message, 429, 'Too Many Requests', undefined, undefined, 'RATE_LIMIT_ERROR');
  }

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
  static documentValidationError(
    code: ValidationErrorCode,
    message: string,
    humanTip: string,
    metadata?: any
  ): ApiError {
    return new ApiError(
      message,
      400,
      'Bad Request',
      undefined,
      undefined,
      code,
      [humanTip],
      undefined
    );
  }
}