import { z } from 'zod';
import { safeNameValidator, mimeTypeValidator, base64Validator } from '../validators';

// Tipos de status comuns
export type EnvelopeStatus = 'draft' | 'running' | 'completed' | 'canceled' | 'closed';
export type DocumentStatus = 'draft' | 'running' | 'completed' | 'canceled' | 'closed';
export type SignerStatus = 'pending' | 'signed' | 'rejected' | 'canceled';

// Métodos de autenticação disponíveis
export type AuthenticationMethod = 
  | 'email_token' 
  | 'email_otp'
  | 'whatsapp_token' 
  | 'sms_token'
  | 'sms_otp'
  | 'ip_address'
  | 'geolocation'
  | 'official_document'
  | 'selfie_with_document'
  | 'address_proof';

// Tipos de qualificação
export type QualificationType = 'parte' | 'testemunha';

// Tipos de documento
export type DocumentType = 'cpf' | 'cnpj' | 'rg' | 'passport' | 'other';

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Schema Zod para validação de resposta da API
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

// Configuração do cliente
export interface ClientConfig {
  baseURL: string;
  apiToken: string;
  timeout?: number;
}

// Metadados de paginação
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Resposta paginada
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

// Coordenadas geográficas
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Informações de arquivo
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  content?: string; // Base64 encoded content
}

// Schema Zod para FileInfo
export const FileInfoSchema = z.object({
  name: safeNameValidator,
  size: z.number().min(0),
  type: mimeTypeValidator,
  content: base64Validator.optional(),
});

// Timestamps padrão
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// Filtros de busca comuns
export interface BaseFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}