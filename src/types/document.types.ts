import { z } from 'zod';
import { DocumentStatus, Timestamps } from './common.types';

// Input para criação de documento via upload
export interface DocumentUploadInput {
  name: string;
  content: string; // Base64 encoded file content
  content_type?: string;
  description?: string;
  custom_fields?: Record<string, any>;
}

// Input para criação de documento via template
export interface DocumentFromTemplateInput {
  template_id: string;
  name?: string; // Se não fornecido, usa o nome do template
  variables?: Record<string, any>; // Variáveis para substituição no template
  description?: string;
  custom_fields?: Record<string, any>;
}

// Schema Zod para DocumentUploadInput
export const DocumentUploadInputSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().min(1),
  content_type: z.string().optional(),
  description: z.string().max(1000).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

// Schema Zod para DocumentFromTemplateInput
export const DocumentFromTemplateInputSchema = z.object({
  template_id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  description: z.string().max(1000).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

// Documento completo retornado pela API
export interface Document extends Timestamps {
  id: string;
  envelope_id: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  content_type: string;
  file_size: number;
  page_count: number;
  download_url?: string;
  preview_url?: string;
  template_id?: string;
  template_variables?: Record<string, any>;
  custom_fields?: Record<string, any>;
  signature_fields: SignatureField[];
  qualification_requirements: QualificationRequirement[];
  is_signed: boolean;
  signed_at?: string;
  signed_by_count: number;
  pending_signatures_count: number;
}

// Campo de assinatura no documento
export interface SignatureField {
  id: string;
  signer_id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initial' | 'text' | 'date' | 'checkbox';
  required: boolean;
  value?: string;
  signed_at?: string;
  signature_image_url?: string;
}

// Requisito de qualificação para o documento
export interface QualificationRequirement {
  id: string;
  document_id: string;
  signer_id: string;
  qualification_type: 'parte' | 'testemunha';
  description?: string;
  is_satisfied: boolean;
  satisfied_at?: string;
}

// Schema Zod para Document
export const DocumentSchema = z.object({
  id: z.string(),
  envelope_id: z.string(),
  name: safeNameValidator,
  description: safeDescriptionValidator.optional(),
  status: z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
  content_type: mimeTypeValidator,
  file_size: z.number().min(0),
  page_count: z.number().min(1),
  download_url: z.string().url().optional(),
  preview_url: z.string().url().optional(),
  template_id: z.string().optional(),
  template_variables: z.record(z.string(), z.any()).optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  signature_fields: z.array(z.object({
    id: z.string(),
    signer_id: z.string(),
    page: z.number().min(1),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1),
    type: z.enum(['signature', 'initial', 'text', 'date', 'checkbox']),
    required: z.boolean(),
    value: z.string().optional(),
    signed_at: z.string().datetime().optional(),
    signature_image_url: z.string().url().optional(),
  })),
  qualification_requirements: z.array(z.object({
    id: z.string(),
    document_id: z.string(),
    signer_id: z.string(),
    qualification_type: z.enum(['parte', 'testemunha']),
    description: z.string().optional(),
    is_satisfied: z.boolean(),
    satisfied_at: z.string().datetime().optional(),
  })),
  is_signed: z.boolean(),
  signed_at: z.string().datetime().optional(),
  signed_by_count: z.number().min(0),
  pending_signatures_count: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Filtros para busca de documentos
export interface DocumentFilters {
  envelope_id?: string;
  status?: DocumentStatus | DocumentStatus[];
  name?: string;
  template_id?: string;
  is_signed?: boolean;
  created_from?: string; // ISO date
  created_to?: string; // ISO date
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'file_size' | 'page_count';
  sort_order?: 'asc' | 'desc';
}

// Informações de upload de arquivo
export interface FileUploadInfo {
  file_path: string;
  name?: string;
  content_type?: string;
}

// Resposta de upload de documento
export interface DocumentUploadResponse {
  document: Document;
  upload_info: {
    original_filename: string;
    file_size: number;
    content_type: string;
    upload_duration_ms: number;
  };
}