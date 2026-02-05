import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ClientConfig,
  AuthResponse,
  RefreshTokenResponse,
  RefreshTokenInput,
  LogoutInput,
  CurrentUserResponse,
  HealthCheck,
  ReadinessStatus,
  LivenessStatus,
  RequestOptions,
  CachedResponse
} from '../types/common.types';
import { ApiError } from '../ApiError';
import { EtagCacheManager } from '../cache/EtagCacheManager';
import { EnvelopeService } from '../services/EnvelopeService';
import { DocumentService } from '../services/DocumentService';
import { SignerService } from '../services/SignerService';
import { SignatureFieldService } from '../services/SignatureFieldService';
import { DocumentTemplateService } from '../services/DocumentTemplateService';
import { NotificationService } from '../services/NotificationService';
import { AuthenticationService } from '../services/AuthenticationService';
import { PublicVerificationService } from '../services/PublicVerificationService';
import { DigitalSignatureService } from '../services/DigitalSignatureService'; // 🆕 FASE 3
import { UserService } from '../services/UserService'; // 🆕 FASE 11
import { ApiTokenService } from '../services/ApiTokenService'; // 🆕 FASE 11
import { OrganizationService } from '../services/OrganizationService'; // 🆕 FASE 11
import { OrganizationSettingsService } from '../services/OrganizationSettingsService'; // 🆕 Seção 1.14
import { WebhookService } from '../services/WebhookService'; // 🆕 Seção 1.8: Webhooks
import { EventService } from '../services/EventService'; // 🆕 Seção 1.10: Events
import { ApprovalService } from '../services/ApprovalService'; // 🆕 Approval Workflows
import { ReceiptService } from '../services/ReceiptService'; // 🆕 Receipt Workflows
import { SectorService } from '../services/SectorService'; // 🆕 FASE 5: Sectors

/**
 * Configuração de retry para requisições HTTP
 */
interface RetryConfig {
  maxRetries: number;
  retryCount: number;
}

/**
 * Calcula delay em milissegundos usando sequência de Fibonacci
 * Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21...
 *
 * @param retryCount - Número da tentativa atual (0-based)
 * @returns Delay em milissegundos
 */
function calculateFibonacciDelay(retryCount: number): number {
  const fibonacci = (n: number): number => {
    if (n <= 1) return 1;
    let a = 1, b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  };

  const seconds = fibonacci(retryCount);
  return seconds * 1000; // Converter para milissegundos
}

/**
 * Extrai o valor do header Retry-After (em segundos ou HTTP-date)
 *
 * @param headers - Headers da resposta HTTP
 * @returns Delay em milissegundos, ou null se não encontrado
 */
function getRetryAfterDelay(headers: any): number | null {
  const retryAfter = headers['retry-after'] || headers['Retry-After'];
  if (!retryAfter) return null;

  // Se for número (segundos)
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // Se for HTTP-date
  const retryDate = new Date(retryAfter);
  if (!isNaN(retryDate.getTime())) {
    return Math.max(0, retryDate.getTime() - Date.now());
  }

  return null;
}

/**
 * Aguarda um tempo específico (helper para async/await)
 *
 * @param ms - Milissegundos para aguardar
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * SDK Client para API de Assinatura Digital
 *
 * Breaking Changes desde v1.x:
 * - apiToken → accessToken (JWT)
 * - Métodos diretos → Services organizados
 * - Novos módulos: Templates DOCX, Notificações, Autenticação
 *
 * Exemplo de uso:
 * ```typescript
 * const client = new SignatureClient({
 *   baseURL: 'http://localhost:3000',
 *   accessToken: 'seu-jwt-token',
 * });
 *
 * // Criar envelope
 * const envelope = await client.envelopes.create({ name: 'Contrato' });
 *
 * // Upload de template DOCX
 * const template = await client.templates.uploadAndExtract({ file: docxBuffer });
 *
 * // Notificações
 * const history = await client.notifications.getHistoryByEnvelope(envelope.id);
 * ```
 */
