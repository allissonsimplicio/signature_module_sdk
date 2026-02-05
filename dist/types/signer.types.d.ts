import { z } from 'zod';
import { SignerStatus, AuthenticationMethod, DocumentType, Coordinates, Timestamps, QualificationType } from './common.types';
export interface SignerInput {
    name?: string;
    email?: string;
    phoneNumber?: string;
    nationalIdNumber?: string;
    documentNumber?: string;
    documentType?: DocumentType;
    birthDate?: string;
    address?: SignerAddress;
    signatureOrder?: number;
    signingOrder?: number;
    role?: string;
    company?: string;
    qualificationRole?: string;
    qualificationType?: QualificationType;
    preferredChannel?: 'email' | 'sms' | 'whatsapp';
    allowEmail?: boolean;
    allowSms?: boolean;
    allowWhatsapp?: boolean;
    /** ID do usuário interno para vincular como signer. Se fornecido, name e email são preenchidos automaticamente. */
    userId?: string;
    /** Requer assinatura digital PAdES para este signatário (estratégia HYBRID/HYBRID_SEALED) */
    requirePades?: boolean;
    /** ID do certificado digital específico para este signatário (opcional, usa certificado da organização se não especificado) */
    useCertificateId?: string;
    isRequired?: boolean;
    allowDelegation?: boolean;
    allowRefusal?: boolean;
    customMessage?: string;
    notificationPreferences?: NotificationPreferences;
    customFields?: Record<string, any>;
}
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
export interface NotificationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    language?: 'pt-BR' | 'en-US' | 'es-ES';
}
export declare const SignerAddressSchema: z.ZodObject<{
    street: z.ZodString;
    number: z.ZodString;
    complement: z.ZodOptional<z.ZodString>;
    neighborhood: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    country: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    emailEnabled: z.ZodBoolean;
    smsEnabled: z.ZodBoolean;
    whatsappEnabled: z.ZodBoolean;
    language: z.ZodOptional<z.ZodEnum<{
        "pt-BR": "pt-BR";
        "en-US": "en-US";
        "es-ES": "es-ES";
    }>>;
}, z.core.$strip>;
export declare const SignerInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    nationalIdNumber: z.ZodOptional<z.ZodString>;
    documentNumber: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodEnum<{
        other: "other";
        cpf: "cpf";
        cnpj: "cnpj";
        rg: "rg";
        cnh: "cnh";
        passport: "passport";
    }>>;
    birthDate: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        number: z.ZodString;
        complement: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    signatureOrder: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    qualificationRole: z.ZodOptional<z.ZodString>;
    preferredChannel: z.ZodOptional<z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>>;
    allowEmail: z.ZodOptional<z.ZodBoolean>;
    allowSms: z.ZodOptional<z.ZodBoolean>;
    allowWhatsapp: z.ZodOptional<z.ZodBoolean>;
    notificationPreferences: z.ZodOptional<z.ZodObject<{
        emailEnabled: z.ZodBoolean;
        smsEnabled: z.ZodBoolean;
        whatsappEnabled: z.ZodBoolean;
        language: z.ZodOptional<z.ZodEnum<{
            "pt-BR": "pt-BR";
            "en-US": "en-US";
            "es-ES": "es-ES";
        }>>;
    }, z.core.$strip>>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    userId: z.ZodOptional<z.ZodString>;
    requirePades: z.ZodOptional<z.ZodBoolean>;
    useCertificateId: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    allowDelegation: z.ZodOptional<z.ZodBoolean>;
    allowRefusal: z.ZodOptional<z.ZodBoolean>;
    customMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export interface Signer extends Omit<SignerInput, 'userId'>, Timestamps {
    id: string;
    envelopeId: string;
    status: SignerStatus;
    nationalIdNumber?: string;
    signatureUrl?: string;
    signatureOrder?: number;
    accessToken?: string;
    refreshToken?: string;
    accessExpiresAt?: string;
    refreshExpiresAt?: string;
    isRevoked?: boolean;
    signatureImageUrl?: string;
    signatureImageKey?: string;
    initialImageUrl?: string;
    initialImageKey?: string;
    signedAt?: string;
    ipAddress?: string;
    userAgent?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    lastAccessAt?: string;
    accessCount: number;
    ipAddresses: string[];
    userAgents: string[];
    authenticationRequirements: AuthenticationRequirement[];
    qualificationRequirements: QualificationRequirement[];
    signatureEvidence: SignatureEvidence[];
    isAuthenticated: boolean;
    isQualified: boolean;
    canSign: boolean;
    /** Flag que identifica signatários auto-adicionados pelo criador do envelope */
    isSelfSigning?: boolean;
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
export interface AuthenticationConfiguration {
    tokenLength?: number;
    tokenExpiryMinutes?: number;
    maxAttempts?: number;
    requiredAccuracyMeters?: number;
    allowedLocations?: Coordinates[];
    allowedIpRanges?: string[];
    requiredDocumentTypes?: string[];
    requireFaceMatch?: boolean;
}
export interface AuthenticationEvidence {
    method: AuthenticationMethod;
    collectedAt: string;
    ipAddress?: string;
    userAgent?: string;
    location?: Coordinates;
    tokenUsed?: string;
    documentImages?: string[];
    faceMatchScore?: number;
    additionalData?: Record<string, any>;
}
export interface QualificationRequirement {
    id: string;
    documentId: string;
    signerId: string;
    qualificationType: 'parte' | 'testemunha' | 'other';
    level?: string;
    description?: string;
    isSatisfied: boolean;
    satisfiedAt?: string;
}
export interface SignatureEvidence {
    id: string;
    type: 'signatureImage' | 'biometricData' | 'certificate' | 'timestamp' | 'auditTrail';
    data: Record<string, any>;
    collectedAt: string;
    hash?: string;
}
export declare const SignerSchema: z.ZodObject<{
    id: z.ZodString;
    envelopeId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodString>;
    nationalIdNumber: z.ZodOptional<z.ZodString>;
    documentNumber: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodEnum<{
        other: "other";
        cpf: "cpf";
        cnpj: "cnpj";
        rg: "rg";
        cnh: "cnh";
        passport: "passport";
    }>>;
    birthDate: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        number: z.ZodString;
        complement: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    signatureOrder: z.ZodOptional<z.ZodNumber>;
    notificationPreferences: z.ZodOptional<z.ZodObject<{
        emailEnabled: z.ZodBoolean;
        smsEnabled: z.ZodBoolean;
        whatsappEnabled: z.ZodBoolean;
        language: z.ZodOptional<z.ZodEnum<{
            "pt-BR": "pt-BR";
            "en-US": "en-US";
            "es-ES": "es-ES";
        }>>;
    }, z.core.$strip>>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    status: z.ZodEnum<{
        canceled: "canceled";
        pending: "pending";
        signed: "signed";
        rejected: "rejected";
    }>;
    signatureUrl: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    accessExpiresAt: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodOptional<z.ZodString>;
    rejectedAt: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    lastAccessAt: z.ZodOptional<z.ZodString>;
    accessCount: z.ZodNumber;
    ipAddresses: z.ZodArray<z.ZodString>;
    userAgents: z.ZodArray<z.ZodString>;
    authenticationRequirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        signerId: z.ZodString;
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
        }>;
        description: z.ZodString;
        isRequired: z.ZodBoolean;
        isSatisfied: z.ZodBoolean;
        satisfiedAt: z.ZodOptional<z.ZodString>;
        configuration: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        evidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
    qualificationRequirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        documentId: z.ZodString;
        signerId: z.ZodString;
        qualificationType: z.ZodEnum<{
            parte: "parte";
            testemunha: "testemunha";
            other: "other";
        }>;
        level: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isSatisfied: z.ZodBoolean;
        satisfiedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    signatureEvidence: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<{
            timestamp: "timestamp";
            signatureImage: "signatureImage";
            biometricData: "biometricData";
            certificate: "certificate";
            auditTrail: "auditTrail";
        }>;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
        collectedAt: z.ZodString;
        hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    isAuthenticated: z.ZodBoolean;
    isQualified: z.ZodBoolean;
    canSign: z.ZodBoolean;
    userId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isInternal: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export interface SignerFilters {
    envelopeId?: string;
    status?: SignerStatus | SignerStatus[];
    name?: string;
    email?: string;
    nationalIdNumber?: string;
    documentNumber?: string;
    isAuthenticated?: boolean;
    isQualified?: boolean;
    canSign?: boolean;
    signedFrom?: string;
    signedTo?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'name' | 'email' | 'createdAt' | 'signedAt' | 'signatureOrder';
    sortOrder?: 'asc' | 'desc';
}
export interface AddAuthenticationRequirementInput {
    method: AuthenticationMethod;
    isRequired?: boolean;
    configuration?: AuthenticationConfiguration;
    description?: string;
}
export interface AddQualificationRequirementInput {
    signerId: string;
    qualificationType: 'parte' | 'testemunha' | 'other';
    level?: string;
    description?: string;
}
export interface SigningUrlResponse {
    url: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    refreshExpiresAt: string;
}
export interface TokenPairResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    accessExpiresAt: string;
    refreshExpiresAt: string;
}
export interface RevokeTokenResponse {
    revoked: boolean;
    message: string;
}
export interface StartAuthenticationResponse {
    signerId: string;
    authenticationStarted: boolean;
    requiredMethods: string[];
    nextSteps: string[];
    message: string;
}
//# sourceMappingURL=signer.types.d.ts.map