"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationRequirementSchema = exports.ValidationErrorCodeSchema = exports.ValidationStatusSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// SCHEMAS ZOD
// ==========================================
exports.ValidationStatusSchema = zod_1.z.enum(['PENDING', 'IN_ANALYSIS', 'VERIFIED', 'REJECTED']);
exports.ValidationErrorCodeSchema = zod_1.z.enum([
    'IMAGE_TOO_SMALL',
    'IMAGE_TOO_BLURRY',
    'IMAGE_POOR_FRAMING',
    'IMAGE_TOO_DARK',
    'IMAGE_TOO_BRIGHT',
    'IMAGE_POOR_EXPOSURE',
    'NO_FACE_DETECTED',
    'MULTIPLE_FACES_DETECTED',
    'FACE_TOO_SMALL',
    'FACE_MISMATCH',
    'DOC_DATA_MISMATCH',
    'DOC_NAME_MISMATCH',
    'DOC_CPF_MISMATCH',
    'POSSIBLE_SPOOF',
    'AI_SERVICE_ERROR',
    'AI_SERVICE_TIMEOUT',
]);
exports.AuthenticationRequirementSchema = zod_1.z.object({
    id: zod_1.z.string(),
    method: zod_1.z.enum([
        'emailToken',
        'whatsappToken',
        'smsToken',
        'ipAddress',
        'geolocation',
        'officialDocument',
        'selfieWithDocument',
        'addressProof',
        'selfie',
        // 🆕 Validation Layer
        'rgFront',
        'rgBack',
        'cnhFront',
    ]),
    description: zod_1.z.string(),
    isRequired: zod_1.z.boolean(),
    isSatisfied: zod_1.z.boolean(),
    satisfiedAt: zod_1.z.string().datetime().optional(),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    evidence: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    attempts: zod_1.z.number(),
    maxAttempts: zod_1.z.number(),
    // 🆕 Validation Layer
    validationStatus: exports.ValidationStatusSchema.optional(),
    validationStartedAt: zod_1.z.string().datetime().optional(),
    validationFinishedAt: zod_1.z.string().datetime().optional(),
    validationResult: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    rejectionReason: exports.ValidationErrorCodeSchema.optional(),
    jobId: zod_1.z.string().optional(),
    signerId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=authentication.types.js.map