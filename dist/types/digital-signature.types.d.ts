/**
 * Digital Signature Types (FASE 3 - PAdES)
 *
 * Tipos para certificados digitais ICP-Brasil e assinaturas PAdES.
 * Suporta estratégia HYBRID_SEALED para assinaturas híbridas.
 */
/**
 * Tipo de certificado digital ICP-Brasil (valores em lowercase compatíveis com API)
 */
export declare enum CertificateType {
    A1 = "a1",// Armazenado em arquivo (P12/PFX) - Validade: 1 ano
    A3 = "a3",// Armazenado em token/smartcard - Validade: 1-5 anos
    A4 = "a4"
}
/**
 * Estratégia de assinatura digital da organização (valores em camelCase compatíveis com API)
 */
export declare enum SignatureStrategy {
    /** Apenas carimbos visuais (sem PAdES) */
    VISUAL_ONLY = "visualOnly",
    /** PAdES aplicado em cada assinatura individual */
    PADES_EACH = "padesEach",
    /** PAdES apenas quando todos assinarem (selo final) */
    PADES_FINAL = "padesFinal",
    /** Configurável por signatário (alguns com PAdES, outros não) */
    HYBRID = "hybrid",
    /** Híbrido + selo final da organização (estratégia recomendada) */
    HYBRID_SEALED = "hybridSealed"
}
/**
 * Certificado Digital
 */
