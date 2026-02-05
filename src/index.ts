/**
 * Signature Module SDK v2.0.0
 *
 * Breaking Changes desde v1.x:
 * - apiToken → accessToken (JWT)
 * - Métodos diretos → Services organizados
 * - Template → DocumentTemplate
 * - Novos módulos: Templates DOCX, Notificações Multi-Canal, Autenticação Avançada
 *
 * Para migração, consulte: sdk/MIGRATION_GUIDE.md
 */

// ==================== CLIENTE PRINCIPAL ====================
export { SignatureClient } from './client/SignatureClient';

// ==================== CACHE & ETAGS ====================
export { EtagCacheManager } from './cache/EtagCacheManager';
export type { EtagCacheEntry, EtagCacheOptions } from './cache/EtagCacheManager';

// ==================== SERVICES ====================
export { EnvelopeService } from './services/EnvelopeService';
export { DocumentService } from './services/DocumentService';
export { SignerService } from './services/SignerService';
export { SignatureFieldService } from './services/SignatureFieldService';
export { DocumentTemplateService } from './services/DocumentTemplateService';
export { NotificationService } from './services/NotificationService';
export { AuthenticationService } from './services/AuthenticationService';
export { PublicVerificationService } from './services/PublicVerificationService';
export { DigitalSignatureService } from './services/DigitalSignatureService'; // 🆕 v2.0.0 (Fase 3)
export { UserService } from './services/UserService'; // 🆕 v2.0.0 (Fase 11)
export { ApiTokenService } from './services/ApiTokenService'; // 🆕 v2.0.0 (Fase 11)
export { OrganizationService } from './services/OrganizationService'; // 🆕 v2.0.0 (Fase 11)
export { OrganizationSettingsService } from './services/OrganizationSettingsService'; // 🆕 Seção 1.14
export { WebhookService } from './services/WebhookService'; // 🆕 Seção 1.8
export { EventService } from './services/EventService'; // 🆕 Seção 1.10
export { ApprovalService } from './services/ApprovalService'; // 🆕 Approval Workflows
export { ReceiptService } from './services/ReceiptService'; // 🆕 Receipt Workflows
export { SectorService } from './services/SectorService'; // 🆕 FASE 5: Sectors

// ==================== TYPES - CORE ====================
export * from './types/common.types';
export * from './types/envelope.types';
export type {
  NotifyEnvelopeResponse,
  GenerateZipResponse,
  ZipStatusResponse,
  FindEnvelopeByIdOptions, // 🆕 PROBLEMA 4
} from './types/envelope.types';

// Health Check types (Seção 1.16)
export type {
  HealthCheck,
  ReadinessStatus,
  LivenessStatus,
  HealthStatus,
  DependencyHealth,
  DatabaseMetrics,
  StorageMetrics,
  MemoryMetrics,
} from './types/common.types';

// Authentication types (Seção 1.17)
export type {
  AuthCredentials,
  AuthTokens,
  AuthResponse,
  RefreshTokenResponse,
  RefreshTokenInput,
  LogoutInput,
  CurrentUserResponse,
} from './types/common.types';

// Document types (evitando conflitos)
export type {
  Document,
  DocumentUploadInput,
  DocumentFromTemplateInput,
  DocumentFilters,
  DocumentVersion,
  FileUploadInfo,
  DocumentUploadResponse,
  DocumentPreviewResponse,
  DocumentPreviewOptions,
} from './types/document.types';

// Signer types (evitando conflitos)
export type {
  Signer,
  SignerInput,
  SignerFilters,
  NotificationPreferences,
  SignatureEvidence,
  AddAuthenticationRequirementInput,
  AddQualificationRequirementInput,
  SigningUrlResponse,
  StartAuthenticationResponse,
} from './types/signer.types';

// Signing Session types (🆕 v3.0.1)
export type {
  SigningSessionResponse,
  SigningSessionEnvelope,
  SigningSessionSigner,
  SigningSessionDocument,
  SigningSessionAuthRequirement,
  SigningSessionAuthRequirements,
  SigningSessionProgress,
} from './types/signing-session.types';

