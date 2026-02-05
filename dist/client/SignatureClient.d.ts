import { ClientConfig, AuthResponse, RefreshTokenResponse, CurrentUserResponse, HealthCheck, ReadinessStatus, LivenessStatus } from '../types/common.types';
import { EnvelopeService } from '../services/EnvelopeService';
import { DocumentService } from '../services/DocumentService';
import { SignerService } from '../services/SignerService';
import { SignatureFieldService } from '../services/SignatureFieldService';
import { DocumentTemplateService } from '../services/DocumentTemplateService';
import { NotificationService } from '../services/NotificationService';
import { AuthenticationService } from '../services/AuthenticationService';
import { PublicVerificationService } from '../services/PublicVerificationService';
import { DigitalSignatureService } from '../services/DigitalSignatureService';
import { UserService } from '../services/UserService';
import { ApiTokenService } from '../services/ApiTokenService';
import { OrganizationService } from '../services/OrganizationService';
import { OrganizationSettingsService } from '../services/OrganizationSettingsService';
import { WebhookService } from '../services/WebhookService';
import { EventService } from '../services/EventService';
import { ApprovalService } from '../services/ApprovalService';
import { ReceiptService } from '../services/ReceiptService';
import { SectorService } from '../services/SectorService';
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
export declare class SignatureClient {
    private httpClient;
    private etagCache?;
    private refreshTokenValue?;
    private isRefreshing;
    private failedQueue;
    envelopes: EnvelopeService;
    documents: DocumentService;
    signers: SignerService;
    signatureFields: SignatureFieldService;
    templates: DocumentTemplateService;
    notifications: NotificationService;
    authentication: AuthenticationService;
    publicVerification: PublicVerificationService;
    digitalSignatures: DigitalSignatureService;
    users: UserService;
    apiTokens: ApiTokenService;
    organizations: OrganizationService;
    organizationSettings: OrganizationSettingsService;
    webhooks: WebhookService;
    events: EventService;
    approvals: ApprovalService;
    receipts: ReceiptService;
    sectors: SectorService;
    constructor(config: ClientConfig);
    /**
     * Atualiza access token (após login)
     */
    setAccessToken(token: string): void;
    /**
     * Define o refresh token para auto-refresh automático
     *
     * Quando configurado, o SDK tentará renovar automaticamente
     * o access token se receber um erro 401.
     *
     * @param token - Refresh token JWT
     */
    setRefreshToken(token: string): void;
    /**
     * Gera um Request ID único para tracking
     */
    private generateRequestId;
    /**
     * Processa fila de requisições que falharam durante refresh
     */
    private processQueue;
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
    login(email: string, password: string): Promise<AuthResponse>;
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
    healthCheck(): Promise<HealthCheck>;
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
    healthCheckReady(): Promise<ReadinessStatus>;
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
    healthCheckLive(): Promise<LivenessStatus>;
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
    refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
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
    logout(refreshToken: string): Promise<void>;
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
    logoutAll(): Promise<void>;
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
    getCurrentUser(): Promise<CurrentUserResponse>;
}
//# sourceMappingURL=SignatureClient.d.ts.map