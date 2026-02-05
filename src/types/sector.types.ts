/**
 * Sector Management Types
 * Setores organizacionais hierárquicos
 */

// Setor básico
export interface Sector {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  organizationId: string;
  parentId: string | null;
  level: number;
  path: string | null;
  managerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Setor com relações
export interface SectorWithRelations extends Sector {
  parent?: SectorBasic | null;
  children?: SectorBasic[];
  manager?: SectorManager | null;
  userCount?: number;
}

// Setor básico (para relações aninhadas)
export interface SectorBasic {
  id: string;
  name: string;
  code: string | null;
  level: number;
}

// Manager do setor
export interface SectorManager {
  id: string;
  name: string;
  email: string;
}

// Nó da árvore hierárquica
export interface SectorTreeNode extends Sector {
  children: SectorTreeNode[];
  userCount: number;
}

// Vínculo usuário-setor
export interface UserSector {
  id: string;
  userId: string;
  sectorId: string;
  isPrimary: boolean;
  role: string | null;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  sector?: SectorBasic;
}

// DTOs de input
export interface CreateSectorDto {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateSectorDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface AddUserToSectorDto {
  userId: string;
  isPrimary?: boolean;
  role?: string;
}

export interface SectorFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
  includeChildren?: boolean;
}
