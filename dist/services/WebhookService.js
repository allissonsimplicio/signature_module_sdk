"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
/**
 * WebhookService - Gerenciamento de Event Observers (Webhooks)
 *
 * Event Observers permitem receber notificações HTTP quando eventos
 * específicos ocorrem no sistema (ex: envelope completo, signer assinou, etc).
 */
class WebhookService {
    constructor(http) {
        this.http = http;
    }
    /**
     * Cria um novo Event Observer (webhook)
     * @param dto - Configuração do webhook (URL, eventos, secret, etc)
     * @returns Event Observer criado
     *
     * @example
     * ```typescript
     * const webhook = await client.webhooks.create({
     *   name: "Webhook de Produção",
     *   callbackUrl: "https://myapp.com/webhooks/signatures",
     *   eventTypes: ["ENVELOPE_COMPLETED", "SIGNER_SIGNED"],
     *   secret: "my-secret-key",
     *   isActive: true
     * });
     * ```
     */
    async create(dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post('/api/v1/event-observers', dto);
        return response.data;
    }
    /**
     * Lista todos os Event Observers da organização
     * @returns Lista de webhooks configurados
     */
    async findAll() {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get('/api/v1/event-observers');
        return response.data;
    }
    /**
     * Busca um Event Observer por ID
     * @param id - ID do event observer
     * @returns Event Observer encontrado
     */
    async findById(id) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get(`/api/v1/event-observers/${id}`);
        return response.data;
    }
    /**
     * Atualiza um Event Observer
     * @param id - ID do event observer
     * @param dto - Dados para atualizar (campos parciais)
     * @returns Event Observer atualizado
     *
     * @example
     * ```typescript
     * // Desativar webhook temporariamente
     * await client.webhooks.update(webhookId, {
     *   isActive: false
     * });
     *
     * // Adicionar mais eventos
     * await client.webhooks.update(webhookId, {
     *   eventTypes: [
     *     "ENVELOPE_COMPLETED",
     *     "SIGNER_SIGNED",
     *     "DOCUMENT_SIGNED"  // Novo
     *   ]
     * });
     * ```
     */
    async update(id, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.patch(`/api/v1/event-observers/${id}`, dto);
        return response.data;
    }
    /**
     * Deleta um Event Observer permanentemente
     * @param id - ID do event observer
     *
     * @example
     * ```typescript
     * await client.webhooks.delete(webhookId);
     * ```
     */
    async delete(id) {
        await this.http.delete(`/api/v1/event-observers/${id}`);
    }
    /**
     * Ativa um Event Observer
     * Atalho para update({ isActive: true })
     */
    async activate(id) {
        return this.update(id, { isActive: true });
    }
    /**
     * Desativa um Event Observer
     * Atalho para update({ isActive: false })
     */
    async deactivate(id) {
        return this.update(id, { isActive: false });
    }
}
exports.WebhookService = WebhookService;
//# sourceMappingURL=WebhookService.js.map