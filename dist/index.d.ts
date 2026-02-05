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
export { SignatureClient } from './client/SignatureClient';
export { EtagCacheManager } from './cache/EtagCacheManager';
export type { EtagCacheEntry, EtagCacheOptions } from './cache/EtagCacheManager';
export { EnvelopeService } from './services/EnvelopeService';
export { DocumentService } from './services/DocumentService';
export { SignerService } from './services/SignerService';
export { SignatureFieldService } from './services/SignatureFieldService';
export { DocumentTemplateService } from './services/DocumentTemplateService';
export { NotificationService } from './services/NotificationService';
export { AuthenticationService } from './services/AuthenticationService';
export { PublicVerificationService } from './services/PublicVerificationService';
export { DigitalSignatureService } from './services/DigitalSignatureService';
export { UserService } from './services/UserService';
export { ApiTokenService } from './services/ApiTokenService';
export { OrganizationService } from './services/OrganizationService';
export { OrganizationSettingsService } from './services/OrganizationSettingsService';
export { WebhookService } from './services/WebhookService';
export { EventService } from './services/EventService';
export { ApprovalService } from './services/ApprovalService';
export { ReceiptService } from './services/ReceiptService';
export { SectorService } from './services/SectorService';
export * from './types/common.types';
export * from './types/envelope.types';
export type { NotifyEnvelopeResponse, GenerateZipResponse, ZipStatusResponse, FindEnvelopeByIdOptions, } from './types/envelope.types';
export type { HealthCheck, ReadinessStatus, LivenessStatus, HealthStatus, DependencyHealth, DatabaseMetrics, StorageMetrics, MemoryMetrics, } from './types/common.types';
export type { AuthCredentials, AuthTokens, AuthResponse, RefreshTokenResponse, RefreshTokenInput, LogoutInput, CurrentUserResponse, } from './types/common.types';
export type { Document, DocumentUploadInput, DocumentFromTemplateInput, DocumentFilters, DocumentVersion, FileUploadInfo, DocumentUploadResponse, DocumentPreviewResponse, DocumentPreviewOptions, } from './types/document.types';
export type { Signer, SignerInput, SignerFilters, NotificationPreferences, SignatureEvidence, AddAuthenticationRequirementInput, AddQualificationRequirementInput, SigningUrlResponse, StartAuthenticationResponse, } from './types/signer.types';
export type { SigningSessionResponse, SigningSessionEnvelope, SigningSessionSigner, SigningSessionDocument, SigningSessionAuthRequirement, SigningSessionAuthRequirements, SigningSessionProgress, } from './types/signing-session.types';
export type { SignatureField, SignatureFieldType, SignatureFieldInput, SignatureFieldUpdateInput, UpdateSignatureFieldInput, SignatureFieldFilters, SignFieldDto, SignFieldResponse, CreateStampGroupDto, // 🆕 FASE signature_fields
CreateInitialFieldsDto, } from './types/signature-field.types';
export { CreateStampGroupDtoSchema, CreateInitialFieldsDtoSchema, } from './types/signature-field.types';
export type { DocumentTemplate, VariableSchema, VariableMapping, TemplateRole, UploadTemplateDto, ConfigureTemplateDto, GenerateDocumentDto, CreateSignerForTemplateDto, GenerateDocumentResponse, } from './types/document-template.types';
export type { NotificationTemplate, NotificationLog, CreateNotificationTemplateDto, PreviewNotificationTemplateDto, NotificationHistoryFilters, NotificationTemplateFilters, } from './types/notification.types';
export { NotificationTemplateSchema, NotificationLogSchema, CreateNotificationTemplateDtoSchema, NotificationHistoryFiltersSchema, NotificationTemplateFiltersSchema, } from './types/notification.types';
export type { AuthenticationRequirement, AuthenticationMethod, ReusableAuthMethod, CreateAuthenticationRequirementDto, VerifyTokenDto, RecordIpLocationDto, UploadAuthDocumentDto, SendAuthTokenResponse, VerifyTokenResponse, AuthenticationStatusResponse, ReuseDocumentResponse, ValidationStatus, ValidationErrorCode, ValidationResult, ValidationProgressResponse, ValidationErrorResponse, UploadAuthDocumentResponse, RecordIpLocationResponse, } from './types/authentication.types';
export { ValidationStatusSchema, ValidationErrorCodeSchema, } from './types/authentication.types';
export type { VerificationResponse, PublicDownloadResponse, SignatureFieldInfo, } from './types/public-verification.types';
export { DigitalCertificate, CertificateStats, UploadCertificateDto, RevokeCertificateDto, CertificateFilters, UploadCertificateResponse, CertificateType, SignatureStrategy, } from './types/digital-signature.types';
export { CertificateTypeSchema, SignatureStrategySchema, UploadCertificateDtoSchema, RevokeCertificateDtoSchema, CertificateFiltersSchema, DigitalCertificateSchema, CertificateStatsSchema, } from './types/digital-signature.types';
export type { User, CreateUserDto, CreateUserResponse, UpdateUserDto, UserFilters, } from './types/user.types';
export type { ApiToken, CreateApiTokenResponse, CreateApiTokenDto, UpdateApiTokenDto, ApiTokenFilters, } from './types/api-token.types';
export { CreateApiTokenDtoSchema, UpdateApiTokenDtoSchema, ApiTokenFiltersSchema, } from './types/api-token.types';
export type { Organization, OrganizationWithStats, CreateOrganizationDto, UpdateOrganizationDto, OrganizationFilters, } from './types/organization.types';
export type { OrganizationSettings, UpdateOrganizationSettingsDto, StampTemplate, UploadLetterheadOptions, UploadLetterheadResponse, UploadLogoOptions, UploadLogoResponse, } from './types/organization-settings.types';
export { AuthenticationLevel } from './types/organization-settings.types';
export type { EventType, EventObserver, CreateEventObserverDto, UpdateEventObserverDto, WebhookPayload, WebhookResponse, } from './types/webhook.types';
export { EventTypeSchema, EventObserverSchema, CreateEventObserverDtoSchema, UpdateEventObserverDtoSchema, } from './types/webhook.types';
export type { ApiEvent, EventFilters, EventStats, EventActivitySummary, EventMetadata, EventSeverity, EventObserverFilters, RetryPolicy, EventObserverInput, WebhookDelivery, } from './types/event.types';
export type { ApproverInput, CreateApprovalEnvelopeInput, ApprovalEnvelope, SendApprovalTokensResponse, ValidateApprovalTokenInput, ValidateApprovalTokenResponse, DecideApprovalInput, DecideApprovalResponse, ApprovalInfo, ApprovalHistoryEntry, ApprovalHistoryResponse, SetApprovalModeInput, } from './types/approval.types';
export { ApprovalMode, ApprovalDecision, NotificationChannel } from './types/approval.types';
export type { ReceiptReceiverInput, CreateReceiptEnvelopeInput, ReceiptEnvelope, SendReceiptTokensResponse, ValidateReceiptTokenInput, ValidateReceiptTokenResponse, ConfirmReceiptInput, ConfirmReceiptResponse, ReceiptInfo, ReceiptHistoryEntry, ReceiptHistoryResponse, DownloadDocumentResponse, } from './types/receipt.types';
export { NotificationChannel as ReceiptNotificationChannel } from './types/receipt.types';
export type { Sector, SectorWithRelations, SectorBasic, SectorManager, SectorTreeNode, UserSector, CreateSectorDto, UpdateSectorDto, AddUserToSectorDto, SectorFilters, } from './types/sector.types';
export type { SignerAddress } from './types/signer.types';
export type { QualificationRequirement } from './types/document.types';
export { LetterheadPosition } from './types/common.types';
export type { LetterheadApplyTo } from './types/common.types';
export { ApiError } from './ApiError';
export * from './validators';
export declare const SDK_VERSION = "2.0.0";
export declare const DEFAULT_CONFIG: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
};
/**
 * Factory function para criar uma instância do SignatureClient com JWT
 * @param baseURL - URL base da API
 * @param accessToken - JWT token (obtido via login)
 */
