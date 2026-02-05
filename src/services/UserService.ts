import { AxiosInstance } from 'axios';
import {
  User,
  CreateUserDto,
  CreateUserResponse,
  UpdateUserDto,
  UserFilters,
} from '../types/user.types';

/**
 * UserService - Gerenciamento de Usuários (FASE 11)
 */
export class UserService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Criar novo usuário (registro público)
   */
  async create(data: CreateUserDto): Promise<CreateUserResponse> {
    const response = await this.httpClient.post<CreateUserResponse>('/api/v1/users', data);
    return response.data;
  }

  /**
   * Listar usuários com filtros
   */
  async findAll(filters?: UserFilters): Promise<User[]> {
    const response = await this.httpClient.get<User[]>('/api/v1/users', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obter usuário atual autenticado
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.get<User>('/api/v1/users/me');
    return response.data;
  }

  /**
   * Obter usuário por ID
   */
  async findOne(id: string): Promise<User> {
    const response = await this.httpClient.get<User>(`/api/v1/users/${id}`);
    return response.data;
  }

  /**
   * Atualizar usuário
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.httpClient.patch<User>(`/api/v1/users/${id}`, data);
    return response.data;
  }

  /**
   * Deletar usuário
   */
  async remove(id: string): Promise<{ message: string }> {
    const response = await this.httpClient.delete<{ message: string }>(`/api/v1/users/${id}`);
    return response.data;
  }
}
