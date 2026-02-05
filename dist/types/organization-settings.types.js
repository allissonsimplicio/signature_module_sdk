"use strict";
/**
 * Organization Settings Types (Seção 1.14)
 * Configurações globais da organização incluindo PAdES e Letterhead
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationLevel = exports.LetterheadPosition = exports.SignatureStrategy = void 0;
const digital_signature_types_1 = require("./digital-signature.types");
Object.defineProperty(exports, "SignatureStrategy", { enumerable: true, get: function () { return digital_signature_types_1.SignatureStrategy; } });
const common_types_1 = require("./common.types");
Object.defineProperty(exports, "LetterheadPosition", { enumerable: true, get: function () { return common_types_1.LetterheadPosition; } });
/**
 * 🆕 FASE 12: Níveis de Autenticação para Signatários
 */
var AuthenticationLevel;
(function (AuthenticationLevel) {
    /** Email token + IP + Geolocalização (mínimo recomendado) */
    AuthenticationLevel["BASIC"] = "BASIC";
    /** BASIC + (WhatsApp ou SMS) + Documento + Selfie */
    AuthenticationLevel["STANDARD"] = "STANDARD";
    /** STANDARD + Comprovante de endereço (obrigatório para PAdES) */
    AuthenticationLevel["STRICT"] = "STRICT";
})(AuthenticationLevel || (exports.AuthenticationLevel = AuthenticationLevel = {}));
//# sourceMappingURL=organization-settings.types.js.map