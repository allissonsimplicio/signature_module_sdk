"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalSignatureService = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const ApiError_1 = require("../ApiError");
const validators_1 = require("../validators");
/**
 * Service para gerenciamento de certificados digitais e assinaturas PAdES
 *
 * @example
 * ```typescript
 * // Upload de certificado
 * const file = fs.readFileSync('certificado.p12');
 * const certificate = await client.digitalSignatures.uploadCertificate(
 *   file,
 *   'senha123',
 *   {
 *     passwordHint: 'Senha do certificado A1',
 *     certificateType: 'A1',
 *     storePassword: true // Habilita automação
 *   }
 * );
 *
 * // Listar certificados
 * const certificates = await client.digitalSignatures.listCertificates();
 *
 * // Obter estatísticas
 * const stats = await client.digitalSignatures.getCertificateStats();
 * console.log(`Total: ${stats.total}, Expiram em 30 dias: ${stats.expiringWithin30Days}`);
 * ```
 */
class DigitalSignatureService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Upload de certificado digital (P12/PFX)
     *
     * @param certificateFile - Arquivo do certificado (Buffer, File, Blob)
     * @param password - Senha do certificado
     * @param options - Opções adicionais
     * @returns Certificado criado (sem campos sensíveis)
     *
     * @example
     * ```typescript
     * const file = fs.readFileSync('meu-certificado.p12');
     * const certificate = await client.digitalSignatures.uploadCertificate(
     *   file,
     *   'MinhaSenh@123',
     *   {
       *     passwordHint: 'Senha do certificado A1',
     *     certificateType: 'A1',
     *     storePassword: true, // Para automação HYBRID_SEALED
     *   }
     * );
     * console.log(`Certificado ${certificate.commonName} carregado com sucesso!`);
     * console.log(`Válido até: ${certificate.notAfter}`);
     * ```
     */
    async uploadCertificate(certificateFile, password, options) {
        // Validar arquivo (MIME type e file size)
        (0, validators_1.validateCertificateFile)(certificateFile);
        try {
            const formData = new form_data_1.default();
            // Add certificate file
            if (certificateFile instanceof Buffer) {
                formData.append('certificate', certificateFile, {
                    filename: 'certificate.p12',
                    contentType: 'application/x-pkcs12',
                });
            }
            else {
                formData.append('certificate', certificateFile);
            }
            // Add form fields
            formData.append('password', password);
            if (options?.passwordHint) {
                formData.append('passwordHint', options.passwordHint);
            }
            if (options?.certificateType) {
                formData.append('certificateType', options.certificateType);
            }
            if (options?.storePassword !== undefined) {
                formData.append('storePassword', options.storePassword.toString());
            }
            const response = await this.client.post('/digital-signatures/certificates', formData, {
                headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to upload certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Lista todos os certificados da organização
     *
     * @param filters - Filtros opcionais
     * @returns Lista de certificados (sem campos sensíveis)
     *
     * @example
     * ```typescript
     * // Listar todos os certificados ativos
     * const certificates = await client.digitalSignatures.listCertificates();
     *
     * // Incluir certificados expirados
     * const allCertificates = await client.digitalSignatures.listCertificates({
     *   includeExpired: true,
     * });
     *
     * // Filtrar apenas A1
     * const a1Certificates = await client.digitalSignatures.listCertificates({
     *   certificateType: 'A1',
     * });
     * ```
     */
    async listCertificates(filters) {
        try {
            const params = {};
            if (filters?.includeExpired !== undefined) {
                params.includeExpired = filters.includeExpired;
            }
            if (filters?.certificateType) {
                params.certificateType = filters.certificateType;
            }
            if (filters?.isActive !== undefined) {
                params.isActive = filters.isActive;
            }
            if (filters?.isRevoked !== undefined) {
                params.isRevoked = filters.isRevoked;
            }
            const response = await this.client.get('/digital-signatures/certificates', {
                params,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to list certificates', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Obtém detalhes de um certificado específico
     *
     * @param certificateId - ID do certificado
     * @returns Certificado completo
     *
     * @example
     * ```typescript
     * const certificate = await client.digitalSignatures.getCertificate('cert-123');
     * console.log(`CPF/CNPJ: ${certificate.cpfCnpj}`);
     * console.log(`Organização: ${certificate.organization}`);
     * console.log(`Usado ${certificate.usageCount} vezes`);
     * ```
     */
    async getCertificate(certificateId) {
        try {
            const response = await this.client.get(`/digital-signatures/certificates/${certificateId}`);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to get certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Obtém estatísticas dos certificados da organização
     *
     * @returns Estatísticas completas
     *
     * @example
     * ```typescript
     * const stats = await client.digitalSignatures.getCertificateStats();
     * console.log(`Total de certificados: ${stats.total}`);
     * console.log(`Ativos: ${stats.active}`);
     * console.log(`Expirados: ${stats.expired}`);
     * console.log(`Revogados: ${stats.revoked}`);
     * console.log(`Expiram em 30 dias: ${stats.expiringWithin30Days}`);
     *
     * // Alerta de certificados expirando
     * if (stats.expiringWithin30Days > 0) {
     *   console.warn(`ATENÇÃO: ${stats.expiringWithin30Days} certificado(s) expiram em breve!`);
     * }
     * ```
     */
    async getCertificateStats() {
        try {
            const response = await this.client.get('/digital-signatures/certificates/stats');
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to get certificate stats', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Ativa um certificado
     *
     * @param certificateId - ID do certificado
     *
     * @example
     * ```typescript
     * await client.digitalSignatures.activateCertificate('cert-123');
     * console.log('Certificado ativado com sucesso!');
     * ```
     */
    async activateCertificate(certificateId) {
        try {
            await this.client.patch(`/digital-signatures/certificates/${certificateId}/activate`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to activate certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Desativa um certificado
     *
     * @param certificateId - ID do certificado
     *
     * @example
     * ```typescript
     * await client.digitalSignatures.deactivateCertificate('cert-123');
     * console.log('Certificado desativado com sucesso!');
     * ```
     */
    async deactivateCertificate(certificateId) {
        try {
            await this.client.patch(`/digital-signatures/certificates/${certificateId}/deactivate`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to deactivate certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Revoga um certificado permanentemente
     *
     * @param certificateId - ID do certificado
     * @param reason - Motivo da revogação
     *
     * @example
     * ```typescript
     * await client.digitalSignatures.revokeCertificate(
     *   'cert-123',
     *   'Certificado comprometido - senha vazada'
     * );
     * console.log('Certificado revogado permanentemente');
     * ```
     */
    async revokeCertificate(certificateId, reason) {
        try {
            const payload = { reason };
            await this.client.patch(`/digital-signatures/certificates/${certificateId}/revoke`, payload);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to revoke certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
    /**
     * Deleta um certificado permanentemente
     *
     * ⚠️ AVISO: Não é possível deletar certificados que já foram usados para assinar documentos.
     * Nesse caso, use revokeCertificate() ao invés de deleteCertificate().
     *
     * @param certificateId - ID do certificado
     *
     * @example
     * ```typescript
     * try {
     *   await client.digitalSignatures.deleteCertificate('cert-123');
     *   console.log('Certificado deletado com sucesso');
     * } catch (error) {
     *   if (error.statusCode === 400) {
     *     console.error('Não é possível deletar certificado que já foi usado');
     *     console.log('Use revokeCertificate() ao invés disso');
     *   }
     * }
     * ```
     */
    async deleteCertificate(certificateId) {
        try {
            await this.client.delete(`/digital-signatures/certificates/${certificateId}`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new ApiError_1.ApiError(error.response.data.message || 'Failed to delete certificate', error.response.status, error.response.statusText);
            }
            throw error;
        }
    }
}
exports.DigitalSignatureService = DigitalSignatureService;
//# sourceMappingURL=DigitalSignatureService.js.map