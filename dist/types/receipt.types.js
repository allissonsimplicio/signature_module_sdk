"use strict";
/**
 * Receipt Types for Signature Module SDK
 *
 * Types related to simple document receipt confirmation:
 * - Creating receipt envelopes
 * - Sending receipt tokens
 * - Validating tokens and confirming receipt
 * - Downloading stamped documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannel = void 0;
/**
 * Notification channel for receipt requests
 */
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
//# sourceMappingURL=receipt.types.js.map