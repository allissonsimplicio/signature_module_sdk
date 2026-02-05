import { z } from 'zod';

/**
 * FASE 4: Verificação Pública de Documentos
 * Permite verificar documentos assinados SEM autenticação via hash
 */

/**
 * Informação de assinatura individual
 */
export interface SignatureFieldInfo {
  /** Nome do signatário */
  signerName: string;
  /** Papel/qualificação do signatário (parte/testemunha) */
  signerRole: string;
  /** Data e hora da assinatura */
  signedAt: Date;
  /** Hash da assinatura */
  signatureHash: string;
}

/**
 * Resposta de verificação pública
 * Estrutura plana conforme retornado pelo backend
 */
export interface VerificationResponse {
  /** ID do documento */
  documentId: string;
  /** Nome do documento */
  documentName: string;
  /** Hash SHA256 do documento (64 caracteres hex) */
  documentHash: string;
  /** Nome da organização (se disponível) */
  organizationName?: string;
  /** Status do documento */
  status: string;
  /** Documento está totalmente assinado */
  isSigned: boolean;
  /** Data em que o documento foi totalmente assinado */
  signedAt?: Date;
  /** Número total de assinaturas */
  signatureCount: number;
  /** Lista de assinaturas com detalhes */
  signatures: SignatureFieldInfo[];
  /** Versão atual do documento */
  currentVersion: number;
  /** Data de criação do documento */
  createdAt: Date;
  /** Download público está habilitado */
  allowPublicDownload: boolean;
  /** ID do envelope */
  envelopeId: string;
  /** Nome do envelope */
  envelopeName: string;
}

/**
 * Resposta de download público
 */
export interface PublicDownloadResponse {
  /** URL temporária assinada do S3 (válida por 1 hora) */
  downloadUrl: string;
  /** Tempo de expiração em segundos (normalmente 3600 = 1 hora) */
  expiresIn: number;
}

// Schemas Zod para validação
export const SignatureFieldInfoSchema = z.object({
  signerName: z.string(),
  signerRole: z.string(),
  signedAt: z.coerce.date(),
  signatureHash: z.string(),
});

export const VerificationResponseSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  documentHash: z.string().length(64, 'Hash deve ter 64 caracteres hexadecimais'),
  organizationName: z.string().optional(),
  status: z.string(),
  isSigned: z.boolean(),
  signedAt: z.coerce.date().optional(),
  signatureCount: z.number().int().nonnegative(),
  signatures: z.array(SignatureFieldInfoSchema),
  currentVersion: z.number().int().positive(),
  createdAt: z.coerce.date(),
  allowPublicDownload: z.boolean(),
  envelopeId: z.string(),
  envelopeName: z.string(),
});

export const PublicDownloadResponseSchema = z.object({
  downloadUrl: z.string().url(),
  expiresIn: z.number().int().positive(),
});