// ==================== TYPES - NOVOS (v2.0.0) ====================

// Signature Field types
export type {
  SignatureField,
  SignatureFieldType,
  SignatureFieldInput,
  SignatureFieldUpdateInput,
  UpdateSignatureFieldInput,
  SignatureFieldFilters,
  SignFieldDto,
  SignFieldResponse,
  CreateStampGroupDto, // 🆕 FASE signature_fields
  CreateInitialFieldsDto, // 🆕 FASE signature_fields
} from './types/signature-field.types';

// 🆕 FASE signature_fields: Schemas Zod
export {
  CreateStampGroupDtoSchema,
  CreateInitialFieldsDtoSchema,
} from './types/signature-field.types';

// Document Template types (Fase 7)
export type {
  DocumentTemplate,
  VariableSchema,
  VariableMapping,
  TemplateRole,
  UploadTemplateDto,
  ConfigureTemplateDto,
  GenerateDocumentDto,
  CreateSignerForTemplateDto,
  GenerateDocumentResponse,
} from './types/document-template.types';

// Notification types (Fase 6)
export type {
  NotificationTemplate,
  NotificationLog,
  CreateNotificationTemplateDto,
  PreviewNotificationTemplateDto,
  NotificationHistoryFilters,
  NotificationTemplateFilters, // 🆕 PROBLEMA 3
} from './types/notification.types';

export {
  NotificationTemplateSchema,
  NotificationLogSchema,
  CreateNotificationTemplateDtoSchema,
  NotificationHistoryFiltersSchema,
  NotificationTemplateFiltersSchema, // 🆕 PROBLEMA 3
} from './types/notification.types';

// Authentication types (Fase 8 + Validation Layer)
export type {
  AuthenticationRequirement,
  AuthenticationMethod,
  ReusableAuthMethod,
  CreateAuthenticationRequirementDto,
  VerifyTokenDto,
  RecordIpLocationDto,
  UploadAuthDocumentDto,
  SendAuthTokenResponse,
  VerifyTokenResponse,
  AuthenticationStatusResponse,
  ReuseDocumentResponse,
  // 🆕 Validation Layer types
  ValidationStatus,
  ValidationErrorCode,
  ValidationResult,
  ValidationProgressResponse,
  ValidationErrorResponse,
  UploadAuthDocumentResponse,
  RecordIpLocationResponse,
} from './types/authentication.types';

// 🆕 Validation Layer schemas
export {
  ValidationStatusSchema,
  ValidationErrorCodeSchema,
} from './types/authentication.types';

// Public Verification types (Fase 4)
export type {
  VerificationResponse,
  PublicDownloadResponse,
  SignatureFieldInfo,
} from './types/public-verification.types';

// Digital Signature types (Fase 3)
export {
  DigitalCertificate,
  CertificateStats,
  UploadCertificateDto,
  RevokeCertificateDto,
  CertificateFilters,
  UploadCertificateResponse,
  CertificateType,
  SignatureStrategy,
} from './types/digital-signature.types';

export {
  CertificateTypeSchema,
  SignatureStrategySchema,
  UploadCertificateDtoSchema,
  RevokeCertificateDtoSchema,
  CertificateFiltersSchema,
  DigitalCertificateSchema,
  CertificateStatsSchema,
} from './types/digital-signature.types';

// User Management types (Fase 11)
export type {
  User,
  CreateUserDto,
  CreateUserResponse,
  UpdateUserDto,
  UserFilters,
} from './types/user.types';

// API Token types (Fase 11)
export type {
  ApiToken,
  CreateApiTokenResponse,
  CreateApiTokenDto,
  UpdateApiTokenDto,
  ApiTokenFilters,
} from './types/api-token.types';

export {
  CreateApiTokenDtoSchema,
  UpdateApiTokenDtoSchema,
  ApiTokenFiltersSchema,
} from './types/api-token.types';

