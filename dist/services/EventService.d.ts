import { AxiosInstance } from 'axios';
import { ApiEvent, EventFilters, EventStats, EventActivitySummary } from '../types/event.types';
import { PaginatedResponse } from '../types/common.types';
/**
 * Serviço para gerenciamento de eventos do sistema
 *
 * Eventos são registros de auditoria de todas as ações que ocorrem no sistema:
 * - Criação/atualização de envelopes
 * - Adição/assinatura de documentos
 * - Ações de signatários (acesso, autenticação, assinatura)
 * - Notificações enviadas
 * - Erros do sistema
 *
 * Use este serviço para:
 * - Auditar ações em envelopes
 * - Rastrear o progresso de assinaturas
 * - Investigar falhas e erros
 * - Gerar relatórios de atividade
 * - Monitorar uso do sistema
 *
 * @example
 * ```typescript
 * // Buscar todos os eventos de um envelope
 * const events = await client.events.findByEnvelope(envelopeId);
 *
 * // Buscar eventos de erro nas últimas 24h
 * const errors = await client.events.findAll({
 *   severity: 'error',
 *   occurredFrom: new Date(Date.now() - 86400000).toISOString()
 * });
 *
 * // Filtrar eventos por tipo
 * const signerEvents = await client.events.findAll({
 *   type: ['signer.signed', 'signer.rejected'],
 *   page: 1,
 *   perPage: 50
 * });
 * ```
 */
export declare class EventService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Lista todos os eventos com filtros opcionais
     *
     * @param filters - Filtros de busca (tipo, severidade, datas, etc)
     * @returns Resposta paginada com lista de eventos
     *
     * @example
     * ```typescript
     * // Eventos de assinatura nas últimas 7 dias
     * const events = await client.events.findAll({
     *   type: ['signer.signed', 'document.signed'],
     *   occurredFrom: new Date(Date.now() - 7*86400000).toISOString(),
     *   sortBy: 'occurredAt',
     *   sortOrder: 'desc',
     *   perPage: 100
     * });
     * ```
     */
    findAll(filters?: EventFilters): Promise<PaginatedResponse<ApiEvent>>;
    /**
     * Lista eventos de um envelope específico
     *
     * Retorna o histórico completo de eventos de um envelope, incluindo:
     * - Criação e ativação do envelope
     * - Adição de documentos e signatários
     * - Ações de assinatura
     * - Notificações enviadas
     * - Erros e falhas
     *
     * @param envelopeId - ID do envelope
     * @param filters - Filtros opcionais (tipo, severidade, datas)
     * @returns Resposta paginada com eventos do envelope
     *
     * @example
     * ```typescript
     * // Histórico completo de um envelope
     * const events = await client.events.findByEnvelope(envelopeId);
     *
     * // Apenas eventos de erro do envelope
     * const errors = await client.events.findByEnvelope(envelopeId, {
     *   severity: 'error',
     *   sortBy: 'occurredAt',
     *   sortOrder: 'desc'
     * });
     *
     * // Eventos de assinatura do envelope
     * const signingEvents = await client.events.findByEnvelope(envelopeId, {
     *   type: ['signer.signed', 'signer.rejected', 'document.signed']
     * });
     * ```
     */
    findByEnvelope(envelopeId: string, filters?: Omit<EventFilters, 'envelopeId'>): Promise<PaginatedResponse<ApiEvent>>;
    /**
     * Busca um evento específico por ID
     *
     * @param eventId - ID do evento
     * @returns Dados completos do evento
     *
     * @example
     * ```typescript
     * const event = await client.events.findById('evt123456');
     * console.log(`Evento: ${event.type} - ${event.title}`);
     * console.log(`Ocorrido em: ${event.occurredAt}`);
     * ```
     */
    findById(eventId: string): Promise<ApiEvent>;
    /**
     * Obtém estatísticas de eventos
     *
     * Retorna métricas agregadas sobre eventos:
     * - Total de eventos por tipo
     * - Total de eventos por severidade
     * - Eventos nas últimas 24h, 7d, 30d
     * - Envelopes mais ativos
     * - Taxa de erro
     *
     * @param filters - Filtros opcionais para escopo das estatísticas
     * @returns Objeto com estatísticas agregadas
     *
     * @example
     * ```typescript
     * const stats = await client.events.getStats();
     * console.log(`Total de eventos: ${stats.totalEvents}`);
     * console.log(`Taxa de erro: ${stats.errorRatePercentage}%`);
     * console.log(`Eventos últimas 24h: ${stats.eventsLast24h}`);
     * ```
     */
    getStats(filters?: Partial<EventFilters>): Promise<EventStats>;
    /**
     * Obtém resumo de atividade de eventos por data
     *
     * Retorna análise detalhada dos eventos de uma data específica:
     * - Distribuição por hora do dia
     * - Top tipos de eventos
     * - Contagem por severidade
     *
     * @param date - Data no formato YYYY-MM-DD
     * @returns Resumo de atividade do dia
     *
     * @example
     * ```typescript
     * const summary = await client.events.getActivitySummary('2025-11-13');
     * console.log(`Total do dia: ${summary.totalEvents}`);
     * console.log(`Pico de atividade: ${summary.eventsByHour.indexOf(Math.max(...summary.eventsByHour))}h`);
     * ```
     */
    getActivitySummary(date: string): Promise<EventActivitySummary>;
    /**
     * Lista eventos de um documento específico
     *
     * @param documentId - ID do documento
     * @param filters - Filtros opcionais
     * @returns Resposta paginada com eventos do documento
     *
     * @example
     * ```typescript
     * const events = await client.events.findByDocument(documentId, {
     *   type: ['document.signed', 'document.completed']
     * });
     * ```
     */
    findByDocument(documentId: string, filters?: Omit<EventFilters, 'documentId'>): Promise<PaginatedResponse<ApiEvent>>;
    /**
     * Lista eventos de um signatário específico
     *
     * @param signerId - ID do signatário
     * @param filters - Filtros opcionais
     * @returns Resposta paginada com eventos do signatário
     *
     * @example
     * ```typescript
     * const events = await client.events.findBySigner(signerId, {
     *   type: ['signer.accessed', 'signer.authenticated', 'signer.signed']
     * });
     * ```
     */
    findBySigner(signerId: string, filters?: Omit<EventFilters, 'signerId'>): Promise<PaginatedResponse<ApiEvent>>;
    /**
     * Lista eventos de um template específico
     *
     * @param templateId - ID do template
     * @param filters - Filtros opcionais
     * @returns Resposta paginada com eventos do template
     *
     * @example
     * ```typescript
     * const events = await client.events.findByTemplate(templateId, {
     *   type: 'template.used'
     * });
     * ```
     */
    findByTemplate(templateId: string, filters?: Omit<EventFilters, 'templateId'>): Promise<PaginatedResponse<ApiEvent>>;
    /**
     * Busca eventos por busca textual
     *
     * Busca no título e descrição dos eventos
     *
     * @param searchTerm - Termo de busca
     * @param filters - Filtros adicionais
     * @returns Resposta paginada com eventos encontrados
     *
     * @example
     * ```typescript
     * const events = await client.events.search('falha na assinatura', {
     *   severity: 'error',
     *   occurredFrom: new Date(Date.now() - 86400000).toISOString()
     * });
     * ```
     */
    search(searchTerm: string, filters?: Omit<EventFilters, 'search'>): Promise<PaginatedResponse<ApiEvent>>;
}
//# sourceMappingURL=EventService.d.ts.map