import { z } from 'zod';
import { EnvelopeStatus, Timestamps } from './common.types';
import { Document } from './document.types';
export interface SelfSignerConfig {
    /** Ordem de assinatura do criador (default: 1) */
    signingOrder?: number;
    /** Mensagem personalizada para o criador */
    customMessage?: string;
    /** Canal de comunicação preferido (default: 'email') */
    preferredChannel?: 'email' | 'sms' | 'whatsapp';
    /** Papel/função do criador no documento */
    role?: string;
    /** Número de telefone para autenticação SMS (opcional) */
    phoneNumber?: string;
}
export interface EnvelopeInput {
    name: string;
    description?: string;
    deadline?: string;
    autoClose?: boolean;
    notificationSettings?: NotificationSettings;
    blockOnRefusal?: boolean;
    customFields?: Record<string, any>;
    callbackUrl?: string;
    ownerId?: string;
    /** Adicionar o criador automaticamente como signatário com autenticação simplificada */
    addMeAsSigner?: boolean;
    /** Configurações para self-signing */
    selfSignerConfig?: SelfSignerConfig;
}
export interface UpdateEnvelopeDto extends Partial<EnvelopeInput> {
    status?: EnvelopeStatus;
}
export interface CancelEnvelopeDto {
    status: 'canceled';
    cancellationReason: string;
    notifySigners?: boolean;
}
export interface FindEnvelopeByIdOptions {
    /**
     * Incluir entidades relacionadas na resposta.
     * Pode ser um único valor ou múltiplos separados por vírgula.
     *
     * @example 'documents'
     * @example 'signers'
     * @example 'documents,signers'
     * @example 'documents,signers,events'
     */
    include?: 'documents' | 'signers' | 'events' | 'documents,signers' | 'documents,events' | 'signers,events' | 'documents,signers,events';
}
export interface NotificationSettings {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    reminderEnabled?: boolean;
    reminderIntervalHours?: number;
    customMessage?: string;
}
export declare const NotificationSettingsSchema: z.ZodObject<{
    emailEnabled: z.ZodOptional<z.ZodBoolean>;
    smsEnabled: z.ZodOptional<z.ZodBoolean>;
    whatsappEnabled: z.ZodOptional<z.ZodBoolean>;
    reminderEnabled: z.ZodOptional<z.ZodBoolean>;
    reminderIntervalHours: z.ZodOptional<z.ZodNumber>;
    customMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SelfSignerConfigSchema: z.ZodObject<{
    signingOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    customMessage: z.ZodOptional<z.ZodString>;
    preferredChannel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        email: "email";
        sms: "sms";
        whatsapp: "whatsapp";
    }>>>;
    role: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const EnvelopeInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    deadline: z.ZodOptional<z.ZodString>;
    autoClose: z.ZodOptional<z.ZodBoolean>;
    notificationSettings: z.ZodOptional<z.ZodObject<{
        emailEnabled: z.ZodOptional<z.ZodBoolean>;
        smsEnabled: z.ZodOptional<z.ZodBoolean>;
        whatsappEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderIntervalHours: z.ZodOptional<z.ZodNumber>;
        customMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    blockOnRefusal: z.ZodOptional<z.ZodBoolean>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    callbackUrl: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    addMeAsSigner: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    selfSignerConfig: z.ZodOptional<z.ZodObject<{
        signingOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        customMessage: z.ZodOptional<z.ZodString>;
        preferredChannel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            email: "email";
            sms: "sms";
            whatsapp: "whatsapp";
        }>>>;
        role: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const UpdateEnvelopeDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    deadline: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    autoClose: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    notificationSettings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        emailEnabled: z.ZodOptional<z.ZodBoolean>;
        smsEnabled: z.ZodOptional<z.ZodBoolean>;
        whatsappEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderIntervalHours: z.ZodOptional<z.ZodNumber>;
        customMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    blockOnRefusal: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    customFields: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    callbackUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addMeAsSigner: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    selfSignerConfig: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        signingOrder: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        customMessage: z.ZodOptional<z.ZodString>;
        preferredChannel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            email: "email";
            sms: "sms";
            whatsapp: "whatsapp";
        }>>>;
        role: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        running: "running";
        completed: "completed";
        canceled: "canceled";
        closed: "closed";
    }>>;
}, z.core.$strip>;
export declare const CancelEnvelopeDtoSchema: z.ZodObject<{
    status: z.ZodLiteral<"canceled">;
    cancellationReason: z.ZodString;
    notifySigners: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export interface Envelope extends EnvelopeInput, Timestamps {
    id: string;
    status: EnvelopeStatus;
    ownerId: string;
    organizationId?: string;
    notificationsSent?: number;
    lastNotificationAt?: string;
    activatedAt?: string;
    completedAt?: string;
    expiresAt?: string;
    documentsCount: number;
    signersCount: number;
    signedCount: number;
    pendingCount: number;
    rejectedCount: number;
    completionPercentage: number;
    isActive: boolean;
    canBeActivated: boolean;
    activationRequirements: ActivationRequirement[];
    owner: {
        id: string;
        name: string;
        email: string;
    };
    documents?: Document[];
    signers?: any[];
    events?: any[];
}
export interface ActivateEnvelopeResponse {
    envelope: Envelope;
    notificationsSent?: number;
}
export interface ActivationRequirement {
    type: 'authentication' | 'qualification';
    description: string;
    isSatisfied: boolean;
    relatedEntityId?: string;
    relatedEntityType?: 'signer' | 'document';
}
export declare const EnvelopeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        draft: "draft";
        running: "running";
        completed: "completed";
        canceled: "canceled";
        closed: "closed";
    }>;
    deadline: z.ZodOptional<z.ZodString>;
    autoClose: z.ZodOptional<z.ZodBoolean>;
    notificationSettings: z.ZodOptional<z.ZodObject<{
        emailEnabled: z.ZodOptional<z.ZodBoolean>;
        smsEnabled: z.ZodOptional<z.ZodBoolean>;
        whatsappEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderEnabled: z.ZodOptional<z.ZodBoolean>;
        reminderIntervalHours: z.ZodOptional<z.ZodNumber>;
        customMessage: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    blockOnRefusal: z.ZodOptional<z.ZodBoolean>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    callbackUrl: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    documentsCount: z.ZodNumber;
    signersCount: z.ZodNumber;
    signedCount: z.ZodNumber;
    pendingCount: z.ZodNumber;
    rejectedCount: z.ZodNumber;
    completionPercentage: z.ZodNumber;
    isActive: z.ZodBoolean;
    canBeActivated: z.ZodBoolean;
    activationRequirements: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            authentication: "authentication";
            qualification: "qualification";
        }>;
        description: z.ZodString;
        isSatisfied: z.ZodBoolean;
        relatedEntityId: z.ZodOptional<z.ZodString>;
        relatedEntityType: z.ZodOptional<z.ZodEnum<{
            document: "document";
            signer: "signer";
        }>>;
    }, z.core.$strip>>;
    owner: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export interface EnvelopeFilters {
    status?: EnvelopeStatus | EnvelopeStatus[];
    name?: string;
    createdFrom?: string;
    createdTo?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    ownerId?: string;
    page?: number;
    perPage?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'deadline' | 'completionPercentage';
    sortOrder?: 'asc' | 'desc';
}
export interface EnvelopeStats {
    totalEnvelopes: number;
    draftEnvelopes: number;
    runningEnvelopes: number;
    completedEnvelopes: number;
    canceledEnvelopes: number;
    averageCompletionTimeHours: number;
    completionRatePercentage: number;
}
export interface NotifyEnvelopeResponse {
    envelopeId: string;
    notificationsSent: number;
    notificationDetails: {
        signerId: string;
        signerName: string;
        signerEmail: string;
        channels: string[];
        status: 'sent' | 'failed';
        erroMessage?: string;
    }[];
}
export interface GenerateZipResponse {
    jobId: string;
    envelopeId: string;
    status: 'pending' | 'processing';
    message: string;
    estimatedCompletionTime?: string;
}
export interface ZipStatusResponse {
    jobId: string;
    envelopeId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progressPercentage?: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    downloadUrl?: string;
    expiresAt?: string;
    errorMessage?: string;
    fileSizeBytes?: number;
}
export interface AuditTrailEntry {
    id: string;
    occurredAt: string;
    action: string;
    actor: {
        type: 'user' | 'signer' | 'system';
        id: string;
        name: string;
        email?: string;
    };
    target?: {
        type: 'envelope' | 'document' | 'signer';
        id: string;
        name: string;
    };
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        geolocation?: string;
        [key: string]: any;
    };
    signature?: string;
}
export interface AuditTrail {
    envelopeId: string;
    envelopeName: string;
    generatedAt: string;
    entries: AuditTrailEntry[];
    totalEntries: number;
}
/**
 * Input para um documento a ser gerado a partir de template
 */
