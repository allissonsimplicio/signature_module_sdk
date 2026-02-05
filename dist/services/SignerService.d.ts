import { AxiosInstance } from 'axios';
import { Signer, SignerInput, SignerFilters, SigningUrlResponse, TokenPairResponse, RevokeTokenResponse, StartAuthenticationResponse, AddQualificationRequirementInput, QualificationRequirement } from '../types/signer.types';
import { PaginatedResponse } from '../types/common.types';
import { SigningSessionResponse } from '../types/signing-session.types';
export declare class SignerService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria um novo signatário
     */
    create(envelopeId: string, dto: SignerInput): Promise<Signer>;
    /**
     * Lista todos os signatários
     */
    findAll(filters?: SignerFilters): Promise<PaginatedResponse<Signer>>;
    /**
     * Lista todos os signatários de um envelope específico
     *
     * @param envelopeId - ID do envelope
     * @param filters - Filtros opcionais (status, etc)
     * @returns Lista de signatários do envelope
     */
    findByEnvelope(envelopeId: string, filters?: Omit<SignerFilters, 'envelopeId'>): Promise<Signer[]>;
    /**
     * Busca signatário por ID
     */
    findById(id: string): Promise<Signer>;
    /**
     * Atualiza um signatário
     */
    update(id: string, dto: Partial<SignerInput>): Promise<Signer>;
    /**
     * Deleta um signatário
     */
    delete(id: string): Promise<void>;
    /**
     * Notifica signatários de um envelope
     * @deprecated Use envelopes.notify(envelopeId). Este método será removido na v3.1.
     */
    notify(envelopeId: string): Promise<void>;
    /**
     * 🆕 Obtém URL de assinatura com JWT tokens
     *
     * Retorna:
     * - URL de assinatura completa com token JWT embarcado
     * - Access token JWT (15 minutos padrão)
     * - Refresh token para renovação (7 dias padrão)
     * - Datas de expiração de ambos os tokens
     *
     * @param id - ID do signatário
     * @returns URL de assinatura com tokens JWT e datas de expiração
     */
    getSigningUrl(id: string): Promise<SigningUrlResponse>;
    /**
     * 🆕 Renova access token usando refresh token
     *
     * Este endpoint é público e não requer autenticação de usuário da API.
     * Implementa token rotation: retorna novo par de tokens e revoga o antigo.
     *
     * @param refreshToken - Refresh token válido do signatário
     * @returns Novo par de tokens (access + refresh)
     * @throws {Error} Se o refresh token for inválido ou expirado
     */
    refreshSignerToken(refreshToken: string): Promise<TokenPairResponse>;
    /**
     * 🆕 Revoga tokens do signatário
     *
     * Este endpoint é público e não requer autenticação de usuário da API.
     * Revoga tanto o access token quanto o refresh token.
     * Ação irreversível - signatário precisará refazer autenticação.
     *
     * @param refreshToken - Refresh token a ser revogado
     * @returns Confirmação de revogação
     */
    revokeSignerToken(refreshToken: string): Promise<RevokeTokenResponse>;
    /**
     * Inicia processo de autenticação para o signatário
     * @param id - ID do signatário
     * @returns Status da autenticação iniciada e próximos passos
     */
    startAuthentication(id: string): Promise<StartAuthenticationResponse>;
    /**
     * Adiciona requisito de qualificação ao signatário (parte ou testemunha)
     * @param documentId - ID do documento
     * @param dto - Dados do requisito (signerId, qualificationType, description)
     * @returns Requisito de qualificação criado
     */
    addQualificationRequirement(documentId: string, dto: AddQualificationRequirementInput): Promise<QualificationRequirement>;
    /**
     * 🆕 Upload da imagem da assinatura do signatário
     *
     * - Se já existir uma assinatura, o arquivo antigo será removido do S3
     * - Faz upload do novo arquivo e salva URL e chave S3 no perfil do signatário
     * - Formatos aceitos: PNG, JPG, JPEG
     * - Tamanho máximo: 2 MB
     *
     * @param signerId - ID do signatário
     * @param file - Arquivo de imagem (Buffer ou Blob)
     * @returns Signatário atualizado com nova URL da assinatura
     */
    uploadSignature(signerId: string, file: Buffer | Blob): Promise<Signer>;
    /**
     * 🆕 Remove a imagem da assinatura do signatário
     *
     * - Remove o arquivo do S3
     * - Limpa os campos signatureImageUrl e signatureImageKey do perfil
     *
     * @param signerId - ID do signatário
     */
    deleteSignature(signerId: string): Promise<void>;
    /**
     * 🆕 Upload da imagem da rubrica do signatário
     *
     * - Se já existir uma rubrica, o arquivo antigo será removido do S3
     * - Faz upload do novo arquivo e salva URL e chave S3 no perfil do signatário
     * - Formatos aceitos: PNG, JPG, JPEG
     * - Tamanho máximo: 2 MB
     *
     * @param signerId - ID do signatário
     * @param file - Arquivo de imagem (Buffer ou Blob)
     * @returns Signatário atualizado com nova URL da rubrica
     */
    uploadInitial(signerId: string, file: Buffer | Blob): Promise<Signer>;
    /**
     * 🆕 Remove a imagem da rubrica do signatário
     *
     * - Remove o arquivo do S3
     * - Limpa os campos initialImageUrl e initialImageKey do perfil
     *
     * @param signerId - ID do signatário
     */
    deleteInitial(signerId: string): Promise<void>;
    /**
     * 🆕 Obtém contexto completo da sessão de assinatura (signer JWT required)
     *
     * Este método retorna todo o contexto necessário para o signatário completar sua assinatura:
     * - Informações do envelope (status, deadline, etc)
     * - Informações do signatário (nome, email, ordem, status)
     * - Lista de documentos com contagem de campos pendentes/assinados
     * - Status de autenticação (step-up required/satisfied)
     * - Progresso geral da assinatura
     *
     * **Requisitos:**
     * - O client deve ser autenticado com JWT do signatário (obtido via getSigningUrl)
     * - Envelope deve estar com status RUNNING
     * - Step-up obrigatório deve estar satisfeito
     *
     * **Casos de uso:**
     * - Frontend público do signatário descobrir quais documentos assinar
     * - Mostrar progresso da assinatura
     * - Validar se pode assinar (step-up, status do envelope)
     * - Eliminar necessidade de proxy no CRM
     *
     * **Padrão de mercado:** Inspirado em DocuSign, Adobe Sign e outras plataformas.
     *
     * @returns Contexto completo da sessão de assinatura
     * @throws {ApiError} 401 - Token JWT inválido ou expirado
     * @throws {ApiError} 403 - Envelope não disponível (DRAFT, COMPLETED, CANCELED) ou step-up pendente
     * @throws {ApiError} 404 - Signatário ou envelope não encontrado
     *
     * @example
     * ```typescript
     * // 1. Obter JWT do signatário
     * const { accessToken } = await client.signers.getSigningUrl(signerId);
     *
     * // 2. Criar client com JWT do signatário
     * const signerClient = new SignatureClient({
     *   baseURL: 'https://api.signature.com',
     *   accessToken: accessToken
     * });
     *
     * // 3. Obter contexto da sessão
     * const session = await signerClient.signers.getSigningSession();
     *
     * console.log('Envelope:', session.envelope.name);
     * console.log('Documentos:', session.documents.length);
     * console.log('Progresso:', session.progress.percentComplete + '%');
     *
     * // 4. Iterar sobre documentos
     * for (const doc of session.documents) {
     *   console.log(`${doc.name}: ${doc.pendingFieldsCount} campos pendentes`);
     *
     *   // Obter preview
     *   const preview = await signerClient.documents.preview(doc.id, { page: 1 });
     *
     *   // Obter campos
     *   const fields = await signerClient.signatureFields.findByDocument(doc.id);
     * }
     * ```
     */
    getSigningSession(): Promise<SigningSessionResponse>;
}
//# sourceMappingURL=SignerService.d.ts.map