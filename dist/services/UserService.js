"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
/**
 * UserService - Gerenciamento de Usuários (FASE 11)
 */
class UserService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * Criar novo usuário (registro público)
     */
    async create(data) {
        const response = await this.httpClient.post('/api/v1/users', data);
        return response.data;
    }
    /**
     * Listar usuários com filtros
     */
    async findAll(filters) {
        const response = await this.httpClient.get('/api/v1/users', {
            params: filters,
        });
        return response.data;
    }
    /**
     * Obter usuário atual autenticado
     */
    async getCurrentUser() {
        const response = await this.httpClient.get('/api/v1/users/me');
        return response.data;
    }
    /**
     * Obter usuário por ID
     */
    async findOne(id) {
        const response = await this.httpClient.get(`/api/v1/users/${id}`);
        return response.data;
    }
    /**
     * Atualizar usuário
     */
    async update(id, data) {
        const response = await this.httpClient.patch(`/api/v1/users/${id}`, data);
        return response.data;
    }
    /**
     * Deletar usuário
     */
    async remove(id) {
        const response = await this.httpClient.delete(`/api/v1/users/${id}`);
        return response.data;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map