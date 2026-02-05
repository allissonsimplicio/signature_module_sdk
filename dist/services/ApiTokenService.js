"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTokenService = void 0;
/**
 * ApiTokenService - Gerenciamento de API Tokens (FASE 11)
 */
class ApiTokenService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * Criar novo API token
     * ⚠️ O token completo só é retornado nesta chamada!
     */
    async create(data) {
        const response = await this.httpClient.post('/api/v1/api-tokens', data);
        return response.data;
    }
    /**
     * Listar API tokens do usuário atual
     */
    async findAll(filters) {
        const response = await this.httpClient.get('/api/v1/api-tokens', {
            params: filters,
        });
        return response.data;
    }
    /**
     * Obter API token por ID
     */
    async findOne(id) {
        const response = await this.httpClient.get(`/api/v1/api-tokens/${id}`);
        return response.data;
    }
    /**
     * Atualizar API token
     */
    async update(id, data) {
        const response = await this.httpClient.patch(`/api/v1/api-tokens/${id}`, data);
        return response.data;
    }
    /**
     * Revogar API token (desativar)
     */
    async revoke(id) {
        const response = await this.httpClient.post(`/api/v1/api-tokens/${id}/revoke`);
        return response.data;
    }
    /**
     * Ativar API token previamente revogado
     */
    async activate(id) {
        const response = await this.httpClient.post(`/api/v1/api-tokens/${id}/activate`);
        return response.data;
    }
    /**
     * Deletar API token permanentemente
     */
    async remove(id) {
        const response = await this.httpClient.delete(`/api/v1/api-tokens/${id}`);
        return response.data;
    }
}
exports.ApiTokenService = ApiTokenService;
//# sourceMappingURL=ApiTokenService.js.map