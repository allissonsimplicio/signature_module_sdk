"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHistoryFiltersSchema = exports.NotificationTemplateFiltersSchema = exports.CreateNotificationTemplateDtoSchema = exports.NotificationLogSchema = exports.NotificationTemplateSchema = void 0;
const zod_1 = require("zod");
// Schemas Zod
exports.NotificationTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    channel: zod_1.z.enum(['email', 'sms', 'whatsapp']),
    subject: zod_1.z.string().optional(),
    bodyTemplate: zod_1.z.string(),
    variables: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
    organizationId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.NotificationLogSchema = zod_1.z.object({
    id: zod_1.z.string(),
    recipientName: zod_1.z.string(),
    recipientEmail: zod_1.z.string().optional(),
    recipientPhone: zod_1.z.string().optional(),
    channel: zod_1.z.enum(['email', 'sms', 'whatsapp']),
    status: zod_1.z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string(),
    provider: zod_1.z.string().optional(),
    attempts: zod_1.z.number(),
    maxAttempts: zod_1.z.number(),
    errorMessage: zod_1.z.string().optional(),
    renderedSubject: zod_1.z.string().optional(),
    renderedBody: zod_1.z.string().optional(),
    envelopeId: zod_1.z.string().optional(),
    signerId: zod_1.z.string().optional(),
    sentAt: zod_1.z.string().datetime().optional(),
    lastAttemptAt: zod_1.z.string().datetime().optional(),
    nextRetryAt: zod_1.z.string().datetime().optional(),
    deliveredAt: zod_1.z.string().datetime().optional(),
    providerMessageId: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    signer: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        phone: zod_1.z.string().optional(),
        status: zod_1.z.string(),
    }).optional(),
    envelope: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        status: zod_1.z.string(),
    }).optional(),
});
exports.CreateNotificationTemplateDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    channel: zod_1.z.enum(['email', 'sms', 'whatsapp']),
    subject: zod_1.z.string().max(200).optional(),
    bodyTemplate: zod_1.z.string().min(10).max(10000),
    variables: zod_1.z.array(zod_1.z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)).optional(),
    isDefault: zod_1.z.boolean().optional(),
    active: zod_1.z.boolean().optional(),
});
// 🆕 PROBLEMA 3: Schema para filtros de templates
exports.NotificationTemplateFiltersSchema = zod_1.z.object({
    channel: zod_1.z.enum(['email', 'sms', 'whatsapp']).optional(),
    name: zod_1.z.string().min(1).optional(),
});
exports.NotificationHistoryFiltersSchema = zod_1.z.object({
    channel: zod_1.z.union([
        zod_1.z.enum(['email', 'sms', 'whatsapp']),
        zod_1.z.array(zod_1.z.enum(['email', 'sms', 'whatsapp']))
    ]).optional(),
    status: zod_1.z.union([
        zod_1.z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']),
        zod_1.z.array(zod_1.z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']))
    ]).optional(),
    provider: zod_1.z.string().optional(),
    recipientName: zod_1.z.string().optional(),
    recipientEmail: zod_1.z.string().optional(),
    recipientPhone: zod_1.z.string().optional(),
    createdFrom: zod_1.z.string().datetime().optional(),
    createdTo: zod_1.z.string().datetime().optional(),
    sentFrom: zod_1.z.string().datetime().optional(),
    sentTo: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().int().min(1).optional(),
    perPage: zod_1.z.number().int().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'sentAt', 'updatedAt', 'status', 'channel']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=notification.types.js.map