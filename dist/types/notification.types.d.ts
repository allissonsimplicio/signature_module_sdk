import { z } from 'zod';
import { NotificationChannel, NotificationStatus } from './common.types';
/**
 * FASE 6: Notificações Multi-Canal (Email, SMS, WhatsApp)
 */
export interface NotificationTemplate {
    id: string;
    name: string;
    channel: NotificationChannel;
    subject?: string;
    bodyTemplate: string;
    variables: string[];
    isActive: boolean;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}
export interface NotificationLog {
    id: string;
    recipientName: string;
    recipientEmail?: string;
    recipientPhone?: string;
    channel: NotificationChannel;
    status: NotificationStatus;
    subject?: string;
    body: string;
    provider?: string;
    attempts: number;
    maxAttempts: number;
    errorMessage?: string;
    renderedSubject?: string;
    renderedBody?: string;
    envelopeId?: string;
    signerId?: string;
    sentAt?: string;
    lastAttemptAt?: string;
    nextRetryAt?: string;
    deliveredAt?: string;
    providerMessageId?: string;
    createdAt: string;
    updatedAt: string;
    signer?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: string;
    };
    envelope?: {
        id: string;
        name: string;
        status: string;
    };
}
export interface CreateNotificationTemplateDto {
    name: string;
    channel: NotificationChannel;
    subject?: string;
    bodyTemplate: string;
    variables?: string[];
    isDefault?: boolean;
    active?: boolean;
}
export interface PreviewNotificationTemplateDto {
    variables: Record<string, string>;
}
export interface NotificationTemplateFilters {
    channel?: 'email' | 'sms' | 'whatsapp';
    name?: string;
}
export interface NotificationHistoryFilters {
    channel?: NotificationChannel | NotificationChannel[];
    status?: NotificationStatus | NotificationStatus[];
    provider?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    createdFrom?: string;
    createdTo?: string;
    sentFrom?: string;
    sentTo?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'createdAt' | 'sentAt' | 'updatedAt' | 'status' | 'channel';
    sortOrder?: 'asc' | 'desc';
}
export declare const NotificationTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    channel: z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>;
    subject: z.ZodOptional<z.ZodString>;
    bodyTemplate: z.ZodString;
    variables: z.ZodArray<z.ZodString>;
    isActive: z.ZodBoolean;
    organizationId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const NotificationLogSchema: z.ZodObject<{
    id: z.ZodString;
    recipientName: z.ZodString;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientPhone: z.ZodOptional<z.ZodString>;
    channel: z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>;
    status: z.ZodEnum<{
        pending: "pending";
        sending: "sending";
        sent: "sent";
        delivered: "delivered";
        failed: "failed";
        retryScheduled: "retryScheduled";
    }>;
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
    provider: z.ZodOptional<z.ZodString>;
    attempts: z.ZodNumber;
    maxAttempts: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
    renderedSubject: z.ZodOptional<z.ZodString>;
    renderedBody: z.ZodOptional<z.ZodString>;
    envelopeId: z.ZodOptional<z.ZodString>;
    signerId: z.ZodOptional<z.ZodString>;
    sentAt: z.ZodOptional<z.ZodString>;
    lastAttemptAt: z.ZodOptional<z.ZodString>;
    nextRetryAt: z.ZodOptional<z.ZodString>;
    deliveredAt: z.ZodOptional<z.ZodString>;
    providerMessageId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    signer: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
    }, z.core.$strip>>;
    envelope: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        status: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CreateNotificationTemplateDtoSchema: z.ZodObject<{
    name: z.ZodString;
    channel: z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>;
    subject: z.ZodOptional<z.ZodString>;
    bodyTemplate: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const NotificationTemplateFiltersSchema: z.ZodObject<{
    channel: z.ZodOptional<z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const NotificationHistoryFiltersSchema: z.ZodObject<{
    channel: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>, z.ZodArray<z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>>]>>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
        pending: "pending";
        sending: "sending";
        sent: "sent";
        delivered: "delivered";
        failed: "failed";
        retryScheduled: "retryScheduled";
    }>, z.ZodArray<z.ZodEnum<{
        pending: "pending";
        sending: "sending";
        sent: "sent";
        delivered: "delivered";
        failed: "failed";
        retryScheduled: "retryScheduled";
    }>>]>>;
    provider: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientPhone: z.ZodOptional<z.ZodString>;
    createdFrom: z.ZodOptional<z.ZodString>;
    createdTo: z.ZodOptional<z.ZodString>;
    sentFrom: z.ZodOptional<z.ZodString>;
    sentTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    perPage: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        status: "status";
        sentAt: "sentAt";
        channel: "channel";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=notification.types.d.ts.map