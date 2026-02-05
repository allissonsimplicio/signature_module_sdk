import { z } from 'zod';

/**
 * FASE 7: Document Templates - Templates DOCX com Variáveis
 */

// Template de documento DOCX
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  s3Key: string;
  s3Bucket: string;
  contentType: string;
  fileSize: number;

  // Categorização e organização
  category?: string;
  tags?: string[];
  isPublic?: boolean; // Visível para outros usuários da organização
  isActive?: boolean; // Template ativo/desativado

  // Variáveis extraídas do DOCX automaticamente
  extractedVariables: string[]; // Ex: ["[[CLIENTE_NOME]]", "[[ADVOGADO_OAB]]"]

  // Schema de mapeamento configurado
  variableSchema?: VariableSchema;

  // Template configurado?
  isConfigured: boolean;

  // Roles necessários
  requiredRoles?: TemplateRole[];

  // Estatísticas de uso
  usageCount?: number;
  lastUsedAt?: string;

  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Schema de mapeamento de variáveis
export interface VariableSchema {
  [variable: string]: VariableMapping;
}

// Transformações disponíveis para variáveis
export type VariableTransformation =
  | 'formatCPF'        // 12345678900 → 123.456.789-00
  | 'formatCNPJ'       // 12345678000100 → 12.345.678/0001-00
  | 'formatDate'       // ISO → dd/MM/yyyy
  | 'formatCurrency'   // 1234.56 → R$ 1.234,56
  | 'uppercase'        // texto → TEXTO
  | 'lowercase'        // TEXTO → texto
  | string;            // Custom transformations like "formatDate:DD/MM/YYYY"

// Mapeamento de uma variável
export interface VariableMapping {
  source: 'signer' | 'document' | 'system';
  role?: string; // Obrigatório se source = 'signer'
  field: string; // Ex: 'name', 'documentNumber', 'customFields.oab_numero'
  required: boolean;
  transform?: VariableTransformation; // Ex: "formatCPF", "formatDate:DD/MM/YYYY"
  confidence?: number; // 0-1 (sugestão automática de mapeamento)
}

// Role necessário no template
export interface TemplateRole {
  role: string; // Ex: "CONTRATANTE"
  displayName: string; // Ex: "Cliente"
  signingOrder: number;
  signatureFieldPosition: {
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

// Input para upload de template
export interface UploadTemplateDto {
  file: File | Buffer | Blob; // DOCX
}

// Input para configurar template
export interface ConfigureTemplateDto {
  variableSchema: VariableSchema;
  requiredRoles: TemplateRole[];
}

// Input para gerar documento a partir de template
export interface GenerateDocumentDto {
  envelopeId: string;
  signers: CreateSignerForTemplateDto[];
  documentCustomFields?: Record<string, any>;
}

// Signatário para template (com role obrigatório)
export interface CreateSignerForTemplateDto {
  role: string; // Obrigatório! Ex: "CONTRATANTE"
  name: string;
  email: string;
  documentNumber?: string;
  phone?: string;
  customFields?: Record<string, any>;
  address?: SignerAddress;
}

export interface SignerAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  full?: string;
}

// Resposta da geração de documento
export interface GenerateDocumentResponse {
  document: any; // Document type
  signers: any[]; // Signer[] type
  variablesUsed: Record<string, string>;
}

// Input para atualizar template
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  variableSchema?: VariableSchema;
  requiredRoles?: TemplateRole[];
}

// Filtros para busca de templates
export interface TemplateFilters {
  name?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  isActive?: boolean;
  ownerId?: string;
  createdFrom?: string; // ISO date
  createdTo?: string; // ISO date
  lastUsedFrom?: string; // ISO date
  lastUsedTo?: string; // ISO date
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

// Schemas Zod
export const DocumentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  s3Key: z.string(),
  s3Bucket: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  extractedVariables: z.array(z.string()),
  variableSchema: z.record(z.string(), z.any()).optional(),
  isConfigured: z.boolean(),
  requiredRoles: z.array(z.any()).optional(),
  usageCount: z.number().optional(),
  lastUsedAt: z.string().datetime().optional(),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UpdateTemplateDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  variableSchema: z.record(z.string(), z.any()).optional(),
  requiredRoles: z.array(z.any()).optional(),
});

export const TemplateFiltersSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  ownerId: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  lastUsedFrom: z.string().datetime().optional(),
  lastUsedTo: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'usageCount', 'lastUsedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
