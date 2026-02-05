import { AxiosInstance } from 'axios';
import {
  Organization,
  OrganizationWithStats,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationFilters,
} from '../types/organization.types';
import {
  CreateUserResponse,
  AddMemberDto,
  UpdateMemberRoleDto,
  UpdateMemberRoleResponse,
} from '../types/user.types';

/**
 * OrganizationService - Gerenciamento de Organizações (FASE 11, FASE 12)
 */
export class OrganizationService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Criar nova organização (admin)
   */
  async create(data: CreateOrganizationDto): Promise<Organization> {
    const response = await this.httpClient.post<Organization>('/api/v1/organizations', data);
    return response.data;
  }

  /**
   * Obter organização do usuário atual com estatísticas
   */
  async getMyOrganization(): Promise<OrganizationWithStats> {
    const response = await this.httpClient.get<OrganizationWithStats>(
      '/api/v1/organizations/me'
    );
    return response.data;
  }

  /**
   * Atualizar organização do usuário atual (requer OWNER ou ADMIN)
   */
  async updateMyOrganization(data: UpdateOrganizationDto): Promise<Organization> {
    const response = await this.httpClient.patch<Organization>(
      '/api/v1/organizations/me',
      data
    );
    return response.data;
  }

  /**
   * Listar todas organizações (admin)
   */
  async findAll(filters?: OrganizationFilters): Promise<Organization[]> {
    const response = await this.httpClient.get<Organization[]>('/api/v1/organizations', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obter organização por ID (admin)
   */
  async findOne(id: string): Promise<Organization> {
    const response = await this.httpClient.get<Organization>(`/api/v1/organizations/${id}`);
    return response.data;
  }

  /**
   * Obter organização com estatísticas por ID (admin)
   */
  async findOneWithStats(id: string): Promise<OrganizationWithStats> {
    const response = await this.httpClient.get<OrganizationWithStats>(
      `/api/v1/organizations/${id}/stats`
    );
    return response.data;
  }

  /**
   * Atualizar organização por ID (admin)
   */
  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    const response = await this.httpClient.patch<Organization>(
      `/api/v1/organizations/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Deletar organização (admin)
   */
  async remove(id: string): Promise<{ message: string }> {
    const response = await this.httpClient.delete<{ message: string }>(
      `/api/v1/organizations/${id}`
    );
    return response.data;
  }

  // 🆕 FASE 12: Gerenciamento de Membros

  /**
   * Adicionar membro à organização
   * Cria novo usuário e adiciona à organização especificada
   * Requer OWNER ou ADMIN
   */
  async addMember(organizationId: string, data: AddMemberDto): Promise<CreateUserResponse> {
    const response = await this.httpClient.post<CreateUserResponse>(
      `/api/v1/organizations/${organizationId}/members`,
      data
    );
    return response.data;
  }

  /**
   * Alterar role de membro
   * Promove/rebaixa usuário (MEMBER ↔ ADMIN)
   * Requer OWNER
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    data: UpdateMemberRoleDto
  ): Promise<UpdateMemberRoleResponse> {
    const response = await this.httpClient.patch<UpdateMemberRoleResponse>(
      `/api/v1/organizations/${organizationId}/members/${userId}/role`,
      data
    );
    return response.data;
  }

  /**
   * Remover membro da organização
   * Remove usuário da organização
   * Requer OWNER ou ADMIN
   * Não permite remover OWNER
   */
  async removeMember(organizationId: string, userId: string): Promise<{ message: string }> {
    const response = await this.httpClient.delete<{ message: string }>(
      `/api/v1/organizations/${organizationId}/members/${userId}`
    );
    return response.data;
  }
}