export interface TemplateDocumentInput {
    /** ID do template a ser usado */
    templateId: string;
    /** Nome customizado para o documento (opcional, usa nome do template se não fornecido) */
    name?: string;
    /** Variáveis específicas para este documento (sobrescreve globalVariables) */
    variables?: Record<string, any>;
}
/**
 * Input para um signatário no envelope
 */
export interface SignerForEnvelopeInput {
    /** Role/papel do signatário (deve corresponder aos roles definidos nos templates) */
    role: string;
    /** Nome completo do signatário */
    name: string;
    /** Email do signatário */
    email: string;
    /** Telefone do signatário (com DDD) */
    phone?: string;
    /** Número do documento (CPF/CNPJ) */
    documentNumber?: string;
    /** Campos customizados do signatário */
    customFields?: Record<string, any>;
    /** Endereço do signatário */
    address?: Record<string, any>;
    /** Ordem de assinatura (opcional, usa do template se não fornecido) */
    signingOrder?: number;
}
/**
 * Input para criar envelope completo a partir de templates
 */
export interface CreateEnvelopeFromTemplatesInput {
    /** Nome do envelope */
    name: string;
    /** Descrição do envelope */
    description?: string;
    /** Status inicial do envelope (DRAFT ou RUNNING) */
    status?: 'draft' | 'running';
    /** Modo sandbox (true para testes, false para produção) */
    sandbox?: boolean;
    /** Prazo limite para assinaturas (ISO 8601) */
    deadline?: string;
    /** URL de callback para webhooks */
    callbackUrl?: string;
    /** Lista de documentos a gerar a partir de templates */
    documents: TemplateDocumentInput[];
    /** Lista de signatários com seus roles */
    signers: SignerForEnvelopeInput[];
    /** Variáveis globais (fallback para todos os documentos) */
    globalVariables?: Record<string, any>;
    /** Se true, ativa o envelope automaticamente após criação */
    autoActivate?: boolean;
    /** Se true, envia notificações aos signatários após ativação */
    notifySigners?: boolean;
}
/**
 * Response inicial ao criar envelope via templates (202 Accepted)
 */
