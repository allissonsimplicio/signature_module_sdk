"use strict";
/**
 * API Token Management Types (FASE 11)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTokenFiltersSchema = exports.UpdateApiTokenDtoSchema = exports.CreateApiTokenDtoSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Zod Schemas para validação
// ============================================
exports.CreateApiTokenDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional().default('API Token'),
    expiresInDays: zod_1.z.number().int().min(1).max(3650).optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
}).refine((data) => {
    // Não pode ter ambos expiresInDays e expiresAt ao mesmo tempo
    if (data.expiresInDays && data.expiresAt) {
        return false;
    }
    return true;
}, {
    message: 'Cannot specify both expiresInDays and expiresAt',
});
exports.UpdateApiTokenDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.ApiTokenFiltersSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    userId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    createdFrom: zod_1.z.string().datetime().optional(),
    createdTo: zod_1.z.string().datetime().optional(),
    expiresFrom: zod_1.z.string().datetime().optional(),
    expiresTo: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=api-token.types.js.map