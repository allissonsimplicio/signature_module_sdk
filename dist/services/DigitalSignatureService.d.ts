import { AxiosInstance } from 'axios';
import { DigitalCertificate, CertificateStats, CertificateFilters, UploadCertificateResponse } from '../types/digital-signature.types';
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
export declare class DigitalSignatureService {
    private client;
    constructor(client: AxiosInstance);
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
    uploadCertificate(certificateFile: Buffer | File | Blob, password: string, options?: {
        passwordHint?: string;
        certificateType?: 'A1' | 'A3' | 'A4';
        storePassword?: boolean;
    }): Promise<UploadCertificateResponse>;
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
    listCertificates(filters?: CertificateFilters): Promise<DigitalCertificate[]>;
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
    getCertificate(certificateId: string): Promise<DigitalCertificate>;
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
    getCertificateStats(): Promise<CertificateStats>;
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
    activateCertificate(certificateId: string): Promise<void>;
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
    deactivateCertificate(certificateId: string): Promise<void>;
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
    revokeCertificate(certificateId: string, reason: string): Promise<void>;
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
    deleteCertificate(certificateId: string): Promise<void>;
}
//# sourceMappingURL=DigitalSignatureService.d.ts.map