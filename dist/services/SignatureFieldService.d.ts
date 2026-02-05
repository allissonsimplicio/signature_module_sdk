import { AxiosInstance } from 'axios';
import { SignatureField, SignatureFieldInput, SignFieldDto, SignFieldResponse, SignatureFieldFilters, UpdateSignatureFieldInput, CreateStampGroupDto } from '../types/signature-field.types';
import { PaginatedResponse } from '../types/common.types';
export declare class SignatureFieldService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria um campo de assinatura
     */
    create(documentId: string, dto: SignatureFieldInput): Promise<SignatureField>;
    /**
     * Lista campos de assinatura de um documento
     * @note Pode ser usado com JWT do signatário (Bearer) para retornar apenas os campos visíveis.
     */
    findByDocument(documentId: string): Promise<SignatureField[]>;
    /**
     * Lista todos os campos de assinatura com filtros opcionais
     */
    findAll(filters?: SignatureFieldFilters): Promise<PaginatedResponse<SignatureField>>;
    /**
     * Busca campo de assinatura por ID
     */
    findById(id: string): Promise<SignatureField>;
    /**
     * Atualiza um campo de assinatura (posição, tamanho, tipo, required)
     * Nota: Só pode atualizar se o envelope não estiver ativo ou completo
     */
    update(id: string, dto: UpdateSignatureFieldInput): Promise<SignatureField>;
    /**
     * Assina um campo de assinatura (Fase 8 - requer accessToken)
     */
    sign(fieldId: string, dto: SignFieldDto): Promise<SignFieldResponse>;
    /**
     * Deleta um campo de assinatura
     */
    delete(id: string): Promise<void>;
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
    createStampGroup(documentId: string, dto: CreateStampGroupDto): Promise<SignatureField[]>;
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
    createInitialFields(documentId: string, dto: {
        signerId: string;
    }): Promise<SignatureField[]>;
}
//# sourceMappingURL=SignatureFieldService.d.ts.map