export interface DigitalCertificate {
    id: string;
    commonName: string;
    cpfCnpj?: string;
    emailAddress?: string;
    organization?: string;
    organizationalUnit?: string;
    issuer: string;
    serialNumber: string;
    notBefore: Date;
    notAfter: Date;
    isExpired: boolean;
    certificateType: CertificateType;
    certificateLevel: string;
    isActive: boolean;
    isRevoked: boolean;
    revokedAt?: Date;
    revocationReason?: string;
    lastUsedAt?: Date;
    usageCount: number;
    fingerprint: string;
    publicKeyAlgorithm: string;
    signatureAlgorithm: string;
    keyUsage: string[];
    organizationId: string;
    uploadedBy?: string;
    uploadedByUser?: {
        id: string;
        name: string;
        email: string;
    };
    passwordHint?: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Estatísticas de certificados da organização
 */
export interface CertificateStats {
    total: number;
    active: number;
    expired: number;
    revoked: number;
    expiringWithin30Days: number;
}
/**
 * DTO para upload de certificado digital
 */
export interface UploadCertificateDto {
    /** Arquivo P12/PFX do certificado */
    certificate: File | Buffer | Blob;
    /** Senha do certificado */
    password: string;
    /** Dica da senha (opcional, para referência do usuário) */
    passwordHint?: string;
    /** Tipo do certificado */
    certificateType?: CertificateType;
    /**
     * Armazenar senha criptografada para automação (HYBRID_SEALED)
     * ⚠️ AVISO: Permite assinatura automática sem prompt de senha
     */
    storePassword?: boolean;
}
/**
 * DTO para revogar certificado
 */
export interface RevokeCertificateDto {
    /** Motivo da revogação */
    reason: string;
}
/**
 * Resposta do upload de certificado
 */
export interface UploadCertificateResponse extends Omit<DigitalCertificate, 'encryptedP12' | 'encryptionIV' | 'encryptionTag'> {
}
/**
 * Filtros para listagem de certificados
 */
export interface CertificateFilters {
    /** Incluir certificados expirados */
    includeExpired?: boolean;
    /** Filtrar por tipo */
    certificateType?: CertificateType;
    /** Filtrar por status ativo */
    isActive?: boolean;
    /** Filtrar por revogado */
    isRevoked?: boolean;
}
/**
 * Configuração de assinatura digital da organização
 */
export interface DigitalSignatureConfiguration {
    /** Estratégia de assinatura */
    signatureStrategy: SignatureStrategy;
    /** ID do certificado padrão da organização */
    defaultCertificateId?: string;
    /** Forçar PAdES para todos os signatários */
    requirePadesForAll: boolean;
    /** Aplicar PAdES automaticamente (requer senha armazenada) */
    padesAutoApply: boolean;
}
/**
 * Configuração de PAdES para signatário individual
 */
export interface SignerPadesConfiguration {
    /** Se true, este signatário DEVE assinar com PAdES */
    requirePades: boolean;
    /** ID do certificado específico para este signatário (opcional) */
    useCertificateId?: string;
}
/**
 * Campos PAdES opcionais para assinatura
 */
export interface PadesSignatureFields {
    /** ID do certificado digital a ser usado */
    digitalCertificateId?: string;
    /** Senha do certificado (se não armazenada) */
    certificatePassword?: string;
    /** Razão da assinatura (para PAdES) */
    padesReason?: string;
    /** Local da assinatura (para PAdES) */
    padesLocation?: string;
    /** Informações de contato (para PAdES) */
    padesContactInfo?: string;
}
/**
 * Metadata da assinatura PAdES no SignatureField
 */
export interface PadesSignatureMetadata {
    isPadesSignature: boolean;
    digitalCertificateId?: string;
    certificateSerialNumber?: string;
    certificateIssuer?: string;
    certificateSubject?: string;
    signatureValidatedAt?: Date;
    isSignatureValid?: boolean;
    padesSignatureData?: {
        signatureAlgorithm: string;
        hashAlgorithm: string;
        signedAt: Date;
        subFilter: string;
    };
}
/**
 * Níveis de certificado ICP-Brasil
 */
export type CertificateLevel = 'e-CPF' | 'e-CNPJ' | 'e-PF' | 'e-PJ' | 'Unknown';
/**
 * Algoritmos de chave pública suportados
 */
export type PublicKeyAlgorithm = 'RSA' | 'ECDSA' | 'DSA';
/**
 * Algoritmos de assinatura suportados
 */
export type SignatureAlgorithm = 'SHA1withRSA' | 'SHA256withRSA' | 'SHA384withRSA' | 'SHA512withRSA' | 'SHA256withECDSA';
/**
 * Uso de chave do certificado
 */
export type KeyUsage = 'digitalSignature' | 'nonRepudiation' | 'keyEncipherment' | 'dataEncipherment' | 'keyAgreement' | 'keyCertSign' | 'cRLSign';
import { z } from 'zod';
export declare const CertificateTypeSchema: z.ZodEnum<{
    a1: "a1";
    a3: "a3";
    a4: "a4";
}>;
export declare const SignatureStrategySchema: z.ZodEnum<{
    visualOnly: "visualOnly";
    padesEach: "padesEach";
    padesFinal: "padesFinal";
    hybrid: "hybrid";
    hybridSealed: "hybridSealed";
}>;
export declare const UploadCertificateDtoSchema: z.ZodObject<{
    certificate: z.ZodAny;
    password: z.ZodString;
    passwordHint: z.ZodOptional<z.ZodString>;
    certificateType: z.ZodOptional<z.ZodEnum<{
        a1: "a1";
        a3: "a3";
        a4: "a4";
    }>>;
    storePassword: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const RevokeCertificateDtoSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const CertificateFiltersSchema: z.ZodObject<{
    includeExpired: z.ZodOptional<z.ZodBoolean>;
    certificateType: z.ZodOptional<z.ZodEnum<{
        a1: "a1";
        a3: "a3";
        a4: "a4";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isRevoked: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const DigitalCertificateSchema: z.ZodObject<{
    id: z.ZodString;
    commonName: z.ZodString;
    cpfCnpj: z.ZodOptional<z.ZodString>;
    emailAddress: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    organizationalUnit: z.ZodOptional<z.ZodString>;
    issuer: z.ZodString;
    serialNumber: z.ZodString;
    notBefore: z.ZodDate;
    notAfter: z.ZodDate;
    isExpired: z.ZodBoolean;
    certificateType: z.ZodEnum<{
        a1: "a1";
        a3: "a3";
        a4: "a4";
    }>;
    certificateLevel: z.ZodString;
    isActive: z.ZodBoolean;
    isRevoked: z.ZodBoolean;
    revokedAt: z.ZodOptional<z.ZodDate>;
    revocationReason: z.ZodOptional<z.ZodString>;
    lastUsedAt: z.ZodOptional<z.ZodDate>;
    usageCount: z.ZodNumber;
    fingerprint: z.ZodString;
    publicKeyAlgorithm: z.ZodString;
    signatureAlgorithm: z.ZodString;
    keyUsage: z.ZodArray<z.ZodString>;
    organizationId: z.ZodString;
    uploadedBy: z.ZodOptional<z.ZodString>;
    uploadedByUser: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>>;
    passwordHint: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const CertificateStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    active: z.ZodNumber;
    expired: z.ZodNumber;
    revoked: z.ZodNumber;
    expiringWithin30Days: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=digital-signature.types.d.ts.map