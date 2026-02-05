import { z } from 'zod';

// Enum para os tipos de campos de assinatura - API format (lowercase)
// Nota: O banco usa UPPERCASE, mas a API espera lowercase
export const SignatureFieldTypeSchema = z.enum([
  'signature',
  'initial',
  'text',
  'date',
  'checkbox',
]);
export type SignatureFieldType = z.infer<typeof SignatureFieldTypeSchema>;

// Schema principal para um campo de assinatura
export const SignatureFieldSchema = z.object({
  id: z.string(),
  page: z.number().int(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  type: SignatureFieldTypeSchema,
  required: z.boolean().default(true),
  signed: z.boolean().default(false),
  value: z.string().nullable(),
  signedAt: z.string().datetime().nullable(),
  signatureData: z.string().nullable(),

  // Hash e Verificação (Fase 4)
  signatureHash: z.string().nullable(),
  hashAlgorithm: z.string().nullable(),
  documentHash: z.string().nullable(),
  signerRole: z.string().nullable(),

  documentId: z.string(),
  signerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SignatureField = z.infer<typeof SignatureFieldSchema>;

// Schema para a criação de um novo campo de assinatura
export const SignatureFieldInputSchema = z.object({
  signerId: z.string(),
  page: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  type: SignatureFieldTypeSchema,
  required: z.boolean().optional().default(true),
  value: z.string().optional(), // Valor padrão para o campo
});
export type SignatureFieldInput = z.infer<typeof SignatureFieldInputSchema>;

// Schema para a atualização de um campo de assinatura
export const SignatureFieldUpdateSchema = SignatureFieldInputSchema.omit({
  signerId: true,
}).partial();
export type SignatureFieldUpdateInput = z.infer<typeof SignatureFieldUpdateSchema>;

// DTO para assinar um campo
export interface SignFieldDto {
  accessToken: string; // Obrigatório para autorização (Fase 8)

  // Campos de assinatura (escolha um dos dois)
  /** Valor da assinatura (para campos TEXT, DATE, CHECKBOX) - max 500 caracteres */
  signatureValue?: string;
  /** URL da imagem de assinatura PNG pré-carregada no S3 (para SIGNATURE/INITIAL) */
  signatureImageUrl?: string;
  /** Imagem da assinatura em Base64 (alternativa ao URL) */
  signatureImage?: string;

  /** Metadados adicionais (IP, user agent, geolocalização, etc.) */
  metadata?: Record<string, any>;

  // 🆕 FASE 3: PAdES Digital Signature (opcional)
  /** ID do certificado digital a ser usado para PAdES (opcional) */
  digitalCertificateId?: string;
  /** Senha do certificado (se não armazenada) */
  certificatePassword?: string;
  /** Razão da assinatura (para PAdES) */
  padesReason?: string;
  /** Local da assinatura (para PAdES) */
  padesLocation?: string;
  /** Informações de contato (para PAdES) */
  padesContactInfo?: string;
}

// Schema Zod para SignFieldDto
export const SignFieldDtoSchema = z.object({
  accessToken: z.string().min(1),
  signatureValue: z.string().max(500).optional(),
  signatureImageUrl: z.string().max(1000).optional(),
  signatureImage: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  digitalCertificateId: z.string().optional(),
  certificatePassword: z.string().min(4).optional(),
  padesReason: z.string().optional(),
  padesLocation: z.string().optional(),
  padesContactInfo: z.string().optional(),
});

// Resposta após assinar um campo
export interface SignFieldResponse {
  signatureField: SignatureField;
  document: {
    id: string;
    version: number;
    s3Key: string;
  };
  verificationUrl?: string;
}

// Filtros para busca de signature fields
export interface SignatureFieldFilters {
  documentId?: string;
  signerId?: string;
  type?: SignatureFieldType;
  documentPage?: number;
  required?: boolean;
  isSigned?: boolean;
  createdFrom?: string; // ISO date
  createdTo?: string; // ISO date
  signedFrom?: string; // ISO date
  signedTo?: string; // ISO date
  sortBy?: 'page' | 'type' | 'required' | 'createdAt' | 'signedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

// Schema Zod para filtros
export const SignatureFieldFiltersSchema = z.object({
  documentId: z.string().uuid().optional(),
  signerId: z.string().uuid().optional(),
  type: SignatureFieldTypeSchema.optional(),
  documentPage: z.number().int().min(1).max(100).optional(),
  required: z.boolean().optional(),
  isSigned: z.boolean().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  signedFrom: z.string().datetime().optional(),
  signedTo: z.string().datetime().optional(),
  sortBy: z.enum(['page', 'type', 'required', 'createdAt', 'signedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

// Input para atualização de signature field
export interface UpdateSignatureFieldInput {
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type?: SignatureFieldType;
  required?: boolean;
  signerId?: string;
  value?: string; // Valor do campo
  signedAt?: string; // Data da assinatura (ISO)
  signatureImageUrl?: string; // URL da imagem de assinatura
}

// 🆕 FASE signature_fields: DTO para criar grupo de campos de carimbo
export interface CreateStampGroupDto {
  signerId: string;
  page: number;
  x: number;
  y: number;
  /** Preset de tamanho: P (300x130pt), M (450x200pt - padrão), G (600x250pt) */
  size?: 'P' | 'M' | 'G';
}

// Schema Zod para CreateStampGroupDto
export const CreateStampGroupDtoSchema = z.object({
  signerId: z.string(), // Removed .uuid() to support CUIDs
  page: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  size: z.enum(['P', 'M', 'G']).optional(),
});

// 🆕 FASE signature_fields: DTO para criar campos de rubrica
export interface CreateInitialFieldsDto {
  signerId: string;
}

// Schema Zod para CreateInitialFieldsDto
export const CreateInitialFieldsDtoSchema = z.object({
  signerId: z.string(), // Removed .uuid() to support CUIDs
});

// Schema Zod para atualização
export const UpdateSignatureFieldInputSchema = z.object({
  page: z.number().int().positive().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  type: SignatureFieldTypeSchema.optional(),
  required: z.boolean().optional(),
  signerId: z.string().optional(),
  value: z.string().optional(),
  signedAt: z.string().datetime().optional(),
  signatureImageUrl: z.string().optional(),
});
