import { z } from 'zod';
/**
 * FASE 7: Document Templates - Templates DOCX com Variáveis
 */
export interface DocumentTemplate {
    id: string;
    name: string;
    description?: string;
    s3Key: string;
    s3Bucket: string;
    contentType: string;
    fileSize: number;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    isActive?: boolean;
    extractedVariables: string[];
    variableSchema?: VariableSchema;
    isConfigured: boolean;
    requiredRoles?: TemplateRole[];
    usageCount?: number;
    lastUsedAt?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}
export interface VariableSchema {
    [variable: string]: VariableMapping;
}
export type VariableTransformation = 'formatCPF' | 'formatCNPJ' | 'formatDate' | 'formatCurrency' | 'uppercase' | 'lowercase' | string;
export interface VariableMapping {
    source: 'signer' | 'document' | 'system';
    role?: string;
    field: string;
    required: boolean;
    transform?: VariableTransformation;
    confidence?: number;
}
export interface TemplateRole {
    role: string;
    displayName: string;
    signingOrder: number;
    signatureFieldPosition: {
        page: number;
        x: number;
        y: number;
        width?: number;
        height?: number;
    };
}
export interface UploadTemplateDto {
    file: File | Buffer | Blob;
}
export interface ConfigureTemplateDto {
    variableSchema: VariableSchema;
    requiredRoles: TemplateRole[];
}
export interface GenerateDocumentDto {
    envelopeId: string;
    signers: CreateSignerForTemplateDto[];
    documentCustomFields?: Record<string, any>;
}
export interface CreateSignerForTemplateDto {
    role: string;
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
export interface GenerateDocumentResponse {
    document: any;
    signers: any[];
    variablesUsed: Record<string, string>;
}
export interface UpdateTemplateDto {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    variableSchema?: VariableSchema;
    requiredRoles?: TemplateRole[];
}
export interface TemplateFilters {
    name?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    isActive?: boolean;
    ownerId?: string;
    createdFrom?: string;
    createdTo?: string;
    lastUsedFrom?: string;
    lastUsedTo?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsedAt';
    sortOrder?: 'asc' | 'desc';
}
export declare const DocumentTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    s3Key: z.ZodString;
    s3Bucket: z.ZodString;
    contentType: z.ZodString;
    fileSize: z.ZodNumber;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    extractedVariables: z.ZodArray<z.ZodString>;
    variableSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isConfigured: z.ZodBoolean;
    requiredRoles: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    usageCount: z.ZodOptional<z.ZodNumber>;
    lastUsedAt: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const UpdateTemplateDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    variableSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    requiredRoles: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}, z.core.$strip>;
export declare const TemplateFiltersSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    ownerId: z.ZodOptional<z.ZodString>;
    createdFrom: z.ZodOptional<z.ZodString>;
    createdTo: z.ZodOptional<z.ZodString>;
    lastUsedFrom: z.ZodOptional<z.ZodString>;
    lastUsedTo: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    perPage: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        name: "name";
        usageCount: "usageCount";
        lastUsedAt: "lastUsedAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=document-template.types.d.ts.map