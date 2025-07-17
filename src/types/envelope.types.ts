import { z } from 'zod';
import { EnvelopeStatus, Timestamps } from './common.types';

// Input para criação de envelope
export interface EnvelopeInput {
  name: string;
  description?: string;
  deadline?: string; // ISO date string
  auto_close?: boolean;
  notification_settings?: NotificationSettings;
  block_on_refusal?: boolean;
  custom_fields?: Record<string, any>;
  callback_url?: string;
  owner_id?: string;
}

// Configurações de notificação
export interface NotificationSettings {
  email_enabled?: boolean;
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
  reminder_enabled?: boolean;
  reminder_interval_hours?: number;
  custom_message?: string;
}

// Schema Zod para NotificationSettings
export const NotificationSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  whatsapp_enabled: z.boolean().optional(),
  reminder_enabled: z.boolean().optional(),
  reminder_interval_hours: z.number().min(1).max(168).optional(), // 1 hora a 1 semana
  custom_message: z.string().max(500).optional(),
});

// Schema Zod para EnvelopeInput
export const EnvelopeInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  deadline: z.string().datetime().optional(),
  auto_close: z.boolean().optional(),
  notification_settings: NotificationSettingsSchema.optional(),
  block_on_refusal: z.boolean().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  callback_url: z.string().url().optional(),
  owner_id: z.string().optional(),
});

// Envelope completo retornado pela API
export interface Envelope extends EnvelopeInput, Timestamps {
  id: string;
  status: EnvelopeStatus;
  documents_count: number;
  signers_count: number;
  signed_count: number;
  pending_count: number;
  rejected_count: number;
  completion_percentage: number;
  is_active: boolean;
  can_be_activated: boolean;
  activation_requirements: ActivationRequirement[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

// Requisitos para ativação do envelope
export interface ActivationRequirement {
  type: 'authentication' | 'qualification';
  description: string;
  is_satisfied: boolean;
  related_entity_id?: string;
  related_entity_type?: 'signer' | 'document';
}

// Schema Zod para Envelope
export const EnvelopeSchema = z.object({
  id: z.string(),
  name: safeNameValidator,
  description: safeDescriptionValidator.optional(),
  status: z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
  deadline: z.string().datetime().optional(),
  auto_close: z.boolean().optional(),
  notification_settings: NotificationSettingsSchema.optional(),
  block_on_refusal: z.boolean().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  callback_url: z.string().url().and(safeUrlValidator).optional(),
  owner_id: z.string().optional(),
  documents_count: z.number().min(0),
  signers_count: z.number().min(0),
  signed_count: z.number().min(0),
  pending_count: z.number().min(0),
  rejected_count: z.number().min(0),
  completion_percentage: z.number().min(0).max(100),
  is_active: z.boolean(),
  can_be_activated: z.boolean(),
  activation_requirements: z.array(z.object({
    type: z.enum(['authentication', 'qualification']),
    description: z.string(),
    is_satisfied: z.boolean(),
    related_entity_id: z.string().optional(),
    related_entity_type: z.enum(['signer', 'document']).optional(),
  })),
  owner: z.object({
    id: z.string(),
    name: safeNameValidator,
    email: z.string().email(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Filtros para busca de envelopes
export interface EnvelopeFilters {
  status?: EnvelopeStatus | EnvelopeStatus[];
  name?: string;
  created_from?: string; // ISO date
  created_to?: string; // ISO date
  deadline_from?: string; // ISO date
  deadline_to?: string; // ISO date
  owner_id?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'deadline' | 'completion_percentage';
  sort_order?: 'asc' | 'desc';
}

// Estatísticas do envelope
export interface EnvelopeStats {
  total_envelopes: number;
  draft_envelopes: number;
  running_envelopes: number;
  completed_envelopes: number;
  canceled_envelopes: number;
  average_completion_time_hours: number;
  completion_rate_percentage: number;
}