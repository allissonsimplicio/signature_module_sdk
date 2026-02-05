import { z } from 'zod';

/**
 * Webhook / Event Observer Types
 * Sistema de notificação de eventos via HTTP callbacks
 */

// Enum com todos os 26 tipos de eventos suportados (formato camelCase compatível com API)
export type EventType =
  // Eventos de Envelope
  | 'envelopeCreated'
  | 'envelopeUpdated'
  | 'envelopeActivated'
  | 'envelopeCompleted'
  | 'envelopeCanceled'
  | 'envelopeExpired'

  // Eventos de Documento
  | 'documentAdded'
  | 'documentUpdated'
  | 'documentSigned'
  | 'documentRefused'
  | 'documentCompleted'

  // Eventos de Signatário
  | 'signerAdded'
  | 'signerUpdated'
  | 'signerNotified'
  | 'signerAccessed'
  | 'signerAuthenticated'
  | 'signerSigned'
  | 'signerRejected'

  // Eventos de Autenticação
  | 'authenticationRequired'
  | 'authenticationCompleted'
  | 'authenticationFailed'

  // Eventos de Qualificação
  | 'qualificationAdded'
  | 'qualificationSatisfied'

  // Eventos de Notificação
  | 'notificationSent'
  | 'notificationDelivered'
  | 'notificationFailed'

  // Eventos de Template
  | 'templateUsed'

  // Eventos de Job/ZIP
  | 'zipGenerated'
  | 'zipFailed'

  // Eventos de Erro
  | 'errorOccurred';

// Schema Zod para EventType
export const EventTypeSchema = z.enum([
  'envelopeCreated',
  'envelopeUpdated',
  'envelopeActivated',
  'envelopeCompleted',
  'envelopeCanceled',
  'envelopeExpired',
  'documentAdded',
  'documentUpdated',
  'documentSigned',
  'documentRefused',
  'documentCompleted',
  'signerAdded',
  'signerUpdated',
  'signerNotified',
  'signerAccessed',
  'signerAuthenticated',
  'signerSigned',
  'signerRejected',
  'authenticationRequired',
  'authenticationCompleted',
  'authenticationFailed',
  'qualificationAdded',
  'qualificationSatisfied',
  'notificationSent',
  'notificationDelivered',
  'notificationFailed',
  'templateUsed',
  'zipGenerated',
  'zipFailed',
  'errorOccurred',
]);

// Event Observer (Webhook)
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

  // Stats
  totalDeliveries?: number;
  successfulDeliveries?: number;
  failedDeliveries?: number;
  lastTriggeredAt?: string;

  // Metadata
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Input para criar Event Observer
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

// Input para atualizar Event Observer
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

// Schemas Zod
export const EventObserverSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  callbackUrl: z.string().url(),
  eventTypes: z.array(EventTypeSchema),
  isActive: z.boolean(),
  description: z.string().max(1000).optional(),
  secret: z.string().max(255).optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  timeoutSeconds: z.number().int().min(1).max(300).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  totalDeliveries: z.number().int().min(0).optional(),
  successfulDeliveries: z.number().int().min(0).optional(),
  failedDeliveries: z.number().int().min(0).optional(),
  lastTriggeredAt: z.string().datetime().optional(),
  organizationId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateEventObserverDtoSchema = z.object({
  name: z.string().min(1).max(255),
  callbackUrl: z.string().url(),
  eventTypes: z.array(EventTypeSchema).min(1),
  isActive: z.boolean().optional().default(true),
  description: z.string().max(1000).optional(),
  secret: z.string().max(255).optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  timeoutSeconds: z.number().int().min(1).max(300).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
});

export const UpdateEventObserverDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  callbackUrl: z.string().url().optional(),
  eventTypes: z.array(EventTypeSchema).min(1).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  secret: z.string().max(255).optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  timeoutSeconds: z.number().int().min(1).max(300).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
});

// Payload de evento enviado ao webhook
export interface WebhookPayload<T = any> {
  id: string; // ID do evento
  eventType: EventType;
  timestamp: string;
  data: T; // Dados específicos do evento
  metadata?: {
    envelopeId?: string;
    documentId?: string;
    signerId?: string;
    organizationId: string;
  };
}

// Resposta do webhook (esperada pela API)
export interface WebhookResponse {
  received: boolean;
  message?: string;
}