export class SignatureClient {
  private httpClient: AxiosInstance;
  private etagCache?: EtagCacheManager;
  private refreshTokenValue?: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  // Services organizados por módulo
  public envelopes: EnvelopeService;
  public documents: DocumentService;
  public signers: SignerService;
  public signatureFields: SignatureFieldService;
  public templates: DocumentTemplateService;
  public notifications: NotificationService;
  public authentication: AuthenticationService;
  public publicVerification: PublicVerificationService;
  public digitalSignatures: DigitalSignatureService; // 🆕 FASE 3: PAdES
  public users: UserService; // 🆕 FASE 11: User Management
  public apiTokens: ApiTokenService; // 🆕 FASE 11: API Token Management
  public organizations: OrganizationService; // 🆕 FASE 11: Multi-tenancy
  public organizationSettings: OrganizationSettingsService; // 🆕 Seção 1.14: Organization Settings (PAdES + Letterhead)
  public webhooks: WebhookService; // 🆕 Seção 1.8: Event Observers (Webhooks)
  public events: EventService; // 🆕 Seção 1.10: Event Management & Audit Log
  public approvals: ApprovalService; // 🆕 Approval Workflows
  public receipts: ReceiptService; // 🆕 Receipt Workflows
  public sectors: SectorService; // 🆕 FASE 5: Sectors

