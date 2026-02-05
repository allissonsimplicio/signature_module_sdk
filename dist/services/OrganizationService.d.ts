import { AxiosInstance } from 'axios';
import { Organization, OrganizationWithStats, CreateOrganizationDto, UpdateOrganizationDto, OrganizationFilters } from '../types/organization.types';
import { CreateUserResponse, AddMemberDto, UpdateMemberRoleDto, UpdateMemberRoleResponse } from '../types/user.types';
/**
 * OrganizationService - Gerenciamento de Organizações (FASE 11, FASE 12)
 */
export declare class OrganizationService {
    private httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * Criar nova organização (admin)
     */
    create(data: CreateOrganizationDto): Promise<Organization>;
    /**
     * Obter organização do usuário atual com estatísticas
     */
    getMyOrganization(): Promise<OrganizationWithStats>;
    /**
     * Atualizar organização do usuário atual (requer OWNER ou ADMIN)
     */
    updateMyOrganization(data: UpdateOrganizationDto): Promise<Organization>;
    /**
     * Listar todas organizações (admin)
     */
    findAll(filters?: OrganizationFilters): Promise<Organization[]>;
    /**
     * Obter organização por ID (admin)
     */
    findOne(id: string): Promise<Organization>;
    /**
     * Obter organização com estatísticas por ID (admin)
     */
    findOneWithStats(id: string): Promise<OrganizationWithStats>;
    /**
     * Atualizar organização por ID (admin)
     */
    update(id: string, data: UpdateOrganizationDto): Promise<Organization>;
    /**
     * Deletar organização (admin)
     */
    remove(id: string): Promise<{
        message: string;
    }>;
    /**
     * Adicionar membro à organização
     * Cria novo usuário e adiciona à organização especificada
     * Requer OWNER ou ADMIN
     */
    addMember(organizationId: string, data: AddMemberDto): Promise<CreateUserResponse>;
    /**
     * Alterar role de membro
     * Promove/rebaixa usuário (MEMBER ↔ ADMIN)
     * Requer OWNER
     */
    updateMemberRole(organizationId: string, userId: string, data: UpdateMemberRoleDto): Promise<UpdateMemberRoleResponse>;
    /**
     * Remover membro da organização
     * Remove usuário da organização
     * Requer OWNER ou ADMIN
     * Não permite remover OWNER
     */
    removeMember(organizationId: string, userId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=OrganizationService.d.ts.map