"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptNotificationChannel = exports.NotificationChannel = exports.ApprovalDecision = exports.ApprovalMode = exports.UpdateEventObserverDtoSchema = exports.CreateEventObserverDtoSchema = exports.EventObserverSchema = exports.EventTypeSchema = exports.AuthenticationLevel = exports.ApiTokenFiltersSchema = exports.UpdateApiTokenDtoSchema = exports.CreateApiTokenDtoSchema = exports.CertificateStatsSchema = exports.DigitalCertificateSchema = exports.CertificateFiltersSchema = exports.RevokeCertificateDtoSchema = exports.UploadCertificateDtoSchema = exports.SignatureStrategySchema = exports.CertificateTypeSchema = exports.SignatureStrategy = exports.CertificateType = exports.ValidationErrorCodeSchema = exports.ValidationStatusSchema = exports.NotificationTemplateFiltersSchema = exports.NotificationHistoryFiltersSchema = exports.CreateNotificationTemplateDtoSchema = exports.NotificationLogSchema = exports.NotificationTemplateSchema = exports.CreateInitialFieldsDtoSchema = exports.CreateStampGroupDtoSchema = exports.SectorService = exports.ReceiptService = exports.ApprovalService = exports.EventService = exports.WebhookService = exports.OrganizationSettingsService = exports.OrganizationService = exports.ApiTokenService = exports.UserService = exports.DigitalSignatureService = exports.PublicVerificationService = exports.AuthenticationService = exports.NotificationService = exports.DocumentTemplateService = exports.SignatureFieldService = exports.SignerService = exports.DocumentService = exports.EnvelopeService = exports.EtagCacheManager = exports.SignatureClient = void 0;
exports.Constants = exports.FormatUtils = exports.ValidationUtils = exports.DEFAULT_CONFIG = exports.SDK_VERSION = exports.ApiError = exports.LetterheadPosition = void 0;
exports.createSignatureClient = createSignatureClient;
// ==================== CLIENTE PRINCIPAL ====================
var SignatureClient_1 = require("./client/SignatureClient");
Object.defineProperty(exports, "SignatureClient", { enumerable: true, get: function () { return SignatureClient_1.SignatureClient; } });
// ==================== CACHE & ETAGS ====================
var EtagCacheManager_1 = require("./cache/EtagCacheManager");
Object.defineProperty(exports, "EtagCacheManager", { enumerable: true, get: function () { return EtagCacheManager_1.EtagCacheManager; } });
// ==================== SERVICES ====================
var EnvelopeService_1 = require("./services/EnvelopeService");
Object.defineProperty(exports, "EnvelopeService", { enumerable: true, get: function () { return EnvelopeService_1.EnvelopeService; } });
var DocumentService_1 = require("./services/DocumentService");
Object.defineProperty(exports, "DocumentService", { enumerable: true, get: function () { return DocumentService_1.DocumentService; } });
var SignerService_1 = require("./services/SignerService");
Object.defineProperty(exports, "SignerService", { enumerable: true, get: function () { return SignerService_1.SignerService; } });
var SignatureFieldService_1 = require("./services/SignatureFieldService");
Object.defineProperty(exports, "SignatureFieldService", { enumerable: true, get: function () { return SignatureFieldService_1.SignatureFieldService; } });
var DocumentTemplateService_1 = require("./services/DocumentTemplateService");
Object.defineProperty(exports, "DocumentTemplateService", { enumerable: true, get: function () { return DocumentTemplateService_1.DocumentTemplateService; } });
var NotificationService_1 = require("./services/NotificationService");
Object.defineProperty(exports, "NotificationService", { enumerable: true, get: function () { return NotificationService_1.NotificationService; } });
var AuthenticationService_1 = require("./services/AuthenticationService");
Object.defineProperty(exports, "AuthenticationService", { enumerable: true, get: function () { return AuthenticationService_1.AuthenticationService; } });
var PublicVerificationService_1 = require("./services/PublicVerificationService");
Object.defineProperty(exports, "PublicVerificationService", { enumerable: true, get: function () { return PublicVerificationService_1.PublicVerificationService; } });
var DigitalSignatureService_1 = require("./services/DigitalSignatureService"); // 🆕 v2.0.0 (Fase 3)
Object.defineProperty(exports, "DigitalSignatureService", { enumerable: true, get: function () { return DigitalSignatureService_1.DigitalSignatureService; } });
var UserService_1 = require("./services/UserService"); // 🆕 v2.0.0 (Fase 11)
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return UserService_1.UserService; } });
var ApiTokenService_1 = require("./services/ApiTokenService"); // 🆕 v2.0.0 (Fase 11)
Object.defineProperty(exports, "ApiTokenService", { enumerable: true, get: function () { return ApiTokenService_1.ApiTokenService; } });
var OrganizationService_1 = require("./services/OrganizationService"); // 🆕 v2.0.0 (Fase 11)
Object.defineProperty(exports, "OrganizationService", { enumerable: true, get: function () { return OrganizationService_1.OrganizationService; } });
var OrganizationSettingsService_1 = require("./services/OrganizationSettingsService"); // 🆕 Seção 1.14
Object.defineProperty(exports, "OrganizationSettingsService", { enumerable: true, get: function () { return OrganizationSettingsService_1.OrganizationSettingsService; } });
var WebhookService_1 = require("./services/WebhookService"); // 🆕 Seção 1.8
Object.defineProperty(exports, "WebhookService", { enumerable: true, get: function () { return WebhookService_1.WebhookService; } });
var EventService_1 = require("./services/EventService"); // 🆕 Seção 1.10
Object.defineProperty(exports, "EventService", { enumerable: true, get: function () { return EventService_1.EventService; } });
var ApprovalService_1 = require("./services/ApprovalService"); // 🆕 Approval Workflows
Object.defineProperty(exports, "ApprovalService", { enumerable: true, get: function () { return ApprovalService_1.ApprovalService; } });
var ReceiptService_1 = require("./services/ReceiptService"); // 🆕 Receipt Workflows
Object.defineProperty(exports, "ReceiptService", { enumerable: true, get: function () { return ReceiptService_1.ReceiptService; } });
var SectorService_1 = require("./services/SectorService"); // 🆕 FASE 5: Sectors
Object.defineProperty(exports, "SectorService", { enumerable: true, get: function () { return SectorService_1.SectorService; } });
// ==================== TYPES - CORE ====================
__exportStar(require("./types/common.types"), exports);
__exportStar(require("./types/envelope.types"), exports);
// 🆕 FASE signature_fields: Schemas Zod
var signature_field_types_1 = require("./types/signature-field.types");
Object.defineProperty(exports, "CreateStampGroupDtoSchema", { enumerable: true, get: function () { return signature_field_types_1.CreateStampGroupDtoSchema; } });
Object.defineProperty(exports, "CreateInitialFieldsDtoSchema", { enumerable: true, get: function () { return signature_field_types_1.CreateInitialFieldsDtoSchema; } });
var notification_types_1 = require("./types/notification.types");
Object.defineProperty(exports, "NotificationTemplateSchema", { enumerable: true, get: function () { return notification_types_1.NotificationTemplateSchema; } });
Object.defineProperty(exports, "NotificationLogSchema", { enumerable: true, get: function () { return notification_types_1.NotificationLogSchema; } });
Object.defineProperty(exports, "CreateNotificationTemplateDtoSchema", { enumerable: true, get: function () { return notification_types_1.CreateNotificationTemplateDtoSchema; } });
Object.defineProperty(exports, "NotificationHistoryFiltersSchema", { enumerable: true, get: function () { return notification_types_1.NotificationHistoryFiltersSchema; } });
Object.defineProperty(exports, "NotificationTemplateFiltersSchema", { enumerable: true, get: function () { return notification_types_1.NotificationTemplateFiltersSchema; } });
// 🆕 Validation Layer schemas
var authentication_types_1 = require("./types/authentication.types");
Object.defineProperty(exports, "ValidationStatusSchema", { enumerable: true, get: function () { return authentication_types_1.ValidationStatusSchema; } });
Object.defineProperty(exports, "ValidationErrorCodeSchema", { enumerable: true, get: function () { return authentication_types_1.ValidationErrorCodeSchema; } });
// Digital Signature types (Fase 3)
var digital_signature_types_1 = require("./types/digital-signature.types");
Object.defineProperty(exports, "CertificateType", { enumerable: true, get: function () { return digital_signature_types_1.CertificateType; } });
Object.defineProperty(exports, "SignatureStrategy", { enumerable: true, get: function () { return digital_signature_types_1.SignatureStrategy; } });
var digital_signature_types_2 = require("./types/digital-signature.types");
Object.defineProperty(exports, "CertificateTypeSchema", { enumerable: true, get: function () { return digital_signature_types_2.CertificateTypeSchema; } });
Object.defineProperty(exports, "SignatureStrategySchema", { enumerable: true, get: function () { return digital_signature_types_2.SignatureStrategySchema; } });
Object.defineProperty(exports, "UploadCertificateDtoSchema", { enumerable: true, get: function () { return digital_signature_types_2.UploadCertificateDtoSchema; } });
Object.defineProperty(exports, "RevokeCertificateDtoSchema", { enumerable: true, get: function () { return digital_signature_types_2.RevokeCertificateDtoSchema; } });
Object.defineProperty(exports, "CertificateFiltersSchema", { enumerable: true, get: function () { return digital_signature_types_2.CertificateFiltersSchema; } });
Object.defineProperty(exports, "DigitalCertificateSchema", { enumerable: true, get: function () { return digital_signature_types_2.DigitalCertificateSchema; } });
Object.defineProperty(exports, "CertificateStatsSchema", { enumerable: true, get: function () { return digital_signature_types_2.CertificateStatsSchema; } });
var api_token_types_1 = require("./types/api-token.types");
Object.defineProperty(exports, "CreateApiTokenDtoSchema", { enumerable: true, get: function () { return api_token_types_1.CreateApiTokenDtoSchema; } });
Object.defineProperty(exports, "UpdateApiTokenDtoSchema", { enumerable: true, get: function () { return api_token_types_1.UpdateApiTokenDtoSchema; } });
Object.defineProperty(exports, "ApiTokenFiltersSchema", { enumerable: true, get: function () { return api_token_types_1.ApiTokenFiltersSchema; } });
// 🆕 FASE 12: Authentication Level
var organization_settings_types_1 = require("./types/organization-settings.types");
Object.defineProperty(exports, "AuthenticationLevel", { enumerable: true, get: function () { return organization_settings_types_1.AuthenticationLevel; } });
var webhook_types_1 = require("./types/webhook.types");
Object.defineProperty(exports, "EventTypeSchema", { enumerable: true, get: function () { return webhook_types_1.EventTypeSchema; } });
Object.defineProperty(exports, "EventObserverSchema", { enumerable: true, get: function () { return webhook_types_1.EventObserverSchema; } });
Object.defineProperty(exports, "CreateEventObserverDtoSchema", { enumerable: true, get: function () { return webhook_types_1.CreateEventObserverDtoSchema; } });
Object.defineProperty(exports, "UpdateEventObserverDtoSchema", { enumerable: true, get: function () { return webhook_types_1.UpdateEventObserverDtoSchema; } });
// Export enums as values (not types)
var approval_types_1 = require("./types/approval.types");
Object.defineProperty(exports, "ApprovalMode", { enumerable: true, get: function () { return approval_types_1.ApprovalMode; } });
Object.defineProperty(exports, "ApprovalDecision", { enumerable: true, get: function () { return approval_types_1.ApprovalDecision; } });
Object.defineProperty(exports, "NotificationChannel", { enumerable: true, get: function () { return approval_types_1.NotificationChannel; } });
// Export enums from receipt types
var receipt_types_1 = require("./types/receipt.types");
Object.defineProperty(exports, "ReceiptNotificationChannel", { enumerable: true, get: function () { return receipt_types_1.NotificationChannel; } });
var common_types_1 = require("./types/common.types");
Object.defineProperty(exports, "LetterheadPosition", { enumerable: true, get: function () { return common_types_1.LetterheadPosition; } });
// ==================== ERROR HANDLING ====================
var ApiError_1 = require("./ApiError");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return ApiError_1.ApiError; } });
// ==================== VALIDADORES ====================
__exportStar(require("./validators"), exports);
// ==================== VERSÃO ====================
exports.SDK_VERSION = '2.0.0';
// ==================== CONFIGURAÇÕES PADRÃO ====================
exports.DEFAULT_CONFIG = {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};
/**
 * Factory function para criar uma instância do SignatureClient com JWT
 * @param baseURL - URL base da API
 * @param accessToken - JWT token (obtido via login)
 */
