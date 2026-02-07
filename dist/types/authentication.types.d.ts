import { z } from 'zod';
/**
 * FASE 8 + Validation Layer: Sistema de Autenticação de Assinantes
 *
 * Métodos básicos: EMAIL_TOKEN, SMS_TOKEN, WHATSAPP_TOKEN, IP_ADDRESS, GEOLOCATION
 * Documentos: OFFICIAL_DOCUMENT (flexível: RG ou CNH com metadados), RG_FRONT, RG_BACK, CNH_FRONT
 * Biometria: SELFIE (recomendado), SELFIE_WITH_DOCUMENT (deprecated)
 * Comprovantes: ADDRESS_PROOF
 */
export type AuthenticationMethod = 'emailToken' | 'whatsappToken' | 'smsToken' | 'ipAddress' | 'geolocation' | 'officialDocument' | 'selfieWithDocument' | 'addressProof' | 'selfie' | 'rgFront' | 'rgBack' | 'cnhFront';
/**
 * Métodos de autenticação que suportam reutilização de documentos.
 */
export type ReusableAuthMethod = 'officialDocument' | 'selfieWithDocument' | 'selfie' | 'addressProof' | 'rgFront' | 'rgBack' | 'cnhFront';
/**
 * Status de validação do documento através do AI Service
 */
export type ValidationStatus = 'PENDING' | 'IN_ANALYSIS' | 'VERIFIED' | 'REJECTED';
/**
 * Códigos de erro de validação
 *
 * Referência completa: docs/validation_layer/IMPLEMENTATION_STATUS.md
 *
 * Categorias:
 * - Qualidade de imagem: IMAGE_*
 * - Detecção facial: *_FACE_*, *_FACES_*
 * - Biometria: FACE_MISMATCH
 * - OCR: DOC_*_MISMATCH
 * - Liveness: POSSIBLE_SPOOF
 * - Serviço: AI_SERVICE_*
 */
export type ValidationErrorCode = 'IMAGE_TOO_SMALL' | 'IMAGE_TOO_BLURRY' | 'IMAGE_POOR_FRAMING' | 'IMAGE_TOO_DARK' | 'IMAGE_TOO_BRIGHT' | 'IMAGE_POOR_EXPOSURE' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES_DETECTED' | 'FACE_TOO_SMALL' | 'FACE_MISMATCH' | 'DOC_DATA_MISMATCH' | 'DOC_NAME_MISMATCH' | 'DOC_CPF_MISMATCH' | 'POSSIBLE_SPOOF' | 'AI_SERVICE_ERROR' | 'AI_SERVICE_TIMEOUT';
/**
 * Resultado detalhado da validação por IA
 *
 * Retornado pelo AI Service após processamento completo.
 */
export interface ValidationResult {
    /** Status geral da validação */
    overall_status: 'APPROVED' | 'REJECTED';
    /** Score de confiança geral (0-1) */
    confidence_score: number;
    /** Detalhes de cada verificação realizada */
    details: {
        /** Comparação facial (documento vs selfie) */
        face_match?: {
            match: boolean;
            similarity: number;
            threshold: number;
        };
        /** Detecção de liveness (anti-spoofing) */
        liveness?: {
            passed: boolean;
            score: number;
            confidence: number;
        };
        /** OCR e validação de dados do documento */
        ocr?: {
            passed: boolean;
            extracted_name?: string;
            extracted_cpf?: string;
            name_match_score?: number;
            cpf_match_score?: number;
        };
    };
    /** Código de rejeição (se REJECTED) */
    rejection_reason?: string;
    /** Tempo de processamento em milissegundos */
    processing_time_ms?: number;
}
/**
 * Resposta do endpoint de progresso de validação
 *
 * Usado para polling durante processamento assíncrono.
 *
 * @example
 * ```typescript
 * const progress = await client.authentication.getValidationProgress(authReqId);
 * console.log(`${progress.progress}% - ${progress.currentStep}`);
 * ```
 */
export interface ValidationProgressResponse {
    /** Status atual da validação */
    status: ValidationStatus;
    /** Progresso percentual (0-100) */
    progress: number;
    /** Descrição da etapa atual */
    currentStep: string;
    /** Tempo estimado restante em segundos */
    estimatedTimeSeconds?: number;
    /** Resultado completo da validação (apenas quando concluído) */
    result?: ValidationResult;
    /** Código de rejeição (apenas quando REJECTED) */
    rejectionCode?: ValidationErrorCode;
    /** Mensagem de rejeição amigável (apenas quando REJECTED) */
    rejectionMessage?: string;
    /** Dica de como corrigir o problema (apenas quando REJECTED) */
    rejectionHumanTip?: string;
    /** ID do job BullMQ (apenas quando IN_ANALYSIS) */
    jobId?: string;
    /** Se pode tentar novamente após erro */
    canRetry: boolean;
}
/**
 * Erro de validação pré-upload
 *
 * Retornado quando a imagem é rejeitada antes do processamento AI
 * (validação de qualidade básica no servidor).
 *
 * @example
 * ```typescript
 * try {
 *   await client.authentication.uploadDocument(authReqId, { file });
 * } catch (error) {
 *   const validationError = error.getValidationError();
 *   console.error(validationError.message);
 *   console.log('Dica:', validationError.humanTip);
 * }
 * ```
 */
