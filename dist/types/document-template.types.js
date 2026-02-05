"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateFiltersSchema = exports.UpdateTemplateDtoSchema = exports.DocumentTemplateSchema = void 0;
const zod_1 = require("zod");
// Schemas Zod
exports.DocumentTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    s3Key: zod_1.z.string(),
    s3Bucket: zod_1.z.string(),
    contentType: zod_1.z.string(),
    fileSize: zod_1.z.number(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPublic: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional(),
    extractedVariables: zod_1.z.array(zod_1.z.string()),
    variableSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    isConfigured: zod_1.z.boolean(),
    requiredRoles: zod_1.z.array(zod_1.z.any()).optional(),
    usageCount: zod_1.z.number().optional(),
    lastUsedAt: zod_1.z.string().datetime().optional(),
    ownerId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UpdateTemplateDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().max(1000).optional(),
    category: zod_1.z.string().max(100).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPublic: zod_1.z.boolean().optional(),
    variableSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    requiredRoles: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.TemplateFiltersSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isPublic: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional(),
    ownerId: zod_1.z.string().optional(),
    createdFrom: zod_1.z.string().datetime().optional(),
    createdTo: zod_1.z.string().datetime().optional(),
    lastUsedFrom: zod_1.z.string().datetime().optional(),
    lastUsedTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().min(1).optional(),
    perPage: zod_1.z.number().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['name', 'createdAt', 'updatedAt', 'usageCount', 'lastUsedAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=document-template.types.js.map