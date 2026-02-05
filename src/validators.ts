import { z } from 'zod';

/**
 * Validador para nomes seguros (sem caracteres especiais perigosos)
 */
export const safeNameValidator = z
  .string()
  .min(1, 'Nome não pode estar vazio')
  .max(100, 'Nome não pode ter mais de 100 caracteres')
  .refine((name) => {
    // Remove caracteres HTML, SQL injection e outros perigosos
    const dangerousChars = /<|>|&|"|'|`|\||;|--|\*|%|#|\$|@|!|\^|~|\+|=|\{|\}|\[|\]|\\|\/|\?/;
    return !dangerousChars.test(name);
  }, 'Nome contém caracteres não permitidos');

/**
 * Validador para descrições seguras
 */
export const safeDescriptionValidator = z
  .string()
  .max(500, 'Descrição não pode ter mais de 500 caracteres')
  .refine((desc) => {
    // Remove scripts e tags HTML perigosas
    const dangerousPatterns = /<script|<iframe|<object|<embed|<form|javascript:|data:|vbscript:/i;
    return !dangerousPatterns.test(desc);
  }, 'Descrição contém conteúdo não permitido');

/**
 * Validador para URLs seguras
 */
export const safeUrlValidator = z
  .string()
  .url('URL inválida')
  .refine((url) => {
    try {
      const urlObj = new URL(url);
      // Permite apenas HTTP e HTTPS
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'URL deve usar protocolo HTTP ou HTTPS');

/**
 * Validador para conteúdo base64
 */
export const base64Validator = z
  .string()
  .refine((content) => {
    try {
      // Verifica se é base64 válido
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Pattern.test(content) && content.length % 4 === 0;
    } catch {
      return false;
    }
  }, 'Conteúdo base64 inválido');

/**
 * Validador para conteúdo de arquivo
 */
export const fileContentValidator = z.union([
  base64Validator,
  z.string().url('URL de arquivo inválida')
]);

/**
 * Validador para tipos MIME
 */
export const mimeTypeValidator = z
  .string()
  .refine((mimeType) => {
    const supportedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      // Certificates
      'application/x-pkcs12',
      'application/x-pkcs7-certificates',
      'application/pkcs12',
      // Generic
      'application/octet-stream'
    ];
    return supportedTypes.includes(mimeType);
  }, 'Tipo de arquivo não suportado');

/**
 * Validador para data de deadline futura
 */
export const futureDateValidator = z
  .string()
  .datetime('Data deve estar no formato ISO 8601')
  .refine((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    // Margem de 1 minuto para evitar problemas de timezone
    return date.getTime() > (now.getTime() - 60000);
  }, 'Deadline deve ser uma data futura');

/**
 * Validador para deadline com regras de negócio
 */
export const deadlineValidator = z
  .string()
  .datetime('Data deve estar no formato ISO 8601')
  .refine((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    
    // Deve ser futura (margem de 1 minuto)
    const isAfterNow = date.getTime() > (now.getTime() - 60000);
    // Não deve ser mais de 5 anos no futuro
    const isBeforeFiveYears = date.getTime() < fiveYearsFromNow.getTime();
    
    return isAfterNow && isBeforeFiveYears;
  }, 'Deadline deve ser uma data futura dentro dos próximos 5 anos');

/**
 * Funções utilitárias para validação
 */
export function isValidBase64(content: string): boolean {
  try {
    return base64Validator.safeParse(content).success;
  } catch {
    return false;
  }
}

export function isValidMimeType(mimeType: string): boolean {
  try {
    return mimeTypeValidator.safeParse(mimeType).success;
  } catch {
    return false;
  }
}

export function isSafeName(name: string): boolean {
  try {
    return safeNameValidator.safeParse(name).success;
  } catch {
    return false;
  }
}

export function isSafeDescription(description: string): boolean {
  try {
    return safeDescriptionValidator.safeParse(description).success;
  } catch {
    return false;
  }
}

export function isSafeUrl(url: string): boolean {
  try {
    return safeUrlValidator.safeParse(url).success;
  } catch {
    return false;
  }
}

/**
 * Valida se uma data é uma deadline válida (futura)
 */
export function isValidDeadline(dateString: string): boolean {
  try {
    return deadlineValidator.safeParse(dateString).success;
  } catch {
    return false;
  }
}

/**
 * Valida se uma data é futura
 */
export function isFutureDate(dateString: string): boolean {
  try {
    return futureDateValidator.safeParse(dateString).success;
  } catch {
    return false;
  }
}

/**
 * Gera uma data de deadline padrão (30 dias no futuro)
 */
export function getDefaultDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

/**
 * Verifica se a deadline está próxima (menos de X horas)
 */
export function isDeadlineNear(deadline: string, hoursThreshold: number = 24): boolean {
  try {
    const date = new Date(deadline);
    const now = new Date();
    const thresholdMs = hoursThreshold * 60 * 60 * 1000;

    return (date.getTime() - now.getTime()) <= thresholdMs;
  } catch {
    return false;
  }
}

/**
 * ============================================
 * FILE UPLOAD VALIDATORS (Seção 5.3)
 * ============================================
 */

/**
 * Tamanhos máximos de arquivo (em bytes)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_LETTERHEAD_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * MIME types permitidos por tipo de upload
 */
export const MIME_TYPES = {
  PDF: ['application/pdf'],
  DOCX: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
  CERTIFICATE: [
    'application/x-pkcs12',
    'application/x-pkcs7-certificates',
    'application/pkcs12'
  ],
  ALL: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/x-pkcs12',
    'application/x-pkcs7-certificates',
    'application/pkcs12'
  ]
};

