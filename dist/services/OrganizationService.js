"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
/**
 * OrganizationService - Gerenciamento de Organizações (FASE 11, FASE 12)
 */
class OrganizationService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * Criar nova organização (admin)
     */
    async create(data) {
        const response = await this.httpClient.post('/api/v1/organizations', data);
        return response.data;
    }
    /**
     * Obter organização do usuário atual com estatísticas
     */
    async getMyOrganization() {
        const response = await this.httpClient.get('/api/v1/organizations/me');
        return response.data;
    }
    /**
     * Atualizar organização do usuário atual (requer OWNER ou ADMIN)
     */
    async updateMyOrganization(data) {
        const response = await this.httpClient.patch('/api/v1/organizations/me', data);
        return response.data;
    }
    /**
     * Listar todas organizações (admin)
     */
    async findAll(filters) {
        const response = await this.httpClient.get('/api/v1/organizations', {
            params: filters,
        });
        return response.data;
    }
    /**
     * Obter organização por ID (admin)
     */
    async findOne(id) {
        const response = await this.httpClient.get(`/api/v1/organizations/${id}`);
        return response.data;
    }
    /**
     * Obter organização com estatísticas por ID (admin)
     */
    async findOneWithStats(id) {
        const response = await this.httpClient.get(`/api/v1/organizations/${id}/stats`);
        return response.data;
    }
    /**
     * Atualizar organização por ID (admin)
     */
    async update(id, data) {
        const response = await this.httpClient.patch(`/api/v1/organizations/${id}`, data);
        return response.data;
    }
    /**
     * Deletar organização (admin)
     */
    async remove(id) {
        const response = await this.httpClient.delete(`/api/v1/organizations/${id}`);
        return response.data;
    }
    // 🆕 FASE 12: Gerenciamento de Membros
    /**
     * Adicionar membro à organização
     * Cria novo usuário e adiciona à organização especificada
     * Requer OWNER ou ADMIN
     */
    async addMember(organizationId, data) {
        const response = await this.httpClient.post(`/api/v1/organizations/${organizationId}/members`, data);
        return response.data;
    }
    /**
     * Alterar role de membro
     * Promove/rebaixa usuário (MEMBER ↔ ADMIN)
     * Requer OWNER
     */
    async updateMemberRole(organizationId, userId, data) {
        const response = await this.httpClient.patch(`/api/v1/organizations/${organizationId}/members/${userId}/role`, data);
        return response.data;
    }
    /**
     * Remover membro da organização
     * Remove usuário da organização
     * Requer OWNER ou ADMIN
     * Não permite remover OWNER
     */
    async removeMember(organizationId, userId) {
        const response = await this.httpClient.delete(`/api/v1/organizations/${organizationId}/members/${userId}`);
        return response.data;
    }
}
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=OrganizationService.js.map