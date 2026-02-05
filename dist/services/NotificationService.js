"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
/**
 * FASE 6: Serviço para Notificações Multi-Canal
 */
class NotificationService {
    constructor(http) {
        this.http = http;
    }
    // ========== Templates ==========
    /**
     * Cria template de notificação
     */
    async createTemplate(dto) {
        const response = await this.http.post('/api/v1/notification-templates', dto);
        return response.data;
    }
    /**
     * 🆕 PROBLEMA 3: Lista templates com suporte a filtros
     * @param filters - Filtros opcionais (channel, name)
     * @returns Lista de templates
     */
    async list(filters) {
        const params = new URLSearchParams();
        if (filters?.channel) {
            params.append('channel', filters.channel);
        }
        if (filters?.name) {
            params.append('name', filters.name);
        }
        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/notification-templates?${queryString}`
            : '/api/v1/notification-templates';
        const response = await this.http.get(url);
        return response.data;
    }
    /**
     * Lista todos os templates
     * @deprecated Use list() ao invés deste método. findAllTemplates() será removido na v3.0
     * @see list
     */
    async findAllTemplates() {
        return this.list();
    }
    /**
     * Busca template por ID
     */
    async findTemplateById(id) {
        const response = await this.http.get(`/api/v1/notification-templates/${id}`);
        return response.data;
    }
    /**
     * Preview de template com variáveis
     */
    async previewTemplate(templateId, dto) {
        const response = await this.http.post(`/api/v1/notification-templates/${templateId}/preview`, dto);
        return response.data;
    }
    /**
     * Deleta template
     */
    async deleteTemplate(templateId) {
        await this.http.delete(`/api/v1/notification-templates/${templateId}`);
    }
    // ========== Histórico de Notificações ==========
    /**
     * Lista histórico de notificações de um envelope
     */
    async getHistoryByEnvelope(envelopeId, filters) {
        const response = await this.http.get(`/api/v1/notifications/history/envelope/${envelopeId}`, { params: filters });
        return response.data;
    }
    /**
     * Lista histórico de notificações de um signatário
     */
    async getHistoryBySigner(signerId, filters) {
        const response = await this.http.get(`/api/v1/notifications/history/signer/${signerId}`, { params: filters });
        return response.data;
    }
    /**
     * Lista notificações falhadas
     */
    async getFailedNotifications(filters) {
        const response = await this.http.get('/api/v1/notifications/history/failed', { params: filters });
        return response.data;
    }
    /**
     * Reenviar notificação falhada
     */
    async retry(notificationId) {
        await this.http.post(`/api/v1/notifications/${notificationId}/retry`);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map