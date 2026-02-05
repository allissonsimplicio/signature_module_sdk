"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
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
class EventService {
    constructor(http) {
        this.http = http;
    }
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
    async findAll(filters) {
        const response = await this.http.get('/api/v1/events', { params: filters });
        return response.data;
    }
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
    async findByEnvelope(envelopeId, filters) {
        const response = await this.http.get(`/api/v1/envelopes/${envelopeId}/events`, { params: filters });
        return response.data;
    }
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
    async findById(eventId) {
        const response = await this.http.get(`/api/v1/events/${eventId}`);
        return response.data;
    }
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
    async getStats(filters) {
        const response = await this.http.get('/api/v1/events/stats', { params: filters });
        return response.data;
    }
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
    async getActivitySummary(date) {
        const response = await this.http.get(`/api/v1/events/activity/${date}`);
        return response.data;
    }
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
    async findByDocument(documentId, filters) {
        const response = await this.http.get(`/api/v1/events`, { params: { ...filters, documentId: documentId } });
        return response.data;
    }
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
    async findBySigner(signerId, filters) {
        const response = await this.http.get(`/api/v1/events`, { params: { ...filters, signerId: signerId } });
        return response.data;
    }
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
    async findByTemplate(templateId, filters) {
        const response = await this.http.get(`/api/v1/events`, { params: { ...filters, templateId: templateId } });
        return response.data;
    }
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
    async search(searchTerm, filters) {
        const response = await this.http.get(`/api/v1/events`, { params: { ...filters, search: searchTerm } });
        return response.data;
    }
}
exports.EventService = EventService;
//# sourceMappingURL=EventService.js.map