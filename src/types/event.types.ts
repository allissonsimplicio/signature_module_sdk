import { z } from 'zod';

// Tipos de eventos disponíveis (formato camelCase compatível com API)
export type EventType =
  | 'envelopeCreated'
  | 'envelopeUpdated'
  | 'envelopeActivated'
  | 'envelopeCompleted'
  | 'envelopeCanceled'
  | 'envelopeExpired'
  | 'documentAdded'
  | 'documentUpdated'
  | 'documentSigned'
  | 'documentRefused'
  | 'documentCompleted'
  | 'signerAdded'
  | 'signerUpdated'
  | 'signerNotified'
  | 'signerAccessed'
  | 'signerAuthenticated'
  | 'signerSigned'
  | 'signerRejected'
  | 'authenticationRequired'
  | 'authenticationCompleted'
  | 'authenticationFailed'
  | 'qualificationAdded'
  | 'qualificationSatisfied'
  | 'notificationSent'
  | 'notificationDelivered'
  | 'notificationFailed'
  | 'templateUsed'
  | 'zipGenerated'
  | 'zipFailed'
  | 'errorOccurred';

// Severidade do evento
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

// Evento da API
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

// Metadados do evento
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

// Schema Zod para EventMetadata
export const EventMetadataSchema = z.object({
  source: z.enum(['api', 'web', 'mobile', 'system', 'webhook']),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  correlationId: z.string().optional(),
  version: z.string(),
  environment: z.enum(['production', 'staging', 'development']),
});

// Schema Zod para ApiEvent
export const ApiEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'envelopeCreated', 'envelopeUpdated', 'envelopeActivated', 'envelopeCompleted', 'envelopeCanceled', 'envelopeExpired',
    'documentAdded', 'documentUpdated', 'documentSigned', 'documentRefused', 'documentCompleted',
    'signerAdded', 'signerUpdated', 'signerNotified', 'signerAccessed', 'signerAuthenticated', 'signerSigned', 'signerRejected',
    'authenticationRequired', 'authenticationCompleted', 'authenticationFailed',
    'qualificationAdded', 'qualificationSatisfied',
    'notificationSent', 'notificationDelivered', 'notificationFailed',
    'templateUsed', 'zipGenerated', 'zipFailed', 'errorOccurred'
  ]),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string(),
  description: z.string().max(500),
  envelopeId: z.string().optional(),
  documentId: z.string().optional(),
  signerId: z.string().optional(),
  templateId: z.string().optional(),
  userId: z.string().optional(),
  data: z.record(z.string(), z.any()),
  metadata: EventMetadataSchema,
  occurredAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
});

// Filtros para busca de eventos
export interface EventFilters {
  envelopeId?: string;
  documentId?: string;
  signerId?: string;
  templateId?: string;
  userId?: string;
  type?: EventType | EventType[];
  severity?: EventSeverity | EventSeverity[];
  source?: string;
  occurredFrom?: string; // ISO date
  occurredTo?: string; // ISO date
  search?: string; // Busca em title e description
  page?: number;
  perPage?: number;
  sortBy?: 'occurredAt' | 'processedAt' | 'severity' | 'type';
  sortOrder?: 'asc' | 'desc';
}

// Estatísticas de eventos
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

// Observer para eventos em tempo real
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

// Filtros para observer de eventos
export interface EventObserverFilters {
  envelopeIds?: string[];
  signerEmails?: string[];
  severities?: EventSeverity[];
  customFilters?: Record<string, any>;
}

// Política de retry para webhooks
export interface RetryPolicy {
  maxAttempts: number;
  initialDelaySeconds: number;
  maxDelaySeconds: number;
  backoffMultiplier: number;
  retryOnStatusCodes: number[];
}

// Input para criação de observer
export interface EventObserverInput {
  name: string;
  description?: string;
  webhookUrl: string;
  secretKey?: string;
  eventTypes: EventType[];
  filters?: EventObserverFilters;
  retryPolicy?: Partial<RetryPolicy>;
}

// Schema Zod para EventObserverInput
export const EventObserverInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  webhookUrl: z.string().url(),
  secretKey: z.string().min(8).max(255).optional(),
  eventTypes: z.array(z.enum([
    'envelopeCreated', 'envelopeUpdated', 'envelopeActivated', 'envelopeCompleted', 'envelopeCanceled', 'envelopeExpired',
    'documentAdded', 'documentUpdated', 'documentSigned', 'documentRefused', 'documentCompleted',
    'signerAdded', 'signerUpdated', 'signerNotified', 'signerAccessed', 'signerAuthenticated', 'signerSigned', 'signerRejected',
    'authenticationRequired', 'authenticationCompleted', 'authenticationFailed',
    'qualificationAdded', 'qualificationSatisfied',
    'notificationSent', 'notificationDelivered', 'notificationFailed',
    'templateUsed', 'zipGenerated', 'zipFailed', 'errorOccurred'
  ])).min(1),
  filters: z.object({
    envelopeIds: z.array(z.string()).optional(),
    signerEmails: z.array(z.string().email()).optional(),
    severities: z.array(z.enum(['info', 'warning', 'error', 'critical'])).optional(),
    customFilters: z.record(z.string(), z.any()).optional(),
  }).optional(),
  retryPolicy: z.object({
    maxAttempts: z.number().min(1).max(10).optional(),
    initialDelaySeconds: z.number().min(1).max(300).optional(),
    maxDelaySeconds: z.number().min(60).max(3600).optional(),
    backoffMultiplier: z.number().min(1).max(5).optional(),
    retryOnStatusCodes: z.array(z.number().min(400).max(599)).optional(),
  }).optional(),
});

// Delivery de webhook
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

// Resumo de atividade de eventos
export interface EventActivitySummary {
  date: string; // YYYY-MM-DD
  totalEvents: number;
  eventsByHour: number[]; // Array de 24 elementos (0-23h)
  topEventTypes: Array<{
    type: EventType;
    count: number;
    percentage: number;
  }>;
  errorEvents: number;
  warningEvents: number;
  criticalEvents: number;
}