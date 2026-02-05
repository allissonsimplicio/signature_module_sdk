"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSignatureFieldInputSchema = exports.CreateInitialFieldsDtoSchema = exports.CreateStampGroupDtoSchema = exports.SignatureFieldFiltersSchema = exports.SignFieldDtoSchema = exports.SignatureFieldUpdateSchema = exports.SignatureFieldInputSchema = exports.SignatureFieldSchema = exports.SignatureFieldTypeSchema = void 0;
const zod_1 = require("zod");
// Enum para os tipos de campos de assinatura - API format (lowercase)
// Nota: O banco usa UPPERCASE, mas a API espera lowercase
exports.SignatureFieldTypeSchema = zod_1.z.enum([
    'signature',
    'initial',
    'text',
    'date',
    'checkbox',
]);
// Schema principal para um campo de assinatura
exports.SignatureFieldSchema = zod_1.z.object({
    id: zod_1.z.string(),
    page: zod_1.z.number().int(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    type: exports.SignatureFieldTypeSchema,
    required: zod_1.z.boolean().default(true),
    signed: zod_1.z.boolean().default(false),
    value: zod_1.z.string().nullable(),
    signedAt: zod_1.z.string().datetime().nullable(),
    signatureData: zod_1.z.string().nullable(),
    // Hash e Verificação (Fase 4)
    signatureHash: zod_1.z.string().nullable(),
    hashAlgorithm: zod_1.z.string().nullable(),
    documentHash: zod_1.z.string().nullable(),
    signerRole: zod_1.z.string().nullable(),
    documentId: zod_1.z.string(),
    signerId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Schema para a criação de um novo campo de assinatura
exports.SignatureFieldInputSchema = zod_1.z.object({
    signerId: zod_1.z.string(),
    page: zod_1.z.number().int().positive(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    type: exports.SignatureFieldTypeSchema,
    required: zod_1.z.boolean().optional().default(true),
    value: zod_1.z.string().optional(), // Valor padrão para o campo
});
// Schema para a atualização de um campo de assinatura
exports.SignatureFieldUpdateSchema = exports.SignatureFieldInputSchema.omit({
    signerId: true,
}).partial();
// Schema Zod para SignFieldDto
exports.SignFieldDtoSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    signatureValue: zod_1.z.string().max(500).optional(),
    signatureImageUrl: zod_1.z.string().max(1000).optional(),
    signatureImage: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    digitalCertificateId: zod_1.z.string().optional(),
    certificatePassword: zod_1.z.string().min(4).optional(),
    padesReason: zod_1.z.string().optional(),
    padesLocation: zod_1.z.string().optional(),
    padesContactInfo: zod_1.z.string().optional(),
});
// Schema Zod para filtros
exports.SignatureFieldFiltersSchema = zod_1.z.object({
    documentId: zod_1.z.string().uuid().optional(),
    signerId: zod_1.z.string().uuid().optional(),
    type: exports.SignatureFieldTypeSchema.optional(),
    documentPage: zod_1.z.number().int().min(1).max(100).optional(),
    required: zod_1.z.boolean().optional(),
    isSigned: zod_1.z.boolean().optional(),
    createdFrom: zod_1.z.string().datetime().optional(),
    createdTo: zod_1.z.string().datetime().optional(),
    signedFrom: zod_1.z.string().datetime().optional(),
    signedTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['page', 'type', 'required', 'createdAt', 'signedAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    page: zod_1.z.number().int().min(1).optional(),
    perPage: zod_1.z.number().int().min(1).max(100).optional(),
});
// Schema Zod para CreateStampGroupDto
exports.CreateStampGroupDtoSchema = zod_1.z.object({
    signerId: zod_1.z.string(), // Removed .uuid() to support CUIDs
    page: zod_1.z.number().int().positive(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    size: zod_1.z.enum(['P', 'M', 'G']).optional(),
});
// Schema Zod para CreateInitialFieldsDto
exports.CreateInitialFieldsDtoSchema = zod_1.z.object({
    signerId: zod_1.z.string(), // Removed .uuid() to support CUIDs
});
// Schema Zod para atualização
exports.UpdateSignatureFieldInputSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    x: zod_1.z.number().optional(),
    y: zod_1.z.number().optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    type: exports.SignatureFieldTypeSchema.optional(),
    required: zod_1.z.boolean().optional(),
    signerId: zod_1.z.string().optional(),
    value: zod_1.z.string().optional(),
    signedAt: zod_1.z.string().datetime().optional(),
    signatureImageUrl: zod_1.z.string().optional(),
});
//# sourceMappingURL=signature-field.types.js.map