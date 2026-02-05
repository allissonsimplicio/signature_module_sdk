import { AxiosInstance } from 'axios';
import { SectorWithRelations, SectorTreeNode, UserSector, CreateSectorDto, UpdateSectorDto, AddUserToSectorDto, SectorFilters } from '../types/sector.types';
/**
 * SectorService - Gerenciamento de Setores Organizacionais
 *
 * Permite criar e gerenciar setores hierárquicos dentro de uma organização,
 * adicionar/remover membros, e navegar pela árvore de setores.
 */
export declare class SectorService {
    private httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * Criar novo setor
     */
    create(data: CreateSectorDto): Promise<SectorWithRelations>;
    /**
     * Listar setores com filtros
     */
    findAll(filters?: SectorFilters): Promise<SectorWithRelations[]>;
    /**
     * Buscar setor por ID
     */
    findOne(id: string): Promise<SectorWithRelations>;
    /**
     * Atualizar setor
     */
    update(id: string, data: UpdateSectorDto): Promise<SectorWithRelations>;
    /**
     * Remover (soft delete) setor
     */
    remove(id: string): Promise<void>;
    /**
     * Obter árvore hierárquica completa da organização
     */
    getTree(): Promise<SectorTreeNode[]>;
    /**
     * Listar filhos diretos de um setor
     */
    getChildren(sectorId: string): Promise<SectorWithRelations[]>;
    /**
     * Listar membros de um setor
     */
    getUsers(sectorId: string): Promise<UserSector[]>;
    /**
     * Adicionar usuário a um setor
     */
    addUser(sectorId: string, data: AddUserToSectorDto): Promise<UserSector>;
    /**
     * Remover usuário de um setor
     */
    removeUser(sectorId: string, userId: string): Promise<void>;
    /**
     * Listar setores de um usuário específico
     */
    getUserSectors(userId: string): Promise<SectorWithRelations[]>;
}
//# sourceMappingURL=SectorService.d.ts.map