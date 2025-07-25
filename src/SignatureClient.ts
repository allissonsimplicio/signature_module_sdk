import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ApiError } from './ApiError';
import { ClientConfig, ApiResponse, PaginatedResponse, PreviewOptions, PreviewResponse, ZipGenerationStatus } from './types/common.types';
import { 
  Envelope, 
  EnvelopeInput, 
  EnvelopeFilters, 
  EnvelopeInputSchema,
  EnvelopeSchema 
} from './types/envelope.types';
import { 
  Document, 
  DocumentUploadInput, 
  DocumentFromTemplateInput,
  DocumentFilters,
  DocumentUploadInputSchema,
  DocumentFromTemplateInputSchema,
  DocumentSchema 
} from './types/document.types';
import { 
  Signer, 
  SignerInput, 
  SignerFilters,
  AddAuthenticationRequirementInput,
  AddQualificationRequirementInput,
  SignerInputSchema,
  SignerSchema 
} from './types/signer.types';
import { 
  Template, 
  TemplateInput, 
  TemplateFilters,
  TemplateUpdateInput,
  TemplateInputSchema,
  TemplateUpdateInputSchema,
  TemplateSchema 
} from './types/template.types';
import { 
  ApiEvent, 
  EventFilters,
  EventObserver,
  EventObserverInput,
  ApiEventSchema,
  EventObserverInputSchema 
} from './types/event.types';

/**
 * Cliente SDK para API de Assinatura Eletrônica Avançada
 * 
 * Este SDK implementa assinatura eletrônica avançada conforme Art. 4º, inciso II 
 * da Lei 14.063/2020, que NÃO utiliza certificados ICP-Brasil.
 * 
 * Características da assinatura eletrônica avançada:
 * - Está associada ao signatário de maneira unívoca
 * - Utiliza dados para criação de assinatura sob controle exclusivo do signatário
 * - Detecta qualquer modificação posterior nos dados
 * - Não requer certificados digitais ICP-Brasil
 * 
 * Métodos de autenticação suportados:
 * - Token por email, SMS ou WhatsApp
 * - Verificação de localização geográfica
 * - Verificação de endereço IP
 * - Upload de documentos oficiais
 * - Selfie com documento
 * - Comprovante de endereço
 */
export class SignatureClient {
  private readonly httpClient: AxiosInstance;
  private readonly config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = {
      timeout: 30000, // 30 segundos por padrão
      ...config,
    };

