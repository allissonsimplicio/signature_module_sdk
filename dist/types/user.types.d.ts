/**
 * User Management Types (FASE 11, FASE 12)
 */
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    role?: UserRole;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
    organizationId?: string;
    organizationName?: string;
    role?: UserRole;
    generateApiToken?: boolean;
}
export interface CreateUserResponse {
    user: User;
    message: string;
    apiToken?: string;
}
export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    organizationName?: string;
    generateApiToken?: boolean;
}
export interface UserFilters {
    name?: string;
    email?: string;
    createdFrom?: string;
    createdTo?: string;
}
export interface AddMemberDto {
    email: string;
    name: string;
    password: string;
    role?: 'ADMIN' | 'MEMBER';
    generateApiToken?: boolean;
}
export interface UpdateMemberRoleDto {
    role: 'ADMIN' | 'MEMBER';
}
export interface UpdateMemberRoleResponse {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}
//# sourceMappingURL=user.types.d.ts.map