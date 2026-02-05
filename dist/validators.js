"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LOGO_SIZE = exports.MIME_TYPES = exports.MAX_LETTERHEAD_SIZE = exports.MAX_FILE_SIZE = exports.deadlineValidator = exports.futureDateValidator = exports.mimeTypeValidator = exports.fileContentValidator = exports.base64Validator = exports.safeUrlValidator = exports.safeDescriptionValidator = exports.safeNameValidator = void 0;
exports.isValidBase64 = isValidBase64;
exports.isValidMimeType = isValidMimeType;
exports.isSafeName = isSafeName;
exports.isSafeDescription = isSafeDescription;
exports.isSafeUrl = isSafeUrl;
exports.isValidDeadline = isValidDeadline;
exports.isFutureDate = isFutureDate;
exports.getDefaultDeadline = getDefaultDeadline;
exports.isDeadlineNear = isDeadlineNear;
exports.getFileSize = getFileSize;
exports.getFileMimeType = getFileMimeType;
exports.validateFileSize = validateFileSize;
exports.validateFileMimeType = validateFileMimeType;
exports.validateDocumentFile = validateDocumentFile;
exports.validateTemplateFile = validateTemplateFile;
exports.validateAuthDocumentFile = validateAuthDocumentFile;
exports.validateLetterheadFile = validateLetterheadFile;
exports.validateLogoFile = validateLogoFile;
exports.validateCertificateFile = validateCertificateFile;
const zod_1 = require("zod");
/**
 * Validador para nomes seguros (sem caracteres especiais perigosos)
 */
exports.safeNameValidator = zod_1.z
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
exports.safeDescriptionValidator = zod_1.z
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
exports.safeUrlValidator = zod_1.z
    .string()
    .url('URL inválida')
    .refine((url) => {
    try {
        const urlObj = new URL(url);
        // Permite apenas HTTP e HTTPS
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    }
    catch {
        return false;
    }
}, 'URL deve usar protocolo HTTP ou HTTPS');
/**
 * Validador para conteúdo base64
 */
exports.base64Validator = zod_1.z
    .string()
    .refine((content) => {
    try {
        // Verifica se é base64 válido
        const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
        return base64Pattern.test(content) && content.length % 4 === 0;
    }
    catch {
        return false;
    }
}, 'Conteúdo base64 inválido');
/**
 * Validador para conteúdo de arquivo
 */
exports.fileContentValidator = zod_1.z.union([
    exports.base64Validator,
    zod_1.z.string().url('URL de arquivo inválida')
]);
/**
 * Validador para tipos MIME
 */
exports.mimeTypeValidator = zod_1.z
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
exports.futureDateValidator = zod_1.z
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
exports.deadlineValidator = zod_1.z
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
function isValidBase64(content) {
    try {
        return exports.base64Validator.safeParse(content).success;
    }
    catch {
        return false;
    }
}
function isValidMimeType(mimeType) {
    try {
        return exports.mimeTypeValidator.safeParse(mimeType).success;
    }
    catch {
        return false;
    }
}
function isSafeName(name) {
    try {
        return exports.safeNameValidator.safeParse(name).success;
    }
    catch {
        return false;
    }
}
function isSafeDescription(description) {
    try {
        return exports.safeDescriptionValidator.safeParse(description).success;
    }
    catch {
        return false;
    }
}
function isSafeUrl(url) {
    try {
        return exports.safeUrlValidator.safeParse(url).success;
    }
    catch {
        return false;
    }
}
/**
 * Valida se uma data é uma deadline válida (futura)
 */
function isValidDeadline(dateString) {
    try {
        return exports.deadlineValidator.safeParse(dateString).success;
    }
    catch {
        return false;
    }
}
/**
 * Valida se uma data é futura
 */
function isFutureDate(dateString) {
    try {
        return exports.futureDateValidator.safeParse(dateString).success;
    }
    catch {
        return false;
    }
}
/**
 * Gera uma data de deadline padrão (30 dias no futuro)
 */
function getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
}
/**
 * Verifica se a deadline está próxima (menos de X horas)
 */
function isDeadlineNear(deadline, hoursThreshold = 24) {
    try {
        const date = new Date(deadline);
        const now = new Date();
        const thresholdMs = hoursThreshold * 60 * 60 * 1000;
        return (date.getTime() - now.getTime()) <= thresholdMs;
    }
    catch {
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
exports.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
exports.MAX_LETTERHEAD_SIZE = 10 * 1024 * 1024; // 10MB
/**
 * MIME types permitidos por tipo de upload
 */
exports.MIME_TYPES = {
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
function getFileSize(file) {
    if (file instanceof Buffer) {
        return file.length;
    }
    if (file instanceof Blob || 'size' in file) {
        return file.size;
    }
    return 0;
}
/**
 * Obtém o MIME type de um arquivo
 */
function getFileMimeType(file) {
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
function validateFileSize(file, maxSize = exports.MAX_FILE_SIZE) {
    const size = getFileSize(file);
    if (size === 0) {
        throw new Error('Arquivo vazio');
    }
    if (size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
        throw new Error(`Arquivo muito grande: ${fileSizeMB}MB. Tamanho máximo: ${maxSizeMB}MB`);
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
function validateFileMimeType(file, allowedTypes) {
    const mimeType = getFileMimeType(file);
    // Se é Buffer, não podemos validar MIME type
    if (!mimeType) {
        // Para Buffer, apenas avisa (não bloqueia)
        console.warn('[SDK] Cannot validate MIME type for Buffer. Validation skipped.');
        return true;
    }
    if (!allowedTypes.includes(mimeType)) {
        throw new Error(`Tipo de arquivo não suportado: ${mimeType}. Tipos permitidos: ${allowedTypes.join(', ')}`);
    }
    return true;
}
/**
 * Valida arquivo para upload de documento (PDF/DOCX)
 */
function validateDocumentFile(file) {
    validateFileSize(file, exports.MAX_FILE_SIZE);
    validateFileMimeType(file, [...exports.MIME_TYPES.PDF, ...exports.MIME_TYPES.DOCX]);
    return true;
}
/**
 * Valida arquivo para upload de template DOCX
 */
function validateTemplateFile(file) {
    validateFileSize(file, exports.MAX_FILE_SIZE);
    validateFileMimeType(file, exports.MIME_TYPES.DOCX);
    return true;
}
/**
 * Valida arquivo para upload de imagem de autenticação
 */
function validateAuthDocumentFile(file) {
    validateFileSize(file, exports.MAX_FILE_SIZE);
    validateFileMimeType(file, exports.MIME_TYPES.IMAGE);
    return true;
}
/**
 * Valida arquivo para upload de letterhead (PNG)
 */
function validateLetterheadFile(file) {
    validateFileSize(file, exports.MAX_LETTERHEAD_SIZE);
    validateFileMimeType(file, ['image/png']);
    return true;
}
/**
 * Tamanho máximo para logo (5MB)
 */
exports.MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
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
function validateLogoFile(file) {
    validateFileSize(file, exports.MAX_LOGO_SIZE);
    validateFileMimeType(file, ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']);
    return true;
}
/**
 * Valida arquivo para upload de certificado digital (P12/PFX)
 */
function validateCertificateFile(file) {
    validateFileSize(file, exports.MAX_FILE_SIZE);
    validateFileMimeType(file, exports.MIME_TYPES.CERTIFICATE);
    return true;
}
//# sourceMappingURL=validators.js.map