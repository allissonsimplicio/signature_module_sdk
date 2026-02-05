/**
 * Organization Management Types (FASE 11)
 */
export interface Organization {
    id: string;
    name: string;
    slug: string;
    plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
    isActive: boolean;
    maxUsers: number;
    maxEnvelopes: number | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrganizationWithStats extends Organization {
    currentUsers: number;
    currentMonthEnvelopes: number;
    storageUsed: number;
}
export interface CreateOrganizationDto {
    name: string;
    slug?: string;
    plan?: string;
    maxUsers?: number;
    maxEnvelopes?: number;
    isActive?: boolean;
}
export interface UpdateOrganizationDto {
    name?: string;
    slug?: string;
    plan?: string;
    maxUsers?: number;
    maxEnvelopes?: number;
    isActive?: boolean;
}
export interface OrganizationFilters {
    name?: string;
    plan?: string;
    isActive?: boolean;
}
//# sourceMappingURL=organization.types.d.ts.map