import { AxiosInstance } from 'axios';
import {
  SignatureField,
  SignatureFieldInput,
  SignFieldDto,
  SignFieldResponse,
  SignatureFieldFilters,
  UpdateSignatureFieldInput,
  CreateStampGroupDto,
} from '../types/signature-field.types';
import { ApiResponse, PaginatedResponse } from '../types/common.types';

export class SignatureFieldService {
  constructor(private http: AxiosInstance) {}

  /**
   * Cria um campo de assinatura
   */
  async create(documentId: string, dto: SignatureFieldInput): Promise<SignatureField> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SignatureField>(
      `/api/v1/documents/${documentId}/signature-fields`,
      dto
    );
    return response.data;
  }

  /**
   * Lista campos de assinatura de um documento
   * @note Pode ser usado com JWT do signatário (Bearer) para retornar apenas os campos visíveis.
   */
  async findByDocument(documentId: string): Promise<SignatureField[]> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<SignatureField[]>(
      `/api/v1/documents/${documentId}/fields`
    );
    return response.data;
  }

  /**
   * Lista todos os campos de assinatura com filtros opcionais
   */
  async findAll(filters?: SignatureFieldFilters): Promise<PaginatedResponse<SignatureField>> {
    const response = await this.http.get<PaginatedResponse<SignatureField>>(
      '/api/v1/signature-fields',
      { params: filters }
    );
    return response.data;
  }

  /**
   * Busca campo de assinatura por ID
   */
  async findById(id: string): Promise<SignatureField> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<SignatureField>(`/api/v1/signature-fields/${id}`);
    return response.data;
  }

  /**
   * Atualiza um campo de assinatura (posição, tamanho, tipo, required)
   * Nota: Só pode atualizar se o envelope não estiver ativo ou completo
   */
  async update(id: string, dto: UpdateSignatureFieldInput): Promise<SignatureField> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.put<SignatureField>(
      `/api/v1/signature-fields/${id}`,
      dto
    );
    return response.data;
  }

  /**
   * Assina um campo de assinatura (Fase 8 - requer accessToken)
   */
  async sign(fieldId: string, dto: SignFieldDto): Promise<SignFieldResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SignFieldResponse>(
      `/api/v1/signature-fields/${fieldId}/sign`,
      dto
    );
    return response.data;
  }

  /**
   * Deleta um campo de assinatura
   */
  async delete(id: string): Promise<void> {
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
  async createStampGroup(
    documentId: string,
    dto: CreateStampGroupDto
  ): Promise<SignatureField[]> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SignatureField[]>(
      `/api/v1/documents/${documentId}/stamp-fields`,
      dto
    );
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
  async createInitialFields(
    documentId: string,
    dto: { signerId: string }
  ): Promise<SignatureField[]> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SignatureField[]>(
      `/api/v1/documents/${documentId}/initial-fields`,
      dto
    );
    return response.data;
  }
}
