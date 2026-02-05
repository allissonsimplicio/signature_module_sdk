/**
 * Digital Signature Types (FASE 3 - PAdES)
 *
 * Tipos para certificados digitais ICP-Brasil e assinaturas PAdES.
 * Suporta estratégia HYBRID_SEALED para assinaturas híbridas.
 */

// ==================== ENUMS ====================

/**
 * Tipo de certificado digital ICP-Brasil (valores em lowercase compatíveis com API)
 */
export enum CertificateType {
  A1 = 'a1', // Armazenado em arquivo (P12/PFX) - Validade: 1 ano
  A3 = 'a3', // Armazenado em token/smartcard - Validade: 1-5 anos
  A4 = 'a4', // Armazenado em HSM - Validade: 1-6 anos
}

/**
 * Estratégia de assinatura digital da organização (valores em camelCase compatíveis com API)
 */
export enum SignatureStrategy {
  /** Apenas carimbos visuais (sem PAdES) */
  VISUAL_ONLY = 'visualOnly',

  /** PAdES aplicado em cada assinatura individual */
  PADES_EACH = 'padesEach',

  /** PAdES apenas quando todos assinarem (selo final) */
  PADES_FINAL = 'padesFinal',

  /** Configurável por signatário (alguns com PAdES, outros não) */
  HYBRID = 'hybrid',

  /** Híbrido + selo final da organização (estratégia recomendada) */
  HYBRID_SEALED = 'hybridSealed',
}

// ==================== INTERFACES ====================

/**
 * Certificado Digital
 */
export interface DigitalCertificate {
  id: string;

  // Metadata do certificado
  commonName: string; // Nome do titular (CN)
  cpfCnpj?: string; // CPF/CNPJ extraído do certificado
  emailAddress?: string;
  organization?: string; // Organização (O)
  organizationalUnit?: string; // Unidade (OU)
  issuer: string; // Emissor (AC)
  serialNumber: string; // Número de série único

  // Validade
  notBefore: Date; // Válido a partir de
  notAfter: Date; // Válido até
  isExpired: boolean;

  // Tipo e nível
  certificateType: CertificateType;
  certificateLevel: string; // e-CPF, e-CNPJ, e-PF, e-PJ

  // Status
  isActive: boolean;
  isRevoked: boolean;
  revokedAt?: Date;
  revocationReason?: string;

  // Uso
  lastUsedAt?: Date;
  usageCount: number;

  // Metadata criptográfica
  fingerprint: string; // SHA-256 fingerprint
  publicKeyAlgorithm: string; // RSA, ECDSA
  signatureAlgorithm: string; // SHA256withRSA
  keyUsage: string[]; // digitalSignature, nonRepudiation

  // 🆕 FASE 3: Organization and audit
  organizationId: string; // Certificado pertence à organização
  uploadedBy?: string; // Quem fez upload
  uploadedByUser?: {
    id: string;
    name: string;
    email: string;
  };

  passwordHint?: string; // Dica da senha (nunca a senha real!)

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

// ==================== DTOs ====================

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
  // Retorna certificado sem campos sensíveis
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

// ==================== CONFIGURATION ====================

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

// ==================== SIGNER CONFIGURATION ====================

/**
 * Configuração de PAdES para signatário individual
 */
export interface SignerPadesConfiguration {
  /** Se true, este signatário DEVE assinar com PAdES */
  requirePades: boolean;

  /** ID do certificado específico para este signatário (opcional) */
  useCertificateId?: string;
}

// ==================== SIGNATURE FIELD ====================

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

// ==================== METADATA ====================

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
    subFilter: string; // ETSI.CAdES.detached
  };
}

// ==================== HELPER TYPES ====================

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
export type SignatureAlgorithm =
  | 'SHA1withRSA'
  | 'SHA256withRSA'
  | 'SHA384withRSA'
  | 'SHA512withRSA'
  | 'SHA256withECDSA';

/**
 * Uso de chave do certificado
 */
export type KeyUsage =
  | 'digitalSignature'
  | 'nonRepudiation'
  | 'keyEncipherment'
  | 'dataEncipherment'
  | 'keyAgreement'
  | 'keyCertSign'
  | 'cRLSign';

// ==================== ZOD SCHEMAS ====================

import { z } from 'zod';

export const CertificateTypeSchema = z.enum(['a1', 'a3', 'a4']);

export const SignatureStrategySchema = z.enum([
  'visualOnly',
  'padesEach',
  'padesFinal',
  'hybrid',
  'hybridSealed',
]);

export const UploadCertificateDtoSchema = z.object({
  certificate: z.any(), // File/Buffer/Blob - validated at runtime
  password: z.string().min(4),
  passwordHint: z.string().max(255).optional(),
  certificateType: CertificateTypeSchema.optional(),
  storePassword: z.boolean().optional(),
});

export const RevokeCertificateDtoSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const CertificateFiltersSchema = z.object({
  includeExpired: z.boolean().optional(),
  certificateType: CertificateTypeSchema.optional(),
  isActive: z.boolean().optional(),
  isRevoked: z.boolean().optional(),
});

export const DigitalCertificateSchema = z.object({
  id: z.string().uuid(),
  commonName: z.string(),
  cpfCnpj: z.string().optional(),
  emailAddress: z.string().optional(),
  organization: z.string().optional(),
  organizationalUnit: z.string().optional(),
  issuer: z.string(),
  serialNumber: z.string(),
  notBefore: z.date(),
  notAfter: z.date(),
  isExpired: z.boolean(),
  certificateType: CertificateTypeSchema,
  certificateLevel: z.string(),
  isActive: z.boolean(),
  isRevoked: z.boolean(),
  revokedAt: z.date().optional(),
  revocationReason: z.string().optional(),
  lastUsedAt: z.date().optional(),
  usageCount: z.number().int().min(0),
  fingerprint: z.string(),
  publicKeyAlgorithm: z.string(),
  signatureAlgorithm: z.string(),
  keyUsage: z.array(z.string()),
  organizationId: z.string().uuid(),
  uploadedBy: z.string().optional(),
  uploadedByUser: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).optional(),
  passwordHint: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CertificateStatsSchema = z.object({
  total: z.number().int().min(0),
  active: z.number().int().min(0),
  expired: z.number().int().min(0),
  revoked: z.number().int().min(0),
  expiringWithin30Days: z.number().int().min(0),
});
