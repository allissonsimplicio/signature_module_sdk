"use strict";
/**
 * Digital Signature Types (FASE 3 - PAdES)
 *
 * Tipos para certificados digitais ICP-Brasil e assinaturas PAdES.
 * Suporta estratégia HYBRID_SEALED para assinaturas híbridas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateStatsSchema = exports.DigitalCertificateSchema = exports.CertificateFiltersSchema = exports.RevokeCertificateDtoSchema = exports.UploadCertificateDtoSchema = exports.SignatureStrategySchema = exports.CertificateTypeSchema = exports.SignatureStrategy = exports.CertificateType = void 0;
// ==================== ENUMS ====================
/**
 * Tipo de certificado digital ICP-Brasil (valores em lowercase compatíveis com API)
 */
var CertificateType;
(function (CertificateType) {
    CertificateType["A1"] = "a1";
    CertificateType["A3"] = "a3";
    CertificateType["A4"] = "a4";
})(CertificateType || (exports.CertificateType = CertificateType = {}));
/**
 * Estratégia de assinatura digital da organização (valores em camelCase compatíveis com API)
 */
var SignatureStrategy;
(function (SignatureStrategy) {
    /** Apenas carimbos visuais (sem PAdES) */
    SignatureStrategy["VISUAL_ONLY"] = "visualOnly";
    /** PAdES aplicado em cada assinatura individual */
    SignatureStrategy["PADES_EACH"] = "padesEach";
    /** PAdES apenas quando todos assinarem (selo final) */
    SignatureStrategy["PADES_FINAL"] = "padesFinal";
    /** Configurável por signatário (alguns com PAdES, outros não) */
    SignatureStrategy["HYBRID"] = "hybrid";
    /** Híbrido + selo final da organização (estratégia recomendada) */
    SignatureStrategy["HYBRID_SEALED"] = "hybridSealed";
})(SignatureStrategy || (exports.SignatureStrategy = SignatureStrategy = {}));
// ==================== ZOD SCHEMAS ====================
const zod_1 = require("zod");
exports.CertificateTypeSchema = zod_1.z.enum(['a1', 'a3', 'a4']);
exports.SignatureStrategySchema = zod_1.z.enum([
    'visualOnly',
    'padesEach',
    'padesFinal',
    'hybrid',
    'hybridSealed',
]);
exports.UploadCertificateDtoSchema = zod_1.z.object({
    certificate: zod_1.z.any(), // File/Buffer/Blob - validated at runtime
    password: zod_1.z.string().min(4),
    passwordHint: zod_1.z.string().max(255).optional(),
    certificateType: exports.CertificateTypeSchema.optional(),
    storePassword: zod_1.z.boolean().optional(),
});
exports.RevokeCertificateDtoSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10).max(500),
});
exports.CertificateFiltersSchema = zod_1.z.object({
    includeExpired: zod_1.z.boolean().optional(),
    certificateType: exports.CertificateTypeSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
    isRevoked: zod_1.z.boolean().optional(),
});
exports.DigitalCertificateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    commonName: zod_1.z.string(),
    cpfCnpj: zod_1.z.string().optional(),
    emailAddress: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    organizationalUnit: zod_1.z.string().optional(),
    issuer: zod_1.z.string(),
    serialNumber: zod_1.z.string(),
    notBefore: zod_1.z.date(),
    notAfter: zod_1.z.date(),
    isExpired: zod_1.z.boolean(),
    certificateType: exports.CertificateTypeSchema,
    certificateLevel: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    isRevoked: zod_1.z.boolean(),
    revokedAt: zod_1.z.date().optional(),
    revocationReason: zod_1.z.string().optional(),
    lastUsedAt: zod_1.z.date().optional(),
    usageCount: zod_1.z.number().int().min(0),
    fingerprint: zod_1.z.string(),
    publicKeyAlgorithm: zod_1.z.string(),
    signatureAlgorithm: zod_1.z.string(),
    keyUsage: zod_1.z.array(zod_1.z.string()),
    organizationId: zod_1.z.string().uuid(),
    uploadedBy: zod_1.z.string().optional(),
    uploadedByUser: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
    }).optional(),
    passwordHint: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CertificateStatsSchema = zod_1.z.object({
    total: zod_1.z.number().int().min(0),
    active: zod_1.z.number().int().min(0),
    expired: zod_1.z.number().int().min(0),
    revoked: zod_1.z.number().int().min(0),
    expiringWithin30Days: zod_1.z.number().int().min(0),
});
//# sourceMappingURL=digital-signature.types.js.map