export interface EnvelopeFromTemplatesJobResponse {
    /** ID do job de processamento em background */
    jobId: string;
    /** Status do job */
    status: 'pending' | 'processing' | 'completed' | 'failed';
    /** Mensagem descritiva */
    message: string;
    /** Tempo estimado de conclusão (segundos) */
    estimatedCompletionTimeSeconds?: number;
    /** Timestamp de criação do job */
    createdAt: string;
    /** URL para consultar o status do job */
    statusUrl?: string;
}
/**
 * Informações de um documento gerado
 */
export interface GeneratedDocumentInfo {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    pageCount: number;
    fileSize: number;
}
/**
 * Informações de um signatário criado
 */
export interface CreatedSignerInfo {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}
/**
 * Informações de um campo de assinatura criado
 */
export interface CreatedSignatureFieldInfo {
    id: string;
    documentId: string;
    signerId: string;
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    anchorString?: string;
}
/**
 * Response completa quando o job é concluído com sucesso
 */
export interface EnvelopeFromTemplatesResponse {
    envelope: {
        id: string;
        name: string;
        status: string;
        documentsCount: number;
        signersCount: number;
        createdAt: string;
    };
    documents: GeneratedDocumentInfo[];
    signers: CreatedSignerInfo[];
    signatureFields: CreatedSignatureFieldInfo[];
    variablesUsed: Record<string, Record<string, string>>;
    notificationsSent?: number;
    warnings?: string[];
}
/**
 * Response de status de job
 */
export interface JobStatusResponse {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progressPercentage?: number;
    currentStep?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    result?: EnvelopeFromTemplatesResponse;
    errorCode?: string;
    errorMessage?: string;
    errors?: string[];
    metadata?: Record<string, any>;
}
//# sourceMappingURL=envelope.types.d.ts.map