export declare function createSignatureClient(baseURL: string, accessToken: string): any;
export declare const ValidationUtils: {
    isValidEmail(email: string): boolean;
    isValidPhone(phone: string): boolean;
    isValidCPF(cpf: string): boolean;
    isValidCNPJ(cnpj: string): boolean;
    isValidURL(url: string): boolean;
    isValidHexColor(color: string): boolean;
};
export declare const FormatUtils: {
    formatCPF(cpf: string): string;
    formatCNPJ(cnpj: string): string;
    formatPhone(phone: string): string;
    formatDateToISO(date: Date): string;
    formatBytes(bytes: number, decimals?: number): string;
};
export declare const Constants: {
    SUPPORTED_FILE_TYPES: string[];
    SUPPORTED_FILE_EXTENSIONS: string[];
    MAX_FILE_SIZE: number;
    AUTHENTICATION_METHODS: readonly ["EMAIL_TOKEN", "WHATSAPP_TOKEN", "SMS_TOKEN", "IP_ADDRESS", "GEOLOCATION", "OFFICIAL_DOCUMENT", "SELFIE_WITH_DOCUMENT", "ADDRESS_PROOF", "RG_FRONT", "RG_BACK", "CNH_FRONT"];
    VALIDATION_STATUSES: readonly ["PENDING", "IN_ANALYSIS", "VERIFIED", "REJECTED"];
    VALIDATION_ERROR_CODES: readonly ["IMAGE_TOO_SMALL", "IMAGE_TOO_BLURRY", "IMAGE_POOR_FRAMING", "IMAGE_TOO_DARK", "IMAGE_TOO_BRIGHT", "IMAGE_POOR_EXPOSURE", "NO_FACE_DETECTED", "MULTIPLE_FACES_DETECTED", "FACE_TOO_SMALL", "FACE_MISMATCH", "DOC_DATA_MISMATCH", "DOC_NAME_MISMATCH", "DOC_CPF_MISMATCH", "POSSIBLE_SPOOF", "AI_SERVICE_ERROR", "AI_SERVICE_TIMEOUT"];
    NOTIFICATION_CHANNELS: readonly ["email", "sms", "whatsapp"];
    QUALIFICATION_TYPES: readonly ["parte", "testemunha"];
    ENVELOPE_STATUSES: readonly ["draft", "active", "running", "completed", "canceled", "expired"];
    DOCUMENT_STATUSES: readonly ["draft", "running", "completed", "canceled", "closed"];
    SIGNER_STATUSES: readonly ["pending", "signed", "rejected", "canceled"];
    NOTIFICATION_STATUSES: readonly ["pending", "sending", "sent", "delivered", "failed", "retryScheduled"];
    SIGNATURE_STRATEGIES: readonly ["VISUAL_ONLY", "PADES_EACH", "PADES_FINAL", "HYBRID", "HYBRID_SEALED"];
    CERTIFICATE_TYPES: readonly ["A1", "A3", "A4"];
};
//# sourceMappingURL=index.d.ts.map