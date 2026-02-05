/**
 * Approval Types for Signature Module SDK
 *
 * Types related to approval workflows including:
 * - Approval envelopes creation
 * - Approval decisions (approve/reject)
 * - Token validation
 * - Approval modes (parallel/sequential)
 */
/**
 * Approval mode for envelope
 */
export declare enum ApprovalMode {
    /** All approvers can approve in any order */
    PARALLEL = "PARALLEL",
    /** Approvers must approve in sequential order */
    SEQUENTIAL = "SEQUENTIAL"
}
/**
 * Approval decision
 */
export declare enum ApprovalDecision {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
/**
 * Notification channel for approval requests
 */
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP"
}
/**
 * Approver configuration
 */
export interface ApproverInput {
    /** Approver's full name */
    name: string;
    /** Approver's email address */
    email: string;
    /** Phone number (optional, required for SMS/WhatsApp) */
    phone?: string;
    /** Allowed notification channels */
    allowedChannels: NotificationChannel[];
    /** Order for sequential approval (1-based, required for SEQUENTIAL mode) */
    approvalOrder?: number;
}
/**
 * Create approval envelope DTO
 */
export interface CreateApprovalEnvelopeInput {
    /** Envelope name */
    name: string;
    /** Envelope description (optional) */
    description?: string;
    /** List of approvers */
    approvers: ApproverInput[];
    /** Approval mode (default: PARALLEL) */
    approvalMode?: ApprovalMode;
    /** Cancel envelope if any approver rejects (default: false) */
    blockOnRejection?: boolean;
    /** Require comment when approving/rejecting (default: false) */
    requireApprovalComment?: boolean;
}
/**
 * Approval envelope response
 */
export interface ApprovalEnvelope {
    /** Envelope ID */
    id: string;
    /** Envelope name */
    name: string;
    /** Envelope description */
    description?: string;
    /** Envelope type (should be 'APPROVAL') */
    type: string;
    /** Envelope status */
    status: string;
    /** Approval mode */
    approvalMode: ApprovalMode;
    /** Block on rejection flag */
    blockOnRejection: boolean;
    /** Require comment flag */
    requireApprovalComment: boolean;
    /** Total number of approvers */
    approversCount: number;
    /** Number of approvals received */
    approvedCount: number;
    /** Number of rejections received */
    approvalRejectedCount: number;
    /** Number of pending approvals */
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
 * Send approval tokens response
 */
export interface SendApprovalTokensResponse {
    /** Number of tokens sent */
    sent: number;
    /** Message */
    message: string;
}
/**
 * Validate approval token input
 */
export interface ValidateApprovalTokenInput {
    /** Approver (signer) ID */
    signerId: string;
    /** 6-digit token */
    token: string;
}
/**
 * Validate approval token response
 */
export interface ValidateApprovalTokenResponse {
    /** Whether token is valid */
    valid: boolean;
    /** Whether approver can approve now (considering sequential mode) */
    canApprove?: boolean;
    /** Validation message */
    message: string;
    /** Approver information if valid */
    approver?: {
        id: string;
        name: string;
        email: string;
    };
    /** Envelope information if valid */
    envelope?: {
        id: string;
        name: string;
        requireApprovalComment: boolean;
    };
}
/**
 * Decide approval input (approve or reject)
 */
export interface DecideApprovalInput {
    /** Envelope ID */
    envelopeId: string;
    /** Approver (signer) ID */
    signerId: string;
    /** 6-digit token */
    token: string;
    /** Approval decision */
    decision: 'APPROVED' | 'REJECTED';
    /** Comment (optional, unless requireApprovalComment is true) */
    comment?: string;
    /** Notification channel used */
    channel: NotificationChannel;
}
/**
 * Decide approval response
 */
export interface DecideApprovalResponse {
    /** Whether decision was successful */
    success: boolean;
    /** Success message */
    message: string;
    /** Approval decision made */
    decision: ApprovalDecision;
    /** Envelope status after decision */
    envelopeStatus: string;
    /** Whether envelope is completed */
    isCompleted: boolean;
    /** Whether envelope was canceled (due to rejection with blockOnRejection) */
    isCanceled: boolean;
}
/**
 * Approval information for public access
 */
export interface ApprovalInfo {
    /** Envelope ID */
    envelopeId: string;
    /** Envelope name */
    envelopeName: string;
    /** Envelope description */
    envelopeDescription?: string;
    /** Approval mode */
    approvalMode: ApprovalMode;
    /** Require comment flag */
    requireApprovalComment: boolean;
    /** Total approvers */
    approversCount: number;
    /** Approved count */
    approvedCount: number;
    /** Rejected count */
    rejectedCount: number;
    /** Pending count */
    pendingCount: number;
    /** Approver information */
    approver: {
        id: string;
        name: string;
        email: string;
        status: string;
        approvalOrder?: number;
    };
}
/**
 * Approval history entry
 */
export interface ApprovalHistoryEntry {
    /** Approver ID */
    approverId: string;
    /** Approver name */
    approverName: string;
    /** Approver email */
    approverEmail: string;
    /** Approval decision */
    decision: ApprovalDecision;
    /** Comment provided */
    comment?: string;
    /** Decision timestamp */
    decidedAt: Date;
    /** Channel used */
    channel: NotificationChannel;
    /** IP address */
    ipAddress: string;
    /** Approval order (for sequential mode) */
    approvalOrder?: number;
}
/**
 * Approval history response
 */
export interface ApprovalHistoryResponse {
    /** Envelope ID */
    envelopeId: string;
    /** Envelope name */
    envelopeName: string;
    /** List of approval decisions */
    history: ApprovalHistoryEntry[];
}
/**
 * Set approval mode input
 */
export interface SetApprovalModeInput {
    /** Approval mode */
    approvalMode: ApprovalMode;
    /** Block on rejection flag */
    blockOnRejection?: boolean;
    /** Require comment flag */
    requireApprovalComment?: boolean;
}
//# sourceMappingURL=approval.types.d.ts.map