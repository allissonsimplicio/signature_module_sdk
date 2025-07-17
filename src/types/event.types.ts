import { z } from 'zod';

// Tipos de eventos disponíveis
export type EventType = 
  | 'envelope.created'
  | 'envelope.updated'
  | 'envelope.activated'
  | 'envelope.completed'
  | 'envelope.canceled'
  | 'document.added'
  | 'document.updated'
  | 'document.signed'
  | 'document.completed'
  | 'signer.added'
  | 'signer.updated'
  | 'signer.notified'
  | 'signer.accessed'
  | 'signer.authenticated'
  | 'signer.signed'
  | 'signer.rejected'
  | 'authentication.required'
  | 'authentication.completed'
  | 'authentication.failed'
  | 'qualification.added'
  | 'qualification.satisfied'
  | 'notification.sent'
  | 'notification.delivered'
  | 'notification.failed'
  | 'template.used'
  | 'error.occurred';

// Severidade do evento
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

// Evento da API
export interface ApiEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  envelope_id?: string;
  document_id?: string;
  signer_id?: string;
  template_id?: string;
  user_id?: string;
  data: Record<string, any>;
  metadata: EventMetadata;
  occurred_at: string;
  processed_at?: string;
}

// Metadados do evento
export interface EventMetadata {
  source: 'api' | 'web' | 'mobile' | 'system' | 'webhook';
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  correlation_id?: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
}

// Schema Zod para EventMetadata
export const EventMetadataSchema = z.object({
  source: z.enum(['api', 'web', 'mobile', 'system', 'webhook']),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  request_id: z.string().optional(),
  correlation_id: z.string().optional(),
  version: z.string(),
  environment: z.enum(['production', 'staging', 'development']),
});

// Schema Zod para ApiEvent
export const ApiEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'envelope.created', 'envelope.updated', 'envelope.activated', 'envelope.completed', 'envelope.canceled',
    'document.added', 'document.updated', 'document.signed', 'document.completed',
    'signer.added', 'signer.updated', 'signer.notified', 'signer.accessed', 'signer.authenticated', 'signer.signed', 'signer.rejected',
    'authentication.required', 'authentication.completed', 'authentication.failed',
    'qualification.added', 'qualification.satisfied',
    'notification.sent', 'notification.delivered', 'notification.failed',
    'template.used', 'error.occurred'
  ]),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string(),
  description: z.string(),
  envelope_id: z.string().optional(),
  document_id: z.string().optional(),
  signer_id: z.string().optional(),
  template_id: z.string().optional(),
  user_id: z.string().optional(),
  data: z.record(z.string(), z.any()),
  metadata: EventMetadataSchema,
  occurred_at: z.string().datetime(),
  processed_at: z.string().datetime().optional(),
});

// Filtros para busca de eventos
export interface EventFilters {
  envelope_id?: string;
  document_id?: string;
  signer_id?: string;
  template_id?: string;
  user_id?: string;
  type?: EventType | EventType[];
  severity?: EventSeverity | EventSeverity[];
  source?: string;
  occurred_from?: string; // ISO date
  occurred_to?: string; // ISO date
  search?: string; // Busca em title e description
  page?: number;
  per_page?: number;
  sort_by?: 'occurred_at' | 'processed_at' | 'severity' | 'type';
  sort_order?: 'asc' | 'desc';
}

// Estatísticas de eventos
export interface EventStats {
  total_events: number;
  events_by_type: Record<EventType, number>;
  events_by_severity: Record<EventSeverity, number>;
  events_last_24h: number;
  events_last_7d: number;
  events_last_30d: number;
  most_active_envelopes: Array<{
    envelope_id: string;
    event_count: number;
  }>;
  error_rate_percentage: number;
}

// Observer para eventos em tempo real
export interface EventObserver {
  id: string;
  name: string;
  description?: string;
  webhook_url: string;
  secret_key?: string;
  event_types: EventType[];
  filters?: EventObserverFilters;
  is_active: boolean;
  retry_policy: RetryPolicy;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
}

// Filtros para observer de eventos
export interface EventObserverFilters {
  envelope_ids?: string[];
  signer_emails?: string[];
  severities?: EventSeverity[];
  custom_filters?: Record<string, any>;
}

// Política de retry para webhooks
export interface RetryPolicy {
  max_attempts: number;
  initial_delay_seconds: number;
  max_delay_seconds: number;
  backoff_multiplier: number;
  retry_on_status_codes: number[];
}

// Input para criação de observer
export interface EventObserverInput {
  name: string;
  description?: string;
  webhook_url: string;
  secret_key?: string;
  event_types: EventType[];
  filters?: EventObserverFilters;
  retry_policy?: Partial<RetryPolicy>;
}

// Schema Zod para EventObserverInput
export const EventObserverInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  webhook_url: z.string().url(),
  secret_key: z.string().min(8).max(255).optional(),
  event_types: z.array(z.enum([
    'envelope.created', 'envelope.updated', 'envelope.activated', 'envelope.completed', 'envelope.canceled',
    'document.added', 'document.updated', 'document.signed', 'document.completed',
    'signer.added', 'signer.updated', 'signer.notified', 'signer.accessed', 'signer.authenticated', 'signer.signed', 'signer.rejected',
    'authentication.required', 'authentication.completed', 'authentication.failed',
    'qualification.added', 'qualification.satisfied',
    'notification.sent', 'notification.delivered', 'notification.failed',
    'template.used', 'error.occurred'
  ])).min(1),
  filters: z.object({
    envelope_ids: z.array(z.string()).optional(),
    signer_emails: z.array(z.string().email()).optional(),
    severities: z.array(z.enum(['info', 'warning', 'error', 'critical'])).optional(),
    custom_filters: z.record(z.string(), z.any()).optional(),
  }).optional(),
  retry_policy: z.object({
    max_attempts: z.number().min(1).max(10).optional(),
    initial_delay_seconds: z.number().min(1).max(300).optional(),
    max_delay_seconds: z.number().min(60).max(3600).optional(),
    backoff_multiplier: z.number().min(1).max(5).optional(),
    retry_on_status_codes: z.array(z.number().min(400).max(599)).optional(),
  }).optional(),
});

// Delivery de webhook
export interface WebhookDelivery {
  id: string;
  observer_id: string;
  event_id: string;
  webhook_url: string;
  http_method: string;
  request_headers: Record<string, string>;
  request_body: string;
  response_status_code?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  delivery_duration_ms?: number;
  attempt_number: number;
  is_successful: boolean;
  error_message?: string;
  delivered_at: string;
  next_retry_at?: string;
}

// Resumo de atividade de eventos
export interface EventActivitySummary {
  date: string; // YYYY-MM-DD
  total_events: number;
  events_by_hour: number[]; // Array de 24 elementos (0-23h)
  top_event_types: Array<{
    type: EventType;
    count: number;
    percentage: number;
  }>;
  error_events: number;
  warning_events: number;
  critical_events: number;
}