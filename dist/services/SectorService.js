"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectorService = void 0;
/**
 * SectorService - Gerenciamento de Setores Organizacionais
 *
 * Permite criar e gerenciar setores hierárquicos dentro de uma organização,
 * adicionar/remover membros, e navegar pela árvore de setores.
 */
class SectorService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * Criar novo setor
     */
    async create(data) {
        const response = await this.httpClient.post('/api/v1/sectors', data);
        return response.data;
    }
    /**
     * Listar setores com filtros
     */
    async findAll(filters) {
        const response = await this.httpClient.get('/api/v1/sectors', {
            params: filters,
        });
        return response.data;
    }
    /**
     * Buscar setor por ID
     */
    async findOne(id) {
        const response = await this.httpClient.get(`/api/v1/sectors/${id}`);
        return response.data;
    }
    /**
     * Atualizar setor
     */
    async update(id, data) {
        const response = await this.httpClient.patch(`/api/v1/sectors/${id}`, data);
        return response.data;
    }
    /**
     * Remover (soft delete) setor
     */
    async remove(id) {
        await this.httpClient.delete(`/api/v1/sectors/${id}`);
    }
    /**
     * Obter árvore hierárquica completa da organização
     */
    async getTree() {
        const response = await this.httpClient.get('/api/v1/sectors/tree');
        return response.data;
    }
    /**
     * Listar filhos diretos de um setor
     */
    async getChildren(sectorId) {
        const response = await this.httpClient.get(`/api/v1/sectors/${sectorId}/children`);
        return response.data;
    }
    /**
     * Listar membros de um setor
     */
    async getUsers(sectorId) {
        const response = await this.httpClient.get(`/api/v1/sectors/${sectorId}/users`);
        return response.data;
    }
    /**
     * Adicionar usuário a um setor
     */
    async addUser(sectorId, data) {
        const response = await this.httpClient.post(`/api/v1/sectors/${sectorId}/users`, data);
        return response.data;
    }
    /**
     * Remover usuário de um setor
     */
    async removeUser(sectorId, userId) {
        await this.httpClient.delete(`/api/v1/sectors/${sectorId}/users/${userId}`);
    }
    /**
     * Listar setores de um usuário específico
     */
    async getUserSectors(userId) {
        const response = await this.httpClient.get(`/api/v1/sectors/users/${userId}`);
        return response.data;
    }
}
exports.SectorService = SectorService;
//# sourceMappingURL=SectorService.js.map