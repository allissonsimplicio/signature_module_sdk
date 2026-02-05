import { z } from 'zod';
/**
 * Webhook / Event Observer Types
 * Sistema de notificação de eventos via HTTP callbacks
 */
export type EventType = 'envelopeCreated' | 'envelopeUpdated' | 'envelopeActivated' | 'envelopeCompleted' | 'envelopeCanceled' | 'envelopeExpired' | 'documentAdded' | 'documentUpdated' | 'documentSigned' | 'documentRefused' | 'documentCompleted' | 'signerAdded' | 'signerUpdated' | 'signerNotified' | 'signerAccessed' | 'signerAuthenticated' | 'signerSigned' | 'signerRejected' | 'authenticationRequired' | 'authenticationCompleted' | 'authenticationFailed' | 'qualificationAdded' | 'qualificationSatisfied' | 'notificationSent' | 'notificationDelivered' | 'notificationFailed' | 'templateUsed' | 'zipGenerated' | 'zipFailed' | 'errorOccurred';
export declare const EventTypeSchema: z.ZodEnum<{
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
export interface EventObserver {
    id: string;
    name: string;
    callbackUrl: string;
    eventTypes: EventType[];
    isActive: boolean;
    description?: string;
    secret?: string;
    customHeaders?: Record<string, string>;
    timeoutSeconds?: number;
    maxRetries?: number;
    totalDeliveries?: number;
    successfulDeliveries?: number;
    failedDeliveries?: number;
    lastTriggeredAt?: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateEventObserverDto {
    name: string;
    callbackUrl: string;
    eventTypes: EventType[];
    isActive?: boolean;
    description?: string;
    secret?: string;
    customHeaders?: Record<string, string>;
    timeoutSeconds?: number;
    maxRetries?: number;
}
export interface UpdateEventObserverDto {
    name?: string;
    callbackUrl?: string;
    eventTypes?: EventType[];
    isActive?: boolean;
    description?: string;
    secret?: string;
    customHeaders?: Record<string, string>;
    timeoutSeconds?: number;
    maxRetries?: number;
}
export declare const EventObserverSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    callbackUrl: z.ZodString;
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
    isActive: z.ZodBoolean;
    description: z.ZodOptional<z.ZodString>;
    secret: z.ZodOptional<z.ZodString>;
    customHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
    totalDeliveries: z.ZodOptional<z.ZodNumber>;
    successfulDeliveries: z.ZodOptional<z.ZodNumber>;
    failedDeliveries: z.ZodOptional<z.ZodNumber>;
    lastTriggeredAt: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const CreateEventObserverDtoSchema: z.ZodObject<{
    name: z.ZodString;
    callbackUrl: z.ZodString;
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
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
    secret: z.ZodOptional<z.ZodString>;
    customHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const UpdateEventObserverDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    callbackUrl: z.ZodOptional<z.ZodString>;
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
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
    }>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    secret: z.ZodOptional<z.ZodString>;
    customHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeoutSeconds: z.ZodOptional<z.ZodNumber>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export interface WebhookPayload<T = any> {
    id: string;
    eventType: EventType;
    timestamp: string;
    data: T;
    metadata?: {
        envelopeId?: string;
        documentId?: string;
        signerId?: string;
        organizationId: string;
    };
}
export interface WebhookResponse {
    received: boolean;
    message?: string;
}
//# sourceMappingURL=webhook.types.d.ts.map