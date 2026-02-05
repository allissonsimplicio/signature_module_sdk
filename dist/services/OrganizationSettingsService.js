"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationSettingsService = void 0;
const validators_1 = require("../validators");
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
class OrganizationSettingsService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
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
    async get() {
        const response = await this.httpClient.get('/api/v1/organization-settings');
        return response.data;
    }
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
    async update(data) {
        const response = await this.httpClient.put('/api/v1/organization-settings', data);
        return response.data;
    }
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
    async uploadLetterhead(letterheadFile, options = {}) {
        // Validar arquivo (MIME type PNG e file size 10MB)
        (0, validators_1.validateLetterheadFile)(letterheadFile);
        const formData = new FormData();
        // Anexar arquivo
        if (letterheadFile instanceof Buffer) {
            // Node.js environment - convert Buffer to Blob using ArrayBuffer
            const arrayBuffer = letterheadFile.buffer.slice(letterheadFile.byteOffset, letterheadFile.byteOffset + letterheadFile.byteLength);
            const blob = new Blob([arrayBuffer], { type: 'image/png' });
            formData.append('letterhead', blob, 'letterhead.png');
        }
        else {
            // Browser environment
            formData.append('letterhead', letterheadFile, 'letterhead.png');
        }
        // Anexar opções
        if (options.useLetterhead !== undefined) {
            formData.append('useLetterhead', String(options.useLetterhead));
        }
        if (options.opacity !== undefined) {
            formData.append('opacity', String(options.opacity));
        }
        if (options.position) {
            formData.append('position', options.position);
        }
        if (options.applyToPages) {
            formData.append('applyToPages', options.applyToPages);
        }
        const response = await this.httpClient.post('/api/v1/organization-settings/letterhead', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
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
    async downloadLetterhead() {
        const response = await this.httpClient.get('/api/v1/organization-settings/letterhead', {
            responseType: 'blob',
        });
        return response.data;
    }
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
    async deleteLetterhead() {
        await this.httpClient.delete('/api/v1/organization-settings/letterhead');
    }
    // ==================== Helper Methods ====================
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
    async hasLetterhead() {
        try {
            const settings = await this.get();
            return !!settings.letterheadImageUrl;
        }
        catch {
            return false;
        }
    }
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
    async getPadesConfig() {
        const settings = await this.get();
        return {
            signatureStrategy: settings.signatureStrategy,
            defaultCertificateId: settings.defaultCertificateId,
            requirePadesForAll: settings.requirePadesForAll,
            padesAutoApply: settings.padesAutoApply,
        };
    }
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
    async setSignatureStrategy(strategy) {
        return this.update({ signatureStrategy: strategy });
    }
    // ==================== LOGO MANAGEMENT ====================
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
    async uploadLogo(logoFile, options = {}) {
        // Validar arquivo (MIME type e tamanho 5MB)
        (0, validators_1.validateLogoFile)(logoFile);
        const formData = new FormData();
        // Anexar arquivo
        if (logoFile instanceof Buffer) {
            // Node.js environment - convert Buffer to Blob using ArrayBuffer
            const arrayBuffer = logoFile.buffer.slice(logoFile.byteOffset, logoFile.byteOffset + logoFile.byteLength);
            // Detect file type from buffer
            let mimeType = 'image/png';
            let extension = 'png';
            // PNG signature: 89 50 4E 47
            if (logoFile[0] === 0x89 && logoFile[1] === 0x50) {
                mimeType = 'image/png';
                extension = 'png';
            }
            // JPEG signature: FF D8 FF
            else if (logoFile[0] === 0xff && logoFile[1] === 0xd8) {
                mimeType = 'image/jpeg';
                extension = 'jpg';
            }
            // SVG signature (starts with <)
            else if (logoFile[0] === 0x3c) {
                mimeType = 'image/svg+xml';
                extension = 'svg';
            }
            const blob = new Blob([arrayBuffer], { type: mimeType });
            formData.append('logo', blob, `logo.${extension}`);
        }
        else {
            // Browser environment
            formData.append('logo', logoFile, 'logo');
        }
        // Anexar opções
        if (options.useAsStamp !== undefined) {
            formData.append('useAsStamp', String(options.useAsStamp));
        }
        const response = await this.httpClient.post('/api/v1/organization-settings/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
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
    async downloadLogo() {
        const response = await this.httpClient.get('/api/v1/organization-settings/logo', {
            responseType: 'blob',
        });
        return response.data;
    }
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
    async deleteLogo() {
        await this.httpClient.delete('/api/v1/organization-settings/logo');
    }
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
    async hasLogo() {
        try {
            const settings = await this.get();
            return !!settings.organizationLogoUrl;
        }
        catch {
            return false;
        }
    }
    // ==================== AUTHENTICATION LEVEL HELPERS ====================
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
    async getAuthenticationLevel() {
        const settings = await this.get();
        return settings.defaultAuthLevel;
    }
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
    async setAuthenticationLevel(level) {
        return this.update({ defaultAuthLevel: level });
    }
}
exports.OrganizationSettingsService = OrganizationSettingsService;
//# sourceMappingURL=OrganizationSettingsService.js.map