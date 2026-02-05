import { z } from 'zod';
export type EventType = 'envelopeCreated' | 'envelopeUpdated' | 'envelopeActivated' | 'envelopeCompleted' | 'envelopeCanceled' | 'envelopeExpired' | 'documentAdded' | 'documentUpdated' | 'documentSigned' | 'documentRefused' | 'documentCompleted' | 'signerAdded' | 'signerUpdated' | 'signerNotified' | 'signerAccessed' | 'signerAuthenticated' | 'signerSigned' | 'signerRejected' | 'authenticationRequired' | 'authenticationCompleted' | 'authenticationFailed' | 'qualificationAdded' | 'qualificationSatisfied' | 'notificationSent' | 'notificationDelivered' | 'notificationFailed' | 'templateUsed' | 'zipGenerated' | 'zipFailed' | 'errorOccurred';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
export interface ApiEvent {
    id: string;
    type: EventType;
    severity: EventSeverity;
    title: string;
    description: string;
    envelopeId?: string;
    documentId?: string;
    signerId?: string;
    templateId?: string;
    userId?: string;
    data: Record<string, any>;
    metadata: EventMetadata;
    occurredAt: string;
    processedAt?: string;
}
export interface EventMetadata {
    source: 'api' | 'web' | 'mobile' | 'system' | 'webhook';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    version: string;
    environment: 'production' | 'staging' | 'development';
}
export declare const EventMetadataSchema: z.ZodObject<{
    source: z.ZodEnum<{
        system: "system";
        api: "api";
        web: "web";
        mobile: "mobile";
        webhook: "webhook";
    }>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
    version: z.ZodString;
    environment: z.ZodEnum<{
        production: "production";
        staging: "staging";
        development: "development";
    }>;
}, z.core.$strip>;
export declare const ApiEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        envelopeCreated: "envelopeCreated";
        envelopeUpdated: "envelopeUpdated";
        envelopeActivated: "envelopeActivated";
        envelopeCompleted: "envelopeCompleted";
        envelopeCanceled: "envelopeCanceled";
        envelopeExpired: "envelopeExpired";
        documentAdded: "documentAdded";
        documentUpdated: "documentUpdated";
        documentSigned: "documentSigned";
        documentRefused: "documentRefused";
        documentCompleted: "documentCompleted";
        signerAdded: "signerAdded";
        signerUpdated: "signerUpdated";
        signerNotified: "signerNotified";
        signerAccessed: "signerAccessed";
        signerAuthenticated: "signerAuthenticated";
        signerSigned: "signerSigned";
        signerRejected: "signerRejected";
        authenticationRequired: "authenticationRequired";
        authenticationCompleted: "authenticationCompleted";
        authenticationFailed: "authenticationFailed";
        qualificationAdded: "qualificationAdded";
        qualificationSatisfied: "qualificationSatisfied";
        notificationSent: "notificationSent";
        notificationDelivered: "notificationDelivered";
        notificationFailed: "notificationFailed";
        templateUsed: "templateUsed";
        zipGenerated: "zipGenerated";
        zipFailed: "zipFailed";
        errorOccurred: "errorOccurred";
    }>;
    severity: z.ZodEnum<{
        error: "error";
        info: "info";
        warning: "warning";
        critical: "critical";
    }>;
    title: z.ZodString;
    description: z.ZodString;
    envelopeId: z.ZodOptional<z.ZodString>;
    documentId: z.ZodOptional<z.ZodString>;
    signerId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    metadata: z.ZodObject<{
        source: z.ZodEnum<{
            system: "system";
            api: "api";
            web: "web";
            mobile: "mobile";
            webhook: "webhook";
        }>;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        sessionId: z.ZodOptional<z.ZodString>;
        requestId: z.ZodOptional<z.ZodString>;
        correlationId: z.ZodOptional<z.ZodString>;
        version: z.ZodString;
        environment: z.ZodEnum<{
            production: "production";
            staging: "staging";
            development: "development";
        }>;
    }, z.core.$strip>;
    occurredAt: z.ZodString;
    processedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export interface EventFilters {
    envelopeId?: string;
    documentId?: string;
    signerId?: string;
    templateId?: string;
    userId?: string;
    type?: EventType | EventType[];
    severity?: EventSeverity | EventSeverity[];
    source?: string;
    occurredFrom?: string;
    occurredTo?: string;
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'occurredAt' | 'processedAt' | 'severity' | 'type';
    sortOrder?: 'asc' | 'desc';
}
export interface EventStats {
    totalEvents: number;
    eventsByType: Record<EventType, number>;
    eventsBySeverity: Record<EventSeverity, number>;
    eventsLast24h: number;
    eventsLast7d: number;
    eventsLast30d: number;
    mostActiveEnvelopes: Array<{
        envelopeId: string;
        eventCount: number;
    }>;
    errorRatePercentage: number;
}
export interface EventObserver {
    id: string;
    name: string;
    description?: string;
    webhookUrl: string;
    secretKey?: string;
    eventTypes: EventType[];
    filters?: EventObserverFilters;
    isActive: boolean;
    retryPolicy: RetryPolicy;
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    successCount: number;
    failureCount: number;
}
export interface EventObserverFilters {
    envelopeIds?: string[];
    signerEmails?: string[];
    severities?: EventSeverity[];
    customFilters?: Record<string, any>;
}
export interface RetryPolicy {
    maxAttempts: number;
    initialDelaySeconds: number;
    maxDelaySeconds: number;
    backoffMultiplier: number;
    retryOnStatusCodes: number[];
}
export interface EventObserverInput {
    name: string;
    description?: string;
    webhookUrl: string;
    secretKey?: string;
    eventTypes: EventType[];
    filters?: EventObserverFilters;
    retryPolicy?: Partial<RetryPolicy>;
}
export declare const EventObserverInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodString;
    secretKey: z.ZodOptional<z.ZodString>;
    eventTypes: z.ZodArray<z.ZodEnum<{
        envelopeCreated: "envelopeCreated";
        envelopeUpdated: "envelopeUpdated";
        envelopeActivated: "envelopeActivated";
        envelopeCompleted: "envelopeCompleted";
        envelopeCanceled: "envelopeCanceled";
        envelopeExpired: "envelopeExpired";
        documentAdded: "documentAdded";
        documentUpdated: "documentUpdated";
        documentSigned: "documentSigned";
        documentRefused: "documentRefused";
        documentCompleted: "documentCompleted";
        signerAdded: "signerAdded";
        signerUpdated: "signerUpdated";
        signerNotified: "signerNotified";
        signerAccessed: "signerAccessed";
        signerAuthenticated: "signerAuthenticated";
        signerSigned: "signerSigned";
        signerRejected: "signerRejected";
        authenticationRequired: "authenticationRequired";
        authenticationCompleted: "authenticationCompleted";
        authenticationFailed: "authenticationFailed";
        qualificationAdded: "qualificationAdded";
        qualificationSatisfied: "qualificationSatisfied";
        notificationSent: "notificationSent";
        notificationDelivered: "notificationDelivered";
        notificationFailed: "notificationFailed";
        templateUsed: "templateUsed";
        zipGenerated: "zipGenerated";
        zipFailed: "zipFailed";
        errorOccurred: "errorOccurred";
    }>>;
    filters: z.ZodOptional<z.ZodObject<{
        envelopeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        signerEmails: z.ZodOptional<z.ZodArray<z.ZodString>>;
        severities: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            error: "error";
            info: "info";
            warning: "warning";
            critical: "critical";
        }>>>;
        customFilters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    retryPolicy: z.ZodOptional<z.ZodObject<{
        maxAttempts: z.ZodOptional<z.ZodNumber>;
        initialDelaySeconds: z.ZodOptional<z.ZodNumber>;
        maxDelaySeconds: z.ZodOptional<z.ZodNumber>;
        backoffMultiplier: z.ZodOptional<z.ZodNumber>;
        retryOnStatusCodes: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export interface WebhookDelivery {
    id: string;
    observerId: string;
    eventId: string;
    webhookUrl: string;
    httpMethod: string;
    requestHeaders: Record<string, string>;
    requestBody: string;
    responseStatusCode?: number;
    responseHeaders?: Record<string, string>;
    responseBody?: string;
    deliveryDurationMs?: number;
    attemptNumber: number;
    isSuccessful: boolean;
    errorMessage?: string;
    deliveredAt: string;
    nextRetryAt?: string;
}
export interface EventActivitySummary {
    date: string;
    totalEvents: number;
    eventsByHour: number[];
    topEventTypes: Array<{
        type: EventType;
        count: number;
        percentage: number;
    }>;
    errorEvents: number;
    warningEvents: number;
    criticalEvents: number;
}
//# sourceMappingURL=event.types.d.ts.map