import { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  DocumentTemplate,
  UploadTemplateDto,
  ConfigureTemplateDto,
  GenerateDocumentDto,
  GenerateDocumentResponse,
  UpdateTemplateDto,
} from '../types/document-template.types';
import { validateTemplateFile } from '../validators';

/**
 * FASE 7: Serviço para Templates DOCX com Variáveis
 */
export class DocumentTemplateService {
  constructor(private http: AxiosInstance) {}

  /**
   * Upload DOCX e extração automática de variáveis
   *
   * Suporta File (browser), Buffer (Node.js) e Blob (browser).
   * Valida automaticamente o tipo de arquivo (DOCX) e tamanho máximo (50MB).
   *
   * @param dto - Dados do template (file)
   * @returns Template criado com variáveis extraídas
   * @throws Error se arquivo inválido (tipo ou tamanho)
   */
  async uploadAndExtract(dto: UploadTemplateDto): Promise<DocumentTemplate> {
    // Validar arquivo (MIME type e file size)
    validateTemplateFile(dto.file);

    const formData = new FormData();

    // Se for Buffer, precisamos adicionar metadados para o Multer identificar corretamente
    if (Buffer.isBuffer(dto.file)) {
      formData.append('file', dto.file, {
        filename: 'template.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } else {
      formData.append('file', dto.file);
    }

    const response = await this.http.post<any>(
      '/api/v1/document-templates/upload-and-extract',
      formData,
      {
        headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
      }
    );

    // API retorna { success: true, data: {...} }, então extraímos o data
    return response.data;
  }

  /**
   * Configura mapeamento de variáveis e roles
   */
  async configure(id: string, dto: ConfigureTemplateDto): Promise<DocumentTemplate> {
    const response = await this.http.post<any>(
      `/api/v1/document-templates/${id}/configure`,
      dto
    );
    return response.data;
  }

  /**
   * Gera documento PDF a partir de template
   */
  async generateDocument(
    id: string,
    dto: GenerateDocumentDto
  ): Promise<GenerateDocumentResponse> {
    const response = await this.http.post<any>(
      `/api/v1/document-templates/${id}/generate-document`,
      dto
    );
    return response.data;
  }

  /**
   * Lista todos os templates
   */
  async findAll(): Promise<DocumentTemplate[]> {
    const response = await this.http.get<any>('/api/v1/document-templates');
    return response.data;
  }

  /**
   * Busca template por ID
   */
  async findById(id: string): Promise<DocumentTemplate> {
    const response = await this.http.get<any>(`/api/v1/document-templates/${id}`);
    return response.data;
  }

  /**
   * Atualiza um template (nome, variableSchema, requiredRoles)
   */
  async update(id: string, dto: UpdateTemplateDto): Promise<DocumentTemplate> {
    const response = await this.http.patch<any>(
      `/api/v1/document-templates/${id}`,
      dto
    );
    return response.data;
  }

  /**
   * Deleta um template
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/document-templates/${id}`);
  }
}
