import { AxiosInstance } from 'axios';
import {
  Sector,
  SectorWithRelations,
  SectorTreeNode,
  UserSector,
  CreateSectorDto,
  UpdateSectorDto,
  AddUserToSectorDto,
  SectorFilters,
} from '../types/sector.types';

/**
 * SectorService - Gerenciamento de Setores Organizacionais
 *
 * Permite criar e gerenciar setores hierárquicos dentro de uma organização,
 * adicionar/remover membros, e navegar pela árvore de setores.
 */
export class SectorService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * Criar novo setor
   */
  async create(data: CreateSectorDto): Promise<SectorWithRelations> {
    const response = await this.httpClient.post<SectorWithRelations>('/api/v1/sectors', data);
    return response.data;
  }

  /**
   * Listar setores com filtros
   */
  async findAll(filters?: SectorFilters): Promise<SectorWithRelations[]> {
    const response = await this.httpClient.get<SectorWithRelations[]>('/api/v1/sectors', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Buscar setor por ID
   */
  async findOne(id: string): Promise<SectorWithRelations> {
    const response = await this.httpClient.get<SectorWithRelations>(`/api/v1/sectors/${id}`);
    return response.data;
  }

  /**
   * Atualizar setor
   */
  async update(id: string, data: UpdateSectorDto): Promise<SectorWithRelations> {
    const response = await this.httpClient.patch<SectorWithRelations>(`/api/v1/sectors/${id}`, data);
    return response.data;
  }

  /**
   * Remover (soft delete) setor
   */
  async remove(id: string): Promise<void> {
    await this.httpClient.delete(`/api/v1/sectors/${id}`);
  }

  /**
   * Obter árvore hierárquica completa da organização
   */
  async getTree(): Promise<SectorTreeNode[]> {
    const response = await this.httpClient.get<SectorTreeNode[]>('/api/v1/sectors/tree');
    return response.data;
  }

  /**
   * Listar filhos diretos de um setor
   */
  async getChildren(sectorId: string): Promise<SectorWithRelations[]> {
    const response = await this.httpClient.get<SectorWithRelations[]>(`/api/v1/sectors/${sectorId}/children`);
    return response.data;
  }

  /**
   * Listar membros de um setor
   */
  async getUsers(sectorId: string): Promise<UserSector[]> {
    const response = await this.httpClient.get<UserSector[]>(`/api/v1/sectors/${sectorId}/users`);
    return response.data;
  }

  /**
   * Adicionar usuário a um setor
   */
  async addUser(sectorId: string, data: AddUserToSectorDto): Promise<UserSector> {
    const response = await this.httpClient.post<UserSector>(`/api/v1/sectors/${sectorId}/users`, data);
    return response.data;
  }

  /**
   * Remover usuário de um setor
   */
  async removeUser(sectorId: string, userId: string): Promise<void> {
    await this.httpClient.delete(`/api/v1/sectors/${sectorId}/users/${userId}`);
  }

  /**
   * Listar setores de um usuário específico
   */
  async getUserSectors(userId: string): Promise<SectorWithRelations[]> {
    const response = await this.httpClient.get<SectorWithRelations[]>(`/api/v1/sectors/users/${userId}`);
    return response.data;
  }
}