    // Configuração do cliente HTTP
    this.httpClient = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'signature-module-sdk/1.0.0',
      },
    });

    // Interceptor de resposta para tratamento de erros
    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        throw ApiError.fromAxiosError(error);
      }
    );

    // Interceptor de requisição para logging (opcional)
    this.httpClient.interceptors.request.use(
      (config) => {
        // Aqui você pode adicionar logging se necessário
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Faz uma requisição HTTP e valida a resposta
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.httpClient.request<ApiResponse<T>>({
        method,
        url: endpoint,
        data,
        ...config,
      });

      if (!response.data.success) {
        throw new ApiError(
          response.data.message || 'Erro na requisição',
          response.status,
          response.statusText,
          response,
          undefined,
          'API_ERROR',
          response.data.errors
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error as any);
    }
  }

  /**
   * Converte arquivo para base64
   */
  private async fileToBase64(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.promises.readFile(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      throw new ApiError(
        `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        400,
        'Bad Request',
        undefined,
        undefined,
        'FILE_READ_ERROR'
      );
    }
  }

  /**
   * Detecta o tipo MIME do arquivo
   */
  private detectContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // ==================== GERENCIAMENTO DE ENVELOPES ====================

  /**
   * Cria um novo envelope
   */
  async createEnvelope(data: EnvelopeInput): Promise<Envelope> {
    // Validação com Zod
    const validatedData = EnvelopeInputSchema.parse(data);
    
    const envelope = await this.makeRequest<Envelope>(
      'POST',
      '/envelopes',
      validatedData
    );

    // Validação da resposta
    return envelope as Envelope;
  }

  /**
   * Atualiza um envelope existente
   */
  async updateEnvelope(id: string, data: Partial<EnvelopeInput>): Promise<Envelope> {
    if (!id) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    const envelope = await this.makeRequest<Envelope>(
      'PUT',
      `/envelopes/${id}`,
      data
    );

    return envelope as Envelope;
  }

  /**
   * Obtém um envelope por ID
   */
  async getEnvelope(id: string): Promise<Envelope> {
    if (!id) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    const envelope = await this.makeRequest<Envelope>(
      'GET',
      `/envelopes/${id}`
    );

    return envelope as Envelope;
  }

  /**
   * Lista envelopes com filtros
   */
  async listEnvelopes(filters?: EnvelopeFilters): Promise<PaginatedResponse<Envelope>> {
    const response = await this.makeRequest<PaginatedResponse<Envelope>>(
      'GET',
      '/envelopes',
      undefined,
      { params: filters }
    );

    // Valida cada envelope na resposta
    if (response.data) {
      response.data = response.data as Envelope[];
    }

    return response;
  }

  /**
   * Obtém eventos de um envelope
   */
  async getEnvelopeEvents(id: string, filters?: EventFilters): Promise<ApiEvent[]> {
    if (!id) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    const events = await this.makeRequest<ApiEvent[]>(
      'GET',
      `/envelopes/${id}/events`,
      undefined,
      { params: filters }
    );

    return events as ApiEvent[];
  }

  /**
   * Ativa um envelope (atalho para updateEnvelope com status 'running')
   */
  async activateEnvelope(envelopeId: string): Promise<Envelope> {
    return this.updateEnvelope(envelopeId, { status: 'running' } as any);
  }

  /**
   * Exclui um envelope
   */
  async deleteEnvelope(id: string): Promise<void> {
    if (!id) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    await this.makeRequest<void>(
      'DELETE',
      `/envelopes/${id}`
    );
  }

  // ==================== GERENCIAMENTO DE DOCUMENTOS ====================

  /**
   * Adiciona documento por upload
   */
  async addDocumentByUpload(
    envelopeId: string, 
    filePath: string, 
    name?: string
  ): Promise<Document> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    if (!fs.existsSync(filePath)) {
      throw ApiError.validationError(`Arquivo não encontrado: ${filePath}`);
    }

    const content = await this.fileToBase64(filePath);
    const contentType = this.detectContentType(filePath);
    const documentName = name || path.basename(filePath);

    const documentData: DocumentUploadInput = {
      name: documentName,
      content,
      content_type: contentType,
    };

    // Validação com Zod
    const validatedData = DocumentUploadInputSchema.parse(documentData);

    const document = await this.makeRequest<Document>(
      'POST',
      `/envelopes/${envelopeId}/documents`,
      validatedData
    );

    return document as Document;
  }

  /**
   * Adiciona documento a partir de template
   */
  async addDocumentFromTemplate(
    envelopeId: string,
    templateId: string,
    variables?: Record<string, any>,
    name?: string
  ): Promise<Document> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    if (!templateId) {
      throw ApiError.validationError('ID do template é obrigatório');
    }

    const documentData: DocumentFromTemplateInput = {
      template_id: templateId,
      variables,
      name,
    };

    // Validação com Zod
    const validatedData = DocumentFromTemplateInputSchema.parse(documentData);

    const document = await this.makeRequest<Document>(
      'POST',
      `/envelopes/${envelopeId}/documents/from-template`,
      validatedData
    );

    return document as Document;
  }

  /**
   * Obtém um documento por ID
   */
  async getDocument(documentId: string): Promise<Document> {
    if (!documentId) {
      throw ApiError.validationError('ID do documento é obrigatório');
    }

    const document = await this.makeRequest<Document>(
      'GET',
      `/documents/${documentId}`
    );

    return document as Document;
  }

  /**
   * Lista documentos com filtros
   */
  async listDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    const response = await this.makeRequest<PaginatedResponse<Document>>(
      'GET',
      '/documents',
      undefined,
      { params: filters }
    );

    // Valida cada documento na resposta
    if (response.data) {
      response.data = response.data as Document[];
    }

    return response;
  }

  // ==================== GERENCIAMENTO DE SIGNATÁRIOS ====================

  /**
   * Adiciona signatário ao envelope
   */
  async addSigner(envelopeId: string, signer: SignerInput): Promise<Signer> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    // Validação com Zod
    const validatedData = SignerInputSchema.parse(signer);

    const signerResponse = await this.makeRequest<Signer>(
      'POST',
      `/envelopes/${envelopeId}/signers`,
      validatedData
    );

    return signerResponse;
  }

  /**
   * Obtém um signatário por ID
   */
  async getSigner(signerId: string): Promise<Signer> {
    if (!signerId) {
      throw ApiError.validationError('ID do signatário é obrigatório');
    }

    const signer = await this.makeRequest<Signer>(
      'GET',
      `/signers/${signerId}`
    );

    return signer;
  }

  /**
   * Lista signatários com filtros
   */
  async listSigners(filters?: SignerFilters): Promise<PaginatedResponse<Signer>> {
    const response = await this.makeRequest<PaginatedResponse<Signer>>(
      'GET',
      '/signers',
      undefined,
      { params: filters }
    );

    // Valida cada signatário na resposta
    if (response.data) {
      response.data = response.data as Signer[];
    }

    return response;
  }

  /**
   * Adiciona requisito de autenticação ao signatário
   */
  async addAuthenticationRequirement(
    signerId: string,
    requirement: AddAuthenticationRequirementInput
  ): Promise<void> {
    if (!signerId) {
      throw ApiError.validationError('ID do signatário é obrigatório');
    }

    await this.makeRequest<void>(
      'POST',
      `/signers/${signerId}/authentication-requirements`,
      requirement
    );
  }

  /**
   * Adiciona requisito de qualificação
   */
  async addQualificationRequirement(
    documentId: string,
    signerId: string,
    qualification: AddQualificationRequirementInput
  ): Promise<void> {
    if (!documentId) {
      throw ApiError.validationError('ID do documento é obrigatório');
    }

    if (!signerId) {
      throw ApiError.validationError('ID do signatário é obrigatório');
    }

    await this.makeRequest<void>(
      'POST',
      `/documents/${documentId}/qualification-requirements`,
      {
        signer_id: signerId,
        ...qualification,
      }
    );
  }

  // ==================== GERENCIAMENTO DE TEMPLATES ====================

  /**
   * Cria um novo template
   */
  async createTemplate(name: string, filePath: string, options?: Partial<TemplateInput>): Promise<Template> {
    if (!name) {
      throw ApiError.validationError('Nome do template é obrigatório');
    }

    if (!fs.existsSync(filePath)) {
      throw ApiError.validationError(`Arquivo não encontrado: ${filePath}`);
    }

    const content = await this.fileToBase64(filePath);
    const contentType = this.detectContentType(filePath);

    const templateData: TemplateInput = {
      name,
      content,
      content_type: contentType,
      ...options,
    };

    // Validação com Zod
    const validatedData = TemplateInputSchema.parse(templateData);

    const template = await this.makeRequest<Template>(
      'POST',
      '/templates',
      validatedData
    );

    return template as Template;
  }

  /**
   * Obtém um template por ID
   */
  async getTemplate(id: string): Promise<Template> {
    if (!id) {
      throw ApiError.validationError('ID do template é obrigatório');
    }

    const template = await this.makeRequest<Template>(
      'GET',
      `/templates/${id}`
    );

    return template as Template;
  }

  /**
   * Lista templates
   */
  async listTemplates(filters?: TemplateFilters): Promise<PaginatedResponse<Template>> {
    const response = await this.makeRequest<PaginatedResponse<Template>>(
      'GET',
      '/templates',
      undefined,
      { params: filters }
    );

    // Valida cada template na resposta
    if (response.data) {
      response.data = response.data as Template[];
    }

    return response;
  }

  /**
   * Atualiza um template
   */
  async updateTemplate(id: string, data: TemplateUpdateInput): Promise<Template> {
    if (!id) {
      throw ApiError.validationError('ID do template é obrigatório');
    }

    // Validação com Zod
    const validatedData = TemplateUpdateInputSchema.parse(data);

    const template = await this.makeRequest<Template>(
      'PUT',
      `/templates/${id}`,
      validatedData
    );

    return template as Template;
  }

  /**
   * Exclui um template
   */
  async deleteTemplate(id: string): Promise<void> {
    if (!id) {
      throw ApiError.validationError('ID do template é obrigatório');
    }

    await this.makeRequest<void>(
      'DELETE',
      `/templates/${id}`
    );
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Notifica um signatário específico
   */
  async notifySigner(signerId: string): Promise<void> {
    if (!signerId) {
      throw ApiError.validationError('ID do signatário é obrigatório');
    }

    await this.makeRequest<void>(
      'POST',
      `/signers/${signerId}/notify`
    );
  }

  /**
   * Notifica todos os signatários de um envelope
   */
  async notifyAllSignersInEnvelope(envelopeId: string): Promise<void> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    await this.makeRequest<void>(
      'POST',
      `/envelopes/${envelopeId}/notify-all`
    );
  }

  // ==================== EVENTOS E OBSERVADORES ====================

  /**
   * Lista eventos com filtros
   */
  async listEvents(filters?: EventFilters): Promise<PaginatedResponse<ApiEvent>> {
    const response = await this.makeRequest<PaginatedResponse<ApiEvent>>(
      'GET',
      '/events',
      undefined,
      { params: filters }
    );

    // Valida cada evento na resposta
    if (response.data) {
      response.data = response.data as ApiEvent[];
    }

    return response;
  }

  /**
   * Cria um observer de eventos (webhook)
   */
  async createEventObserver(observer: EventObserverInput): Promise<EventObserver> {
    // Validação com Zod
    const validatedData = EventObserverInputSchema.parse(observer);

    return this.makeRequest<EventObserver>(
      'POST',
      '/event-observers',
      validatedData
    );
  }

  /**
   * Lista observers de eventos
   */
  async listEventObservers(): Promise<EventObserver[]> {
    return this.makeRequest<EventObserver[]>(
      'GET',
      '/event-observers'
    );
  }

  /**
   * Atualiza um observer de eventos
   */
  async updateEventObserver(id: string, data: Partial<EventObserverInput>): Promise<EventObserver> {
    if (!id) {
      throw ApiError.validationError('ID do observer é obrigatório');
    }

    return this.makeRequest<EventObserver>(
      'PUT',
      `/event-observers/${id}`,
      data
    );
  }

  /**
   * Exclui um observer de eventos
   */
  async deleteEventObserver(id: string): Promise<void> {
    if (!id) {
      throw ApiError.validationError('ID do observer é obrigatório');
    }

    await this.makeRequest<void>(
      'DELETE',
      `/event-observers/${id}`
    );
  }

  // ==================== DOWNLOAD E PREVIEW ====================

  /**
   * Faz download de um documento assinado
   */
  async downloadSignedDocument(documentId: string): Promise<string> {
    if (!documentId) {
      throw ApiError.validationError('ID do documento é obrigatório');
    }

    return this.makeRequest<string>('GET', `/documents/${documentId}/download`);
  }

  /**
   * Gera ZIP com todos os documentos de um envelope
   */
  async generateEnvelopeZip(envelopeId: string): Promise<{jobId: string}> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    return this.makeRequest<{jobId: string}>('POST', `/envelopes/${envelopeId}/generate-zip`);
  }

  /**
   * Obtém status da geração do ZIP
   */
  async getZipStatus(jobId: string): Promise<ZipGenerationStatus> {
    if (!jobId) {
      throw ApiError.validationError('ID do job é obrigatório');
    }

    return this.makeRequest<ZipGenerationStatus>('GET', `/zip-jobs/${jobId}/status`);
  }

  /**
   * Faz download do ZIP gerado
   */
  async downloadEnvelopeZip(jobId: string): Promise<string> {
    if (!jobId) {
      throw ApiError.validationError('ID do job é obrigatório');
    }

    return this.makeRequest<string>('GET', `/zip-jobs/${jobId}/download`);
  }

  /**
   * Obtém preview de um documento
   */
  async getDocumentPreview(
    documentId: string, 
    options?: PreviewOptions
  ): Promise<PreviewResponse> {
    if (!documentId) {
      throw ApiError.validationError('ID do documento é obrigatório');
    }

    return this.makeRequest<PreviewResponse>('GET', `/documents/${documentId}/preview`, undefined, {
      params: options
    });
  }

  /**
   * Cancela um envelope com motivo específico
   */
  async cancelEnvelope(
    envelopeId: string, 
    reason: string, 
    notifySigners: boolean = true
  ): Promise<Envelope> {
    if (!envelopeId) {
      throw ApiError.validationError('ID do envelope é obrigatório');
    }

    if (!reason) {
      throw ApiError.validationError('Motivo do cancelamento é obrigatório');
    }

    return this.updateEnvelope(envelopeId, {
      status: 'canceled',
      cancellation_reason: reason,
      notify_signers: notifySigners
    } as any);
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================

  /**
   * Testa a conectividade com a API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>(
      'GET',
      '/health'
    );
  }

  /**
   * Obtém informações sobre o usuário atual
   */
  async getCurrentUser(): Promise<{ id: string; name: string; email: string }> {
    return this.makeRequest<{ id: string; name: string; email: string }>(
      'GET',
      '/me'
    );
  }
}