export interface ValidationErrorResponse {
    status: 'REJECTED';
    code: ValidationErrorCode;
    message: string;
    humanTip: string;
    canRetry: boolean;
    metadata?: {
        fileSize?: number;
        dimensions?: {
            width: number;
            height: number;
        };
        mimeType?: string;
    };
}
/**
 * Resposta de upload de documento de autenticação
 *
 * @example
 * ```typescript
 * const result = await client.authentication.uploadDocument(authReqId, { file });
 *
 * if (result.job_id === 'AWAITING_OTHER_DOCUMENTS') {
 *   console.log('RG frente enviado. Aguardando verso...');
 * } else {
 *   console.log('Processamento iniciado. Job ID:', result.job_id);
 * }
 * ```
 */
export interface UploadAuthDocumentResponse {
    /** Se o upload foi realizado com sucesso */
    uploaded: boolean;
    /** Chave S3 do documento armazenado */
    s3Key: string;
    /** Data de expiração da URL assinada */
    expiresAt: string;
    /** ID do job BullMQ ou 'AWAITING_OTHER_DOCUMENTS' se aguardando mais uploads */
    jobId: string | 'AWAITING_OTHER_DOCUMENTS';
}
/**
 * Resposta estendida ao registrar IP e localização
 */
export interface RecordIpLocationResponse {
    /** Se o registro foi realizado com sucesso */
    recorded: boolean;
    /** Flag de risco de spoofing (se discrepância GPS/IP > 500km) */
    riskFlag?: 'RISK_SPOOFING';
    /** Mensagem adicional */
    message?: string;
}
export interface AuthenticationRequirement {
    id: string;
    method: AuthenticationMethod;
    description: string;
    isRequired: boolean;
    isSatisfied: boolean;
    satisfiedAt?: string;
    configuration?: Record<string, any>;
    evidence?: Record<string, any>;
    tokenValue?: string;
    tokenExpiresAt?: string;
    tokenUsed?: boolean;
    tokenUsedAt?: string;
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: string;
    documentS3Key?: string;
    documentUploadedAt?: string;
    documentExpiresAt?: string;
    documentMetadata?: Record<string, any>;
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    ipLatitude?: number;
    ipLongitude?: number;
    ipAddress?: string;
    ipMetadata?: Record<string, any>;
    /** Status atual da validação do documento */
    validationStatus?: ValidationStatus;
    /** Data/hora de início da validação */
    validationStartedAt?: string;
    /** Data/hora de conclusão da validação */
    validationFinishedAt?: string;
    /** Resultado completo da validação (retornado pelo AI Service) */
    validationResult?: ValidationResult;
    /** Código de rejeição (se validationStatus === 'REJECTED') */
    rejectionReason?: ValidationErrorCode;
    /** ID do job BullMQ de processamento forense */
    jobId?: string;
    signerId: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateAuthenticationRequirementDto {
    method: AuthenticationMethod;
    description: string;
    isRequired?: boolean;
    configuration?: Record<string, any>;
}
export interface VerifyTokenDto {
    token: string;
}
export interface RecordIpLocationDto {
    ipAddress: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
}
export interface UploadAuthDocumentDto {
    file: File | Buffer | Blob;
    /** 🆕 FASE 10: Tipo de documento (opcional, para OFFICIAL_DOCUMENT) */
    documentType?: 'RG' | 'CNH';
    /** 🆕 FASE 10: Parte do documento (obrigatório para RG, opcional para CNH) */
    documentPart?: 'FRONT' | 'BACK';
}
export interface SendAuthTokenResponse {
    tokenSent: boolean;
    expiresAt: string;
}
export interface VerifyTokenResponse {
    verified: boolean;
    message: string;
}
export interface AuthenticationStatusResponse {
    signerId: string;
    allSatisfied: boolean;
    requirements: {
        id: string;
        method: AuthenticationMethod;
        isRequired: boolean;
        isSatisfied: boolean;
        satisfiedAt?: string;
        evidence?: Record<string, any>;
        validationStatus?: ValidationStatus;
        validationStartedAt?: string;
        validationFinishedAt?: string;
        validationResult?: ValidationResult;
        rejectionReason?: ValidationErrorCode;
        jobId?: string;
    }[];
}
export interface ReuseDocumentResponse {
    reused: boolean;
    authRequirementId: string;
    message: string;
    documentS3Key?: string;
    expiresAt?: string;
}
export declare const ValidationStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    IN_ANALYSIS: "IN_ANALYSIS";
    VERIFIED: "VERIFIED";
    REJECTED: "REJECTED";
}>;
export declare const ValidationErrorCodeSchema: z.ZodEnum<{
    IMAGE_TOO_SMALL: "IMAGE_TOO_SMALL";
    IMAGE_TOO_BLURRY: "IMAGE_TOO_BLURRY";
    IMAGE_POOR_FRAMING: "IMAGE_POOR_FRAMING";
    IMAGE_TOO_DARK: "IMAGE_TOO_DARK";
    IMAGE_TOO_BRIGHT: "IMAGE_TOO_BRIGHT";
    IMAGE_POOR_EXPOSURE: "IMAGE_POOR_EXPOSURE";
    NO_FACE_DETECTED: "NO_FACE_DETECTED";
    MULTIPLE_FACES_DETECTED: "MULTIPLE_FACES_DETECTED";
    FACE_TOO_SMALL: "FACE_TOO_SMALL";
    FACE_MISMATCH: "FACE_MISMATCH";
    DOC_DATA_MISMATCH: "DOC_DATA_MISMATCH";
    DOC_NAME_MISMATCH: "DOC_NAME_MISMATCH";
    DOC_CPF_MISMATCH: "DOC_CPF_MISMATCH";
    POSSIBLE_SPOOF: "POSSIBLE_SPOOF";
    AI_SERVICE_ERROR: "AI_SERVICE_ERROR";
    AI_SERVICE_TIMEOUT: "AI_SERVICE_TIMEOUT";
}>;
export declare const AuthenticationRequirementSchema: z.ZodObject<{
    id: z.ZodString;
    method: z.ZodEnum<{
        emailToken: "emailToken";
        whatsappToken: "whatsappToken";
        smsToken: "smsToken";
        ipAddress: "ipAddress";
        geolocation: "geolocation";
        officialDocument: "officialDocument";
        selfieWithDocument: "selfieWithDocument";
        addressProof: "addressProof";
        selfie: "selfie";
        rgFront: "rgFront";
        rgBack: "rgBack";
        cnhFront: "cnhFront";
    }>;
    description: z.ZodString;
    isRequired: z.ZodBoolean;
    isSatisfied: z.ZodBoolean;
    satisfiedAt: z.ZodOptional<z.ZodString>;
    configuration: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    evidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    attempts: z.ZodNumber;
    maxAttempts: z.ZodNumber;
    validationStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        IN_ANALYSIS: "IN_ANALYSIS";
        VERIFIED: "VERIFIED";
        REJECTED: "REJECTED";
    }>>;
    validationStartedAt: z.ZodOptional<z.ZodString>;
    validationFinishedAt: z.ZodOptional<z.ZodString>;
    validationResult: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    rejectionReason: z.ZodOptional<z.ZodEnum<{
        IMAGE_TOO_SMALL: "IMAGE_TOO_SMALL";
        IMAGE_TOO_BLURRY: "IMAGE_TOO_BLURRY";
        IMAGE_POOR_FRAMING: "IMAGE_POOR_FRAMING";
        IMAGE_TOO_DARK: "IMAGE_TOO_DARK";
        IMAGE_TOO_BRIGHT: "IMAGE_TOO_BRIGHT";
        IMAGE_POOR_EXPOSURE: "IMAGE_POOR_EXPOSURE";
        NO_FACE_DETECTED: "NO_FACE_DETECTED";
        MULTIPLE_FACES_DETECTED: "MULTIPLE_FACES_DETECTED";
        FACE_TOO_SMALL: "FACE_TOO_SMALL";
        FACE_MISMATCH: "FACE_MISMATCH";
        DOC_DATA_MISMATCH: "DOC_DATA_MISMATCH";
        DOC_NAME_MISMATCH: "DOC_NAME_MISMATCH";
        DOC_CPF_MISMATCH: "DOC_CPF_MISMATCH";
        POSSIBLE_SPOOF: "POSSIBLE_SPOOF";
        AI_SERVICE_ERROR: "AI_SERVICE_ERROR";
        AI_SERVICE_TIMEOUT: "AI_SERVICE_TIMEOUT";
    }>>;
    jobId: z.ZodOptional<z.ZodString>;
    signerId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
/**
 * Provedor de autenticação do usuário
 */
export type AuthProvider = 'local' | 'google';
/**
 * Resposta da URL de autenticação Google
 * Usado quando o frontend precisa da URL de redirect
 */
export interface GoogleAuthUrlResponse {
    url: string;
}
/**
 * Usuário com campos OAuth
 * Extensão do User base com campos de autenticação externa
 */
export interface UserWithOAuth {
    id: string;
    email: string;
    name: string;
    organizationId?: string;
    role: string;
    isActive: boolean;
    googleId?: string | null;
    authProvider: AuthProvider;
    avatarUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}
/**
 * Schema Zod para AuthProvider
 */
export declare const AuthProviderSchema: z.ZodEnum<{
    local: "local";
    google: "google";
}>;
/**
 * Schema Zod para UserWithOAuth
 */
export declare const UserWithOAuthSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    role: z.ZodString;
    isActive: z.ZodBoolean;
    googleId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    authProvider: z.ZodEnum<{
        local: "local";
        google: "google";
    }>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=authentication.types.d.ts.map