"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPreviewOptionsSchema = exports.DocumentSchema = exports.DocumentFromTemplateInputSchema = exports.DocumentUploadInputSchema = void 0;
const zod_1 = require("zod");
// Schema Zod para DocumentUploadInput
exports.DocumentUploadInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    content: zod_1.z.string().min(1),
    contentType: zod_1.z.string().min(1), // Obrigatório
    fileSize: zod_1.z.number().min(1), // Obrigatório
    pageCount: zod_1.z.number().min(1).optional(),
    description: zod_1.z.string().max(1000).optional(),
    templateId: zod_1.z.string().optional(),
    templateVariables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    envelopeId: zod_1.z.string().optional(),
    visibleToQualifications: zod_1.z.array(zod_1.z.enum(['parte', 'testemunha', 'other'])).optional(),
});
// Schema Zod para DocumentFromTemplateInput
exports.DocumentFromTemplateInputSchema = zod_1.z.object({
    templateId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(255).optional(),
    variables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    description: zod_1.z.string().max(1000).optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    visibleToQualifications: zod_1.z.array(zod_1.z.enum(['parte', 'testemunha', 'other'])).optional(),
});
// Schema Zod para Document
exports.DocumentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    envelopeId: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
    contentType: zod_1.z.string(),
    fileSize: zod_1.z.number().min(0),
    pageCount: zod_1.z.number().min(1),
    // ✅ Removido downloadUrl/previewUrl do schema (usar métodos dedicados)
    templateId: zod_1.z.string().optional(),
    templateVariables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    visibleToQualifications: zod_1.z.array(zod_1.z.enum(['parte', 'testemunha', 'other'])).optional(),
    signatureFields: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        signerId: zod_1.z.string(),
        page: zod_1.z.number().min(1),
        x: zod_1.z.number().min(0),
        y: zod_1.z.number().min(0),
        width: zod_1.z.number().min(1),
        height: zod_1.z.number().min(1),
        type: zod_1.z.enum(['signature', 'initial', 'text', 'date', 'checkbox']),
        required: zod_1.z.boolean(),
        value: zod_1.z.string().optional(),
        signedAt: zod_1.z.string().datetime().optional(),
        signatureImageUrl: zod_1.z.string().url().optional(),
    })),
    qualificationRequirements: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        documentId: zod_1.z.string(),
        signerId: zod_1.z.string(),
        qualificationType: zod_1.z.enum(['parte', 'testemunha', 'other']),
        description: zod_1.z.string().optional(),
        isSatisfied: zod_1.z.boolean(),
        satisfiedAt: zod_1.z.string().datetime().optional(),
    })),
    isSigned: zod_1.z.boolean(),
    signedAt: zod_1.z.string().datetime().optional(),
    signedByCount: zod_1.z.number().min(0),
    pendingSignaturesCount: zod_1.z.number().min(0),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Schema Zod para DocumentPreviewOptions
exports.DocumentPreviewOptionsSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional().default(1),
});
//# sourceMappingURL=document.types.js.map