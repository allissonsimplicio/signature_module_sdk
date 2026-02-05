import { z } from 'zod';
export declare const SignatureFieldTypeSchema: z.ZodEnum<{
    date: "date";
    text: "text";
    signature: "signature";
    initial: "initial";
    checkbox: "checkbox";
}>;
export type SignatureFieldType = z.infer<typeof SignatureFieldTypeSchema>;
export declare const SignatureFieldSchema: z.ZodObject<{
    id: z.ZodString;
    page: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    type: z.ZodEnum<{
        date: "date";
        text: "text";
        signature: "signature";
        initial: "initial";
        checkbox: "checkbox";
    }>;
    required: z.ZodDefault<z.ZodBoolean>;
    signed: z.ZodDefault<z.ZodBoolean>;
    value: z.ZodNullable<z.ZodString>;
    signedAt: z.ZodNullable<z.ZodString>;
    signatureData: z.ZodNullable<z.ZodString>;
    signatureHash: z.ZodNullable<z.ZodString>;
    hashAlgorithm: z.ZodNullable<z.ZodString>;
    documentHash: z.ZodNullable<z.ZodString>;
    signerRole: z.ZodNullable<z.ZodString>;
    documentId: z.ZodString;
    signerId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type SignatureField = z.infer<typeof SignatureFieldSchema>;
export declare const SignatureFieldInputSchema: z.ZodObject<{
    signerId: z.ZodString;
    page: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    type: z.ZodEnum<{
        date: "date";
        text: "text";
        signature: "signature";
        initial: "initial";
        checkbox: "checkbox";
    }>;
    required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    value: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SignatureFieldInput = z.infer<typeof SignatureFieldInputSchema>;
export declare const SignatureFieldUpdateSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        date: "date";
        text: "text";
        signature: "signature";
        initial: "initial";
        checkbox: "checkbox";
    }>>;
    value: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    page: z.ZodOptional<z.ZodNumber>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export type SignatureFieldUpdateInput = z.infer<typeof SignatureFieldUpdateSchema>;
export interface SignFieldDto {
    accessToken: string;
    /** Valor da assinatura (para campos TEXT, DATE, CHECKBOX) - max 500 caracteres */
    signatureValue?: string;
    /** URL da imagem de assinatura PNG pré-carregada no S3 (para SIGNATURE/INITIAL) */
    signatureImageUrl?: string;
    /** Imagem da assinatura em Base64 (alternativa ao URL) */
    signatureImage?: string;
    /** Metadados adicionais (IP, user agent, geolocalização, etc.) */
    metadata?: Record<string, any>;
    /** ID do certificado digital a ser usado para PAdES (opcional) */
    digitalCertificateId?: string;
    /** Senha do certificado (se não armazenada) */
    certificatePassword?: string;
    /** Razão da assinatura (para PAdES) */
    padesReason?: string;
    /** Local da assinatura (para PAdES) */
    padesLocation?: string;
    /** Informações de contato (para PAdES) */
    padesContactInfo?: string;
}
export declare const SignFieldDtoSchema: z.ZodObject<{
    accessToken: z.ZodString;
    signatureValue: z.ZodOptional<z.ZodString>;
    signatureImageUrl: z.ZodOptional<z.ZodString>;
    signatureImage: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    digitalCertificateId: z.ZodOptional<z.ZodString>;
    certificatePassword: z.ZodOptional<z.ZodString>;
    padesReason: z.ZodOptional<z.ZodString>;
    padesLocation: z.ZodOptional<z.ZodString>;
    padesContactInfo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export interface SignFieldResponse {
    signatureField: SignatureField;
    document: {
        id: string;
        version: number;
        s3Key: string;
    };
    verificationUrl?: string;
}
export interface SignatureFieldFilters {
    documentId?: string;
    signerId?: string;
    type?: SignatureFieldType;
    documentPage?: number;
    required?: boolean;
    isSigned?: boolean;
    createdFrom?: string;
    createdTo?: string;
    signedFrom?: string;
    signedTo?: string;
    sortBy?: 'page' | 'type' | 'required' | 'createdAt' | 'signedAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
}
export declare const SignatureFieldFiltersSchema: z.ZodObject<{
    documentId: z.ZodOptional<z.ZodString>;
    signerId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        date: "date";
        text: "text";
        signature: "signature";
        initial: "initial";
        checkbox: "checkbox";
    }>>;
    documentPage: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodBoolean>;
    isSigned: z.ZodOptional<z.ZodBoolean>;
    createdFrom: z.ZodOptional<z.ZodString>;
    createdTo: z.ZodOptional<z.ZodString>;
    signedFrom: z.ZodOptional<z.ZodString>;
    signedTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        type: "type";
        page: "page";
        required: "required";
        signedAt: "signedAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    page: z.ZodOptional<z.ZodNumber>;
    perPage: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export interface UpdateSignatureFieldInput {
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    type?: SignatureFieldType;
    required?: boolean;
    signerId?: string;
    value?: string;
    signedAt?: string;
    signatureImageUrl?: string;
}
export interface CreateStampGroupDto {
    signerId: string;
    page: number;
    x: number;
    y: number;
    /** Preset de tamanho: P (300x130pt), M (450x200pt - padrão), G (600x250pt) */
    size?: 'P' | 'M' | 'G';
}
export declare const CreateStampGroupDtoSchema: z.ZodObject<{
    signerId: z.ZodString;
    page: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    size: z.ZodOptional<z.ZodEnum<{
        P: "P";
        M: "M";
        G: "G";
    }>>;
}, z.core.$strip>;
export interface CreateInitialFieldsDto {
    signerId: string;
}
export declare const CreateInitialFieldsDtoSchema: z.ZodObject<{
    signerId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateSignatureFieldInputSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        date: "date";
        text: "text";
        signature: "signature";
        initial: "initial";
        checkbox: "checkbox";
    }>>;
    required: z.ZodOptional<z.ZodBoolean>;
    signerId: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodOptional<z.ZodString>;
    signatureImageUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=signature-field.types.d.ts.map