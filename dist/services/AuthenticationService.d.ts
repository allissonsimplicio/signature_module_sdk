import { AxiosInstance } from 'axios';
import { AuthenticationRequirement, CreateAuthenticationRequirementDto, VerifyTokenDto, RecordIpLocationDto, UploadAuthDocumentDto, SendAuthTokenResponse, VerifyTokenResponse, AuthenticationStatusResponse, ReuseDocumentResponse, ReusableAuthMethod, ValidationProgressResponse, UploadAuthDocumentResponse, RecordIpLocationResponse } from '../types/authentication.types';
/**
 * FASE 8 + Validation Layer: Serviço para Autenticação de Assinantes
 *
 * Funcionalidades:
 * - Autenticação por token (Email, SMS, WhatsApp)
 * - Validação contextual (IP, Geolocalização)
 * - Upload e validação de documentos (RG, CNH)
 * - Processamento assíncrono com IA (OCR, Biometria, Liveness)
 * - Polling de progresso de validação
 */
export declare class AuthenticationService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria requisito de autenticação para um signatário
     */
    create(signerId: string, dto: CreateAuthenticationRequirementDto): Promise<AuthenticationRequirement>;
    /**
     * Envia token por Email, SMS ou WhatsApp
     */
    sendToken(authRequirementId: string): Promise<SendAuthTokenResponse>;
    /**
     * Verifica token enviado
     */
    verifyToken(authRequirementId: string, dto: VerifyTokenDto): Promise<VerifyTokenResponse>;
    /**
     * Upload de documento oficial (RG, CNH, Passaporte)
     *
     * 🆕 Agora retorna job_id para acompanhar processamento assíncrono
     *
     * Suporta File (browser), Buffer (Node.js) e Blob (browser).
     * Valida automaticamente o tipo de arquivo (imagem: JPEG, PNG) e tamanho máximo (50MB).
     *
     * **Validação Pré-Upload:**
     * - Tamanho máximo: 10MB
     * - Tipos permitidos: JPEG, PNG
     * - Dimensões mínimas: 640x480
     * - Qualidade de imagem (blur, exposição)
     *
     * **Processamento Assíncrono:**
     * - RG: Aguarda upload de frente + verso + selfie antes de disparar job
     * - CNH: Dispara job após upload de CNH + selfie
     *
     * @param authRequirementId - ID do requisito de autenticação
     * @param dto - Dados do upload (file)
     * @returns Confirmação de upload com S3 key e job ID
     * @throws ApiError com ValidationErrorResponse se imagem for rejeitada na pré-validação
     *
     * @example
     * ```typescript
     * try {
     *   const result = await client.authentication.uploadDocument(authReqId, { file: rgFrenteFile });
     *
     *   if (result.job_id === 'AWAITING_OTHER_DOCUMENTS') {
     *     console.log('RG frente enviado. Aguardando verso...');
     *   } else {
     *     console.log('Processamento iniciado. Job ID:', result.job_id);
     *     // Iniciar polling de progresso
     *     await pollValidationProgress(authReqId);
     *   }
     * } catch (error) {
     *   if (error.isDocumentValidationError?.()) {
     *     const validationError = error.getValidationError?.();
     *     console.error('Erro de validação:', validationError?.message);
     *     console.log('Dica:', validationError?.humanTip);
     *   }
     * }
     * ```
     */
    uploadDocument(authRequirementId: string, dto: UploadAuthDocumentDto): Promise<UploadAuthDocumentResponse>;
    /**
     * 🆕 Consulta progresso de validação de documento
     *
     * Usado para fazer polling durante processamento assíncrono.
     * Recomenda-se consultar a cada 2 segundos até status VERIFIED ou REJECTED.
     *
     * @param authRequirementId - ID do requisito de autenticação
     * @returns Progresso atual da validação (0-100%)
     *
     * @example
     * ```typescript
     * const progress = await client.authentication.getValidationProgress(authReqId);
     *
     * console.log(`Status: ${progress.status}`);
     * console.log(`Progresso: ${progress.progress}%`);
     * console.log(`Etapa: ${progress.currentStep}`);
     * console.log(`ETA: ${progress.estimatedTimeSeconds}s`);
     *
     * if (progress.status === 'VERIFIED') {
     *   console.log('✅ Aprovado!');
     *   console.log('Resultado:', progress.result);
     * } else if (progress.status === 'REJECTED') {
     *   console.error('❌ Rejeitado:', progress.rejectionMessage);
     *   console.log('Dica:', progress.rejectionHumanTip);
     * }
     * ```
     */
    getValidationProgress(authRequirementId: string): Promise<ValidationProgressResponse>;
    /**
     * 🆕 Helper: Polling automático de progresso
     *
     * Consulta progresso automaticamente até conclusão (VERIFIED ou REJECTED).
     *
     * @param authRequirementId - ID do requisito de autenticação
     * @param options - Opções de polling
     * @param onProgress - Callback chamado a cada atualização
     * @returns Resultado final da validação
     *
     * @example
     * ```typescript
     * const result = await client.authentication.pollValidationProgress(
     *   authReqId,
     *   { intervalMs: 2000, timeoutMs: 60000 },
     *   (progress) => {
     *     console.log(`${progress.progress}% - ${progress.currentStep}`);
     *   }
     * );
     *
     * if (result.status === 'VERIFIED') {
     *   console.log('✅ Documento validado!');
     * } else {
     *   console.error('❌ Validação falhou:', result.rejectionMessage);
     * }
     * ```
     */
    pollValidationProgress(authRequirementId: string, options?: {
        intervalMs?: number;
        timeoutMs?: number;
    }, onProgress?: (progress: ValidationProgressResponse) => void): Promise<ValidationProgressResponse>;
    /**
     * Registra IP e geolocalização do signatário
     *
     * 🆕 Agora retorna flag de risco de spoofing se GPS/IP discrepantes
     *
     * @param authRequirementId - ID do requisito de autenticação
     * @param dto - Dados de IP e localização
     * @returns Confirmação de registro com possível flag de risco
     *
     * @example
     * ```typescript
     * const result = await client.authentication.recordIpLocation(authReqId, {
     *   ipAddress: '192.168.1.100',
     *   latitude: -3.7319,
     *   longitude: -38.5267,
     *   accuracy: 10
     * });
     *
     * if (result.riskFlag === 'RISK_SPOOFING') {
     *   console.warn('⚠️ Possível spoofing de localização detectado');
     * }
     * ```
     */
    recordIpLocation(authRequirementId: string, dto: RecordIpLocationDto): Promise<RecordIpLocationResponse>;
    /**
     * Obtém status de autenticação completo do signatário
     */
    getStatus(signerId: string): Promise<AuthenticationStatusResponse>;
    /**
     * Lista requisitos de autenticação de um signatário
     */
    findBySigner(signerId: string): Promise<AuthenticationRequirement[]>;
    /**
     * Deleta requisito de autenticação
     */
    delete(authRequirementId: string): Promise<void>;
    /**
     * Reutiliza documento de autenticação válido de outro envelope
     * @param signerId - ID do signatário
     * @param method - Método de autenticação a ser reutilizado.
     * @returns Informações do documento reutilizado
     */
    reuseDocument(signerId: string, method: ReusableAuthMethod): Promise<ReuseDocumentResponse>;
}
//# sourceMappingURL=AuthenticationService.d.ts.map