// Organization types (Fase 11)
export type {
  Organization,
  OrganizationWithStats,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationFilters,
} from './types/organization.types';

// Organization Settings types (Seção 1.14)
export type {
  OrganizationSettings,
  UpdateOrganizationSettingsDto,
  StampTemplate,
  UploadLetterheadOptions,
  UploadLetterheadResponse,
  UploadLogoOptions,
  UploadLogoResponse,
} from './types/organization-settings.types';

// 🆕 FASE 12: Authentication Level
export { AuthenticationLevel } from './types/organization-settings.types';

// Webhook types (Seção 1.8)
export type {
  EventType,
  EventObserver,
  CreateEventObserverDto,
  UpdateEventObserverDto,
  WebhookPayload,
  WebhookResponse,
} from './types/webhook.types';

export {
  EventTypeSchema,
  EventObserverSchema,
  CreateEventObserverDtoSchema,
  UpdateEventObserverDtoSchema,
} from './types/webhook.types';

// Event types (Seção 1.10)
export type {
  ApiEvent,
  EventFilters,
  EventStats,
  EventActivitySummary,
  EventMetadata,
  EventSeverity,
  EventObserverFilters,
  RetryPolicy,
  EventObserverInput,
  WebhookDelivery,
} from './types/event.types';

// Approval types (Approval Workflows)
export type {
  ApproverInput,
  CreateApprovalEnvelopeInput,
  ApprovalEnvelope,
  SendApprovalTokensResponse,
  ValidateApprovalTokenInput,
  ValidateApprovalTokenResponse,
  DecideApprovalInput,
  DecideApprovalResponse,
  ApprovalInfo,
  ApprovalHistoryEntry,
  ApprovalHistoryResponse,
  SetApprovalModeInput,
} from './types/approval.types';

// Export enums as values (not types)
export { ApprovalMode, ApprovalDecision, NotificationChannel } from './types/approval.types';

// Receipt types (Receipt Workflows)
export type {
  ReceiptReceiverInput,
  CreateReceiptEnvelopeInput,
  ReceiptEnvelope,
  SendReceiptTokensResponse,
  ValidateReceiptTokenInput,
  ValidateReceiptTokenResponse,
  ConfirmReceiptInput,
  ConfirmReceiptResponse,
  ReceiptInfo,
  ReceiptHistoryEntry,
  ReceiptHistoryResponse,
  DownloadDocumentResponse,
} from './types/receipt.types';

// Export enums from receipt types
export { NotificationChannel as ReceiptNotificationChannel } from './types/receipt.types';

// Sector types (FASE 5: Sectors)
export type {
  Sector,
  SectorWithRelations,
  SectorBasic,
  SectorManager,
  SectorTreeNode,
  UserSector,
  CreateSectorDto,
  UpdateSectorDto,
  AddUserToSectorDto,
  SectorFilters,
} from './types/sector.types';

// ==================== TYPES - LEGACY (deprecated) ====================
// export * from './types/template.types'; // @deprecated - File removed, use document-template.types instead

// Re-export common types that are shared
export type { SignerAddress } from './types/signer.types';
export type { QualificationRequirement } from './types/document.types';
export { LetterheadPosition } from './types/common.types';
export type { LetterheadApplyTo } from './types/common.types';

// ==================== ERROR HANDLING ====================
export { ApiError } from './ApiError';

// ==================== VALIDADORES ====================
export * from './validators';

// ==================== VERSÃO ====================
export const SDK_VERSION = '2.0.0';

// ==================== CONFIGURAÇÕES PADRÃO ====================
export const DEFAULT_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Factory function para criar uma instância do SignatureClient com JWT
 * @param baseURL - URL base da API
 * @param accessToken - JWT token (obtido via login)
 */
export function createSignatureClient(baseURL: string, accessToken: string) {
  const { SignatureClient } = require('./client/SignatureClient');
  return new SignatureClient({
    baseURL,
    accessToken,
    ...DEFAULT_CONFIG,
  });
}

// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================
export const ValidationUtils = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  },

  isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return digit2 === parseInt(cleanCNPJ.charAt(13));
  },

  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidHexColor(color: string): boolean {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(color);
  },
};

// ==================== UTILITÁRIOS DE FORMATAÇÃO ====================
export const FormatUtils = {
  formatCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  formatCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  formatDateToISO(date: Date): string {
    return date.toISOString();
  },

  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
};

// ==================== CONSTANTES ====================
export const Constants = {
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/octet-stream',
  ],

  SUPPORTED_FILE_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],

  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  // 🆕 v2.0.0: Métodos de autenticação (Fase 8 + Validation Layer)
  AUTHENTICATION_METHODS: [
    'EMAIL_TOKEN',
    'WHATSAPP_TOKEN',
    'SMS_TOKEN',
    'IP_ADDRESS',
    'GEOLOCATION',
    'OFFICIAL_DOCUMENT',    // @deprecated - Use RG_FRONT/RG_BACK/CNH_FRONT
    'SELFIE_WITH_DOCUMENT',
    'ADDRESS_PROOF',
    // 🆕 Validation Layer: Documentos específicos
    'RG_FRONT',             // RG Frente (foto para biometria)
    'RG_BACK',              // RG Verso (CPF, nome para OCR)
    'CNH_FRONT',            // CNH Frente (foto + CPF + nome)
  ] as const,

  // 🆕 Validation Layer: Status de validação
  VALIDATION_STATUSES: ['PENDING', 'IN_ANALYSIS', 'VERIFIED', 'REJECTED'] as const,

  // 🆕 Validation Layer: Códigos de erro de validação
  VALIDATION_ERROR_CODES: [
    // Qualidade de imagem
    'IMAGE_TOO_SMALL',
    'IMAGE_TOO_BLURRY',
    'IMAGE_POOR_FRAMING',
    'IMAGE_TOO_DARK',
    'IMAGE_TOO_BRIGHT',
    'IMAGE_POOR_EXPOSURE',
    // Detecção facial
    'NO_FACE_DETECTED',
    'MULTIPLE_FACES_DETECTED',
    'FACE_TOO_SMALL',
    // Biometria
    'FACE_MISMATCH',
    // OCR
    'DOC_DATA_MISMATCH',
    'DOC_NAME_MISMATCH',
    'DOC_CPF_MISMATCH',
    // Liveness
    'POSSIBLE_SPOOF',
    // Serviço
    'AI_SERVICE_ERROR',
    'AI_SERVICE_TIMEOUT',
  ] as const,

  // 🆕 v2.0.0: Canais de notificação (Fase 6)
  NOTIFICATION_CHANNELS: ['email', 'sms', 'whatsapp'] as const,

  QUALIFICATION_TYPES: ['parte', 'testemunha'] as const,

  // 🆕 v2.0.0: Status de envelope (adicionado 'active', 'expired')
  ENVELOPE_STATUSES: ['draft', 'active', 'running', 'completed', 'canceled', 'expired'] as const,

  DOCUMENT_STATUSES: ['draft', 'running', 'completed', 'canceled', 'closed'] as const,

  SIGNER_STATUSES: ['pending', 'signed', 'rejected', 'canceled'] as const,

  // 🆕 v2.0.0: Status de notificação (Fase 6)
  NOTIFICATION_STATUSES: [
    'pending',
    'sending',
    'sent',
    'delivered',
    'failed',
    'retryScheduled',
  ] as const,

  // 🆕 v2.0.0: Estratégias de assinatura digital (Fase 3)
  SIGNATURE_STRATEGIES: [
    'VISUAL_ONLY',
    'PADES_EACH',
    'PADES_FINAL',
    'HYBRID',
    'HYBRID_SEALED',
  ] as const,

  // 🆕 v2.0.0: Tipos de certificado digital ICP-Brasil (Fase 3)
  CERTIFICATE_TYPES: ['A1', 'A3', 'A4'] as const,
};
