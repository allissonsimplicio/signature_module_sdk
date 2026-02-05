import { z } from 'zod';
import { DocumentStatus, Timestamps } from './common.types';

// Input para criação de documento via upload
export interface DocumentUploadInput {
  name: string;
  content: string; // Base64 encoded file content
  contentType: string; // MIME type (obrigatório)
  fileSize: number; // Tamanho do arquivo em bytes (obrigatório)
  pageCount?: number; // Número de páginas (opcional, calculado automaticamente para PDFs)
  description?: string;
  templateId?: string; // ID do template (se criado a partir de template)
  templateVariables?: Record<string, any>; // Variáveis do template
  customFields?: Record<string, any>;
  envelopeId?: string; // ID do envelope (opcional, vem da URL)

  // Controle de visibilidade por qualification (null/undefined = visível para todos)
  visibleToQualifications?: ('parte' | 'testemunha' | 'other')[];
}

// Input para criação de documento via template
export interface DocumentFromTemplateInput {
  templateId: string;
  name?: string; // Se não fornecido, usa o nome do template
  variables?: Record<string, any>; // Variáveis para substituição no template
  description?: string;
  customFields?: Record<string, any>;

  // Controle de visibilidade por qualification (null/undefined = visível para todos)
  visibleToQualifications?: ('parte' | 'testemunha' | 'other')[];
}

// Schema Zod para DocumentUploadInput
export const DocumentUploadInputSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().min(1),
  contentType: z.string().min(1), // Obrigatório
  fileSize: z.number().min(1), // Obrigatório
  pageCount: z.number().min(1).optional(),
  description: z.string().max(1000).optional(),
  templateId: z.string().optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  envelopeId: z.string().optional(),
  visibleToQualifications: z.array(z.enum(['parte', 'testemunha', 'other'])).optional(),
});

// Schema Zod para DocumentFromTemplateInput
export const DocumentFromTemplateInputSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  description: z.string().max(1000).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  visibleToQualifications: z.array(z.enum(['parte', 'testemunha', 'other'])).optional(),
});

// Documento completo retornado pela API
export interface Document extends Timestamps {
  id: string;
  envelopeId: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  contentType: string;
  fileSize: number;
  pageCount: number;

  // S3 Storage
  s3Key: string;
  s3Bucket: string;

  // Versioning
  version: number;
  versionHistory?: DocumentVersion[];

  // Hash e Verificação (Fase 4)
  hash?: string;
  allowPublicVerification: boolean;
  allowPublicDownload: boolean;
  publicVerificationUrl?: string;

  // ✅ Removido downloadUrl/previewUrl - Use métodos dedicados:
  // - client.documents.download(id) para obter URL de download
  // - client.documents.preview(id, options?) para obter preview com metadados

  // Template (Fase 7)
  templateId?: string;
  templateVariables?: Record<string, any>;

  customFields?: Record<string, any>;
  signatureFields: SignatureField[];
  qualificationRequirements: QualificationRequirement[];

  // Controle de visibilidade por qualification
  // null/undefined = visível para todos
  // ['parte'] = apenas para signers com qualification "parte"
  // ['testemunha'] = apenas para signers com qualification "testemunha"
  // ['parte', 'testemunha'] = para ambos
  visibleToQualifications?: ('parte' | 'testemunha')[];

  isSigned: boolean;
  signedAt?: string;
  signedByCount: number;
  pendingSignaturesCount: number;
}

// Versão do documento
export interface DocumentVersion {
  version: number;
  s3Key: string;
  createdAt: string;
  signedBy?: string;
  signatureFieldId?: string;
}

// Campo de assinatura no documento
export interface SignatureField {
  id: string;
  signerId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initial' | 'text' | 'date' | 'checkbox';
  required: boolean;
  value?: string;
  signedAt?: string;
  signatureImageUrl?: string;
}

// Requisito de qualificação para o documento
export interface QualificationRequirement {
  id: string;
  documentId: string;
  signerId: string;
  qualificationType: 'parte' | 'testemunha' | 'other';
  description?: string;
  isSatisfied: boolean;
  satisfiedAt?: string;
}

// Schema Zod para Document
export const DocumentSchema = z.object({
  id: z.string(),
  envelopeId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'running', 'completed', 'canceled', 'closed']),
  contentType: z.string(),
  fileSize: z.number().min(0),
  pageCount: z.number().min(1),
  // ✅ Removido downloadUrl/previewUrl do schema (usar métodos dedicados)
  templateId: z.string().optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  visibleToQualifications: z.array(z.enum(['parte', 'testemunha', 'other'])).optional(),
  signatureFields: z.array(z.object({
    id: z.string(),
    signerId: z.string(),
    page: z.number().min(1),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1),
    type: z.enum(['signature', 'initial', 'text', 'date', 'checkbox']),
    required: z.boolean(),
    value: z.string().optional(),
    signedAt: z.string().datetime().optional(),
    signatureImageUrl: z.string().url().optional(),
  })),
  qualificationRequirements: z.array(z.object({
    id: z.string(),
    documentId: z.string(),
    signerId: z.string(),
    qualificationType: z.enum(['parte', 'testemunha', 'other']),
    description: z.string().optional(),
    isSatisfied: z.boolean(),
    satisfiedAt: z.string().datetime().optional(),
  })),
  isSigned: z.boolean(),
  signedAt: z.string().datetime().optional(),
  signedByCount: z.number().min(0),
  pendingSignaturesCount: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Filtros para busca de documentos
