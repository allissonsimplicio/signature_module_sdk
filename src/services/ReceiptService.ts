import { AxiosInstance } from 'axios';
import {
  ReceiptEnvelope,
  CreateReceiptEnvelopeInput,
  SendReceiptTokensResponse,
  ValidateReceiptTokenInput,
  ValidateReceiptTokenResponse,
  ConfirmReceiptInput,
  ConfirmReceiptResponse,
  ReceiptInfo,
  ReceiptHistoryResponse,
} from '../types/receipt.types';
import { ApiResponse } from '../types/common.types';

/**
 * Service for managing receipt confirmation workflows
 *
 * Handles:
 * - Creating receipt envelopes
 * - Sending receipt tokens to receivers
 * - Validating receipt tokens
 * - Confirming receipt
 * - Retrieving receipt information and history
 *
 * @example
 * ```typescript
 * // Create receipt envelope
 * const envelope = await client.receipts.create({
 *   name: 'Contract Delivery',
 *   receivers: [
 *     { name: 'Client', email: 'client@example.com', allowedChannels: ['EMAIL'] }
 *   ]
 * });
 *
 * // Send receipt tokens
 * await client.receipts.sendTokens(envelope.id);
 * ```
 */
export class ReceiptService {
  constructor(private http: AxiosInstance) {}

  /**
   * Creates a new receipt envelope
   *
   * @param dto - Receipt envelope configuration
   * @returns Created receipt envelope
   *
   * @example
   * ```typescript
   * const envelope = await client.receipts.create({
   *   name: 'Invoice Delivery',
   *   description: 'Monthly invoice for December 2024',
   *   receivers: [
   *     {
   *       name: 'John Doe',
   *       email: 'john@example.com',
   *       phone: '+5511987654321',
   *       allowedChannels: ['EMAIL', 'WHATSAPP']
   *     }
   *   ]
   * });
   * ```
   */
  async create(dto: CreateReceiptEnvelopeInput): Promise<ReceiptEnvelope> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<ReceiptEnvelope>(
      '/api/v1/receipt',
      dto
    );
    return response.data;
  }

  /**
   * Sends receipt tokens to all pending receivers
   *
   * @param envelopeId - ID of the receipt envelope
   * @returns Number of tokens sent
   *
   * @example
   * ```typescript
   * const result = await client.receipts.sendTokens('envelope-id');
   * console.log(`Sent ${result.sent} receipt tokens`);
   * ```
   */
  async sendTokens(envelopeId: string): Promise<SendReceiptTokensResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<SendReceiptTokensResponse>(
      `/api/v1/receipt/${envelopeId}/send-tokens`
    );
    return response.data;
  }

  // ==========================================
  // Public Endpoints (no authentication required)
  // ==========================================

  /**
   * Validates a receipt token (public endpoint)
   *
   * Checks if the token is valid, not expired, and not used.
   *
   * @param dto - Signer ID and token
   * @returns Validation result with receiver and envelope info
   *
   * @example
   * ```typescript
   * const result = await client.receipts.validateToken({
   *   signerId: 'signer-id',
   *   token: '123456'
   * });
   *
   * if (result.valid) {
   *   console.log('Token is valid!');
   * }
   * ```
   */
  async validateToken(dto: ValidateReceiptTokenInput): Promise<ValidateReceiptTokenResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<ValidateReceiptTokenResponse>(
      '/api/v1/public/receipt/validate-token',
      dto
    );
    return response.data;
  }

  /**
   * Gets receipt information for a specific envelope (public endpoint)
   *
   * Returns envelope details and receiver information.
   * Useful for displaying receipt confirmation page.
   *
   * @param envelopeId - ID of the receipt envelope
   * @param token - 6-digit token
   * @returns Receipt information
   *
   * @example
   * ```typescript
   * const info = await client.receipts.getInfo('envelope-id', '123456');
   * console.log(`Envelope: ${info.envelopeName}`);
   * console.log(`Progress: ${info.receivedCount}/${info.receiversCount}`);
   * ```
   */
  async getInfo(envelopeId: string, token: string): Promise<ReceiptInfo> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<ReceiptInfo>(
      `/api/v1/public/receipt/${envelopeId}`,
      { params: { token } }
    );
    return response.data;
  }

  /**
   * Confirms document receipt (public endpoint)
   *
   * Processes the receipt confirmation using the validated token.
   * May complete the envelope if all receivers have confirmed.
   *
   * @param envelopeId - ID of the receipt envelope
   * @param dto - Confirmation data with token and channel
   * @param metadata - Request metadata (IP and user agent)
   * @returns Confirmation result
   *
   * @example
   * ```typescript
   * const result = await client.receipts.confirm('envelope-id', {
   *   token: '123456',
   *   channel: 'EMAIL',
   *   signerId: 'signer-id'
   * }, {
   *   ip: '192.168.1.1',
   *   userAgent: 'Mozilla/5.0...'
   * });
   *
   * console.log(`Receipt confirmed at: ${result.confirmedAt}`);
   * console.log(`Envelope completed: ${result.isCompleted}`);
   * ```
   */
  async confirm(
    envelopeId: string,
    dto: ConfirmReceiptInput,
    metadata: { ip: string; userAgent: string }
  ): Promise<ConfirmReceiptResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<ConfirmReceiptResponse>(
      `/api/v1/public/receipt/${envelopeId}/confirm`,
      dto,
      {
        headers: {
          'X-Forwarded-For': metadata.ip,
          'User-Agent': metadata.userAgent,
        },
      }
    );
    return response.data;
  }

  /**
   * Downloads the document with receipt stamp (public endpoint)
   *
   * Returns the PDF document with receipt confirmation stamp applied.
   *
   * @param envelopeId - ID of the receipt envelope
   * @param token - 6-digit token
   * @returns Document buffer
   *
   * @example
   * ```typescript
   * const pdfBuffer = await client.receipts.downloadDocument('envelope-id', '123456');
   * fs.writeFileSync('received-document.pdf', pdfBuffer);
   * ```
   */
  async downloadDocument(envelopeId: string, token: string): Promise<Buffer> {
    const response = await this.http.get(
      `/api/v1/public/receipt/${envelopeId}/download`,
      {
        params: { token },
        responseType: 'arraybuffer',
      }
    );
    return Buffer.from(response.data);
  }

  /**
   * Gets receipt history for an envelope (public endpoint)
   *
   * Returns a chronological list of all receipt confirmations.
   *
   * @param envelopeId - ID of the receipt envelope
   * @param token - 6-digit token
   * @returns Receipt history
   *
   * @example
   * ```typescript
   * const history = await client.receipts.getHistory('envelope-id', '123456');
   * history.history.forEach(entry => {
   *   console.log(`${entry.receiverName}: confirmed at ${entry.confirmedAt}`);
   * });
   * ```
   */
  async getHistory(envelopeId: string, token: string): Promise<ReceiptHistoryResponse> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<ReceiptHistoryResponse>(
      `/api/v1/public/receipt/${envelopeId}/history`,
      { params: { token } }
    );
    return response.data;
  }
}
