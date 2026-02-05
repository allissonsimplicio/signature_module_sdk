"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInfoSchema = exports.ApiResponseSchema = exports.LetterheadPosition = void 0;
const zod_1 = require("zod");
// 🆕 FASE 10: Letterhead Position
var LetterheadPosition;
(function (LetterheadPosition) {
    LetterheadPosition["BACKGROUND"] = "BACKGROUND";
    LetterheadPosition["OVERLAY"] = "OVERLAY";
})(LetterheadPosition || (exports.LetterheadPosition = LetterheadPosition = {}));
// Schema Zod para validação de resposta da API
const ApiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    message: zod_1.z.string().optional(),
    errors: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.ApiResponseSchema = ApiResponseSchema;
// Schema Zod para FileInfo
exports.FileInfoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    size: zod_1.z.number().min(0),
    type: zod_1.z.string(),
    content: zod_1.z.string().optional(),
});
//# sourceMappingURL=common.types.js.map