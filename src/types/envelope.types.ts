import { z } from 'zod';
import { EnvelopeStatus, Timestamps } from './common.types';
import { deadlineValidator } from '../validators';
import { Document } from './document.types';

// 🆕 Self-Signing Configuration
export interface SelfSignerConfig {
  /** Ordem de assinatura do criador (default: 1) */
  signingOrder?: number;
  /** Mensagem personalizada para o criador */
  customMessage?: string;
  /** Canal de comunicação preferido (default: 'email') */
  preferredChannel?: 'email' | 'sms' | 'whatsapp';
  /** Papel/função do criador no documento */
  role?: string;
  /** Número de telefone para autenticação SMS (opcional) */
  phoneNumber?: string;
}

// Input para criação de envelope
export interface EnvelopeInput {
  name: string;
  description?: string;
  deadline?: string; // ISO date string
  autoClose?: boolean;
  notificationSettings?: NotificationSettings;
  blockOnRefusal?: boolean;
  customFields?: Record<string, any>;
  callbackUrl?: string;
  ownerId?: string;

  // 🆕 Self-Signing Feature
  /** Adicionar o criador automaticamente como signatário com autenticação simplificada */
  addMeAsSigner?: boolean;
  /** Configurações para self-signing */
  selfSignerConfig?: SelfSignerConfig;
}

// Input para atualização de envelope (permite atualizar status também)
export interface UpdateEnvelopeDto extends Partial<EnvelopeInput> {
  status?: EnvelopeStatus;
}

// Input para cancelamento de envelope
export interface CancelEnvelopeDto {
  status: 'canceled';
  cancellationReason: string;
  notifySigners?: boolean;
}

// 🆕 PROBLEMA 4: Opções para query parameters
export interface FindEnvelopeByIdOptions {
  /**
   * Incluir entidades relacionadas na resposta.
   * Pode ser um único valor ou múltiplos separados por vírgula.
   *
   * @example 'documents'
   * @example 'signers'
   * @example 'documents,signers'
   * @example 'documents,signers,events'
   */
  include?: 'documents' | 'signers' | 'events' | 'documents,signers' | 'documents,events' | 'signers,events' | 'documents,signers,events';
}

// Configurações de notificação
export interface NotificationSettings {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  reminderEnabled?: boolean;
  reminderIntervalHours?: number;
  customMessage?: string;
}

// Schema Zod para NotificationSettings
export const NotificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderIntervalHours: z.number().min(1).max(168).optional(), // 1 hora a 1 semana
  customMessage: z.string().max(500).optional(),
});

// 🆕 Schema Zod para SelfSignerConfig
export const SelfSignerConfigSchema = z.object({
  signingOrder: z.number().int().min(1).optional().default(1),
  customMessage: z.string().max(1000).optional(),
  preferredChannel: z.enum(['email', 'sms', 'whatsapp']).optional().default('email'),
  role: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

// Schema Zod para EnvelopeInput
export const EnvelopeInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  deadline: deadlineValidator.optional(),
  autoClose: z.boolean().optional(),
  notificationSettings: NotificationSettingsSchema.optional(),
  blockOnRefusal: z.boolean().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  callbackUrl: z.string().url().optional(),
  ownerId: z.string().optional(),

  // 🆕 Self-Signing Feature
  addMeAsSigner: z.boolean().optional().default(false),
  selfSignerConfig: SelfSignerConfigSchema.optional(),
});

// Schema Zod para UpdateEnvelopeDto
export const UpdateEnvelopeDtoSchema = EnvelopeInputSchema.partial().extend({
  status: z.enum(['draft', 'running', 'completed', 'canceled', 'closed']).optional(),
});

// Schema Zod para CancelEnvelopeDto
export const CancelEnvelopeDtoSchema = z.object({
  status: z.literal('canceled'),
  cancellationReason: z.string().min(1).max(500),
  notifySigners: z.boolean().optional().default(true),
});

// Envelope completo retornado pela API
export interface Envelope extends EnvelopeInput, Timestamps {
  id: string;
  status: EnvelopeStatus;

  // Multiorg (Fase 1)
  ownerId: string;
  organizationId?: string;

