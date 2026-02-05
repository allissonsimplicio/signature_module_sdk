import { AxiosInstance } from 'axios';
import {
  ApiToken,
  CreateApiTokenResponse,
  CreateApiTokenDto,
  UpdateApiTokenDto,
  ApiTokenFilters,
} from '../types/api-token.types';

/**
 * ApiTokenService - Gerenciamento de API Tokens (FASE 11)
 */
export class ApiTokenService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Criar novo API token
   * ⚠️ O token completo só é retornado nesta chamada!
   */
  async create(data: CreateApiTokenDto): Promise<CreateApiTokenResponse> {
    const response = await this.httpClient.post<CreateApiTokenResponse>(
      '/api/v1/api-tokens',
      data
    );
    return response.data;
  }

  /**
   * Listar API tokens do usuário atual
   */
  async findAll(filters?: ApiTokenFilters): Promise<ApiToken[]> {
    const response = await this.httpClient.get<ApiToken[]>('/api/v1/api-tokens', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obter API token por ID
   */
  async findOne(id: string): Promise<ApiToken> {
    const response = await this.httpClient.get<ApiToken>(`/api/v1/api-tokens/${id}`);
    return response.data;
  }

  /**
   * Atualizar API token
   */
  async update(id: string, data: UpdateApiTokenDto): Promise<ApiToken> {
    const response = await this.httpClient.patch<ApiToken>(`/api/v1/api-tokens/${id}`, data);
    return response.data;
  }

  /**
   * Revogar API token (desativar)
   */
  async revoke(id: string): Promise<{ message: string }> {
    const response = await this.httpClient.post<{ message: string }>(
      `/api/v1/api-tokens/${id}/revoke`
    );
    return response.data;
  }

  /**
   * Ativar API token previamente revogado
   */
  async activate(id: string): Promise<{ message: string }> {
    const response = await this.httpClient.post<{ message: string }>(
      `/api/v1/api-tokens/${id}/activate`
    );
    return response.data;
  }

  /**
   * Deletar API token permanentemente
   */
  async remove(id: string): Promise<{ message: string }> {
    const response = await this.httpClient.delete<{ message: string }>(
      `/api/v1/api-tokens/${id}`
    );
    return response.data;
  }
}
