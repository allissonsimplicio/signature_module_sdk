import { z } from 'zod';
import { NotificationChannel, NotificationStatus, PaginatedResponse } from './common.types';

/**
 * FASE 6: Notificações Multi-Canal (Email, SMS, WhatsApp)
 */

// Template de notificação
export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string; // Apenas para EMAIL
  bodyTemplate: string;
  variables: string[]; // Ex: ["signerName", "documentName", "deadline"]
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Log de notificação enviada
export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject?: string;
  body: string;
  provider?: string; // "MAILTRAP", "TWILIO"
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

  // Relações opcionais
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

// Input para criar template de notificação
export interface CreateNotificationTemplateDto {
  name: string;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  variables?: string[];
  isDefault?: boolean;
  active?: boolean;
}

// Input para preview de template
export interface PreviewNotificationTemplateDto {
  variables: Record<string, string>;
}

// 🆕 PROBLEMA 3: Filtros para listagem de templates
export interface NotificationTemplateFilters {
  channel?: 'email' | 'sms' | 'whatsapp';
  name?: string;
}

// Filtros para histórico de notificações
export interface NotificationHistoryFilters {
  channel?: NotificationChannel | NotificationChannel[];
  status?: NotificationStatus | NotificationStatus[];
  provider?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  createdFrom?: string; // ISO date
  createdTo?: string; // ISO date
  sentFrom?: string; // ISO date
  sentTo?: string; // ISO date
  page?: number;
  perPage?: number;
  sortBy?: 'createdAt' | 'sentAt' | 'updatedAt' | 'status' | 'channel';
  sortOrder?: 'asc' | 'desc';
}

// Schemas Zod
export const NotificationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  subject: z.string().optional(),
  bodyTemplate: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean(),
  organizationId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const NotificationLogSchema = z.object({
  id: z.string(),
  recipientName: z.string(),
  recipientEmail: z.string().optional(),
  recipientPhone: z.string().optional(),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  status: z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']),
  subject: z.string().optional(),
  body: z.string(),
  provider: z.string().optional(),
  attempts: z.number(),
  maxAttempts: z.number(),
  errorMessage: z.string().optional(),
  renderedSubject: z.string().optional(),
  renderedBody: z.string().optional(),
  envelopeId: z.string().optional(),
  signerId: z.string().optional(),
  sentAt: z.string().datetime().optional(),
  lastAttemptAt: z.string().datetime().optional(),
  nextRetryAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  providerMessageId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  signer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    status: z.string(),
  }).optional(),
  envelope: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
  }).optional(),
});

export const CreateNotificationTemplateDtoSchema = z.object({
  name: z.string().min(3).max(100),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  subject: z.string().max(200).optional(),
  bodyTemplate: z.string().min(10).max(10000),
  variables: z.array(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)).optional(),
  isDefault: z.boolean().optional(),
  active: z.boolean().optional(),
});

// 🆕 PROBLEMA 3: Schema para filtros de templates
export const NotificationTemplateFiltersSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp']).optional(),
  name: z.string().min(1).optional(),
});

export const NotificationHistoryFiltersSchema = z.object({
  channel: z.union([
    z.enum(['email', 'sms', 'whatsapp']),
    z.array(z.enum(['email', 'sms', 'whatsapp']))
  ]).optional(),
  status: z.union([
    z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']),
    z.array(z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'retryScheduled']))
  ]).optional(),
  provider: z.string().optional(),
  recipientName: z.string().optional(),
  recipientEmail: z.string().optional(),
  recipientPhone: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  sentFrom: z.string().datetime().optional(),
  sentTo: z.string().datetime().optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'sentAt', 'updatedAt', 'status', 'channel']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
