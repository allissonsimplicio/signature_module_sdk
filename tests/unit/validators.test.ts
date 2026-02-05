/**
 * Testes Unitários: Validators
 *
 * Testa todas as funções de validação do SDK que são executadas
 * no lado do cliente antes de enviar dados para a API.
 */

import {
  // Validators Zod
  safeNameValidator,
  safeDescriptionValidator,
  safeUrlValidator,
  base64Validator,
  mimeTypeValidator,
  futureDateValidator,
  deadlineValidator,

  // Utility functions
  isValidBase64,
  isValidMimeType,
  isSafeName,
  isSafeDescription,
  isSafeUrl,
  isValidDeadline,
  isFutureDate,
  getDefaultDeadline,
  isDeadlineNear,

  // File validators
  getFileSize,
  getFileMimeType,
  validateFileSize,
  validateFileMimeType,
  validateDocumentFile,
  validateTemplateFile,
  validateAuthDocumentFile,
  validateLetterheadFile,
  validateCertificateFile,

  // Constants
  MAX_FILE_SIZE,
  MAX_LETTERHEAD_SIZE,
  MIME_TYPES,
} from '../../src/validators';

describe('Validators', () => {

  // ==========================================
  // Safe Name Validator
  // ==========================================
  describe('safeNameValidator', () => {
    it('should accept valid names', () => {
      const validNames = [
        'João da Silva',
        'Maria Santos',
        'Pedro Oliveira',
        'Ana Coordenadora',
      ];

      validNames.forEach(name => {
        expect(safeNameValidator.safeParse(name).success).toBe(true);
      });
    });

    it('should reject names with dangerous characters', () => {
      const dangerousNames = [
        '<script>alert("xss")</script>',
        'DROP TABLE users;--',
        'SELECT * FROM users',
        'name@example.com',
        'name$price',
        'test%value',
      ];

      dangerousNames.forEach(name => {
        expect(safeNameValidator.safeParse(name).success).toBe(false);
      });
    });

    it('should reject empty names', () => {
      expect(safeNameValidator.safeParse('').success).toBe(false);
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(safeNameValidator.safeParse(longName).success).toBe(false);
    });
  });

  // ==========================================
  // Safe Description Validator
  // ==========================================
  describe('safeDescriptionValidator', () => {
    it('should accept valid descriptions', () => {
      const validDescriptions = [
        'Contrato de prestação de serviços',
        'Documento importante para assinatura',
        'Descrição com números 123 e pontuação!',
      ];

      validDescriptions.forEach(desc => {
        expect(safeDescriptionValidator.safeParse(desc).success).toBe(true);
      });
    });

    it('should reject descriptions with script tags', () => {
      const dangerousDescriptions = [
        '<script>alert("xss")</script>',
        '<iframe src="malicious.com"></iframe>',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
      ];

      dangerousDescriptions.forEach(desc => {
        expect(safeDescriptionValidator.safeParse(desc).success).toBe(false);
      });
    });

    it('should reject descriptions longer than 500 characters', () => {
      const longDesc = 'a'.repeat(501);
      expect(safeDescriptionValidator.safeParse(longDesc).success).toBe(false);
    });
  });

  // ==========================================
  // Safe URL Validator
  // ==========================================
  describe('safeUrlValidator', () => {
    it('should accept valid HTTP/HTTPS URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/webhook',
      ];

      validUrls.forEach(url => {
        expect(safeUrlValidator.safeParse(url).success).toBe(true);
      });
    });

    it('should reject non-HTTP protocols', () => {
      const invalidUrls = [
        'ftp://example.com',
        'file:///etc/passwd',
        'javascript:alert(1)',
        'data:text/html,<script>',
      ];

      invalidUrls.forEach(url => {
        expect(safeUrlValidator.safeParse(url).success).toBe(false);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com', // Missing protocol
        '',
      ];

      invalidUrls.forEach(url => {
        expect(safeUrlValidator.safeParse(url).success).toBe(false);
      });
    });
  });

  // ==========================================
  // Base64 Validator
  // ==========================================
  describe('base64Validator', () => {
    it('should accept valid base64 strings', () => {
      const validBase64 = [
        'SGVsbG8gV29ybGQ=',
        'VGVzdA==',
        'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=',
      ];

      validBase64.forEach(str => {
        expect(base64Validator.safeParse(str).success).toBe(true);
      });
    });

    it('should reject invalid base64 strings', () => {
      const invalidBase64 = [
        'abc@def', // Invalid characters
        'SGVsbG8', // Missing padding (invalid length)
      ];

      invalidBase64.forEach(str => {
        expect(base64Validator.safeParse(str).success).toBe(false);
      });
    });
  });

  // ==========================================
  // MIME Type Validator
  // ==========================================
  describe('mimeTypeValidator', () => {
    it('should accept supported MIME types', () => {
      const supportedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-pkcs12',
      ];

      supportedTypes.forEach(type => {
        expect(mimeTypeValidator.safeParse(type).success).toBe(true);
      });
    });

    it('should reject unsupported MIME types', () => {
      const unsupportedTypes = [
        'video/mp4',
        'audio/mpeg',
        'application/zip',
        'text/html',
      ];

      unsupportedTypes.forEach(type => {
        expect(mimeTypeValidator.safeParse(type).success).toBe(false);
      });
    });
  });

  // ==========================================
  // Deadline Validators
  // ==========================================
  describe('futureDateValidator', () => {
    it('should accept future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      expect(futureDateValidator.safeParse(futureDate).success).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(futureDateValidator.safeParse(pastDate).success).toBe(false);
    });

    it('should accept dates within 1 minute margin', () => {
      const nowDate = new Date().toISOString();
      expect(futureDateValidator.safeParse(nowDate).success).toBe(true);
    });
  });

  describe('deadlineValidator', () => {
    it('should accept dates within 5 years', () => {
      const validDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      expect(deadlineValidator.safeParse(validDate).success).toBe(true);
    });

    it('should reject dates more than 5 years in the future', () => {
      const farFutureDate = new Date(Date.now() + 6 * 365 * 24 * 60 * 60 * 1000).toISOString();
      expect(deadlineValidator.safeParse(farFutureDate).success).toBe(false);
    });

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(deadlineValidator.safeParse(pastDate).success).toBe(false);
    });
  });

  // ==========================================
  // Utility Functions
  // ==========================================
  describe('Utility Functions', () => {
    describe('isValidBase64', () => {
      it('should return true for valid base64', () => {
        expect(isValidBase64('SGVsbG8=')).toBe(true);
      });

      it('should return false for invalid base64', () => {
        expect(isValidBase64('Hello!')).toBe(false);
      });
    });

    describe('isValidMimeType', () => {
      it('should return true for supported types', () => {
        expect(isValidMimeType('application/pdf')).toBe(true);
      });

      it('should return false for unsupported types', () => {
        expect(isValidMimeType('video/mp4')).toBe(false);
      });
    });

    describe('isSafeName', () => {
      it('should return true for safe names', () => {
        expect(isSafeName('João Silva')).toBe(true);
      });

      it('should return false for dangerous names', () => {
        expect(isSafeName('<script>alert()</script>')).toBe(false);
      });
    });

    describe('getDefaultDeadline', () => {
      it('should return date 30 days in the future', () => {
        const deadline = getDefaultDeadline();
        const deadlineDate = new Date(deadline);
        const expectedDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Allow 1 second difference
        expect(Math.abs(deadlineDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
      });
    });

    describe('isDeadlineNear', () => {
      it('should return true for deadline within threshold', () => {
        const nearDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
        expect(isDeadlineNear(nearDeadline, 24)).toBe(true);
      });

      it('should return false for deadline beyond threshold', () => {
        const farDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours
        expect(isDeadlineNear(farDeadline, 24)).toBe(false);
      });
    });
  });

  // ==========================================
  // File Size and MIME Type Functions
  // ==========================================
  describe('File Functions', () => {
    describe('getFileSize', () => {
      it('should return size for Buffer', () => {
        const buffer = Buffer.alloc(1024);
        expect(getFileSize(buffer)).toBe(1024);
      });

      it('should return size for Blob', () => {
        const blob = new Blob(['test'], { type: 'text/plain' });
        expect(getFileSize(blob)).toBe(4);
      });
    });

    describe('getFileMimeType', () => {
      it('should return MIME type for File', () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        expect(getFileMimeType(file)).toBe('text/plain');
      });

      it('should return null for Buffer', () => {
        const buffer = Buffer.alloc(10);
        expect(getFileMimeType(buffer)).toBeNull();
      });
    });
  });

  // ==========================================
  // File Validation Functions
  // ==========================================
  describe('File Validation', () => {
    describe('validateFileSize', () => {
      it('should accept files within size limit', () => {
        const smallFile = Buffer.alloc(1024); // 1KB
        expect(() => validateFileSize(smallFile, MAX_FILE_SIZE)).not.toThrow();
      });

      it('should reject files exceeding size limit', () => {
        const largeFile = Buffer.alloc(51 * 1024 * 1024); // 51MB
        expect(() => validateFileSize(largeFile, MAX_FILE_SIZE)).toThrow('Arquivo muito grande');
      });

      it('should reject empty files', () => {
        const emptyFile = Buffer.alloc(0);
        expect(() => validateFileSize(emptyFile)).toThrow('Arquivo vazio');
      });
    });

    describe('validateFileMimeType', () => {
      it('should accept files with allowed MIME types', () => {
        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        expect(() => validateFileMimeType(file, ['application/pdf'])).not.toThrow();
      });

      it('should reject files with disallowed MIME types', () => {
        const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
        expect(() => validateFileMimeType(file, ['application/pdf'])).toThrow('Tipo de arquivo não suportado');
      });

      it('should not throw for Buffer (cannot validate)', () => {
        const buffer = Buffer.alloc(10);
        expect(() => validateFileMimeType(buffer, ['application/pdf'])).not.toThrow();
      });
    });

    describe('validateDocumentFile', () => {
      it('should accept PDF files', () => {
        const pdfFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
        expect(() => validateDocumentFile(pdfFile)).not.toThrow();
      });

      it('should accept DOCX files', () => {
        const docxFile = new File(['test'], 'doc.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        expect(() => validateDocumentFile(docxFile)).not.toThrow();
      });

      it('should reject non-document files', () => {
        const imageFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
        expect(() => validateDocumentFile(imageFile)).toThrow('Tipo de arquivo não suportado');
      });
    });

    describe('validateTemplateFile', () => {
      it('should accept DOCX files', () => {
        const docxFile = new File(['test'], 'template.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        expect(() => validateTemplateFile(docxFile)).not.toThrow();
      });

      it('should reject non-DOCX files', () => {
        const pdfFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
        expect(() => validateTemplateFile(pdfFile)).toThrow('Tipo de arquivo não suportado');
      });
    });

    describe('validateAuthDocumentFile', () => {
      it('should accept JPEG files', () => {
        const jpegFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
        expect(() => validateAuthDocumentFile(jpegFile)).not.toThrow();
      });

      it('should accept PNG files', () => {
        const pngFile = new File(['test'], 'photo.png', { type: 'image/png' });
        expect(() => validateAuthDocumentFile(pngFile)).not.toThrow();
      });

      it('should reject non-image files', () => {
        const pdfFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
        expect(() => validateAuthDocumentFile(pdfFile)).toThrow('Tipo de arquivo não suportado');
      });

      it('should reject files larger than 50MB', () => {
        // Create a mock file that reports large size
        const largeBuffer = Buffer.alloc(51 * 1024 * 1024);
        expect(() => validateAuthDocumentFile(largeBuffer)).toThrow('Arquivo muito grande');
      });
    });

    describe('validateLetterheadFile', () => {
      it('should accept PNG files within size limit', () => {
        const pngFile = new File(['test'], 'letterhead.png', { type: 'image/png' });
        expect(() => validateLetterheadFile(pngFile)).not.toThrow();
      });

      it('should reject non-PNG files', () => {
        const jpegFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
        expect(() => validateLetterheadFile(jpegFile)).toThrow('Tipo de arquivo não suportado');
      });

      it('should reject files larger than 10MB', () => {
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
        expect(() => validateLetterheadFile(largeBuffer)).toThrow('Arquivo muito grande');
      });
    });

    describe('validateCertificateFile', () => {
      it('should accept P12 files', () => {
        const p12File = new File(['test'], 'cert.p12', { type: 'application/x-pkcs12' });
        expect(() => validateCertificateFile(p12File)).not.toThrow();
      });

      it('should reject non-certificate files', () => {
        const pdfFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
        expect(() => validateCertificateFile(pdfFile)).toThrow('Tipo de arquivo não suportado');
      });
    });
  });

  // ==========================================
  // Constants
  // ==========================================
  describe('Constants', () => {
    it('should have correct MAX_FILE_SIZE', () => {
      expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024); // 50MB
    });

    it('should have correct MAX_LETTERHEAD_SIZE', () => {
      expect(MAX_LETTERHEAD_SIZE).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should have MIME_TYPES object with correct structure', () => {
      expect(MIME_TYPES).toHaveProperty('PDF');
      expect(MIME_TYPES).toHaveProperty('DOCX');
      expect(MIME_TYPES).toHaveProperty('IMAGE');
      expect(MIME_TYPES).toHaveProperty('CERTIFICATE');
      expect(MIME_TYPES).toHaveProperty('ALL');

      expect(MIME_TYPES.PDF).toContain('application/pdf');
      expect(MIME_TYPES.IMAGE).toContain('image/jpeg');
      expect(MIME_TYPES.IMAGE).toContain('image/png');
    });
  });
});
