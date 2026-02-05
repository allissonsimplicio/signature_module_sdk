import { AxiosInstance } from 'axios';
import { Document, DocumentUploadInput, DocumentFilters, DocumentFromTemplateInput, DocumentPreviewResponse, DocumentPreviewOptions, ConvertCoordinatesRequest, ConvertCoordinatesResponse, DocumentPagesMetadataResponse } from '../types/document.types';
import { SignatureField, SignatureFieldInput } from '../types/signature-field.types';
import { PaginatedResponse } from '../types/common.types';
export declare class DocumentService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria documento via upload
     * Converte o input base64 para FormData para compatibilidade com a API multipart
     */
    create(envelopeId: string, dto: DocumentUploadInput): Promise<Document>;
    /**
     * Upload de arquivo (form-data)
     *
     * Suporta File (browser), Buffer (Node.js) e Blob (browser).
     * Valida automaticamente o tipo de arquivo (PDF/DOCX) e tamanho máximo (50MB).
     *
     * @param envelopeId - ID do envelope
     * @param file - Arquivo PDF ou DOCX (File, Buffer ou Blob)
     * @param name - Nome do arquivo
     * @returns Documento criado
     * @throws Error se arquivo inválido (tipo ou tamanho)
     */
    upload(envelopeId: string, file: File | Buffer | Blob, name: string): Promise<Document>;
    /**
     * Lista todos os documentos
     */
    findAll(filters?: DocumentFilters): Promise<PaginatedResponse<Document>>;
    /**
     * Busca documento por ID
     */
    findById(id: string): Promise<Document>;
    /**
     * Obtém URL de download do documento (via redirect)
     * @note Documentos COMPLETED podem expor URL; DRAFT/RUNNING devem usar endpoints autenticados
     */
    getDownloadUrl(id: string): Promise<string>;
    /**
     * @deprecated Use getDownloadUrl() for URLs or downloadBlob() for content
     */
    download(id: string): Promise<string>;
    /**
     * Faz download do conteúdo do documento (Blob/ArrayBuffer)
     * @note Útil para preview local e integrações que precisam do binário
     */
    downloadBlob(id: string, options?: {
        responseType?: 'arraybuffer' | 'blob';
    }): Promise<Blob | ArrayBuffer>;
    /**
     * Deleta um documento
     */
    delete(id: string): Promise<void>;
    /**
     * Cria documento a partir de template
     * @param envelopeId - ID do envelope
     * @param dto - Dados do template e variáveis
     * @returns Documento criado com variáveis substituídas
     */
    createFromTemplate(envelopeId: string, dto: DocumentFromTemplateInput): Promise<Document>;
    /**
     * Gera preview visual de uma página do documento
     * @param id - ID do documento
     * @param options - Opções de preview (página, dimensões, formato)
     * @returns URL temporária do preview e metadados
     * @note Rate limit: 30 requisições/minuto
     * @note Pode ser usado com JWT do signatário (Bearer) para preview por token.
     */
    preview(id: string, options?: DocumentPreviewOptions): Promise<DocumentPreviewResponse>;
    /**
     * Obtém metadata de todas as páginas do documento
     * @param id - ID do documento
     * @returns Metadata de cada página (dimensões em points e rotação)
     * @note Rate limit: 50 requisições/minuto
     * @note Útil para posicionamento preciso de campos de assinatura
     * @note Pode ser usado com JWT do signatário (Bearer) para preview por token.
     *
     * @example
     * ```typescript
     * // Obter dimensões das páginas para posicionar carimbo
     * const metadata = await client.documents.getPagesMetadata('doc-123');
     *
     * // Usar dimensões da última página
     * const lastPage = metadata.pages[metadata.pages.length - 1];
     * const stampFields = await client.signatureFields.createStampGroup('doc-123', {
     *   signerId: 'signer-456',
     *   page: lastPage.pageNumber,
     *   x: 50,
     *   y: lastPage.heightPt - 250, // 50pt de margem inferior
     *   size: 'M',
     * });
     * ```
     */
    getPagesMetadata(id: string): Promise<DocumentPagesMetadataResponse>;
    /**
     * Adiciona um campo de assinatura ao documento PDF
     * @param documentId - ID do documento
     * @param dto - Dados do campo (posição, tipo, signer)
     * @returns Campo de assinatura criado
     * @note Alias para signatureFields.create() - workflow natural ao trabalhar com PDFs
     * @note Para uso semântico completo, prefira usar client.signatureFields.create()
     */
    addSignatureField(documentId: string, dto: SignatureFieldInput): Promise<SignatureField>;
    /**
     * Converte coordenadas entre pixels (preview) e pontos PDF
     *
     * Conversão bidirecional determinística entre sistemas de coordenadas:
     * - Pixel: origem top-left, Y cresce para baixo
     * - PDF (API/armazenamento): origem top-left, Y cresce para baixo
     *
     * @param request - Dados da conversão (documentId, page, direction, coordinates)
     * @returns Coordenadas convertidas + metadata
     * @note Rate limit: 100 requisições/minuto
     *
     * @example
     * ```typescript
     * // Converter coordenadas de pixel para PDF points
     * const result = await client.documents.convertCoordinates({
     *   documentId: 'doc-123',
     *   page: 1,
     *   direction: 'pixelToPoint',
     *   pixel: { xPx: 420, yPx: 980, widthPx: 180, heightPx: 60 },
     *   previewHeightPx: 1754
     * });
     *
     * console.log(result.point); // { xPt: 210, yPt: 490, widthPt: 90, heightPt: 30 }
     * ```
     */
    convertCoordinates(request: ConvertCoordinatesRequest): Promise<ConvertCoordinatesResponse>;
}
//# sourceMappingURL=DocumentService.d.ts.map