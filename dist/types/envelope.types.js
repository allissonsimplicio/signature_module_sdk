"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopeSchema = exports.CancelEnvelopeDtoSchema = exports.UpdateEnvelopeDtoSchema = exports.EnvelopeInputSchema = exports.SelfSignerConfigSchema = exports.NotificationSettingsSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("../validators");
// Schema Zod para NotificationSettings
exports.NotificationSettingsSchema = zod_1.z.object({
    emailEnabled: zod_1.z.boolean().optional(),
    smsEnabled: zod_1.z.boolean().optional(),
    whatsappEnabled: zod_1.z.boolean().optional(),
    reminderEnabled: zod_1.z.boolean().optional(),
    reminderIntervalHours: zod_1.z.number().min(1).max(168).optional(), // 1 hora a 1 semana
    customMessage: zod_1.z.string().max(500).optional(),
});
// 🆕 Schema Zod para SelfSignerConfig
exports.SelfSignerConfigSchema = zod_1.z.object({
    signingOrder: zod_1.z.number().int().min(1).optional().default(1),
    customMessage: zod_1.z.string().max(1000).optional(),
    preferredChannel: zod_1.z.enum(['email', 'sms', 'whatsapp']).optional().default('email'),
    role: zod_1.z.string().max(100).optional(),
    phoneNumber: zod_1.z.string().max(20).optional(),
});
// Schema Zod para EnvelopeInput
exports.EnvelopeInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(1000).optional(),
    deadline: validators_1.deadlineValidator.optional(),
    autoClose: zod_1.z.boolean().optional(),
    notificationSettings: exports.NotificationSettingsSchema.optional(),
    blockOnRefusal: zod_1.z.boolean().optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    callbackUrl: zod_1.z.string().url().optional(),
    ownerId: zod_1.z.string().optional(),
    // 🆕 Self-Signing Feature
    addMeAsSigner: zod_1.z.boolean().optional().default(false),
    selfSignerConfig: exports.SelfSignerConfigSchema.optional(),
});
// Schema Zod para UpdateEnvelopeDto
exports.UpdateEnvelopeDtoSchema = exports.EnvelopeInputSchema.partial().extend({
    status: zod_1.z.enum(['draft', 'running', 'completed', 'canceled', 'closed']).optional(),
});
// Schema Zod para CancelEnvelopeDto
exports.CancelEnvelopeDtoSchema = zod_1.z.object({
    status: zod_1.z.literal('canceled'),
    cancellationReason: zod_1.z.string().min(1).max(500),
    notifySigners: zod_1.z.boolean().optional().default(true),
});
// Schema Zod para Envelope
exports.EnvelopeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
    deadline: zod_1.z.string().datetime().optional(),
    autoClose: zod_1.z.boolean().optional(),
    notificationSettings: exports.NotificationSettingsSchema.optional(),
    blockOnRefusal: zod_1.z.boolean().optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    callbackUrl: zod_1.z.string().url().optional(),
    ownerId: zod_1.z.string().optional(),
    documentsCount: zod_1.z.number().min(0),
    signersCount: zod_1.z.number().min(0),
    signedCount: zod_1.z.number().min(0),
    pendingCount: zod_1.z.number().min(0),
    rejectedCount: zod_1.z.number().min(0),
    completionPercentage: zod_1.z.number().min(0).max(100),
    isActive: zod_1.z.boolean(),
    canBeActivated: zod_1.z.boolean(),
    activationRequirements: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['authentication', 'qualification']),
        description: zod_1.z.string(),
        isSatisfied: zod_1.z.boolean(),
        relatedEntityId: zod_1.z.string().optional(),
        relatedEntityType: zod_1.z.enum(['signer', 'document']).optional(),
    })),
    owner: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(255),
        email: zod_1.z.string().email(),
    }),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=envelope.types.js.map