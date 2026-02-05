"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureFieldService = void 0;
class SignatureFieldService {
    constructor(http) {
        this.http = http;
    }
    /**
     * Cria um campo de assinatura
     */
    async create(documentId, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/documents/${documentId}/signature-fields`, dto);
        return response.data;
    }
    /**
     * Lista campos de assinatura de um documento
     * @note Pode ser usado com JWT do signatário (Bearer) para retornar apenas os campos visíveis.
     */
    async findByDocument(documentId) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get(`/api/v1/documents/${documentId}/fields`);
        return response.data;
    }
    /**
     * Lista todos os campos de assinatura com filtros opcionais
     */
    async findAll(filters) {
        const response = await this.http.get('/api/v1/signature-fields', { params: filters });
        return response.data;
    }
    /**
     * Busca campo de assinatura por ID
     */
    async findById(id) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get(`/api/v1/signature-fields/${id}`);
        return response.data;
    }
    /**
     * Atualiza um campo de assinatura (posição, tamanho, tipo, required)
     * Nota: Só pode atualizar se o envelope não estiver ativo ou completo
     */
    async update(id, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.put(`/api/v1/signature-fields/${id}`, dto);
        return response.data;
    }
    /**
     * Assina um campo de assinatura (Fase 8 - requer accessToken)
     */
    async sign(fieldId, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/signature-fields/${fieldId}/sign`, dto);
        return response.data;
    }
    /**
     * Deleta um campo de assinatura
     */
    async delete(id) {
        await this.http.delete(`/api/v1/signature-fields/${id}`);
    }
    // =============== 🆕 FASE signature_fields: Criação Agrupada de Campos ===============
    /**
     * 🆕 Cria um campo de carimbo verificado (verifiedStampV1 template)
     *
     * Cria um campo SIGNATURE com dimensões otimizadas (450x200) que renderiza um carimbo
     * visual completo com todas as informações de assinatura:
     * - Header: "ASSINATURA DIGITAL VERIFICADA"
     * - Logo da organização (esquerda)
     * - Dados estruturados: Nome, Cargo, Data, Hash, URL de verificação
     * - QR Code para verificação (direita)
     * - Nome da organização (rodapé)
     *
     * O carimbo utiliza o template "verifiedStampV1" com timezone America/Sao_Paulo.
     *
     * @param documentId - ID do documento
     * @param dto - Dados do carimbo (signerId, page, x, y)
     * @returns Array com o campo de assinatura criado (1 elemento)
     */
    async createStampGroup(documentId, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/documents/${documentId}/stamp-fields`, dto);
        return response.data;
    }
    /**
     * 🆕 Cria campos de rubrica em todas as páginas (exceto a última)
     *
     * - Obtém automaticamente o número de páginas do documento
     * - Cria um campo INITIAL no canto inferior direito de cada página
     * - Não cria rubrica na última página (reservada para assinatura final)
     *
     * @param documentId - ID do documento
     * @param dto - Dados da rubrica (signerId)
     * @returns Array com todos os campos de rubrica criados
     */
    async createInitialFields(documentId, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/documents/${documentId}/initial-fields`, dto);
        return response.data;
    }
}
exports.SignatureFieldService = SignatureFieldService;
//# sourceMappingURL=SignatureFieldService.js.map