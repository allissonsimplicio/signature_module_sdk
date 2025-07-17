import { z } from 'zod';
import { SignerStatus, AuthenticationMethod, DocumentType, Coordinates, Timestamps } from './common.types';

// Input para criação de signatário
export interface SignerInput {
  name: string;
  email: string;
  phone_number?: string;
  document_number?: string; // CPF, CNPJ, etc.
  document_type?: DocumentType;
  birth_date?: string; // ISO date
  address?: SignerAddress;
  signature_order?: number;
  notification_preferences?: NotificationPreferences;
  custom_fields?: Record<string, any>;
}

// Endereço do signatário
export interface SignerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
}

// Preferências de notificação do signatário
export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  language?: 'pt-BR' | 'en-US' | 'es-ES';
}

// Schema Zod para SignerAddress
export const SignerAddressSchema = z.object({
  street: z.string().min(1).max(255).and(z.string()({ allowSpecialChars: true, allowNumbers: true })),
  number: z.string().min(1).max(20).and(z.string()({ allowSpecialChars: true, allowNumbers: true })),
  complement: z.string().max(100).and(z.string()({ allowSpecialChars: true, allowNumbers: true })).optional(),
  neighborhood: z.string().min(1).max(100).and(z.string()({ allowSpecialChars: true, allowNumbers: true })),
  city: z.string().min(1).max(100).and(z.string()),
  state: z.string().min(2).max(50).and(z.string()),
  zip_code: z.string().min(5).max(20).and(z.string()({ allowNumbers: true, allowSpecialChars: false })),
  country: z.string().max(50).and(z.string()).optional(),
});

// Schema Zod para NotificationPreferences
export const NotificationPreferencesSchema = z.object({
  email_enabled: z.boolean(),
  sms_enabled: z.boolean(),
  whatsapp_enabled: z.boolean(),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).optional(),
});

