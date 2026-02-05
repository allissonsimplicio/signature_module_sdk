"use strict";
/**
 * Approval Types for Signature Module SDK
 *
 * Types related to approval workflows including:
 * - Approval envelopes creation
 * - Approval decisions (approve/reject)
 * - Token validation
 * - Approval modes (parallel/sequential)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannel = exports.ApprovalDecision = exports.ApprovalMode = void 0;
/**
 * Approval mode for envelope
 */
var ApprovalMode;
(function (ApprovalMode) {
    /** All approvers can approve in any order */
    ApprovalMode["PARALLEL"] = "PARALLEL";
    /** Approvers must approve in sequential order */
    ApprovalMode["SEQUENTIAL"] = "SEQUENTIAL";
})(ApprovalMode || (exports.ApprovalMode = ApprovalMode = {}));
/**
 * Approval decision
 */
var ApprovalDecision;
(function (ApprovalDecision) {
    ApprovalDecision["APPROVED"] = "APPROVED";
    ApprovalDecision["REJECTED"] = "REJECTED";
})(ApprovalDecision || (exports.ApprovalDecision = ApprovalDecision = {}));
/**
 * Notification channel for approval requests
 */
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
//# sourceMappingURL=approval.types.js.map