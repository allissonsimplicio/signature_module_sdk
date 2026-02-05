import { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  AuthenticationRequirement,
  CreateAuthenticationRequirementDto,
  VerifyTokenDto,
  RecordIpLocationDto,
  UploadAuthDocumentDto,
  SendAuthTokenResponse,
  VerifyTokenResponse,
  AuthenticationStatusResponse,
  ReuseDocumentResponse,
  ReusableAuthMethod,
  // 🆕 Validation Layer
  ValidationProgressResponse,
  UploadAuthDocumentResponse,
  RecordIpLocationResponse,
} from '../types/authentication.types';
import { ApiResponse } from '../types/common.types';
import { validateAuthDocumentFile } from '../validators';

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
export class AuthenticationService {
  constructor(private http: AxiosInstance) {}

  /**
   * Cria requisito de autenticação para um signatário
   */
  async create(
    signerId: string,
    dto: CreateAuthenticationRequirementDto
  ): Promise<AuthenticationRequirement> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<AuthenticationRequirement>(
      `/api/v1/signers/${signerId}/authentication-requirements`,
      dto
    );
    return response.data;
  }

  /**
   * Envia token por Email, SMS ou WhatsApp
   */
  async sendToken(authRequirementId: string): Promise<SendAuthTokenResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SendAuthTokenResponse>(
      `/api/v1/authentication-requirements/${authRequirementId}/send-token`
    );
    return response.data;
  }

  /**
   * Verifica token enviado
   */
  async verifyToken(
    authRequirementId: string,
    dto: VerifyTokenDto
  ): Promise<VerifyTokenResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<VerifyTokenResponse>(
      `/api/v1/authentication-requirements/${authRequirementId}/verify-token`,
      dto
    );
    return response.data;
  }

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
  async uploadDocument(
    authRequirementId: string,
    dto: UploadAuthDocumentDto
  ): Promise<UploadAuthDocumentResponse> {
    // Validar arquivo (MIME type e file size)
    validateAuthDocumentFile(dto.file);

    const formData = new FormData();
    formData.append('file', dto.file);

    // 🆕 FASE 10: Adicionar metadados opcionais para OFFICIAL_DOCUMENT
    if (dto.documentType) {
      formData.append('documentType', dto.documentType);
    }

    if (dto.documentPart) {
      formData.append('documentPart', dto.documentPart);
    }

    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<UploadAuthDocumentResponse>(
      `/api/v1/authentication-requirements/${authRequirementId}/upload-document`,
      formData,
      {
        headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data;
  }

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
  async getValidationProgress(authRequirementId: string): Promise<ValidationProgressResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<ValidationProgressResponse>(
      `/api/v1/authentication-requirements/${authRequirementId}/validation-progress`
    );
    return response.data;
  }

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
  async pollValidationProgress(
    authRequirementId: string,
    options: {
      intervalMs?: number;    // Intervalo entre consultas (padrão: 2000ms)
      timeoutMs?: number;     // Timeout total (padrão: 60000ms = 1 minuto)
    } = {},
    onProgress?: (progress: ValidationProgressResponse) => void
  ): Promise<ValidationProgressResponse> {
    const { intervalMs = 2000, timeoutMs = 60000 } = options;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Verificar timeout
          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Timeout aguardando validação'));
            return;
          }

          // Consultar progresso
          const progress = await this.getValidationProgress(authRequirementId);

          // Notificar callback
          if (onProgress) {
            onProgress(progress);
          }

          // Verificar se concluiu
          if (progress.status === 'VERIFIED' || progress.status === 'REJECTED') {
            resolve(progress);
            return;
          }

          // Continuar polling
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

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
  async recordIpLocation(
    authRequirementId: string,
    dto: RecordIpLocationDto
  ): Promise<RecordIpLocationResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<RecordIpLocationResponse>(
      `/api/v1/authentication-requirements/${authRequirementId}/record-ip-location`,
      dto
    );
    return response.data;
  }

  /**
   * Obtém status de autenticação completo do signatário
   */
  async getStatus(signerId: string): Promise<AuthenticationStatusResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<AuthenticationStatusResponse>(
      `/api/v1/signers/${signerId}/authentication-status`
    );
    return response.data;
  }

  /**
   * Lista requisitos de autenticação de um signatário
   */
  async findBySigner(signerId: string): Promise<AuthenticationRequirement[]> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<AuthenticationRequirement[]>(
      `/api/v1/signers/${signerId}/authentication-requirements`
    );
    return response.data;
  }

  /**
   * Deleta requisito de autenticação
   */
  async delete(authRequirementId: string): Promise<void> {
    await this.http.delete(`/api/v1/authentication-requirements/${authRequirementId}`);
  }

  /**
   * Reutiliza documento de autenticação válido de outro envelope
   * @param signerId - ID do signatário
   * @param method - Método de autenticação a ser reutilizado.
   * @returns Informações do documento reutilizado
   */
  async reuseDocument(signerId: string, method: ReusableAuthMethod): Promise<ReuseDocumentResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<ReuseDocumentResponse>(
      `/api/v1/signers/${signerId}/authentication/reuse-document`,
      { method }
    );
    return response.data;
  }
}