export interface DocumentFilters {
  envelopeId?: string;
  status?: DocumentStatus | DocumentStatus[];
  name?: string;
  templateId?: string;
  isSigned?: boolean;
  createdFrom?: string; // ISO date
  createdTo?: string; // ISO date
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'fileSize' | 'pageCount';
  sortOrder?: 'asc' | 'desc';
}

// Informações de upload de arquivo
export interface FileUploadInfo {
  filePath: string;
  name?: string;
  contentType?: string;
}

// Resposta de upload de documento
export interface DocumentUploadResponse {
  document: Document;
  uploadInfo: {
    originalFilename: string;
    fileSize: number;
    contentType: string;
    uploadDurationMs: number;
  };
}

/**
 * PDF page metadata in PDF points (pt)
 * 1 PDF point = 1/72 inch
 */
export interface PdfPageMetadata {
  /** Page width in PDF points */
  widthPt: number;
  /** Page height in PDF points */
  heightPt: number;
  /** Page rotation in degrees (0, 90, 180, 270) */
  rotation: number;
  /** MediaBox coordinates [x1, y1, x2, y2] */
  mediaBox: number[];
  /** CropBox coordinates [x1, y1, x2, y2] if different from MediaBox */
  cropBox?: number[];
}

/**
 * Resposta de preview de documento com PDF.js
 * Backend retorna URL do PDF + metadados, frontend renderiza com PDF.js
 */
export interface DocumentPreviewResponse {
  success: boolean;
  /** URL assinada do PDF (válida por 1 hora) */
  pdfUrl?: string;
  /** Número total de páginas do documento */
  pageCount?: number;
  /** Página atual solicitada (1-indexed) */
  page?: number;
  /** Metadados da página em pontos PDF */
  pdfMetadata?: PdfPageMetadata;
  /** Mensagem de erro (se success = false) */
  error?: string;
}

/**
 * Opções para preview de documento
 */
export interface DocumentPreviewOptions {
  /** Página específica para obter metadados (default: 1, min: 1) */
  page?: number;
}

// Schema Zod para DocumentPreviewOptions
export const DocumentPreviewOptionsSchema = z.object({
  page: z.number().min(1).optional().default(1),
});

/**
 * Metadata de uma página do PDF
 */
export interface PageMetadata {
  /** Número da página (1-indexed) */
  pageNumber: number;
  /** Largura da página em points (1pt = 1/72 polegada) */
  widthPt: number;
  /** Altura da página em points (1pt = 1/72 polegada) */
  heightPt: number;
  /** Rotação da página em graus (0, 90, 180, 270) */
  rotation: number;
}

/**
 * Resposta do endpoint de metadata das páginas
 */
export interface DocumentPagesMetadataResponse {
  /** ID do documento */
  documentId: string;
  /** Número total de páginas */
  totalPages: number;
  /** Metadata de cada página */
  pages: PageMetadata[];
  /** Escala padrão recomendada para preview (150 DPI = 2.0833) */
  defaultScale: number;
}

/**
 * Coordinate in pixels (for frontend/preview)
 */
export interface PixelCoordinate {
  /** X coordinate in pixels (origin: top-left) */
  xPx: number;
  /** Y coordinate in pixels (origin: top-left) */
  yPx: number;
  /** Width in pixels */
  widthPx?: number;
  /** Height in pixels */
  heightPx?: number;
}

/**
 * Coordinate in PDF points (for API/storage)
 */
export type PointCoordinateOrigin = 'top-left';

/**
 * Coordinate in PDF points (for API/storage)
 */
export interface PointCoordinate {
  /** X coordinate in PDF points (origin: top-left, 1pt = 1/72 inch) */
  xPt: number;
  /** Y coordinate in PDF points (origin: top-left, 1pt = 1/72 inch) */
  yPt: number;
  /** Width in PDF points */
  widthPt?: number;
  /** Height in PDF points */
  heightPt?: number;
}

/**
 * Request para conversão de coordenadas
 */
export interface ConvertCoordinatesRequest {
  /** Document ID to get PDF metadata from */
  documentId: string;
  /** Page number (1-indexed) */
  page: number;
  /** Conversion direction */
  direction: 'pixelToPoint' | 'pointToPixel';
  /** Pixel coordinates (required if direction is pixelToPoint) */
  pixel?: PixelCoordinate;
  /** Point coordinates (required if direction is pointToPixel) */
  point?: PointCoordinate;
  /** Preview scale to use for conversion (optional, extracted from PDF metadata if not provided) */
  scale?: number;
  /** Preview height in pixels (used for scale calculation) */
  previewHeightPx?: number;
}

/**
 * Response da conversão de coordenadas
 */
export interface ConvertCoordinatesResponse {
  /** Conversion was successful */
  success: boolean;
  /** Pixel coordinates (returned if direction is pointToPixel) */
  pixel?: PixelCoordinate;
  /** Point coordinates (returned if direction is pixelToPoint) */
  point?: PointCoordinate;
  /** Scale factor used for conversion (pixels per point) */
  scale: number;
  /** PDF page height in points (used for scale calculation) */
  pageHeightPt: number;
  /** Preview height in pixels (used for scale calculation) */
  previewHeightPx: number;
}
