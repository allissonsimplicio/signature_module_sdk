import { AxiosInstance } from 'axios';
import { DocumentTemplate, UploadTemplateDto, ConfigureTemplateDto, GenerateDocumentDto, GenerateDocumentResponse, UpdateTemplateDto } from '../types/document-template.types';
/**
 * FASE 7: Serviço para Templates DOCX com Variáveis
 */
export declare class DocumentTemplateService {
    private http;
    constructor(http: AxiosInstance);
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
    uploadAndExtract(dto: UploadTemplateDto): Promise<DocumentTemplate>;
    /**
     * Configura mapeamento de variáveis e roles
     */
    configure(id: string, dto: ConfigureTemplateDto): Promise<DocumentTemplate>;
    /**
     * Gera documento PDF a partir de template
     */
    generateDocument(id: string, dto: GenerateDocumentDto): Promise<GenerateDocumentResponse>;
    /**
     * Lista todos os templates
     */
    findAll(): Promise<DocumentTemplate[]>;
    /**
     * Busca template por ID
     */
    findById(id: string): Promise<DocumentTemplate>;
    /**
     * Atualiza um template (nome, variableSchema, requiredRoles)
     */
    update(id: string, dto: UpdateTemplateDto): Promise<DocumentTemplate>;
    /**
     * Deleta um template
     */
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=DocumentTemplateService.d.ts.map