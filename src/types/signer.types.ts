import { z } from 'zod';
import { SignerStatus, AuthenticationMethod, DocumentType, Coordinates, Timestamps, QualificationType } from './common.types';

// Input para criação de signatário
// Quando userId é fornecido (destinatário interno), name e email são preenchidos automaticamente do User
export interface SignerInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  nationalIdNumber?: string; // 🆕 CPF, CNPJ (identidade nacional única)
  documentNumber?: string; // Número do RG, CNH, etc (documento de validação)
  documentType?: DocumentType;
  birthDate?: string; // ISO date
  address?: SignerAddress;
  // 🔄 FASE 14: Unificação de campos de ordem
  signatureOrder?: number; // 🗑️ DEPRECATED - usar signingOrder
  signingOrder?: number; // ✅ Ordem de assinatura (substitui signatureOrder)

  // Campos profissionais
  role?: string; // Cargo/função do signatário
  company?: string; // Empresa do signatário

  // Template Role (Fase 7)
  qualificationRole?: string; // Ex: "CONTRATANTE", "CONTRATADO"
  // 🆕 FASE 14: Qualification Type
  qualificationType?: QualificationType; // Tipo de qualificação: parte, testemunha, gestor, etc.

  // Notification Preferences (Fase 6)
  preferredChannel?: 'email' | 'sms' | 'whatsapp';
  allowEmail?: boolean;
  allowSms?: boolean;
  allowWhatsapp?: boolean;

  // 🆕 SETORES: Destinatário interno
  /** ID do usuário interno para vincular como signer. Se fornecido, name e email são preenchidos automaticamente. */
  userId?: string;

  // 🆕 Digital Signature Configuration (Fase 3)
  /** Requer assinatura digital PAdES para este signatário (estratégia HYBRID/HYBRID_SEALED) */
  requirePades?: boolean;
  /** ID do certificado digital específico para este signatário (opcional, usa certificado da organização se não especificado) */
  useCertificateId?: string;

  // Controles de assinatura
  isRequired?: boolean; // Assinatura obrigatória (default: true)
  allowDelegation?: boolean; // Permitir delegação da assinatura
  allowRefusal?: boolean; // Permitir recusa da assinatura
  customMessage?: string; // Mensagem personalizada para o signatário

  notificationPreferences?: NotificationPreferences;
  customFields?: Record<string, any>;
}

// Endereço do signatário
export interface SignerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

// Preferências de notificação do signatário
export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  language?: 'pt-BR' | 'en-US' | 'es-ES';
}

// Schema Zod para SignerAddress
export const SignerAddressSchema = z.object({
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(5).max(20),
  country: z.string().max(50).optional(),
});

// Schema Zod para NotificationPreferences
export const NotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).optional(),
});

// Schema Zod para SignerInput
export const SignerInputSchema = z.object({
  name: z.string().min(1).max(255).optional(), // Opcional quando userId fornecido (auto-preenchido)
  email: z.string().email().optional(), // Opcional quando userId fornecido (auto-preenchido)
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
  nationalIdNumber: z.string().max(20).optional(), // 🆕
  documentNumber: z.string().max(50).optional(),
  documentType: z.enum(['cpf', 'cnpj', 'rg', 'passport', 'cnh', 'other']).optional(),
  birthDate: z.string().optional(),
  address: SignerAddressSchema.optional(),
  signatureOrder: z.number().min(1).optional(),
  role: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  qualificationRole: z.string().max(255).optional(),
  preferredChannel: z.enum(['email', 'sms', 'whatsapp']).optional(),
  allowEmail: z.boolean().optional(),
  allowSms: z.boolean().optional(),
  allowWhatsapp: z.boolean().optional(),
  notificationPreferences: NotificationPreferencesSchema.optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  // 🆕 SETORES: Destinatário interno
  userId: z.string().optional(),
  // 🆕 FASE 3: PAdES configuration
  requirePades: z.boolean().optional(),
  useCertificateId: z.string().optional(),
  // Controles de assinatura
  isRequired: z.boolean().optional(),
  allowDelegation: z.boolean().optional(),
  allowRefusal: z.boolean().optional(),
  customMessage: z.string().max(1000).optional(),
});

