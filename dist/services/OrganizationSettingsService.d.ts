import { AxiosInstance } from 'axios';
import { OrganizationSettings, UpdateOrganizationSettingsDto, UploadLetterheadOptions, UploadLetterheadResponse, UploadLogoOptions, UploadLogoResponse, SignatureStrategy, AuthenticationLevel } from '../types/organization-settings.types';
/**
 * OrganizationSettingsService - Gerenciamento de Configurações da Organização
 *
 * Seção 1.14 - Organization Settings
 *
 * Funcionalidades:
 * - Configurações gerais (verificação pública, download, stamps)
 * - FASE 3: Configurações de assinatura digital PAdES
 * - FASE 10: Gerenciamento de papel timbrado (letterhead)
 */
export declare class OrganizationSettingsService {
    private httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * Obter configurações da organização do usuário autenticado
     *
     * @returns {Promise<OrganizationSettings>} Configurações completas
     *
     * @example
     * ```typescript
     * const settings = await client.organizationSettings.get();
     * console.log('Estratégia de assinatura:', settings.signatureStrategy);
     * console.log('Letterhead habilitado:', settings.useLetterhead);
     * ```
     */
    get(): Promise<OrganizationSettings>;
    /**
     * Atualizar configurações da organização (upsert)
     *
     * Se as configurações não existirem, serão criadas automaticamente.
     *
     * @param {UpdateOrganizationSettingsDto} data - Campos a atualizar
     * @returns {Promise<OrganizationSettings>} Configurações atualizadas
     *
     * @example
     * ```typescript
     * // Atualizar estratégia de assinatura
     * const settings = await client.organizationSettings.update({
     *   signatureStrategy: 'HYBRID_SEALED',
     *   requirePadesForAll: true,
     *   padesAutoApply: false,
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Configurar letterhead
     * await client.organizationSettings.update({
     *   useLetterhead: true,
     *   letterheadOpacity: 20,
     *   letterheadPosition: 'BACKGROUND',
     *   letterheadApplyToPages: 'ALL',
     * });
     * ```
     */
    update(data: UpdateOrganizationSettingsDto): Promise<OrganizationSettings>;
    /**
     * Upload de papel timbrado da organização
     *
     * Faz upload de uma imagem PNG para ser usada como papel timbrado (marca d'água)
     * em todos os documentos da organização.
     *
     * **Formato recomendado**: PNG em formato A4 (2480x3508px @ 300dpi)
     * **Tamanho máximo**: 10MB
     *
     * @param {Buffer | Blob} letterheadFile - Arquivo PNG do letterhead
     * @param {UploadLetterheadOptions} options - Opções de configuração
     * @returns {Promise<UploadLetterheadResponse>} URL e detalhes do upload
     *
     * @example
     * ```typescript
     * // Node.js
     * import fs from 'fs';
     *
     * const letterheadBuffer = fs.readFileSync('./letterhead.png');
     * const result = await client.organizationSettings.uploadLetterhead(
     *   letterheadBuffer,
     *   {
     *     useLetterhead: true,
     *     opacity: 20,
     *     position: 'BACKGROUND',
     *     applyToPages: 'ALL',
     *   }
     * );
     *
     * console.log('Letterhead URL:', result.letterheadImageUrl);
     * ```
     *
     * @example
     * ```typescript
     * // Browser
     * const fileInput = document.querySelector('input[type="file"]');
     * const file = fileInput.files[0];
     *
     * const result = await client.organizationSettings.uploadLetterhead(file, {
     *   useLetterhead: true,
     *   opacity: 15,
     *   position: 'OVERLAY',
     *   applyToPages: 'FIRST',
     * });
     * ```
     */
    uploadLetterhead(letterheadFile: Buffer | Blob | File, options?: UploadLetterheadOptions): Promise<UploadLetterheadResponse>;
    /**
     * Download do papel timbrado da organização
     *
     * Retorna o arquivo PNG do letterhead configurado.
     *
     * @returns {Promise<Blob>} Imagem PNG do letterhead
     * @throws {ApiError} 404 se letterhead não existir
     *
     * @example
     * ```typescript
     * // Node.js - salvar arquivo
     * const letterheadBlob = await client.organizationSettings.downloadLetterhead();
     * const buffer = Buffer.from(await letterheadBlob.arrayBuffer());
     * fs.writeFileSync('./letterhead-downloaded.png', buffer);
     * ```
     *
     * @example
     * ```typescript
     * // Browser - exibir imagem
     * const letterheadBlob = await client.organizationSettings.downloadLetterhead();
     * const imageUrl = URL.createObjectURL(letterheadBlob);
     * document.querySelector('img').src = imageUrl;
     * ```
     */
    downloadLetterhead(): Promise<Blob>;
    /**
     * Deletar papel timbrado da organização
     *
     * Remove a imagem do letterhead e desabilita a aplicação automática.
     *
     * @returns {Promise<void>}
     * @throws {ApiError} 404 se letterhead não existir
     *
     * @example
     * ```typescript
     * await client.organizationSettings.deleteLetterhead();
     * console.log('Letterhead removido com sucesso');
     * ```
     */
    deleteLetterhead(): Promise<void>;
    /**
     * Verificar se letterhead está configurado
     *
     * @returns {Promise<boolean>} true se letterhead existir
     *
     * @example
     * ```typescript
     * const hasLetterhead = await client.organizationSettings.hasLetterhead();
     * if (hasLetterhead) {
     *   console.log('Letterhead configurado!');
     * }
     * ```
     */
    hasLetterhead(): Promise<boolean>;
    /**
     * Obter configurações de assinatura digital
     *
     * Atalho para obter apenas as configurações relacionadas a PAdES.
     *
     * @returns {Promise<PadesConfig>} Configurações PAdES
     *
     * @example
     * ```typescript
     * const padesConfig = await client.organizationSettings.getPadesConfig();
     * console.log('Estratégia:', padesConfig.signatureStrategy);
     * console.log('Certificado padrão:', padesConfig.defaultCertificateId);
     * ```
     */
    getPadesConfig(): Promise<{
        signatureStrategy: string;
        defaultCertificateId?: string;
        requirePadesForAll: boolean;
        padesAutoApply: boolean;
    }>;
    /**
     * Configurar estratégia de assinatura digital
     *
     * Atalho para atualizar apenas a estratégia PAdES.
     *
     * @param {SignatureStrategy} strategy - Estratégia de assinatura
     * @returns {Promise<OrganizationSettings>} Settings atualizadas
     *
     * @example
     * ```typescript
     * // Ativar modo híbrido selado (recomendado para máxima segurança)
     * await client.organizationSettings.setSignatureStrategy('HYBRID_SEALED');
     * ```
     */
    setSignatureStrategy(strategy: SignatureStrategy): Promise<OrganizationSettings>;
    /**
     * Upload de logo da organização
     *
     * Faz upload de uma imagem (PNG, JPG, SVG) para ser usada como logo da organização.
     * Quando configurado, o logo pode ser usado como stamp padrão nos documentos.
     *
     * **Formatos aceitos**: PNG (recomendado), JPG/JPEG, SVG
     * **Dimensões recomendadas**: 512x512px (quadrado, 72dpi)
     * **Tamanho máximo**: 5MB
     *
     * @param {Buffer | Blob} logoFile - Arquivo de imagem do logo
     * @param {UploadLogoOptions} options - Opções de configuração
     * @returns {Promise<UploadLogoResponse>} URL e detalhes do upload
     *
     * @example
     * ```typescript
     * // Node.js
     * import fs from 'fs';
     *
     * const logoBuffer = fs.readFileSync('./logo.png');
     * const result = await client.organizationSettings.uploadLogo(
     *   logoBuffer,
     *   { useAsStamp: true }
     * );
     *
     * console.log('Logo URL:', result.organizationLogoUrl);
     * console.log('Usado como stamp:', result.settings.useAsStamp);
     * ```
     *
     * @example
     * ```typescript
     * // Browser
     * const fileInput = document.querySelector('input[type="file"]');
     * const file = fileInput.files[0];
     *
     * const result = await client.organizationSettings.uploadLogo(file, {
     *   useAsStamp: true,
     * });
     * ```
     */
    uploadLogo(logoFile: Buffer | Blob | File, options?: UploadLogoOptions): Promise<UploadLogoResponse>;
    /**
     * Download do logo da organização
     *
     * Retorna o arquivo de imagem do logo configurado.
     *
     * @returns {Promise<Blob>} Imagem do logo (PNG, JPG ou SVG)
     * @throws {ApiError} 404 se logo não existir
     *
     * @example
     * ```typescript
     * // Node.js - salvar arquivo
     * const logoBlob = await client.organizationSettings.downloadLogo();
     * const buffer = Buffer.from(await logoBlob.arrayBuffer());
     * fs.writeFileSync('./logo-downloaded.png', buffer);
     * ```
     *
     * @example
     * ```typescript
     * // Browser - exibir imagem
     * const logoBlob = await client.organizationSettings.downloadLogo();
     * const imageUrl = URL.createObjectURL(logoBlob);
     * document.querySelector('img').src = imageUrl;
     * ```
     */
    downloadLogo(): Promise<Blob>;
    /**
     * Deletar logo da organização
     *
     * Remove a imagem do logo e as referências no stampTemplate.
     *
     * @returns {Promise<void>}
     * @throws {ApiError} 404 se logo não existir
     *
     * @example
     * ```typescript
     * await client.organizationSettings.deleteLogo();
     * console.log('Logo removido com sucesso');
     * ```
     */
    deleteLogo(): Promise<void>;
    /**
     * Verificar se logo está configurado
     *
     * @returns {Promise<boolean>} true se logo existir
     *
     * @example
     * ```typescript
     * const hasLogo = await client.organizationSettings.hasLogo();
     * if (hasLogo) {
     *   console.log('Logo configurado!');
     * }
     * ```
     */
    hasLogo(): Promise<boolean>;
    /**
     * Obter nível de autenticação padrão da organização
     *
     * @returns {Promise<AuthenticationLevel>} Nível de autenticação configurado
     *
     * @example
     * ```typescript
     * const authLevel = await client.organizationSettings.getAuthenticationLevel();
     * console.log('Nível de autenticação:', authLevel);
     * // Output: 'BASIC', 'STANDARD' ou 'STRICT'
     * ```
     */
    getAuthenticationLevel(): Promise<AuthenticationLevel>;
    /**
     * Configurar nível de autenticação padrão
     *
     * Define o nível de autenticação que será aplicado por padrão aos novos signatários.
     *
     * **Níveis disponíveis:**
     * - `BASIC`: Email token + IP + Geolocalização (mínimo recomendado)
     * - `STANDARD`: BASIC + (WhatsApp ou SMS) + Documento + Selfie
     * - `STRICT`: STANDARD + Comprovante de endereço (obrigatório para PAdES)
     *
     * **Recomendação:** Para assinaturas PAdES, use sempre STRICT para máxima validade jurídica.
     *
     * @param {AuthenticationLevel} level - Nível de autenticação
     * @returns {Promise<OrganizationSettings>} Settings atualizadas
     *
     * @example
     * ```typescript
     * // Configurar nível básico (mais rápido)
     * await client.organizationSettings.setAuthenticationLevel('BASIC');
     * ```
     *
     * @example
     * ```typescript
     * // Configurar nível rigoroso (recomendado para PAdES)
     * await client.organizationSettings.setAuthenticationLevel('STRICT');
     * ```
     */
    setAuthenticationLevel(level: AuthenticationLevel): Promise<OrganizationSettings>;
}
//# sourceMappingURL=OrganizationSettingsService.d.ts.map