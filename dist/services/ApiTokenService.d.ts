import { AxiosInstance } from 'axios';
import { ApiToken, CreateApiTokenResponse, CreateApiTokenDto, UpdateApiTokenDto, ApiTokenFilters } from '../types/api-token.types';
/**
 * ApiTokenService - Gerenciamento de API Tokens (FASE 11)
 */
export declare class ApiTokenService {
    private httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * Criar novo API token
     * ⚠️ O token completo só é retornado nesta chamada!
     */
    create(data: CreateApiTokenDto): Promise<CreateApiTokenResponse>;
    /**
     * Listar API tokens do usuário atual
     */
    findAll(filters?: ApiTokenFilters): Promise<ApiToken[]>;
    /**
     * Obter API token por ID
     */
    findOne(id: string): Promise<ApiToken>;
    /**
     * Atualizar API token
     */
    update(id: string, data: UpdateApiTokenDto): Promise<ApiToken>;
    /**
     * Revogar API token (desativar)
     */
    revoke(id: string): Promise<{
        message: string;
    }>;
    /**
     * Ativar API token previamente revogado
     */
    activate(id: string): Promise<{
        message: string;
    }>;
    /**
     * Deletar API token permanentemente
     */
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=ApiTokenService.d.ts.map