function createSignatureClient(baseURL, accessToken) {
    const { SignatureClient } = require('./client/SignatureClient');
    return new SignatureClient({
        baseURL,
        accessToken,
        ...exports.DEFAULT_CONFIG,
    });
}
// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================
exports.ValidationUtils = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    isValidPhone(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    },
    isValidCPF(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11)
            return false;
        if (/^(\d)\1{10}$/.test(cleanCPF))
            return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11)
            remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9)))
            return false;
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11)
            remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(10)))
            return false;
        return true;
    },
    isValidCNPJ(cnpj) {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        if (cleanCNPJ.length !== 14)
            return false;
        if (/^(\d)\1{13}$/.test(cleanCNPJ))
            return false;
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (digit1 !== parseInt(cleanCNPJ.charAt(12)))
            return false;
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;
        return digit2 === parseInt(cleanCNPJ.charAt(13));
    },
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    },
    isValidHexColor(color) {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(color);
    },
};
// ==================== UTILITÁRIOS DE FORMATAÇÃO ====================
exports.FormatUtils = {
    formatCPF(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    formatCNPJ(cnpj) {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    formatPhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 11) {
            return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        else if (cleanPhone.length === 10) {
            return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    formatDateToISO(date) {
        return date.toISOString();
    },
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
};
// ==================== CONSTANTES ====================
exports.Constants = {
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
        'OFFICIAL_DOCUMENT', // @deprecated - Use RG_FRONT/RG_BACK/CNH_FRONT
        'SELFIE_WITH_DOCUMENT',
        'ADDRESS_PROOF',
        // 🆕 Validation Layer: Documentos específicos
        'RG_FRONT', // RG Frente (foto para biometria)
        'RG_BACK', // RG Verso (CPF, nome para OCR)
        'CNH_FRONT', // CNH Frente (foto + CPF + nome)
    ],
    // 🆕 Validation Layer: Status de validação
    VALIDATION_STATUSES: ['PENDING', 'IN_ANALYSIS', 'VERIFIED', 'REJECTED'],
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
    ],
    // 🆕 v2.0.0: Canais de notificação (Fase 6)
    NOTIFICATION_CHANNELS: ['email', 'sms', 'whatsapp'],
    QUALIFICATION_TYPES: ['parte', 'testemunha'],
    // 🆕 v2.0.0: Status de envelope (adicionado 'active', 'expired')
    ENVELOPE_STATUSES: ['draft', 'active', 'running', 'completed', 'canceled', 'expired'],
    DOCUMENT_STATUSES: ['draft', 'running', 'completed', 'canceled', 'closed'],
    SIGNER_STATUSES: ['pending', 'signed', 'rejected', 'canceled'],
    // 🆕 v2.0.0: Status de notificação (Fase 6)
    NOTIFICATION_STATUSES: [
        'pending',
        'sending',
        'sent',
        'delivered',
        'failed',
        'retryScheduled',
    ],
    // 🆕 v2.0.0: Estratégias de assinatura digital (Fase 3)
    SIGNATURE_STRATEGIES: [
        'VISUAL_ONLY',
        'PADES_EACH',
        'PADES_FINAL',
        'HYBRID',
        'HYBRID_SEALED',
    ],
    // 🆕 v2.0.0: Tipos de certificado digital ICP-Brasil (Fase 3)
    CERTIFICATE_TYPES: ['A1', 'A3', 'A4'],
};
//# sourceMappingURL=index.js.map