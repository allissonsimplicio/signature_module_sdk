import { AxiosInstance } from 'axios';
import {
  Envelope,
  EnvelopeInput,
  ActivateEnvelopeResponse,
  EnvelopeFilters,
  NotifyEnvelopeResponse,
  GenerateZipResponse,
  ZipStatusResponse,
  FindEnvelopeByIdOptions,
  AuditTrail,
  CreateEnvelopeFromTemplatesInput,
  EnvelopeFromTemplatesJobResponse,
  JobStatusResponse,
} from '../types/envelope.types';
import { PaginatedResponse, ApiResponse } from '../types/common.types';

export class EnvelopeService {
  constructor(private http: AxiosInstance) {}

  /**
   * Cria um novo envelope
   */
  async create(dto: EnvelopeInput): Promise<Envelope> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<Envelope>('/api/v1/envelopes', dto);
    return response.data;
  }

  /**
   * Lista todos os envelopes
   */
  async findAll(filters?: EnvelopeFilters): Promise<PaginatedResponse<Envelope>> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<PaginatedResponse<Envelope>>('/api/v1/envelopes', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Busca envelope por ID
   * 🆕 PROBLEMA 4: Suporte a query parameters (include)
   *
   * @param id - ID do envelope
   * @param options - Opções de query parameters
   * @param options.include - Incluir entidades relacionadas (documents, signers, events)
   * @returns Envelope com ou sem entidades relacionadas incluídas
   *
   * @example
   * // Buscar apenas o envelope
   * const envelope = await envelopes.findById('env_123');
   *
   * @example
   * // Buscar envelope com documentos incluídos
   * const envelope = await envelopes.findById('env_123', { include: 'documents' });
   *
   * @example
   * // Buscar envelope com documentos e signatários
   * const envelope = await envelopes.findById('env_123', { include: 'documents,signers' });
   */
  async findById(id: string, options?: FindEnvelopeByIdOptions): Promise<Envelope> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const params = new URLSearchParams();

    if (options?.include) {
      params.append('include', options.include);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/envelopes/${id}?${queryString}`
      : `/api/v1/envelopes/${id}`;

    const response = await this.http.get<Envelope>(url);
    return response.data;
  }

  /**
   * Obtém trilha de auditoria (audit trail) de um envelope
   *
   * @param id - ID do envelope
   * @returns Trilha de auditoria completa do envelope
   */
  async getAuditTrail(id: string): Promise<AuditTrail> {
    const response = await this.http.get<AuditTrail>(
      `/api/v1/envelopes/${id}/audit-trail`
    );
    return response.data;
  }

  /**
   * Atualiza um envelope
   */
  async update(id: string, dto: Partial<EnvelopeInput>): Promise<Envelope> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.put<Envelope>(`/api/v1/envelopes/${id}`, dto);
    return response.data;
  }

  /**
   * Deleta um envelope
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/envelopes/${id}`);
  }

  /**
   * Ativa um envelope (envia notificações aos signatários)
   */
  async activate(id: string): Promise<ActivateEnvelopeResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<ActivateEnvelopeResponse>(`/api/v1/envelopes/${id}/activate`);
    return response.data;
  }

  /**
   * Cancela um envelope
   */
  async cancel(id: string, reason?: string): Promise<Envelope> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<Envelope>(`/api/v1/envelopes/${id}/cancel`, { reason });
    return response.data;
  }

  /**
   * Envia notificações manuais para signatários do envelope
   * @param id - ID do envelope
   * @returns Detalhes das notificações enviadas
   */
  async notify(id: string): Promise<NotifyEnvelopeResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<NotifyEnvelopeResponse>(`/api/v1/envelopes/${id}/notify`);
    return response.data;
  }

  /**
   * Inicia geração de arquivo ZIP com todos os documentos do envelope
   * @param id - ID do envelope
   * @returns Job ID para consultar status da geração
   */
  async generateZip(id: string): Promise<GenerateZipResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<GenerateZipResponse>(`/api/v1/envelopes/${id}/generate-zip`);
    return response.data;
  }

  /**
   * Consulta status da geração de ZIP
   * @param id - ID do envelope
   * @param jobId - ID do job de geração
   * @returns Status atual da geração, incluindo URL de download se completo
   */
  async getZipStatus(id: string, jobId: string): Promise<ZipStatusResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<ZipStatusResponse>(`/api/v1/envelopes/${id}/zip-status/${jobId}`);
    return response.data;
  }

  /**
   * Cancela/deleta um job de geração de ZIP
   * @param id - ID do envelope
   * @param jobId - ID do job a ser cancelado
   */
  async deleteZipJob(id: string, jobId: string): Promise<void> {
    await this.http.delete(`/api/v1/envelopes/${id}/zip-jobs/${jobId}`);
  }

  /**
   * 🆕 Cria envelope completo a partir de templates (Orquestração)
   *
   * Esta é uma operação composta que orquestra:
   * 1. Processamento de variáveis dos templates
   * 2. Geração de PDFs a partir de templates DOCX
   * 3. Criação de signatários com matching de roles
   * 4. Posicionamento automático de campos de assinatura
   * 5. Ativação e notificação opcionais
   *
   * **Processamento Assíncrono:**
   * O processamento acontece em background. O método retorna imediatamente
   * com HTTP 202 Accepted e um jobId para acompanhamento.
   *
   * **Acompanhamento:**
   * Use `getJobStatus(jobId)` para consultar o status e obter o resultado quando completo.
   *
   * **Precedência de Variáveis:**
   * Variáveis locais (documents[].variables) sobrescrevem variáveis globais (globalVariables).
   *
   * **Validação Fail Fast:**
   * Todos os templates e roles são validados ANTES de iniciar o processamento.
   *
   * @param input - Dados para criar o envelope
   * @returns Job response com jobId para tracking
   *
   * @example
   * ```typescript
   * const job = await client.envelopes.createFromTemplates({
   *   name: 'Processo #1234 - Divórcio',
   *   status: 'running',
   *   autoActivate: true,
   *   notifySigners: true,
   *   signers: [
   *     {
   *       role: 'CLIENTE',
   *       name: 'João da Silva',
   *       email: 'joao@email.com',
   *       customFields: { profissao: 'Engenheiro' }
   *     },
   *     {
   *       role: 'ADVOGADO',
   *       name: 'Dra. Maria',
   *       email: 'maria@firma.com'
   *     }
   *   ],
   *   documents: [
   *     { templateId: 'tpl_procuracao_v1' },
   *     { templateId: 'tpl_contrato_v2', variables: { VALOR: '5000.00' } }
   *   ],
   *   globalVariables: { CIDADE: 'Russas' }
   * });
   *
   * // Acompanhar progresso
   * const status = await client.envelopes.getJobStatus(job.jobId);
   * ```
   */
  async createFromTemplates(
    input: CreateEnvelopeFromTemplatesInput
  ): Promise<EnvelopeFromTemplatesJobResponse> {
    const response = await this.http.post<EnvelopeFromTemplatesJobResponse>(
      '/api/v1/envelopes/from-templates',
      input
    );
    return response.data;
  }

  /**
   * Consulta status de job de criação de envelope via templates
   *
   * **Status possíveis:**
   * - `pending`: Job aguardando processamento na fila
   * - `processing`: Job em execução
   * - `completed`: Job concluído com sucesso (resultado disponível)
   * - `failed`: Job falhou (detalhes do erro disponíveis)
   *
   * **Polling:**
   * Você pode fazer polling deste método para acompanhar o progresso.
   * Recomendamos intervalo de 2-5 segundos.
   *
   * @param jobId - ID do job retornado por createFromTemplates
   * @returns Status e resultado do job
   *
   * @example
   * ```typescript
   * // Polling simples
   * const checkStatus = async (jobId: string) => {
   *   let status = await client.envelopes.getJobStatus(jobId);
   *
   *   while (status.status === 'pending' || status.status === 'processing') {
   *     await new Promise(resolve => setTimeout(resolve, 3000)); // 3s
   *     status = await client.envelopes.getJobStatus(jobId);
   *     console.log(`Progress: ${status.progressPercentage}% - ${status.currentStep}`);
   *   }
   *
   *   if (status.status === 'completed') {
   *     console.log('Envelope criado:', status.result);
   *   } else {
   *     console.error('Falhou:', status.errors);
   *   }
   * };
   * ```
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.http.get<JobStatusResponse>(
      `/api/v1/envelopes/jobs/${jobId}`
    );
    return response.data;
  }

  /**
   * Cancela job de criação de envelope
   *
   * Cancela um job pendente ou em processamento.
   * Jobs já concluídos ou falhos não podem ser cancelados.
   *
   * @param jobId - ID do job a ser cancelado
   *
   * @example
   * ```typescript
   * await client.envelopes.cancelJob('job_abc123');
   * ```
   */
  async cancelJob(jobId: string): Promise<void> {
    await this.http.delete(`/api/v1/envelopes/jobs/${jobId}`);
  }
}
