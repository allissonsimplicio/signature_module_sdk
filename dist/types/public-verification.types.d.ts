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
export declare const SignatureFieldInfoSchema: z.ZodObject<{
    signerName: z.ZodString;
    signerRole: z.ZodString;
    signedAt: z.ZodCoercedDate<unknown>;
    signatureHash: z.ZodString;
}, z.core.$strip>;
export declare const VerificationResponseSchema: z.ZodObject<{
    documentId: z.ZodString;
    documentName: z.ZodString;
    documentHash: z.ZodString;
    organizationName: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    isSigned: z.ZodBoolean;
    signedAt: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    signatureCount: z.ZodNumber;
    signatures: z.ZodArray<z.ZodObject<{
        signerName: z.ZodString;
        signerRole: z.ZodString;
        signedAt: z.ZodCoercedDate<unknown>;
        signatureHash: z.ZodString;
    }, z.core.$strip>>;
    currentVersion: z.ZodNumber;
    createdAt: z.ZodCoercedDate<unknown>;
    allowPublicDownload: z.ZodBoolean;
    envelopeId: z.ZodString;
    envelopeName: z.ZodString;
}, z.core.$strip>;
export declare const PublicDownloadResponseSchema: z.ZodObject<{
    downloadUrl: z.ZodString;
    expiresIn: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=public-verification.types.d.ts.map