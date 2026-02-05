import { AxiosInstance } from 'axios';
import { Envelope, EnvelopeInput, ActivateEnvelopeResponse, EnvelopeFilters, NotifyEnvelopeResponse, GenerateZipResponse, ZipStatusResponse, FindEnvelopeByIdOptions, AuditTrail, CreateEnvelopeFromTemplatesInput, EnvelopeFromTemplatesJobResponse, JobStatusResponse } from '../types/envelope.types';
import { PaginatedResponse } from '../types/common.types';
export declare class EnvelopeService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria um novo envelope
     */
    create(dto: EnvelopeInput): Promise<Envelope>;
    /**
     * Lista todos os envelopes
     */
    findAll(filters?: EnvelopeFilters): Promise<PaginatedResponse<Envelope>>;
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
    findById(id: string, options?: FindEnvelopeByIdOptions): Promise<Envelope>;
    /**
     * Obtém trilha de auditoria (audit trail) de um envelope
     *
     * @param id - ID do envelope
     * @returns Trilha de auditoria completa do envelope
     */
    getAuditTrail(id: string): Promise<AuditTrail>;
    /**
     * Atualiza um envelope
     */
    update(id: string, dto: Partial<EnvelopeInput>): Promise<Envelope>;
    /**
     * Deleta um envelope
     */
    delete(id: string): Promise<void>;
    /**
     * Ativa um envelope (envia notificações aos signatários)
     */
    activate(id: string): Promise<ActivateEnvelopeResponse>;
    /**
     * Cancela um envelope
     */
    cancel(id: string, reason?: string): Promise<Envelope>;
    /**
     * Envia notificações manuais para signatários do envelope
     * @param id - ID do envelope
     * @returns Detalhes das notificações enviadas
     */
    notify(id: string): Promise<NotifyEnvelopeResponse>;
    /**
     * Inicia geração de arquivo ZIP com todos os documentos do envelope
     * @param id - ID do envelope
     * @returns Job ID para consultar status da geração
     */
    generateZip(id: string): Promise<GenerateZipResponse>;
    /**
     * Consulta status da geração de ZIP
     * @param id - ID do envelope
     * @param jobId - ID do job de geração
     * @returns Status atual da geração, incluindo URL de download se completo
     */
    getZipStatus(id: string, jobId: string): Promise<ZipStatusResponse>;
    /**
     * Cancela/deleta um job de geração de ZIP
     * @param id - ID do envelope
     * @param jobId - ID do job a ser cancelado
     */
    deleteZipJob(id: string, jobId: string): Promise<void>;
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
    createFromTemplates(input: CreateEnvelopeFromTemplatesInput): Promise<EnvelopeFromTemplatesJobResponse>;
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
    getJobStatus(jobId: string): Promise<JobStatusResponse>;
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
    cancelJob(jobId: string): Promise<void>;
}
//# sourceMappingURL=EnvelopeService.d.ts.map