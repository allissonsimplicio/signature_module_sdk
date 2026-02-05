/**
 * API Token Management Types (FASE 11)
 */
import { z } from 'zod';
export interface ApiToken {
    id: string;
    name: string;
    isActive: boolean;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateApiTokenResponse extends ApiToken {
    token: string;
}
export interface CreateApiTokenDto {
    name?: string;
    expiresInDays?: number;
    expiresAt?: string;
}
export interface UpdateApiTokenDto {
    name?: string;
    expiresAt?: string;
    isActive?: boolean;
}
export interface ApiTokenFilters {
    name?: string;
    userId?: string;
    isActive?: boolean;
    createdFrom?: string;
    createdTo?: string;
    expiresFrom?: string;
    expiresTo?: string;
}
export declare const CreateApiTokenDtoSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    expiresInDays: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UpdateApiTokenDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const ApiTokenFiltersSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    createdFrom: z.ZodOptional<z.ZodString>;
    createdTo: z.ZodOptional<z.ZodString>;
    expiresFrom: z.ZodOptional<z.ZodString>;
    expiresTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=api-token.types.d.ts.map