// Signatário completo retornado pela API
export interface Signer extends Omit<SignerInput, 'userId'>, Timestamps {
  id: string;
  envelopeId: string;
  status: SignerStatus;
  nationalIdNumber?: string; // 🆕
  signatureUrl?: string;
  signatureOrder?: number;

  // 🆕 JWT Token System (Fase 12)
  accessToken?: string; // JWT access token
  refreshToken?: string; // Refresh token
  accessExpiresAt?: string; // Access token expiration
  refreshExpiresAt?: string; // Refresh token expiration
  isRevoked?: boolean; // Token revocation flag

  // 🆕 FASE signature_fields: Assinatura e Rubrica salvas no perfil
  signatureImageUrl?: string; // URL da imagem da assinatura salva no perfil
  signatureImageKey?: string; // Chave S3 da imagem da assinatura
  initialImageUrl?: string; // URL da imagem da rubrica salva no perfil
  initialImageKey?: string; // Chave S3 da imagem da rubrica

  // Signing Status
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  lastAccessAt?: string;
  accessCount: number;
  ipAddresses: string[];
  userAgents: string[];

  // Fase 8 - Authentication
  authenticationRequirements: AuthenticationRequirement[];
  qualificationRequirements: QualificationRequirement[];
  signatureEvidence: SignatureEvidence[];
  isAuthenticated: boolean;
  isQualified: boolean;
  canSign: boolean;

  // 🆕 Self-Signing Feature
  /** Flag que identifica signatários auto-adicionados pelo criador do envelope */
  isSelfSigning?: boolean;

  // 🆕 SETORES: Destinatário interno
  /** ID do usuário interno vinculado (null se externo) */
  userId?: string | null;
  /** Flag indicando se é destinatário interno da organização */
  isInternal?: boolean;
  /** Dados do usuário interno (quando disponível) */
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

// Requisito de autenticação
export interface AuthenticationRequirement {
  id: string;
  signerId: string;
  method: AuthenticationMethod;
  description: string;
  isRequired: boolean;
  isSatisfied: boolean;
  satisfiedAt?: string;
  configuration?: AuthenticationConfiguration;
  evidence?: AuthenticationEvidence;
}

// Configuração específica do método de autenticação
export interface AuthenticationConfiguration {
  // Para token via email/SMS/WhatsApp
  tokenLength?: number;
  tokenExpiryMinutes?: number;
  maxAttempts?: number;
  
  // Para geolocalização
  requiredAccuracyMeters?: number;
  allowedLocations?: Coordinates[];
  
  // Para IP
  allowedIpRanges?: string[];
  