  // Notificações (Fase 6)
  notificationsSent?: number;
  lastNotificationAt?: string;

  // Lifecycle dates
  activatedAt?: string;
  completedAt?: string;
  expiresAt?: string;

  documentsCount: number;
  signersCount: number;
  signedCount: number;
  pendingCount: number;
  rejectedCount: number;
  completionPercentage: number;
  isActive: boolean;
  canBeActivated: boolean;
  activationRequirements: ActivationRequirement[];
  owner: {
    id: string;
    name: string;
    email: string;
  };

  // Optional related entities (populated when using include query parameter)
  // 🆕 PROBLEMA 4: Entidades relacionadas incluídas via query params
  documents?: Document[];
  signers?: any[]; // Tipo Signer não está importado aqui, usando any por enquanto
  events?: any[];  // Tipo Event não está importado aqui, usando any por enquanto
}

// Resposta de ativação do envelope (com notificações)
export interface ActivateEnvelopeResponse {
  envelope: Envelope;
  notificationsSent?: number;
}

// Requisitos para ativação do envelope
export interface ActivationRequirement {
  type: 'authentication' | 'qualification';
  description: string;
  isSatisfied: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'signer' | 'document';
}

// Schema Zod para Envelope
export const EnvelopeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
  deadline: z.string().datetime().optional(),
  autoClose: z.boolean().optional(),
  notificationSettings: NotificationSettingsSchema.optional(),
  blockOnRefusal: z.boolean().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  callbackUrl: z.string().url().optional(),
  ownerId: z.string().optional(),
  documentsCount: z.number().min(0),
  signersCount: z.number().min(0),
  signedCount: z.number().min(0),
  pendingCount: z.number().min(0),
  rejectedCount: z.number().min(0),
  completionPercentage: z.number().min(0).max(100),
  isActive: z.boolean(),
  canBeActivated: z.boolean(),
  activationRequirements: z.array(z.object({
    type: z.enum(['authentication', 'qualification']),
    description: z.string(),
    isSatisfied: z.boolean(),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.enum(['signer', 'document']).optional(),
  })),
  owner: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    email: z.string().email(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Filtros para busca de envelopes
export interface EnvelopeFilters {
  status?: EnvelopeStatus | EnvelopeStatus[];
  name?: string;
  createdFrom?: string; // ISO date
  createdTo?: string; // ISO date
  deadlineFrom?: string; // ISO date
  deadlineTo?: string; // ISO date
  ownerId?: string;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'deadline' | 'completionPercentage';
  sortOrder?: 'asc' | 'desc';
}

// Estatísticas do envelope
export interface EnvelopeStats {
  totalEnvelopes: number;
  draftEnvelopes: number;
  runningEnvelopes: number;
  completedEnvelopes: number;
  canceledEnvelopes: number;
  averageCompletionTimeHours: number;
  completionRatePercentage: number;
}

// Resposta de notificação do envelope
export interface NotifyEnvelopeResponse {
  envelopeId: string;
  notificationsSent: number;
  notificationDetails: {
    signerId: string;
    signerName: string;
    signerEmail: string;
    channels: string[]; // ['email', 'sms', 'whatsapp']
    status: 'sent' | 'failed';
    erroMessage?: string;
  }[];
}

// Resposta de geração de ZIP
export interface GenerateZipResponse {
  jobId: string;
  envelopeId: string;
  status: 'pending' | 'processing';
  message: string;
  estimatedCompletionTime?: string;
}

// Resposta de status do ZIP
export interface ZipStatusResponse {
  jobId: string;
  envelopeId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progressPercentage?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  errorMessage?: string;
  fileSizeBytes?: number;
}

// 🆕 FASE 14: Audit Trail Types
export interface AuditTrailEntry {
  id: string;
  occurredAt: string; // ISO 8601
  action: string; // 'created', 'activated', 'signed', 'completed', etc
  actor: {
    type: 'user' | 'signer' | 'system';
    id: string;
    name: string;
    email?: string;
  };
  target?: {
    type: 'envelope' | 'document' | 'signer';
    id: string;
    name: string;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    geolocation?: string;
    [key: string]: any;
  };
  signature?: string; // Hash criptográfico para não repúdio
}

export interface AuditTrail {
  envelopeId: string;
  envelopeName: string;
  generatedAt: string;
  entries: AuditTrailEntry[];
  totalEntries: number;
}

// 🆕 Envelope from Templates Types

/**
 * Input para um documento a ser gerado a partir de template
 */
export interface TemplateDocumentInput {
  /** ID do template a ser usado */
  templateId: string;
  /** Nome customizado para o documento (opcional, usa nome do template se não fornecido) */
  name?: string;
  /** Variáveis específicas para este documento (sobrescreve globalVariables) */
  variables?: Record<string, any>;
}

/**
 * Input para um signatário no envelope
 */
export interface SignerForEnvelopeInput {
  /** Role/papel do signatário (deve corresponder aos roles definidos nos templates) */
  role: string;
  /** Nome completo do signatário */
  name: string;
  /** Email do signatário */
  email: string;
  /** Telefone do signatário (com DDD) */
  phone?: string;
  /** Número do documento (CPF/CNPJ) */
  documentNumber?: string;
  /** Campos customizados do signatário */
  customFields?: Record<string, any>;
  /** Endereço do signatário */
  address?: Record<string, any>;
  /** Ordem de assinatura (opcional, usa do template se não fornecido) */
  signingOrder?: number;
}

/**
 * Input para criar envelope completo a partir de templates
 */
export interface CreateEnvelopeFromTemplatesInput {
  /** Nome do envelope */
  name: string;
  /** Descrição do envelope */
  description?: string;
  /** Status inicial do envelope (DRAFT ou RUNNING) */
  status?: 'draft' | 'running';
  /** Modo sandbox (true para testes, false para produção) */
  sandbox?: boolean;
  /** Prazo limite para assinaturas (ISO 8601) */
  deadline?: string;
  /** URL de callback para webhooks */
  callbackUrl?: string;
  /** Lista de documentos a gerar a partir de templates */
  documents: TemplateDocumentInput[];
  /** Lista de signatários com seus roles */
  signers: SignerForEnvelopeInput[];
  /** Variáveis globais (fallback para todos os documentos) */
  globalVariables?: Record<string, any>;
  /** Se true, ativa o envelope automaticamente após criação */
  autoActivate?: boolean;
  /** Se true, envia notificações aos signatários após ativação */
  notifySigners?: boolean;
}

/**
 * Response inicial ao criar envelope via templates (202 Accepted)
 */
export interface EnvelopeFromTemplatesJobResponse {
  /** ID do job de processamento em background */
  jobId: string;
  /** Status do job */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Mensagem descritiva */
  message: string;
  /** Tempo estimado de conclusão (segundos) */
  estimatedCompletionTimeSeconds?: number;
  /** Timestamp de criação do job */
  createdAt: string;
  /** URL para consultar o status do job */
  statusUrl?: string;
}

/**
 * Informações de um documento gerado
 */
export interface GeneratedDocumentInfo {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  pageCount: number;
  fileSize: number;
}

/**
 * Informações de um signatário criado
 */
export interface CreatedSignerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

/**
 * Informações de um campo de assinatura criado
 */
export interface CreatedSignatureFieldInfo {
  id: string;
  documentId: string;
  signerId: string;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  anchorString?: string;
}

/**
 * Response completa quando o job é concluído com sucesso
 */
export interface EnvelopeFromTemplatesResponse {
  envelope: {
    id: string;
    name: string;
    status: string;
    documentsCount: number;
    signersCount: number;
    createdAt: string;
  };
  documents: GeneratedDocumentInfo[];
  signers: CreatedSignerInfo[];
  signatureFields: CreatedSignatureFieldInfo[];
  variablesUsed: Record<string, Record<string, string>>;
  notificationsSent?: number;
  warnings?: string[];
}

/**
 * Response de status de job
 */
export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progressPercentage?: number;
  currentStep?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  result?: EnvelopeFromTemplatesResponse;
  errorCode?: string;
  errorMessage?: string;
  errors?: string[];
  metadata?: Record<string, any>;
}