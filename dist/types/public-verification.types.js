"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDownloadResponseSchema = exports.VerificationResponseSchema = exports.SignatureFieldInfoSchema = void 0;
const zod_1 = require("zod");
// Schemas Zod para validação
exports.SignatureFieldInfoSchema = zod_1.z.object({
    signerName: zod_1.z.string(),
    signerRole: zod_1.z.string(),
    signedAt: zod_1.z.coerce.date(),
    signatureHash: zod_1.z.string(),
});
exports.VerificationResponseSchema = zod_1.z.object({
    documentId: zod_1.z.string(),
    documentName: zod_1.z.string(),
    documentHash: zod_1.z.string().length(64, 'Hash deve ter 64 caracteres hexadecimais'),
    organizationName: zod_1.z.string().optional(),
    status: zod_1.z.string(),
    isSigned: zod_1.z.boolean(),
    signedAt: zod_1.z.coerce.date().optional(),
    signatureCount: zod_1.z.number().int().nonnegative(),
    signatures: zod_1.z.array(exports.SignatureFieldInfoSchema),
    currentVersion: zod_1.z.number().int().positive(),
    createdAt: zod_1.z.coerce.date(),
    allowPublicDownload: zod_1.z.boolean(),
    envelopeId: zod_1.z.string(),
    envelopeName: zod_1.z.string(),
});
exports.PublicDownloadResponseSchema = zod_1.z.object({
    downloadUrl: zod_1.z.string().url(),
    expiresIn: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=public-verification.types.js.map