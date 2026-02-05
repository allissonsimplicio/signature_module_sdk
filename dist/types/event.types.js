"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventObserverInputSchema = exports.ApiEventSchema = exports.EventMetadataSchema = void 0;
const zod_1 = require("zod");
// Schema Zod para EventMetadata
exports.EventMetadataSchema = zod_1.z.object({
    source: zod_1.z.enum(['api', 'web', 'mobile', 'system', 'webhook']),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    requestId: zod_1.z.string().optional(),
    correlationId: zod_1.z.string().optional(),
    version: zod_1.z.string(),
    environment: zod_1.z.enum(['production', 'staging', 'development']),
});
// Schema Zod para ApiEvent
exports.ApiEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum([
        'envelopeCreated', 'envelopeUpdated', 'envelopeActivated', 'envelopeCompleted', 'envelopeCanceled', 'envelopeExpired',
        'documentAdded', 'documentUpdated', 'documentSigned', 'documentRefused', 'documentCompleted',
        'signerAdded', 'signerUpdated', 'signerNotified', 'signerAccessed', 'signerAuthenticated', 'signerSigned', 'signerRejected',
        'authenticationRequired', 'authenticationCompleted', 'authenticationFailed',
        'qualificationAdded', 'qualificationSatisfied',
        'notificationSent', 'notificationDelivered', 'notificationFailed',
        'templateUsed', 'zipGenerated', 'zipFailed', 'errorOccurred'
    ]),
    severity: zod_1.z.enum(['info', 'warning', 'error', 'critical']),
    title: zod_1.z.string(),
    description: zod_1.z.string().max(500),
    envelopeId: zod_1.z.string().optional(),
    documentId: zod_1.z.string().optional(),
    signerId: zod_1.z.string().optional(),
    templateId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    metadata: exports.EventMetadataSchema,
    occurredAt: zod_1.z.string().datetime(),
    processedAt: zod_1.z.string().datetime().optional(),
});
// Schema Zod para EventObserverInput
exports.EventObserverInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(1000).optional(),
    webhookUrl: zod_1.z.string().url(),
    secretKey: zod_1.z.string().min(8).max(255).optional(),
    eventTypes: zod_1.z.array(zod_1.z.enum([
        'envelopeCreated', 'envelopeUpdated', 'envelopeActivated', 'envelopeCompleted', 'envelopeCanceled', 'envelopeExpired',
        'documentAdded', 'documentUpdated', 'documentSigned', 'documentRefused', 'documentCompleted',
        'signerAdded', 'signerUpdated', 'signerNotified', 'signerAccessed', 'signerAuthenticated', 'signerSigned', 'signerRejected',
        'authenticationRequired', 'authenticationCompleted', 'authenticationFailed',
        'qualificationAdded', 'qualificationSatisfied',
        'notificationSent', 'notificationDelivered', 'notificationFailed',
        'templateUsed', 'zipGenerated', 'zipFailed', 'errorOccurred'
    ])).min(1),
    filters: zod_1.z.object({
        envelopeIds: zod_1.z.array(zod_1.z.string()).optional(),
        signerEmails: zod_1.z.array(zod_1.z.string().email()).optional(),
        severities: zod_1.z.array(zod_1.z.enum(['info', 'warning', 'error', 'critical'])).optional(),
        customFilters: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }).optional(),
    retryPolicy: zod_1.z.object({
        maxAttempts: zod_1.z.number().min(1).max(10).optional(),
        initialDelaySeconds: zod_1.z.number().min(1).max(300).optional(),
        maxDelaySeconds: zod_1.z.number().min(60).max(3600).optional(),
        backoffMultiplier: zod_1.z.number().min(1).max(5).optional(),
        retryOnStatusCodes: zod_1.z.array(zod_1.z.number().min(400).max(599)).optional(),
    }).optional(),
});
//# sourceMappingURL=event.types.js.map