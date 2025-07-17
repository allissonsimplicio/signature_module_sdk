// Exporta a classe principal
export { SignatureClient } from './SignatureClient';

// Exporta a classe de erro
export { ApiError } from './ApiError';

// Exporta todos os tipos
export * from './types/common.types';
export * from './types/envelope.types';
export * from './types/document.types';
export { 
  Signer, 
  SignerInput, 
  SignerAddress, 
  NotificationPreferences,
  AuthenticationRequirement,
  AuthenticationConfiguration,
  AuthenticationEvidence,
  AddAuthenticationRequirementInput,
  AddQualificationRequirementInput,
  SignerFilters,
  SignatureEvidence
} from './types/signer.types';
export * from './types/template.types';
export * from './types/event.types';

// Exporta versão do SDK
export const SDK_VERSION = '1.0.0';

// Exporta configurações padrão
export const DEFAULT_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Factory function para criar uma instância do SignatureClient
 * com configurações padrão
 */
export function createSignatureClient(baseURL: string, apiToken: string) {
  const { SignatureClient } = require('./SignatureClient');
  return new SignatureClient({
    baseURL,
    apiToken,
    ...DEFAULT_CONFIG,
  });
}

/**
 * Utilitários para validação
 */
export const ValidationUtils = {
  /**
   * Valida se um email é válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida se um telefone está no formato E.164
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Valida se um CPF é válido
   */
  isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  },

  /**
   * Valida se um CNPJ é válido
   */
  isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validação do algoritmo do CNPJ
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cleanCNPJ.charAt(13));
  },

  /**
   * Valida se uma URL é válida
   */
  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida se uma cor hex é válida
   */
  isValidHexColor(color: string): boolean {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(color);
  },
};

/**
 * Utilitários para formatação
 */
export const FormatUtils = {
  /**
   * Formata CPF
   */
  formatCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  /**
   * Formata CNPJ
   */
  formatCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  /**
   * Formata telefone brasileiro
   */
  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  /**
   * Formata data para ISO string
   */
  formatDateToISO(date: Date): string {
    return date.toISOString();
  },

  /**
   * Formata bytes para formato legível
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
};

/**
 * Constantes úteis
 */
export const Constants = {
  // Tipos de arquivo suportados
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
  ],

  // Extensões de arquivo suportadas
  SUPPORTED_FILE_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],

  // Tamanho máximo de arquivo (50MB)
  MAX_FILE_SIZE: 50 * 1024 * 1024,

  // Métodos de autenticação disponíveis
  AUTHENTICATION_METHODS: [
    'email_token',
    'whatsapp_token',
    'sms_token',
    'ip_address',
    'geolocation',
    'official_document',
    'selfie_with_document',
    'address_proof',
  ] as const,

  // Tipos de qualificação
  QUALIFICATION_TYPES: ['parte', 'testemunha'] as const,

  // Status de envelope
  ENVELOPE_STATUSES: ['draft', 'running', 'completed', 'canceled', 'closed'] as const,

  // Status de documento
  DOCUMENT_STATUSES: ['draft', 'running', 'completed', 'canceled', 'closed'] as const,

  // Status de signatário
  SIGNER_STATUSES: ['pending', 'signed', 'rejected', 'canceled'] as const,
};