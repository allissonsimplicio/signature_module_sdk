import { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  Document,
  DocumentUploadInput,
  DocumentFilters,
  DocumentFromTemplateInput,
  DocumentPreviewResponse,
  DocumentPreviewOptions,
  ConvertCoordinatesRequest,
  ConvertCoordinatesResponse,
  DocumentPagesMetadataResponse
} from '../types/document.types';
import { SignatureField, SignatureFieldInput } from '../types/signature-field.types';
import { PaginatedResponse, ApiResponse } from '../types/common.types';
import { validateDocumentFile } from '../validators';

export class DocumentService {
  constructor(private http: AxiosInstance) {}

  /**
   * Cria documento via upload
   * Converte o input base64 para FormData para compatibilidade com a API multipart
   */
  async create(envelopeId: string, dto: DocumentUploadInput): Promise<Document> {
    const formData = new FormData();
    
    // Convert base64 content to Buffer
    const buffer = Buffer.from(dto.content, 'base64');
    
    formData.append('file', buffer, {
      filename: dto.name,
      contentType: dto.contentType,
      knownLength: dto.fileSize,
    });

    if (dto.description) {
      formData.append('description', dto.description);
    }

    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<Document>(
      `/api/v1/envelopes/${envelopeId}/documents`,
      formData,
      {
        headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }

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
  async upload(envelopeId: string, file: File | Buffer | Blob, name: string): Promise<Document> {
    // Validar arquivo (MIME type e file size)
    validateDocumentFile(file);

    const formData = new FormData();
    formData.append('file', file, name);

    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<Document>(
      `/api/v1/envelopes/${envelopeId}/documents`, // ✅ Fixed URL (removed /upload suffix)
      formData,
      {
        headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }

  /**
   * Lista todos os documentos
   */
  async findAll(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<PaginatedResponse<Document>>('/api/v1/documents', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Busca documento por ID
   */
  async findById(id: string): Promise<Document> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<Document>(`/api/v1/documents/${id}`);
    return response.data;
  }

  /**
   * Obtém URL de download do documento (via redirect)
   * @note Documentos COMPLETED podem expor URL; DRAFT/RUNNING devem usar endpoints autenticados
   */
  async getDownloadUrl(id: string): Promise<string> {
    const response = await this.http.get(`/api/v1/documents/${id}/download`, {
      maxRedirects: 0,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
    });

    if (response.status === 302 && response.headers?.location) {
      return response.headers.location;
    }

    const responseUrl =
      (response.request as any)?.res?.responseUrl ||
      (response.request as any)?.responseURL;

    if (responseUrl) {
      return responseUrl;
    }

    throw new Error('Download URL not available in response');
  }

  /**
   * @deprecated Use getDownloadUrl() for URLs or downloadBlob() for content
   */
  async download(id: string): Promise<string> {
    return this.getDownloadUrl(id);
  }

  /**
   * Faz download do conteúdo do documento (Blob/ArrayBuffer)
   * @note Útil para preview local e integrações que precisam do binário
   */
  async downloadBlob(
    id: string,
    options?: { responseType?: 'arraybuffer' | 'blob' },
  ): Promise<Blob | ArrayBuffer> {
    const response = await this.http.get<Blob | ArrayBuffer>(
      `/api/v1/documents/${id}/download`,
      {
        responseType: options?.responseType || 'arraybuffer',
      }
    );
    return response.data;
  }

  /**
   * Deleta um documento
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/documents/${id}`);
  }

  /**
   * Cria documento a partir de template
   * @param envelopeId - ID do envelope
   * @param dto - Dados do template e variáveis
   * @returns Documento criado com variáveis substituídas
   */
  async createFromTemplate(envelopeId: string, dto: DocumentFromTemplateInput): Promise<Document> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<Document>(
      `/api/v1/envelopes/${envelopeId}/documents/from-template`,
      dto
    );
    return response.data;
  }

  /**
   * Gera preview visual de uma página do documento
   * @param id - ID do documento
   * @param options - Opções de preview (página, dimensões, formato)
   * @returns URL temporária do preview e metadados
   * @note Rate limit: 30 requisições/minuto
   * @note Pode ser usado com JWT do signatário (Bearer) para preview por token.
   */
  async preview(id: string, options?: DocumentPreviewOptions): Promise<DocumentPreviewResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<DocumentPreviewResponse>(
      `/api/v1/documents/${id}/preview`,
      { params: options }
    );
    return response.data;
  }

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
  async getPagesMetadata(id: string): Promise<DocumentPagesMetadataResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<DocumentPagesMetadataResponse>(
      `/api/v1/documents/${id}/pages`
    );
    return response.data;
  }

  /**
   * Adiciona um campo de assinatura ao documento PDF
   * @param documentId - ID do documento
   * @param dto - Dados do campo (posição, tipo, signer)
   * @returns Campo de assinatura criado
   * @note Alias para signatureFields.create() - workflow natural ao trabalhar com PDFs
   * @note Para uso semântico completo, prefira usar client.signatureFields.create()
   */
  async addSignatureField(documentId: string, dto: SignatureFieldInput): Promise<SignatureField> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SignatureField>(
      `/api/v1/documents/${documentId}/fields`,
      dto
    );
    return response.data;
  }

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
  async convertCoordinates(request: ConvertCoordinatesRequest): Promise<ConvertCoordinatesResponse> {
    const response = await this.http.post<ConvertCoordinatesResponse>(
      '/api/v1/documents/convert-coordinates',
      request
    );
    return response.data;
  }
}