  // Para documentos
  requiredDocumentTypes?: string[];
  requireFaceMatch?: boolean;
}

// Evidência de autenticação coletada
export interface AuthenticationEvidence {
  method: AuthenticationMethod;
  collectedAt: string;
  ipAddress?: string;
  userAgent?: string;
  location?: Coordinates;
  tokenUsed?: string;
  documentImages?: string[]; // URLs das imagens
  faceMatchScore?: number;
  additionalData?: Record<string, any>;
}

// Requisito de qualificação
export interface QualificationRequirement {
  id: string;
  documentId: string;
  signerId: string;
  qualificationType: 'parte' | 'testemunha' | 'other';
  level?: string; // Nível de qualificação (opcional)
  description?: string;
  isSatisfied: boolean;
  satisfiedAt?: string;
}

// Evidências da assinatura
export interface SignatureEvidence {
  id: string;
  type: 'signatureImage' | 'biometricData' | 'certificate' | 'timestamp' | 'auditTrail';
  data: Record<string, any>;
  collectedAt: string;
  hash?: string;
}

// Schema Zod para Signer
export const SignerSchema = z.object({
  id: z.string(),
  envelopeId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  nationalIdNumber: z.string().optional(), // 🆕
  documentNumber: z.string().optional(),
  documentType: z.enum(['cpf', 'cnpj', 'rg', 'passport', 'cnh', 'other']).optional(),
  birthDate: z.string().optional(),
  address: SignerAddressSchema.optional(),
  signatureOrder: z.number().min(1).optional(),
  notificationPreferences: NotificationPreferencesSchema.optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  status: z.enum(['pending', 'signed', 'rejected', 'canceled']),
  signatureUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
  accessExpiresAt: z.string().datetime().optional(),
  signedAt: z.string().datetime().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().max(500).optional(),
  lastAccessAt: z.string().datetime().optional(),
  accessCount: z.number().min(0),
  ipAddresses: z.array(z.string()),
  userAgents: z.array(z.string()),
  authenticationRequirements: z.array(z.object({
    id: z.string(),
    signerId: z.string(),
    method: z.enum(['emailToken', 'whatsappToken', 'smsToken', 'ipAddress', 'geolocation', 'officialDocument', 'selfieWithDocument', 'addressProof', 'selfie']),
    description: z.string().max(500),
    isRequired: z.boolean(),
    isSatisfied: z.boolean(),
    satisfiedAt: z.string().datetime().optional(),
    configuration: z.record(z.string(), z.any()).optional(),
    evidence: z.record(z.string(), z.any()).optional(),
  })),
  qualificationRequirements: z.array(z.object({
    id: z.string(),
    documentId: z.string(),
    signerId: z.string(),
    qualificationType: z.enum(['parte', 'testemunha', 'other']),
    level: z.string().optional(),
    description: z.string().max(500).optional(),
    isSatisfied: z.boolean(),
    satisfiedAt: z.string().datetime().optional(),
  })),
  signatureEvidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['signatureImage', 'biometricData', 'certificate', 'timestamp', 'auditTrail']),
    data: z.record(z.string(), z.any()),
    collectedAt: z.string().datetime(),
    hash: z.string().optional(),
  })),
  isAuthenticated: z.boolean(),
  isQualified: z.boolean(),
  canSign: z.boolean(),
  // 🆕 SETORES: Destinatário interno
  userId: z.string().nullable().optional(),
  isInternal: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Filtros para busca de signatários
export interface SignerFilters {
  envelopeId?: string;
  status?: SignerStatus | SignerStatus[];
  name?: string;
  email?: string;
  nationalIdNumber?: string; // 🆕
  documentNumber?: string;
  isAuthenticated?: boolean;
  isQualified?: boolean;
  canSign?: boolean;
  signedFrom?: string; // ISO date
  signedTo?: string; // ISO date
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'signedAt' | 'signatureOrder';
  sortOrder?: 'asc' | 'desc';
}

// Input para adicionar requisito de autenticação
export interface AddAuthenticationRequirementInput {
  method: AuthenticationMethod;
  isRequired?: boolean;
  configuration?: AuthenticationConfiguration;
  description?: string;
}

// Input para adicionar requisito de qualificação
export interface AddQualificationRequirementInput {
  signerId: string;
  qualificationType: 'parte' | 'testemunha' | 'other';
  level?: string; // Nível de qualificação (opcional)
  description?: string;
}

// 🆕 Resposta ao obter URL de assinatura (com JWT tokens)
export interface SigningUrlResponse {
  url: string; // Complete signing URL with embedded JWT token
  accessToken: string; // JWT access token (15 min default)
  refreshToken: string; // Refresh token (7 days default)
  expiresAt: string; // Access token expiration (ISO 8601)
  refreshExpiresAt: string; // Refresh token expiration (ISO 8601)
}

// 🆕 Token pair response (refresh operation)
export interface TokenPairResponse {
  accessToken: string; // New JWT access token
  refreshToken: string; // New refresh token (rotated)
  expiresIn: number; // Access token expiration in seconds
  accessExpiresAt: string; // ISO 8601 date string
  refreshExpiresAt: string; // ISO 8601 date string
}

// 🆕 Token revocation response
export interface RevokeTokenResponse {
  revoked: boolean;
  message: string;
}

// Resposta ao iniciar autenticação
export interface StartAuthenticationResponse {
  signerId: string;
  authenticationStarted: boolean;
  requiredMethods: string[];
  nextSteps: string[];
  message: string;
}
