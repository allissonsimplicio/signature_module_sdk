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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'application/octet-stream'
    ];
    return supportedTypes.includes(mimeType);
  }, 'Tipo de arquivo não suportado');

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