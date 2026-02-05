/**
 * Receipt Types for Signature Module SDK
 *
 * Types related to simple document receipt confirmation:
 * - Creating receipt envelopes
 * - Sending receipt tokens
 * - Validating tokens and confirming receipt
 * - Downloading stamped documents
 */
/**
 * Notification channel for receipt requests
 */
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP"
}
/**
 * Receipt receiver configuration
 */
export interface ReceiptReceiverInput {
    /** Receiver's full name */
    name: string;
    /** Receiver's email address */
    email: string;
    /** Phone number (optional, required for SMS/WhatsApp) */
    phone?: string;
    /** Allowed notification channels */
    allowedChannels: NotificationChannel[];
}
/**
 * Create receipt envelope DTO
 */
export interface CreateReceiptEnvelopeInput {
    /** Envelope name */
    name: string;
    /** Envelope description (optional) */
    description?: string;
    /** List of receivers */
    receivers: ReceiptReceiverInput[];
}
/**
 * Receipt envelope response
 */
export interface ReceiptEnvelope {
    /** Envelope ID */
    id: string;
    /** Envelope name */
    name: string;
    /** Envelope description */
    description?: string;
    /** Envelope type (should be 'RECEIPT') */
    type: string;
    /** Envelope status */
    status: string;
    /** Total number of receivers */
    receiversCount: number;
    /** Number of receipts confirmed */
    receivedCount: number;
    /** Number of pending receipts */
    pendingCount: number;
    /** Owner user ID */
    ownerId: string;
    /** Organization ID */
    organizationId: string;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
}
/**
 * Send receipt tokens response
 */
export interface SendReceiptTokensResponse {
    /** Number of tokens sent */
    sent: number;
    /** Message */
    message: string;
}
/**
 * Validate receipt token input
 */
export interface ValidateReceiptTokenInput {
    /** Receiver (signer) ID */
    signerId: string;
    /** 6-digit token */
    token: string;
}
/**
 * Validate receipt token response
 */
export interface ValidateReceiptTokenResponse {
    /** Whether token is valid */
    valid: boolean;
    /** Validation message */
    message: string;
    /** Receiver information if valid */
    receiver?: {
        id: string;
        name: string;
        email: string;
    };
    /** Envelope information if valid */
    envelope?: {
        id: string;
        name: string;
        description?: string;
    };
}
/**
 * Confirm receipt input
 */
export interface ConfirmReceiptInput {
    /** 6-digit token */
    token: string;
    /** Notification channel used */
    channel: NotificationChannel;
    /** Receiver (signer) ID */
    signerId: string;
}
/**
 * Confirm receipt response
 */
export interface ConfirmReceiptResponse {
    /** Success status */
    success: boolean;
    /** Success message */
    message: string;
    /** Receipt confirmation timestamp */
    confirmedAt: Date;
    /** Channel used for confirmation */
    channel: NotificationChannel;
    /** Whether envelope is completed */
    isCompleted: boolean;
}
/**
 * Receipt information for public access
 */
export interface ReceiptInfo {
    /** Envelope ID */
    envelopeId: string;
    /** Envelope name */
    envelopeName: string;
    /** Envelope description */
    envelopeDescription?: string;
    /** Total receivers */
    receiversCount: number;
    /** Received count */
    receivedCount: number;
    /** Pending count */
    pendingCount: number;
    /** Receiver information */
    receiver: {
        id: string;
        name: string;
        email: string;
        status: string;
    };
    /** Document information */
    documents?: Array<{
        id: string;
        name: string;
        contentType: string;
    }>;
}
/**
 * Receipt history entry
 */
export interface ReceiptHistoryEntry {
    /** Receiver ID */
    receiverId: string;
    /** Receiver name */
    receiverName: string;
    /** Receiver email */
    receiverEmail: string;
    /** Confirmation timestamp */
    confirmedAt: Date;
    /** Channel used */
    channel: NotificationChannel;
    /** IP address */
    ipAddress: string;
    /** User agent */
    userAgent?: string;
}
/**
 * Receipt history response
 */
export interface ReceiptHistoryResponse {
    /** Envelope ID */
    envelopeId: string;
    /** Envelope name */
    envelopeName: string;
    /** List of receipt confirmations */
    history: ReceiptHistoryEntry[];
}
/**
 * Download document response
 */
export interface DownloadDocumentResponse {
    /** Document buffer */
    buffer: Buffer;
    /** Content type */
    contentType: string;
    /** Filename */
    filename?: string;
}
//# sourceMappingURL=receipt.types.d.ts.map