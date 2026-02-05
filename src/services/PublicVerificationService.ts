import { AxiosInstance } from 'axios';
import { VerificationResponse, PublicDownloadResponse } from '../types/public-verification.types';

/**
 * PublicVerificationService - Verificação Pública de Documentos
 *
 * Seção 1.15 - Public Verification
 *
 * **IMPORTANTE**: Estes endpoints NÃO requerem autenticação.
 * São acessados via QR code nos carimbos de assinatura.
 *
 * Funcionalidades:
 * - Verificar autenticidade de documentos assinados
 * - Visualizar informações de assinaturas
 * - Download público de documentos (se habilitado)
 */
export class PublicVerificationService {
  constructor(private http: AxiosInstance) {}

  /**
   * Verifica documento assinado via hash SHA256
   *
   * **Endpoint público - SEM autenticação necessária**
   *
   * Este endpoint usa o hash SHA256 do documento e pode ser usado
   * após resolver um token curto (por exemplo, via verifyByToken).
   *
   * @param {string} hash - Hash SHA256 do documento (64 caracteres hexadecimais)
   * @returns {Promise<VerificationResponse>} Informações de verificação
   * @throws {ApiError} 404 se documento não encontrado
   * @throws {ApiError} 403 se verificação pública não habilitada
   *
   * @example
   * ```typescript
   * // Verificar documento via hash
   * const hash = 'abc123def456...'; // Hash do documento
   *
   * const verification = await client.publicVerification.verify(hash);
   *
   * console.log('Documento:', verification.documentName);
   * console.log('Assinado:', verification.isSigned);
   * console.log('Organização:', verification.organizationName);
   * console.log('Total de assinaturas:', verification.signatureCount);
   *
   * // Listar todas as assinaturas
   * verification.signatures.forEach(sig => {
   *   console.log(`${sig.signerName} (${sig.signerRole})`);
   *   console.log(`  Assinado em: ${sig.signedAt}`);
   *   console.log(`  Hash: ${sig.signatureHash}`);
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Verificar se download público está habilitado
   * const verification = await client.publicVerification.verify(hash);
   *
   * if (verification.allowPublicDownload) {
   *   const download = await client.publicVerification.download(hash);
   *   console.log('Download disponível:', download.downloadUrl);
   * } else {
   *   console.log('Download público não habilitado para este documento');
   * }
   * ```
   */
  async verify(hash: string): Promise<VerificationResponse> {
    // Validar formato do hash
    if (!hash || hash.length !== 64 || !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error('Hash inválido. Deve ser um hash SHA256 de 64 caracteres hexadecimais.');
    }

    const response = await this.http.get<VerificationResponse>(
      `/api/v1/public/verify/${hash}`
    );
    return response.data;
  }

  /**
   * Verifica documento assinado via token curto do QR code
   *
   * **Endpoint público - SEM autenticação necessária**
   *
   * @param {string} token - Token curto do QR code
   * @returns {Promise<VerificationResponse>} Informações de verificação
   * @throws {ApiError} 404 se token não encontrado
   * @throws {ApiError} 403 se verificação pública não habilitada
   */
  async verifyByToken(token: string): Promise<VerificationResponse> {
    if (!token) {
      throw new Error('Token inválido. Deve ser um token curto do QR code.');
    }

    const response = await this.http.get<VerificationResponse>(
      `/api/v1/v/${token}`
    );
    return response.data;
  }

  /**
   * Obter URL de download público do documento
   *
   * **Endpoint público - SEM autenticação necessária**
   *
   * Retorna uma URL temporária assinada do S3 válida por 1 hora.
   * O download público deve estar habilitado para o documento.
   *
   * @param {string} hash - Hash SHA256 do documento (64 caracteres hexadecimais)
   * @returns {Promise<PublicDownloadResponse>} URL temporária e tempo de expiração
   * @throws {ApiError} 404 se documento não encontrado
   * @throws {ApiError} 403 se download público não habilitado
   *
   * @example
   * ```typescript
   * // Download público de documento verificado
   * const hash = 'abc123def456...'; // Hash do QR code
   *
   * const download = await client.publicVerification.download(hash);
   *
   * console.log('URL de download:', download.downloadUrl);
   * console.log('Válida por:', download.expiresIn, 'segundos');
   *
   * // Usar a URL para download direto
   * window.open(download.downloadUrl, '_blank');
   * ```
   *
   * @example
   * ```typescript
   * // Verificar antes de fazer download
   * try {
   *   const verification = await client.publicVerification.verify(hash);
   *
   *   if (!verification.allowPublicDownload) {
   *     console.log('Download público não habilitado');
   *     return;
   *   }
   *
   *   const download = await client.publicVerification.download(hash);
   *   // Fazer download do arquivo
   *   const response = await fetch(download.downloadUrl);
   *   const blob = await response.blob();
   *   // Salvar arquivo...
   * } catch (error) {
   *   console.error('Erro ao baixar documento:', error);
   * }
   * ```
   */
  async download(hash: string): Promise<PublicDownloadResponse> {
    // Validar formato do hash
    if (!hash || hash.length !== 64 || !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error('Hash inválido. Deve ser um hash SHA256 de 64 caracteres hexadecimais.');
    }

    const response = await this.http.get<PublicDownloadResponse>(
      `/api/v1/public/download/${hash}`
    );
    return response.data;
  }

  // ==================== Helper Methods ====================

  /**
   * Validar formato de hash SHA256
   *
   * @param {string} hash - Hash para validar
   * @returns {boolean} true se hash é válido
   *
   * @example
   * ```typescript
   * const isValid = client.publicVerification.isValidHash('abc123...');
   * ```
   */
  isValidHash(hash: string): boolean {
    return !!hash && hash.length === 64 && /^[a-f0-9]{64}$/i.test(hash);
  }

  /**
   * Verificar se documento permite download público
   *
   * Atalho para verificar o documento e retornar apenas se download está habilitado.
   *
   * @param {string} hash - Hash SHA256 do documento
   * @returns {Promise<boolean>} true se download público está habilitado
   *
   * @example
   * ```typescript
   * const canDownload = await client.publicVerification.canDownload(hash);
   * if (canDownload) {
   *   const url = await client.publicVerification.download(hash);
   * }
   * ```
   */
  async canDownload(hash: string): Promise<boolean> {
    try {
      const verification = await this.verify(hash);
      return verification.allowPublicDownload;
    } catch {
      return false;
    }
  }
}