// Schema Zod para SignerInput
export const SignerInputSchema = z.object({
  name: z.string().min(1).max(255).and(z.string()),
  email: z.string().email(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
  document_number: z.string().max(50).and(z.string()({ allowNumbers: true, allowSpecialChars: false })).optional(),
  document_type: z.enum(['cpf', 'cnpj', 'rg', 'passport', 'other']).optional(),
  birth_date: z.string().date().optional(),
  address: SignerAddressSchema.optional(),
  signature_order: z.number().min(1).optional(),
  notification_preferences: NotificationPreferencesSchema.optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

// Signatário completo retornado pela API
export interface Signer extends SignerInput, Timestamps {
  id: string;
  envelope_id: string;
  status: SignerStatus;
  signature_url?: string;
  access_token?: string;
  access_expires_at?: string;
  signed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  last_access_at?: string;
  access_count: number;
  ip_addresses: string[];
  user_agents: string[];
  authentication_requirements: AuthenticationRequirement[];
  qualification_requirements: QualificationRequirement[];
  signature_evidence: SignatureEvidence[];
  is_authenticated: boolean;
  is_qualified: boolean;
  can_sign: boolean;
}

// Requisito de autenticação
export interface AuthenticationRequirement {
  id: string;
  signer_id: string;
  method: AuthenticationMethod;
  description: string;
  is_required: boolean;
  is_satisfied: boolean;
  satisfied_at?: string;
  configuration?: AuthenticationConfiguration;
  evidence?: AuthenticationEvidence;
}

// Configuração específica do método de autenticação
export interface AuthenticationConfiguration {
  // Para token via email/SMS/WhatsApp
  token_length?: number;
  token_expiry_minutes?: number;
  max_attempts?: number;
  
  // Para geolocalização
  required_accuracy_meters?: number;
  allowed_locations?: Coordinates[];
  
  // Para IP
  allowed_ip_ranges?: string[];
  
  // Para documentos
  required_document_types?: string[];
  require_face_match?: boolean;
}

// Evidência de autenticação coletada
export interface AuthenticationEvidence {
  method: AuthenticationMethod;
  collected_at: string;
  ip_address?: string;
  user_agent?: string;
  location?: Coordinates;
  token_used?: string;
  document_images?: string[]; // URLs das imagens
  face_match_score?: number;
  additional_data?: Record<string, any>;
}

// Requisito de qualificação
export interface QualificationRequirement {
  id: string;
  document_id: string;
  signer_id: string;
  qualification_type: 'parte' | 'testemunha';
  description?: string;
  is_satisfied: boolean;
  satisfied_at?: string;
}

// Evidências da assinatura
export interface SignatureEvidence {
  id: string;
  type: 'signature_image' | 'biometric_data' | 'certificate' | 'timestamp' | 'audit_trail';
  data: Record<string, any>;
  collected_at: string;
  hash?: string;
}

// Schema Zod para Signer
export const SignerSchema = z.object({
  id: z.string(),
  envelope_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string().optional(),
  document_number: z.string()({ allowNumbers: true, allowSpecialChars: false }).optional(),
  document_type: z.enum(['cpf', 'cnpj', 'rg', 'passport', 'other']).optional(),
  birth_date: z.string().date().optional(),
  address: SignerAddressSchema.optional(),
  signature_order: z.number().min(1).optional(),
  notification_preferences: NotificationPreferencesSchema.optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  status: z.enum(['pending', 'signed', 'rejected', 'canceled']),
  signature_url: safeUrlValidator.optional(),
  access_token: z.string().optional(),
  access_expires_at: z.string().datetime().optional(),
  signed_at: z.string().datetime().optional(),
  rejected_at: z.string().datetime().optional(),
  rejection_reason: safeDescriptionValidator.optional(),
  last_access_at: z.string().datetime().optional(),
  access_count: z.number().min(0),
  ip_addresses: z.array(z.string()),
  user_agents: z.array(z.string()),
  authentication_requirements: z.array(z.object({
    id: z.string(),
    signer_id: z.string(),
    method: z.enum(['email_token', 'whatsapp_token', 'sms_token', 'ip_address', 'geolocation', 'official_document', 'selfie_with_document', 'address_proof']),
    description: safeDescriptionValidator,
    is_required: z.boolean(),
    is_satisfied: z.boolean(),
    satisfied_at: z.string().datetime().optional(),
    configuration: z.record(z.string(), z.any()).optional(),
    evidence: z.record(z.string(), z.any()).optional(),
  })),
  qualification_requirements: z.array(z.object({
    id: z.string(),
    document_id: z.string(),
    signer_id: z.string(),
    qualification_type: z.enum(['parte', 'testemunha']),
    description: safeDescriptionValidator.optional(),
    is_satisfied: z.boolean(),
    satisfied_at: z.string().datetime().optional(),
  })),
  signature_evidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['signature_image', 'biometric_data', 'certificate', 'timestamp', 'audit_trail']),
    data: z.record(z.string(), z.any()),
    collected_at: z.string().datetime(),
    hash: z.string().optional(),
  })),
  is_authenticated: z.boolean(),
  is_qualified: z.boolean(),
  can_sign: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Filtros para busca de signatários
export interface SignerFilters {
  envelope_id?: string;
  status?: SignerStatus | SignerStatus[];
  name?: string;
  email?: string;
  document_number?: string;
  is_authenticated?: boolean;
  is_qualified?: boolean;
  can_sign?: boolean;
  signed_from?: string; // ISO date
  signed_to?: string; // ISO date
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'email' | 'created_at' | 'signed_at' | 'signature_order';
  sort_order?: 'asc' | 'desc';
}

// Input para adicionar requisito de autenticação
export interface AddAuthenticationRequirementInput {
  method: AuthenticationMethod;
  is_required?: boolean;
  configuration?: AuthenticationConfiguration;
  description?: string;
}

// Input para adicionar requisito de qualificação
export interface AddQualificationRequirementInput {
  qualification_type: 'parte' | 'testemunha';
  description?: string;
}