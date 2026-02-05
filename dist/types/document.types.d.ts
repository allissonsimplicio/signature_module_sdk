import { z } from 'zod';
import { DocumentStatus, Timestamps } from './common.types';
export interface DocumentUploadInput {
    name: string;
    content: string;
    contentType: string;
    fileSize: number;
    pageCount?: number;
    description?: string;
    templateId?: string;
    templateVariables?: Record<string, any>;
    customFields?: Record<string, any>;
    envelopeId?: string;
    visibleToQualifications?: ('parte' | 'testemunha' | 'other')[];
}
export interface DocumentFromTemplateInput {
    templateId: string;
    name?: string;
    variables?: Record<string, any>;
    description?: string;
    customFields?: Record<string, any>;
    visibleToQualifications?: ('parte' | 'testemunha' | 'other')[];
}
export declare const DocumentUploadInputSchema: z.ZodObject<{
    name: z.ZodString;
    content: z.ZodString;
    contentType: z.ZodString;
    fileSize: z.ZodNumber;
    pageCount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    templateVariables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    envelopeId: z.ZodOptional<z.ZodString>;
    visibleToQualifications: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        parte: "parte";
        testemunha: "testemunha";
        other: "other";
    }>>>;
}, z.core.$strip>;
export declare const DocumentFromTemplateInputSchema: z.ZodObject<{
    templateId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    description: z.ZodOptional<z.ZodString>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    visibleToQualifications: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        parte: "parte";
        testemunha: "testemunha";
        other: "other";
    }>>>;
}, z.core.$strip>;
export interface Document extends Timestamps {
    id: string;
    envelopeId: string;
    name: string;
    description?: string;
    status: DocumentStatus;
    contentType: string;
    fileSize: number;
    pageCount: number;
    s3Key: string;
    s3Bucket: string;
    version: number;
    versionHistory?: DocumentVersion[];
    hash?: string;
    allowPublicVerification: boolean;
    allowPublicDownload: boolean;
    publicVerificationUrl?: string;
    templateId?: string;
    templateVariables?: Record<string, any>;
    customFields?: Record<string, any>;
    signatureFields: SignatureField[];
    qualificationRequirements: QualificationRequirement[];
    visibleToQualifications?: ('parte' | 'testemunha')[];
    isSigned: boolean;
    signedAt?: string;
    signedByCount: number;
    pendingSignaturesCount: number;
}
export interface DocumentVersion {
    version: number;
    s3Key: string;
    createdAt: string;
    signedBy?: string;
    signatureFieldId?: string;
}
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
export interface QualificationRequirement {
    id: string;
    documentId: string;
    signerId: string;
    qualificationType: 'parte' | 'testemunha' | 'other';
    description?: string;
    isSatisfied: boolean;
    satisfiedAt?: string;
}
export declare const DocumentSchema: z.ZodObject<{
    id: z.ZodString;
    envelopeId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        draft: "draft";
        running: "running";
        completed: "completed";
        canceled: "canceled";
        closed: "closed";
    }>;
    contentType: z.ZodString;
    fileSize: z.ZodNumber;
    pageCount: z.ZodNumber;
    templateId: z.ZodOptional<z.ZodString>;
    templateVariables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    visibleToQualifications: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        parte: "parte";
        testemunha: "testemunha";
        other: "other";
    }>>>;
    signatureFields: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        signerId: z.ZodString;
        page: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        type: z.ZodEnum<{
            date: "date";
            text: "text";
            signature: "signature";
            initial: "initial";
            checkbox: "checkbox";
        }>;
        required: z.ZodBoolean;
        value: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodOptional<z.ZodString>;
        signatureImageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    qualificationRequirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        documentId: z.ZodString;
        signerId: z.ZodString;
        qualificationType: z.ZodEnum<{
            parte: "parte";
            testemunha: "testemunha";
            other: "other";
        }>;
        description: z.ZodOptional<z.ZodString>;
        isSatisfied: z.ZodBoolean;
        satisfiedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    isSigned: z.ZodBoolean;
    signedAt: z.ZodOptional<z.ZodString>;
    signedByCount: z.ZodNumber;
    pendingSignaturesCount: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export interface DocumentFilters {
    envelopeId?: string;
    status?: DocumentStatus | DocumentStatus[];
    name?: string;
    templateId?: string;
    isSigned?: boolean;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'fileSize' | 'pageCount';
    sortOrder?: 'asc' | 'desc';
}
export interface FileUploadInfo {
    filePath: string;
    name?: string;
    contentType?: string;
}
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
export declare const DocumentPreviewOptionsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
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
//# sourceMappingURL=document.types.d.ts.map