import { z } from 'zod';
/**
 * Validador para nomes seguros (sem caracteres especiais perigosos)
 */
export declare const safeNameValidator: z.ZodString;
/**
 * Validador para descrições seguras
 */
export declare const safeDescriptionValidator: z.ZodString;
/**
 * Validador para URLs seguras
 */
export declare const safeUrlValidator: z.ZodString;
/**
 * Validador para conteúdo base64
 */
export declare const base64Validator: z.ZodString;
/**
 * Validador para conteúdo de arquivo
 */
export declare const fileContentValidator: z.ZodUnion<readonly [z.ZodString, z.ZodString]>;
/**
 * Validador para tipos MIME
 */
export declare const mimeTypeValidator: z.ZodString;
/**
 * Validador para data de deadline futura
 */
export declare const futureDateValidator: z.ZodString;
/**
 * Validador para deadline com regras de negócio
 */
export declare const deadlineValidator: z.ZodString;
/**
 * Funções utilitárias para validação
 */
export declare function isValidBase64(content: string): boolean;
export declare function isValidMimeType(mimeType: string): boolean;
export declare function isSafeName(name: string): boolean;
export declare function isSafeDescription(description: string): boolean;
export declare function isSafeUrl(url: string): boolean;
/**
 * Valida se uma data é uma deadline válida (futura)
 */
export declare function isValidDeadline(dateString: string): boolean;
/**
 * Valida se uma data é futura
 */
export declare function isFutureDate(dateString: string): boolean;
/**
 * Gera uma data de deadline padrão (30 dias no futuro)
 */
export declare function getDefaultDeadline(): string;
/**
 * Verifica se a deadline está próxima (menos de X horas)
 */
export declare function isDeadlineNear(deadline: string, hoursThreshold?: number): boolean;
/**
 * ============================================
 * FILE UPLOAD VALIDATORS (Seção 5.3)
 * ============================================
 */
/**
 * Tamanhos máximos de arquivo (em bytes)
 */
export declare const MAX_FILE_SIZE: number;
export declare const MAX_LETTERHEAD_SIZE: number;
/**
 * MIME types permitidos por tipo de upload
 */
export declare const MIME_TYPES: {
    PDF: string[];
    DOCX: string[];
    IMAGE: string[];
    CERTIFICATE: string[];
    ALL: string[];
};
/**
 * Obtém o tamanho de um arquivo (File, Buffer ou Blob)
 */
export declare function getFileSize(file: File | Buffer | Blob): number;
/**
 * Obtém o MIME type de um arquivo
 */
export declare function getFileMimeType(file: File | Buffer | Blob): string | null;
/**
 * Valida o tamanho de um arquivo
 * @param file - Arquivo (File, Buffer ou Blob)
 * @param maxSize - Tamanho máximo em bytes (padrão: 50MB)
 * @returns true se válido
 * @throws Error se inválido
 */
export declare function validateFileSize(file: File | Buffer | Blob, maxSize?: number): boolean;
/**
 * Valida o MIME type de um arquivo
 * @param file - Arquivo (File ou Blob com type)
 * @param allowedTypes - Array de MIME types permitidos
 * @returns true se válido
 * @throws Error se inválido
 */
export declare function validateFileMimeType(file: File | Buffer | Blob, allowedTypes: string[]): boolean;
/**
 * Valida arquivo para upload de documento (PDF/DOCX)
 */
export declare function validateDocumentFile(file: File | Buffer | Blob): boolean;
/**
 * Valida arquivo para upload de template DOCX
 */
export declare function validateTemplateFile(file: File | Buffer | Blob): boolean;
/**
 * Valida arquivo para upload de imagem de autenticação
 */
export declare function validateAuthDocumentFile(file: File | Buffer | Blob): boolean;
/**
 * Valida arquivo para upload de letterhead (PNG)
 */
export declare function validateLetterheadFile(file: File | Buffer | Blob): boolean;
/**
 * Tamanho máximo para logo (5MB)
 */
export declare const MAX_LOGO_SIZE: number;
/**
 * Valida arquivo para upload de logo da organização (PNG, JPG, SVG)
 *
 * Recomendações:
 * - Formato: PNG (recomendado para transparência), JPG ou SVG
 * - Dimensões: 512x512px (quadrado, 72dpi)
 * - Tamanho máximo: 5MB
 *
 * @param file - Arquivo (File, Buffer ou Blob)
 * @returns true se válido
 * @throws Error se inválido
 */
export declare function validateLogoFile(file: File | Buffer | Blob): boolean;
/**
 * Valida arquivo para upload de certificado digital (P12/PFX)
 */
export declare function validateCertificateFile(file: File | Buffer | Blob): boolean;
//# sourceMappingURL=validators.d.ts.map