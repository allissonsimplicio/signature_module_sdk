"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
/**
 * Service for managing approval workflows
 *
 * Handles:
 * - Creating approval envelopes
 * - Sending approval tokens to approvers
 * - Validating approval tokens
 * - Processing approval decisions (approve/reject)
 * - Retrieving approval information and history
 *
 * @example
 * ```typescript
 * // Create approval envelope
 * const envelope = await client.approvals.create({
 *   name: 'Contract Review',
 *   approvers: [
 *     { name: 'Manager', email: 'manager@example.com', allowedChannels: ['EMAIL'] },
 *     { name: 'Director', email: 'director@example.com', allowedChannels: ['EMAIL'], approvalOrder: 2 }
 *   ],
 *   approvalMode: 'SEQUENTIAL',
 *   blockOnRejection: true
 * });
 *
 * // Send approval tokens
 * await client.approvals.sendTokens(envelope.id);
 * ```
 */
class ApprovalService {
    constructor(http) {
        this.http = http;
    }
    /**
     * Creates a new approval envelope
     *
     * @param dto - Approval envelope configuration
     * @returns Created approval envelope
     *
     * @example
     * ```typescript
     * const envelope = await client.approvals.create({
     *   name: 'Budget Approval',
     *   approvers: [
     *     {
     *       name: 'Finance Manager',
     *       email: 'finance@example.com',
     *       allowedChannels: ['EMAIL', 'SMS']
     *     }
     *   ],
     *   approvalMode: 'PARALLEL',
     *   blockOnRejection: false
     * });
     * ```
     */
    async create(dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post('/api/v1/approval', dto);
        return response.data;
    }
    /**
     * Sends approval tokens to all pending approvers
     *
     * For PARALLEL mode: sends to all pending approvers
     * For SEQUENTIAL mode: sends only to the next approver in order
     *
     * @param envelopeId - ID of the approval envelope
     * @returns Number of tokens sent
     *
     * @example
     * ```typescript
     * const result = await client.approvals.sendTokens('envelope-id');
     * console.log(`Sent ${result.sent} approval tokens`);
     * ```
     */
    async sendTokens(envelopeId) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/approval/${envelopeId}/send-tokens`);
        return response.data;
    }
    /**
     * Sets or updates the approval mode for an envelope
     *
     * @param envelopeId - ID of the approval envelope
     * @param dto - Approval mode configuration
     * @returns Updated envelope
     *
     * @example
     * ```typescript
     * await client.approvals.setMode('envelope-id', {
     *   approvalMode: 'SEQUENTIAL',
     *   blockOnRejection: true,
     *   requireApprovalComment: true
     * });
     * ```
     */
    async setMode(envelopeId, dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/approval/${envelopeId}/set-mode`, dto);
        return response.data;
    }
    // ==========================================
    // Public Endpoints (no authentication required)
    // ==========================================
    /**
     * Validates an approval token (public endpoint)
     *
     * Checks if the token is valid, not expired, and not used.
     * Also checks if the approver can approve now (for sequential mode).
     *
     * @param dto - Signer ID and token
     * @returns Validation result with approver and envelope info
     *
     * @example
     * ```typescript
     * const result = await client.approvals.validateToken({
     *   signerId: 'signer-id',
     *   token: '123456'
     * });
     *
     * if (result.valid && result.canApprove) {
     *   console.log('Token is valid and approver can approve now');
     * }
     * ```
     */
    async validateToken(dto) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post('/api/v1/public/approval/validate-token', dto);
        return response.data;
    }
    /**
     * Gets approval information for a specific envelope (public endpoint)
     *
     * Returns envelope details and approver information.
     * Useful for displaying approval page to approvers.
     *
     * @param envelopeId - ID of the approval envelope
     * @returns Approval information
     *
     * @example
     * ```typescript
     * const info = await client.approvals.getInfo('envelope-id');
     * console.log(`Envelope: ${info.envelopeName}`);
     * console.log(`Progress: ${info.approvedCount}/${info.approversCount}`);
     * ```
     */
    async getInfo(envelopeId) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get(`/api/v1/public/approval/${envelopeId}`);
        return response.data;
    }
    /**
     * Makes an approval decision (approve or reject) (public endpoint)
     *
     * Processes the approval decision using the validated token.
     * May complete or cancel the envelope depending on configuration.
     *
     * @param envelopeId - ID of the approval envelope
     * @param dto - Decision data with token, decision, and optional comment
     * @param metadata - Request metadata (IP and user agent)
     * @returns Decision result with envelope status
     *
     * @example
     * ```typescript
     * const result = await client.approvals.decide('envelope-id', {
     *   envelopeId: 'envelope-id',
     *   signerId: 'signer-id',
     *   token: '123456',
     *   decision: 'APPROVED',
     *   comment: 'Looks good!',
     *   channel: 'EMAIL'
     * }, {
     *   ip: '192.168.1.1',
     *   userAgent: 'Mozilla/5.0...'
     * });
     *
     * console.log(`Decision: ${result.decision}`);
     * console.log(`Envelope completed: ${result.isCompleted}`);
     * ```
     */
    async decide(envelopeId, dto, metadata) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.post(`/api/v1/public/approval/${envelopeId}/decide`, dto, {
            headers: {
                'X-Forwarded-For': metadata.ip,
                'User-Agent': metadata.userAgent,
            },
        });
        return response.data;
    }
    /**
     * Downloads the approved document with stamps (public endpoint)
     *
     * Returns the PDF document with approval stamps applied.
     * Only available after approval decisions are made.
     *
     * @param envelopeId - ID of the approval envelope
     * @param documentId - ID of the document to download
     * @returns Document buffer
     *
     * @example
     * ```typescript
     * const pdfBuffer = await client.approvals.downloadDocument('envelope-id', 'document-id');
     * fs.writeFileSync('approved-document.pdf', pdfBuffer);
     * ```
     */
    async downloadDocument(envelopeId, documentId) {
        const response = await this.http.get(`/api/v1/public/approval/${envelopeId}/download`, {
            params: { documentId },
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    /**
     * Gets approval history for an envelope (public endpoint)
     *
     * Returns a chronological list of all approval decisions made.
     *
     * @param envelopeId - ID of the approval envelope
     * @returns Approval history with all decisions
     *
     * @example
     * ```typescript
     * const history = await client.approvals.getHistory('envelope-id');
     * history.history.forEach(entry => {
     *   console.log(`${entry.approverName}: ${entry.decision} at ${entry.decidedAt}`);
     * });
     * ```
     */
    async getHistory(envelopeId) {
        // ✅ v3.0: Direct type (no ApiResponse wrapper)
        const response = await this.http.get(`/api/v1/public/approval/${envelopeId}/history`);
        return response.data;
    }
}
exports.ApprovalService = ApprovalService;
//# sourceMappingURL=ApprovalService.js.map