import { z } from 'zod';
import { Timestamps } from './common.types';

// Input para criação de template
export interface TemplateInput {
  name: string;
  description?: string;
  content: string; // Base64 encoded file content
  content_type?: string;
  color?: string; // Hex color for identification
  variables?: TemplateVariable[];
  tags?: string[];
  category?: string;
  is_public?: boolean;
  custom_fields?: Record<string, any>;
}

// Variável do template
export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'currency';
  description?: string;
  default_value?: any;
  required: boolean;
  validation_rules?: VariableValidationRules;
  placeholder?: string;
}

// Regras de validação para variáveis
export interface VariableValidationRules {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string; // Regex pattern
  allowed_values?: any[]; // Lista de valores permitidos
  date_format?: string;
}

// Schema Zod para VariableValidationRules
export const VariableValidationRulesSchema = z.object({
  min_length: z.number().min(0).optional(),
  max_length: z.number().min(1).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  pattern: z.string().optional(),
  allowed_values: z.array(z.any()).optional(),
  date_format: z.string().optional(),
});

// Schema Zod para TemplateVariable
export const TemplateVariableSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'date', 'boolean', 'email', 'phone', 'currency']),
  description: z.string().max(500).optional(),
  default_value: z.any().optional(),
  required: z.boolean(),
  validation_rules: VariableValidationRulesSchema.optional(),
  placeholder: z.string().max(100).optional(),
});

// Schema Zod para TemplateInput
export const TemplateInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  content: z.string().min(1), // Base64 content
  content_type: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color
  variables: z.array(TemplateVariableSchema).optional(),
  tags: z.array(z.string().max(50)).optional(),
  category: z.string().max(100).optional(),
  is_public: z.boolean().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

// Template completo retornado pela API
export interface Template extends TemplateInput, Timestamps {
  id: string;
  file_size: number;
  page_count: number;
  download_url?: string;
  preview_url?: string;
  usage_count: number;
  last_used_at?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  is_active: boolean;
  version: number;
  parent_template_id?: string; // Para versionamento
}

// Schema Zod para Template
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  content: z.string(),
  content_type: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  variables: z.array(TemplateVariableSchema).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  is_public: z.boolean().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
  file_size: z.number().min(0),
  page_count: z.number().min(1),
  download_url: z.string().url().optional(),
  preview_url: z.string().url().optional(),
  usage_count: z.number().min(0),
  last_used_at: z.string().datetime().optional(),
  owner: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
  is_active: z.boolean(),
  version: z.number().min(1),
  parent_template_id: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Filtros para busca de templates
export interface TemplateFilters {
  name?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_active?: boolean;
  owner_id?: string;
  created_from?: string; // ISO date
  created_to?: string; // ISO date
  last_used_from?: string; // ISO date
  last_used_to?: string; // ISO date
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at';
  sort_order?: 'asc' | 'desc';
}

// Input para atualização de template
export interface TemplateUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  variables?: TemplateVariable[];
  tags?: string[];
  category?: string;
  is_public?: boolean;
  is_active?: boolean;
  custom_fields?: Record<string, any>;
}

// Schema Zod para TemplateUpdateInput
export const TemplateUpdateInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  variables: z.array(TemplateVariableSchema).optional(),
  tags: z.array(z.string().max(50)).optional(),
  category: z.string().max(100).optional(),
  is_public: z.boolean().optional(),
  is_active: z.boolean().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

// Estatísticas de uso do template
export interface TemplateUsageStats {
  template_id: string;
  total_usage: number;
  usage_last_30_days: number;
  usage_last_7_days: number;
  unique_users: number;
  average_documents_per_envelope: number;
  most_used_variables: string[];
  usage_by_month: Array<{
    month: string; // YYYY-MM
    count: number;
  }>;
}

// Validação de variáveis do template
export interface TemplateVariableValidation {
  variable_name: string;
  is_valid: boolean;
  error_message?: string;
  provided_value: any;
  expected_type: string;
}

// Resultado da validação de todas as variáveis
export interface TemplateValidationResult {
  is_valid: boolean;
  variables: TemplateVariableValidation[];
  missing_required_variables: string[];
  invalid_variables: string[];
}

// Preview do template com variáveis aplicadas
export interface TemplatePreview {
  template_id: string;
  preview_url: string;
  variables_applied: Record<string, any>;
  generated_at: string;
  expires_at: string;
}