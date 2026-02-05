"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentTemplateService = void 0;
const form_data_1 = __importDefault(require("form-data"));
const validators_1 = require("../validators");
/**
 * FASE 7: Serviço para Templates DOCX com Variáveis
 */
class DocumentTemplateService {
    constructor(http) {
        this.http = http;
    }
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
    async uploadAndExtract(dto) {
        // Validar arquivo (MIME type e file size)
        (0, validators_1.validateTemplateFile)(dto.file);
        const formData = new form_data_1.default();
        // Se for Buffer, precisamos adicionar metadados para o Multer identificar corretamente
        if (Buffer.isBuffer(dto.file)) {
            formData.append('file', dto.file, {
                filename: 'template.docx',
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
        }
        else {
            formData.append('file', dto.file);
        }
        const response = await this.http.post('/api/v1/document-templates/upload-and-extract', formData, {
            headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
        });
        // API retorna { success: true, data: {...} }, então extraímos o data
        return response.data;
    }
    /**
     * Configura mapeamento de variáveis e roles
     */
    async configure(id, dto) {
        const response = await this.http.post(`/api/v1/document-templates/${id}/configure`, dto);
        return response.data;
    }
    /**
     * Gera documento PDF a partir de template
     */
    async generateDocument(id, dto) {
        const response = await this.http.post(`/api/v1/document-templates/${id}/generate-document`, dto);
        return response.data;
    }
    /**
     * Lista todos os templates
     */
    async findAll() {
        const response = await this.http.get('/api/v1/document-templates');
        return response.data;
    }
    /**
     * Busca template por ID
     */
    async findById(id) {
        const response = await this.http.get(`/api/v1/document-templates/${id}`);
        return response.data;
    }
    /**
     * Atualiza um template (nome, variableSchema, requiredRoles)
     */
    async update(id, dto) {
        const response = await this.http.patch(`/api/v1/document-templates/${id}`, dto);
        return response.data;
    }
    /**
     * Deleta um template
     */
    async delete(id) {
        await this.http.delete(`/api/v1/document-templates/${id}`);
    }
}
exports.DocumentTemplateService = DocumentTemplateService;
//# sourceMappingURL=DocumentTemplateService.js.map