/**
 * Obtém o tamanho de um arquivo (File, Buffer ou Blob)
 */
export function getFileSize(file: File | Buffer | Blob): number {
  if (file instanceof Buffer) {
    return file.length;
  }
  if (file instanceof Blob || 'size' in file) {
    return (file as Blob | File).size;
  }
  return 0;
}

/**
 * Obtém o MIME type de um arquivo
 */
export function getFileMimeType(file: File | Buffer | Blob): string | null {
  if ('type' in file && typeof file.type === 'string') {
    return file.type;
  }
  return null;
}

/**
 * Valida o tamanho de um arquivo
 * @param file - Arquivo (File, Buffer ou Blob)
 * @param maxSize - Tamanho máximo em bytes (padrão: 50MB)
 * @returns true se válido
 * @throws Error se inválido
 */
export function validateFileSize(
  file: File | Buffer | Blob,
  maxSize: number = MAX_FILE_SIZE
): boolean {
  const size = getFileSize(file);

  if (size === 0) {
    throw new Error('Arquivo vazio');
  }

  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Arquivo muito grande: ${fileSizeMB}MB. Tamanho máximo: ${maxSizeMB}MB`
    );
  }

  return true;
}

/**
 * Valida o MIME type de um arquivo
 * @param file - Arquivo (File ou Blob com type)
 * @param allowedTypes - Array de MIME types permitidos
 * @returns true se válido
 * @throws Error se inválido
 */
export function validateFileMimeType(
  file: File | Buffer | Blob,
  allowedTypes: string[]
): boolean {
  const mimeType = getFileMimeType(file);

  // Se é Buffer, não podemos validar MIME type
  if (!mimeType) {
    // Para Buffer, apenas avisa (não bloqueia)
    console.warn('[SDK] Cannot validate MIME type for Buffer. Validation skipped.');
    return true;
  }

  if (!allowedTypes.includes(mimeType)) {
    throw new Error(
      `Tipo de arquivo não suportado: ${mimeType}. Tipos permitidos: ${allowedTypes.join(', ')}`
    );
  }

  return true;
}

/**
 * Valida arquivo para upload de documento (PDF/DOCX)
 */
export function validateDocumentFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_FILE_SIZE);
  validateFileMimeType(file, [...MIME_TYPES.PDF, ...MIME_TYPES.DOCX]);
  return true;
}

/**
 * Valida arquivo para upload de template DOCX
 */
export function validateTemplateFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_FILE_SIZE);
  validateFileMimeType(file, MIME_TYPES.DOCX);
  return true;
}

/**
 * Valida arquivo para upload de imagem de autenticação
 */
export function validateAuthDocumentFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_FILE_SIZE);
  validateFileMimeType(file, MIME_TYPES.IMAGE);
  return true;
}

/**
 * Valida arquivo para upload de letterhead (PNG)
 */
export function validateLetterheadFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_LETTERHEAD_SIZE);
  validateFileMimeType(file, ['image/png']);
  return true;
}

/**
 * Tamanho máximo para logo (5MB)
 */
export const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB

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
export function validateLogoFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_LOGO_SIZE);
  validateFileMimeType(file, ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']);
  return true;
}

/**
 * Valida arquivo para upload de certificado digital (P12/PFX)
 */
export function validateCertificateFile(file: File | Buffer | Blob): boolean {
  validateFileSize(file, MAX_FILE_SIZE);
  validateFileMimeType(file, MIME_TYPES.CERTIFICATE);
  return true;
}