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
  token: string; // Token apenas retornado na criação
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

// ============================================
// Zod Schemas para validação
// ============================================

export const CreateApiTokenDtoSchema = z.object({
  name: z.string().min(1).max(255).optional().default('API Token'),
  expiresInDays: z.number().int().min(1).max(3650).optional(),
  expiresAt: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Não pode ter ambos expiresInDays e expiresAt ao mesmo tempo
    if (data.expiresInDays && data.expiresAt) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot specify both expiresInDays and expiresAt',
  }
);

export const UpdateApiTokenDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const ApiTokenFiltersSchema = z.object({
  name: z.string().optional(),
  userId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  expiresFrom: z.string().datetime().optional(),
  expiresTo: z.string().datetime().optional(),
});
