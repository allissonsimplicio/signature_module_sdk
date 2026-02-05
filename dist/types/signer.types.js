"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignerSchema = exports.SignerInputSchema = exports.NotificationPreferencesSchema = exports.SignerAddressSchema = void 0;
const zod_1 = require("zod");
// Schema Zod para SignerAddress
exports.SignerAddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1).max(255),
    number: zod_1.z.string().min(1).max(20),
    complement: zod_1.z.string().max(100).optional(),
    neighborhood: zod_1.z.string().min(1).max(100),
    city: zod_1.z.string().min(1).max(100),
    state: zod_1.z.string().min(2).max(50),
    zipCode: zod_1.z.string().min(5).max(20),
    country: zod_1.z.string().max(50).optional(),
});
// Schema Zod para NotificationPreferences
exports.NotificationPreferencesSchema = zod_1.z.object({
    emailEnabled: zod_1.z.boolean(),
    smsEnabled: zod_1.z.boolean(),
    whatsappEnabled: zod_1.z.boolean(),
    language: zod_1.z.enum(['pt-BR', 'en-US', 'es-ES']).optional(),
});
// Schema Zod para SignerInput
exports.SignerInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(), // Opcional quando userId fornecido (auto-preenchido)
    email: zod_1.z.string().email().optional(), // Opcional quando userId fornecido (auto-preenchido)
    phoneNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
    nationalIdNumber: zod_1.z.string().max(20).optional(), // 🆕
    documentNumber: zod_1.z.string().max(50).optional(),
    documentType: zod_1.z.enum(['cpf', 'cnpj', 'rg', 'passport', 'cnh', 'other']).optional(),
    birthDate: zod_1.z.string().optional(),
    address: exports.SignerAddressSchema.optional(),
    signatureOrder: zod_1.z.number().min(1).optional(),
    role: zod_1.z.string().max(255).optional(),
    company: zod_1.z.string().max(255).optional(),
    qualificationRole: zod_1.z.string().max(255).optional(),
    preferredChannel: zod_1.z.enum(['email', 'sms', 'whatsapp']).optional(),
    allowEmail: zod_1.z.boolean().optional(),
    allowSms: zod_1.z.boolean().optional(),
    allowWhatsapp: zod_1.z.boolean().optional(),
    notificationPreferences: exports.NotificationPreferencesSchema.optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    // 🆕 SETORES: Destinatário interno
    userId: zod_1.z.string().optional(),
    // 🆕 FASE 3: PAdES configuration
    requirePades: zod_1.z.boolean().optional(),
    useCertificateId: zod_1.z.string().optional(),
    // Controles de assinatura
    isRequired: zod_1.z.boolean().optional(),
    allowDelegation: zod_1.z.boolean().optional(),
    allowRefusal: zod_1.z.boolean().optional(),
    customMessage: zod_1.z.string().max(1000).optional(),
});
// Schema Zod para Signer
exports.SignerSchema = zod_1.z.object({
    id: zod_1.z.string(),
    envelopeId: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phoneNumber: zod_1.z.string().optional(),
    nationalIdNumber: zod_1.z.string().optional(), // 🆕
    documentNumber: zod_1.z.string().optional(),
    documentType: zod_1.z.enum(['cpf', 'cnpj', 'rg', 'passport', 'cnh', 'other']).optional(),
    birthDate: zod_1.z.string().optional(),
    address: exports.SignerAddressSchema.optional(),
    signatureOrder: zod_1.z.number().min(1).optional(),
    notificationPreferences: exports.NotificationPreferencesSchema.optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    status: zod_1.z.enum(['pending', 'signed', 'rejected', 'canceled']),
    signatureUrl: zod_1.z.string().url().optional(),
    accessToken: zod_1.z.string().optional(),
    accessExpiresAt: zod_1.z.string().datetime().optional(),
    signedAt: zod_1.z.string().datetime().optional(),
    rejectedAt: zod_1.z.string().datetime().optional(),
    rejectionReason: zod_1.z.string().max(500).optional(),
    lastAccessAt: zod_1.z.string().datetime().optional(),
    accessCount: zod_1.z.number().min(0),
    ipAddresses: zod_1.z.array(zod_1.z.string()),
    userAgents: zod_1.z.array(zod_1.z.string()),
    authenticationRequirements: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        signerId: zod_1.z.string(),
        method: zod_1.z.enum(['emailToken', 'whatsappToken', 'smsToken', 'ipAddress', 'geolocation', 'officialDocument', 'selfieWithDocument', 'addressProof', 'selfie']),
        description: zod_1.z.string().max(500),
        isRequired: zod_1.z.boolean(),
        isSatisfied: zod_1.z.boolean(),
        satisfiedAt: zod_1.z.string().datetime().optional(),
        configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        evidence: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    })),
    qualificationRequirements: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        documentId: zod_1.z.string(),
        signerId: zod_1.z.string(),
        qualificationType: zod_1.z.enum(['parte', 'testemunha', 'other']),
        level: zod_1.z.string().optional(),
        description: zod_1.z.string().max(500).optional(),
        isSatisfied: zod_1.z.boolean(),
        satisfiedAt: zod_1.z.string().datetime().optional(),
    })),
    signatureEvidence: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(['signatureImage', 'biometricData', 'certificate', 'timestamp', 'auditTrail']),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        collectedAt: zod_1.z.string().datetime(),
        hash: zod_1.z.string().optional(),
    })),
    isAuthenticated: zod_1.z.boolean(),
    isQualified: zod_1.z.boolean(),
    canSign: zod_1.z.boolean(),
    // 🆕 SETORES: Destinatário interno
    userId: zod_1.z.string().nullable().optional(),
    isInternal: zod_1.z.boolean().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=signer.types.js.map