  constructor(config: ClientConfig) {
    // Validação de configuração
    if (!config.baseURL) {
      throw new Error('baseURL is required');
    }

    if (!config.accessToken && !config.apiKey) {
      throw new Error('accessToken or apiKey is required');
    }

    // Inicializar cache de ETags se habilitado
    if (config.enableEtagCache) {
      this.etagCache = new EtagCacheManager(config.etagCacheOptions);
    }

    // Configurar cliente HTTP
    this.httpClient = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'signature-module-sdk/3.0.1',
        ...(config.accessToken && { Authorization: `Bearer ${config.accessToken}` }),
        ...(config.apiKey && { 'X-API-Key': config.apiKey }), // Deprecated, mantido para compatibilidade
      },
    });

    // Request interceptor para logging, headers e ETags
    this.httpClient.interceptors.request.use(
      async (config) => {
        // Adicionar X-Request-ID para tracking de requisições
        if (!config.headers['X-Request-ID']) {
          config.headers['X-Request-ID'] = this.generateRequestId();
        }

        // ==========================================
        // ETAG CACHE LOGIC (Request)
        // ==========================================
        if (this.etagCache && config.method?.toUpperCase() === 'GET') {
          const url = config.url?.replace(config.baseURL || '', '') || '';
          const cached = this.etagCache.get(url);

          if (cached) {
            config.headers['If-None-Match'] = cached.etag;
            // Armazenar referência ao cache na config para uso no response interceptor
            (config as any)._cachedEntry = cached;
          }
        }

        if (process.env.DEBUG === 'true') {
          console.log(`[SDK] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para tratamento de erros, auto-refresh e ETags
    this.httpClient.interceptors.response.use(
      (response) => {
        // ==========================================
        // ETAG CACHE LOGIC (Response 2xx)
        // ==========================================
        if (this.etagCache) {
          const method = response.config.method?.toUpperCase();
          const url = response.config.url?.replace(response.config.baseURL || '', '') || '';
          
          if (method === 'GET') {
            const etag = response.headers['etag'];
            
            // Cachear nova resposta se tiver ETag
            if (etag) {
              const cacheControl = response.headers['cache-control'];
              let maxAge: number | undefined;

              if (cacheControl) {
                const match = cacheControl.match(/max-age=(\d+)/);
                if (match) {
                  maxAge = parseInt(match[1], 10);
                }
              }

              this.etagCache.set(
                url,
                etag,
                response.data,
                maxAge,
                response.headers['last-modified']
              );
            }

            // Enriquecer dados da resposta com metadados de cache
            // Isso garante que quem recebe response.data (Services) tenha acesso aos metadados
            if (response.data && typeof response.data === 'object') {
              if ((response.config as any)._cachedEntry) {
                 // Se veio do cache (304 tratado abaixo), mas aqui é 200, então é refresh
                 // Na verdade, 304 cai no catch do interceptor (error)
                 // Aqui é sempre 200, então fromCache = false
                 Object.assign(response.data, {
                   fromCache: false,
                   etag: etag,
                   lastModified: response.headers['last-modified']
                 });
              } else {
                 // Primeira requisição ou sem cache prévio
                 Object.assign(response.data, {
                   fromCache: false,
                   etag: etag,
                   lastModified: response.headers['last-modified']
                 });
              }
            }
          } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
            // Invalidar cache para métodos de modificação
            this.etagCache.invalidate(url);
            
            // Tentar invalidar lista pai (ex: /documents/1 -> /documents)
            const parentUrl = url.substring(0, url.lastIndexOf('/'));
            if (parentUrl) {
              this.etagCache.invalidate(parentUrl);
            }
          }
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // ==========================================
        // ETAG CACHE LOGIC (Response 304)
        // ==========================================
        if (error.response?.status === 304 && this.etagCache) {
          const cached = originalRequest._cachedEntry;
          if (cached) {
            // Enriquecer dados do cache
            if (cached.data && typeof cached.data === 'object') {
              Object.assign(cached.data, {
                fromCache: true,
                etag: cached.etag,
                lastModified: cached.lastModified
              });
            }

            // Retornar dados do cache como sucesso
            return {
              data: cached.data,
              status: 304,
              statusText: 'Not Modified',
              headers: error.response.headers,
              config: originalRequest,
              request: error.request,
            };
          }
        }

        // ==========================================
        // RETRY LOGIC (antes do tratamento de 401)
        // ==========================================

        // Inicializar retry config se não existir
        if (!originalRequest._retryConfig) {
          originalRequest._retryConfig = {
            maxRetries: 5, // Configuração: 5 tentativas
            retryCount: 0
          } as RetryConfig;
        }

        const retryConfig = originalRequest._retryConfig as RetryConfig;

        // Converter para ApiError para verificar se é retryable
        const apiError = ApiError.fromAxiosError(error);

        // Verificar se deve fazer retry (erros 429, 502, 503, 504, network)
        if (
          apiError.isRetryable() &&
          retryConfig.retryCount < retryConfig.maxRetries &&
          !originalRequest._retry // Não fazer retry em requisições de refresh
        ) {
          retryConfig.retryCount++;

          let delay: number;

          // Para 429 (rate limit), respeitar Retry-After se disponível
          if (apiError.isRateLimitError() && error.response?.headers) {
            const retryAfterDelay = getRetryAfterDelay(error.response.headers);
            delay = retryAfterDelay ?? calculateFibonacciDelay(retryConfig.retryCount - 1);
          } else {
            // Para outros erros retryable, usar Fibonacci backoff
            delay = calculateFibonacciDelay(retryConfig.retryCount - 1);
          }

          if (process.env.DEBUG === 'true') {
            console.log(
              `[SDK Retry] Attempt ${retryConfig.retryCount}/${retryConfig.maxRetries} ` +
              `after ${delay}ms for ${error.config?.method?.toUpperCase()} ${error.config?.url} ` +
              `(Error: ${apiError.status} ${apiError.statusText})`
            );
          }

          // Aguardar o delay antes de retentar
          await sleep(delay);

          // Retentar a requisição
          return this.httpClient(originalRequest);
        }

        // ==========================================
        // TRATAMENTO DE 401 - Token Expirado
        // ==========================================

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshTokenValue && !this.isRefreshing) {
            this.isRefreshing = true;
            originalRequest._retry = true;

            try {
              // Tentar renovar o token
              const response = await this.httpClient.post<RefreshTokenResponse>(
                '/api/v1/auth/refresh',
                { refreshToken: this.refreshTokenValue }
              );

              const { accessToken, refreshToken } = response.data;

              // Atualizar tokens
              this.setAccessToken(accessToken);
              this.setRefreshToken(refreshToken);

              // Processar fila de requisições que falharam
              this.processQueue(null, accessToken);

              // Retentar a requisição original
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
              return this.httpClient(originalRequest);
            } catch (refreshError) {
              // Refresh token também expirou
              this.processQueue(refreshError, null);
              this.refreshTokenValue = undefined;

              // Converter refresh error para ApiError antes de rejeitar
              const refreshApiError = refreshError instanceof Error && 'isAxiosError' in refreshError
                ? ApiError.fromAxiosError(refreshError as AxiosError)
                : refreshError;

              return Promise.reject(refreshApiError);
            } finally {
              this.isRefreshing = false;
            }
          } else if (this.isRefreshing) {
            // Se já está refreshing, adicionar à fila
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return this.httpClient(originalRequest);
              })
              .catch((err) => {
                // Converter erro para ApiError antes de rejeitar
                const queueApiError = err instanceof Error && 'isAxiosError' in err
                  ? ApiError.fromAxiosError(err as AxiosError)
                  : err;
                return Promise.reject(queueApiError);
              });
          }
        }

        // ==========================================
        // LOGGING E REJEIÇÃO FINAL
        // ==========================================

        // Logging de erros
        if (error.response) {
          console.error(
            `[SDK Error] ${error.response.status}: ${JSON.stringify(error.response.data)}`
          );
        } else {
          console.error(`[SDK Error] ${error.message}`);
        }

        // SEMPRE converter para ApiError antes de rejeitar
        return Promise.reject(apiError);
      }
    );

    // Inicializar services
    this.envelopes = new EnvelopeService(this.httpClient);
    this.documents = new DocumentService(this.httpClient);
    this.signers = new SignerService(this.httpClient);
    this.signatureFields = new SignatureFieldService(this.httpClient);
    this.templates = new DocumentTemplateService(this.httpClient);
    this.notifications = new NotificationService(this.httpClient);
    this.authentication = new AuthenticationService(this.httpClient);
    this.publicVerification = new PublicVerificationService(this.httpClient);
    this.digitalSignatures = new DigitalSignatureService(this.httpClient); // 🆕 FASE 3: PAdES
    this.users = new UserService(this.httpClient); // 🆕 FASE 11: User Management
    this.apiTokens = new ApiTokenService(this.httpClient); // 🆕 FASE 11: API Token Management
    this.organizations = new OrganizationService(this.httpClient); // 🆕 FASE 11: Multi-tenancy
    this.organizationSettings = new OrganizationSettingsService(this.httpClient); // 🆕 Seção 1.14: Organization Settings
    this.webhooks = new WebhookService(this.httpClient); // 🆕 Seção 1.8: Event Observers (Webhooks)
    this.events = new EventService(this.httpClient); // 🆕 Seção 1.10: Event Management & Audit Log
    this.approvals = new ApprovalService(this.httpClient); // 🆕 Approval Workflows
    this.receipts = new ReceiptService(this.httpClient); // 🆕 Receipt Workflows
    this.sectors = new SectorService(this.httpClient); // 🆕 FASE 5: Sectors
  }

  /**
   * Atualiza access token (após login)
   */
  setAccessToken(token: string): void {
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Define o refresh token para auto-refresh automático
   *
   * Quando configurado, o SDK tentará renovar automaticamente
   * o access token se receber um erro 401.
   *
   * @param token - Refresh token JWT
   */
  setRefreshToken(token: string): void {
    this.refreshTokenValue = token;
  }

  /**
   * Gera um Request ID único para tracking
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Processa fila de requisições que falharam durante refresh
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Login com email e senha
   *
   * Autentica o usuário e retorna tokens JWT (access e refresh).
   *
   * @param email - Email do usuário
   * @param password - Senha do usuário (mínimo 6 caracteres)
   * @returns AuthResponse com user e tokens (accessToken, refreshToken, expiresIn)
   *
   * @example
   * ```typescript
   * const auth = await client.login('user@example.com', 'password123');
   *
   * // Tokens são configurados automaticamente no cliente
   * console.log('Usuário:', auth.user.name);
   * console.log('Access token expira em:', auth.tokens.expiresIn, 'segundos');
   *
   * // IMPORTANTE: Armazene o refreshToken com segurança
   * localStorage.setItem('refreshToken', auth.tokens.refreshToken);
   * ```
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.httpClient.post<AuthResponse>('/api/v1/auth/login', {
      email,
      password,
    });

    const authData = response.data;
    // Configurar tokens automaticamente no cliente
    this.setAccessToken(authData.tokens.accessToken);
    this.setRefreshToken(authData.tokens.refreshToken);

    return authData;
  }

  // ==========================================
  // 🆕 SEÇÃO 1.16: Health Check Methods
  // ==========================================

  /**
   * Health check completo da API
   *
   * Verifica status de todas as dependências do sistema:
   * - Database (PostgreSQL)
   * - Storage (S3)
   * - Cache (Redis)
   * - Queue (Bull)
   *
   * @returns HealthCheck com status, dependências e métricas
   *
   * @example
   * ```typescript
   * const health = await client.healthCheck();
   * console.log('Status:', health.status); // 'healthy' | 'degraded' | 'unhealthy'
   * console.log('Database:', health.dependencies.database.status);
   * console.log('Memory:', health.metrics.memory.percentage, '%');
   * ```
   */
  async healthCheck(): Promise<HealthCheck> {
    const response = await this.httpClient.get<HealthCheck>('/api/v1/health');
    return response.data;
  }

  /**
   * Readiness probe para Kubernetes
   *
   * Verifica se o sistema está pronto para receber requisições.
   * Retorna HTTP 503 se unhealthy, HTTP 200 se ready.
   *
   * @returns ReadinessStatus indicando se o sistema está pronto
   *
   * @example
   * ```typescript
   * const readiness = await client.healthCheckReady();
   * if (readiness.ready) {
   *   console.log('Sistema pronto!');
   * }
   * ```
   */
  async healthCheckReady(): Promise<ReadinessStatus> {
    const response = await this.httpClient.get<ReadinessStatus>('/api/v1/health/ready');
    return response.data;
  }

  /**
   * Liveness probe para Kubernetes
   *
   * Verifica se o processo está vivo e respondendo.
   * Sempre retorna alive: true se o processo está rodando.
   *
   * @returns LivenessStatus indicando se o processo está vivo
   *
   * @example
   * ```typescript
   * const liveness = await client.healthCheckLive();
   * console.log('Alive:', liveness.alive); // true
   * ```
   */
  async healthCheckLive(): Promise<LivenessStatus> {
    const response = await this.httpClient.get<LivenessStatus>('/api/v1/health/live');
    return response.data;
  }

  // ==========================================
  // 🆕 SEÇÃO 1.17: Authentication Methods
  // ==========================================

  /**
   * Renova o access token usando refresh token
   *
   * Quando o access token expira (~15min), use este método para obter
   * um novo access token sem precisar fazer login novamente.
   *
   * @param refreshToken - Refresh token obtido no login
   * @returns Novos tokens (accessToken, refreshToken, expiresIn)
   *
   * @example
   * ```typescript
   * try {
   *   const tokens = await client.refreshToken('refresh_token_aqui');
   *   client.setAccessToken(tokens.accessToken);
   *   // Armazene o novo refreshToken com segurança
   *   console.log('Tokens renovados!');
   * } catch (error) {
   *   console.error('Refresh token expirado, faça login novamente');
   * }
   * ```
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.httpClient.post<RefreshTokenResponse>(
      '/api/v1/auth/refresh',
      { refreshToken }
    );

    // Atualizar automaticamente os tokens no cliente
    this.setAccessToken(response.data.accessToken);
    this.setRefreshToken(response.data.refreshToken);

    return response.data;
  }

  /**
   * Faz logout revogando o refresh token especificado
   *
   * Após o logout, o refresh token não pode mais ser usado para
   * obter novos access tokens. O access token atual continua válido
   * até expirar (~15min).
   *
   * @param refreshToken - Refresh token a ser revogado
   *
   * @example
   * ```typescript
   * await client.logout('refresh_token_aqui');
   * console.log('Logout realizado com sucesso');
   * // Remova os tokens do armazenamento local
   * ```
   */
  async logout(refreshToken: string): Promise<void> {
    await this.httpClient.post('/api/v1/auth/logout', { refreshToken });
    // Limpar refresh token armazenado
    this.refreshTokenValue = undefined;
  }

  /**
   * Faz logout de todos os dispositivos
   *
   * Revoga TODOS os refresh tokens do usuário atual. Útil para
   * cenários de segurança onde o usuário quer deslogar de todos
   * os dispositivos simultaneamente.
   *
   * Requer autenticação (access token válido).
   *
   * @example
   * ```typescript
   * await client.logoutAll();
   * console.log('Logout de todos os dispositivos realizado');
   * // Usuário precisará fazer login novamente em todos os dispositivos
   * ```
   */
  async logoutAll(): Promise<void> {
    await this.httpClient.post('/api/v1/auth/logout-all');
    // Limpar refresh token armazenado
    this.refreshTokenValue = undefined;
  }

  /**
   * Obtém informações do usuário autenticado via /auth/me
   *
   * Este endpoint é equivalente a GET /users/me, mas está sob /auth
   * para consistência com os outros endpoints de autenticação.
   *
   * @returns Informações básicas do usuário (id, name, email, createdAt)
   *
   * @example
   * ```typescript
   * const user = await client.getCurrentUser();
   * console.log('Usuário:', user.name, user.email);
   * ```
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await this.httpClient.get<CurrentUserResponse>('/api/v1/auth/me');
    return response.data;
  }
}
