import { z } from 'zod';

/**
 * FASE 8 + Validation Layer: Sistema de Autenticação de Assinantes
 *
 * Métodos básicos: EMAIL_TOKEN, SMS_TOKEN, WHATSAPP_TOKEN, IP_ADDRESS, GEOLOCATION
 * Documentos: OFFICIAL_DOCUMENT (flexível: RG ou CNH com metadados), RG_FRONT, RG_BACK, CNH_FRONT
 * Biometria: SELFIE (recomendado), SELFIE_WITH_DOCUMENT (deprecated)
 * Comprovantes: ADDRESS_PROOF
 */

export type AuthenticationMethod =
  | 'emailToken'
  | 'whatsappToken'
  | 'smsToken'
  | 'ipAddress'
  | 'geolocation'
  | 'officialDocument'      // 🆕 FASE 10: Flexível (RG ou CNH) com metadados - Permite escolha do assinante
  | 'selfieWithDocument'    // @deprecated - Use 'selfie' (mais flexível e moderno)
  | 'addressProof'
  | 'selfie'
  // 🆕 Validation Layer: Métodos específicos de documentos
  | 'rgFront'               // RG Frente (foto para biometria)
  | 'rgBack'                // RG Verso (CPF, nome para OCR)
  | 'cnhFront';             // CNH Frente (foto + CPF + nome)

/**
 * Métodos de autenticação que suportam reutilização de documentos.
 */
export type ReusableAuthMethod =
  | 'officialDocument'
  | 'selfieWithDocument'
  | 'selfie'
  | 'addressProof'
  | 'rgFront'
  | 'rgBack'
  | 'cnhFront';

// ==========================================
// 🆕 VALIDATION LAYER TYPES
// ==========================================

/**
 * Status de validação do documento através do AI Service
 */
export type ValidationStatus =
  | 'PENDING'        // Aguardando upload
  | 'IN_ANALYSIS'    // Processando via AI Service (BullMQ job em andamento)
  | 'VERIFIED'       // Aprovado em todas as verificações
  | 'REJECTED';      // Rejeitado (ver rejectionReason para detalhes)

/**
 * Códigos de erro de validação
 *
 * Referência completa: docs/validation_layer/IMPLEMENTATION_STATUS.md
 *
 * Categorias:
 * - Qualidade de imagem: IMAGE_*
 * - Detecção facial: *_FACE_*, *_FACES_*
 * - Biometria: FACE_MISMATCH
 * - OCR: DOC_*_MISMATCH
 * - Liveness: POSSIBLE_SPOOF
 * - Serviço: AI_SERVICE_*
 */
export type ValidationErrorCode =
  // Qualidade de imagem
  | 'IMAGE_TOO_SMALL'         // Resolução abaixo de 640x480
  | 'IMAGE_TOO_BLURRY'        // Imagem desfocada (blur detection)
  | 'IMAGE_POOR_FRAMING'      // Enquadramento inadequado
  | 'IMAGE_TOO_DARK'          // Imagem escura demais
  | 'IMAGE_TOO_BRIGHT'        // Imagem clara demais (overexposed)
  | 'IMAGE_POOR_EXPOSURE'     // Exposição inadequada
  // Detecção facial
  | 'NO_FACE_DETECTED'        // Nenhum rosto detectado na imagem
  | 'MULTIPLE_FACES_DETECTED' // Múltiplas faces detectadas (apenas 1 esperada)
  | 'FACE_TOO_SMALL'          // Rosto muito pequeno na imagem
  // Comparação biométrica (documento vs selfie)
  | 'FACE_MISMATCH'           // Rosto do documento não corresponde à selfie
  // OCR e validação de dados
  | 'DOC_DATA_MISMATCH'       // Dados do documento não correspondem ao esperado
  | 'DOC_NAME_MISMATCH'       // Nome extraído não corresponde (fuzzy match < 85%)
  | 'DOC_CPF_MISMATCH'        // CPF extraído não corresponde
  // Liveness (anti-spoofing)
  | 'POSSIBLE_SPOOF'          // Possível tentativa de fraude detectada
  // Erros de serviço
  | 'AI_SERVICE_ERROR'        // Erro genérico no AI Service
  | 'AI_SERVICE_TIMEOUT';     // Timeout ao processar no AI Service

/**
 * Resultado detalhado da validação por IA
 *
 * Retornado pelo AI Service após processamento completo.
 */
export interface ValidationResult {
  /** Status geral da validação */
  overall_status: 'APPROVED' | 'REJECTED';

  /** Score de confiança geral (0-1) */
  confidence_score: number;

  /** Detalhes de cada verificação realizada */
  details: {
    /** Comparação facial (documento vs selfie) */
    face_match?: {
      match: boolean;
      similarity: number;     // Score de similaridade (0-1)
      threshold: number;      // Threshold usado (ex: 0.60)
    };

    /** Detecção de liveness (anti-spoofing) */
    liveness?: {
      passed: boolean;
      score: number;          // Score de liveness (0-1)
      confidence: number;     // Confiança da detecção (0-1)
    };

    /** OCR e validação de dados do documento */
    ocr?: {
      passed: boolean;
      extracted_name?: string;
      extracted_cpf?: string;
      name_match_score?: number;  // Fuzzy match score (0-100)
      cpf_match_score?: number;   // Match exato esperado = 100
    };
  };

  /** Código de rejeição (se REJECTED) */
  rejection_reason?: string;

  /** Tempo de processamento em milissegundos */
  processing_time_ms?: number;
}

/**
 * Resposta do endpoint de progresso de validação
 *
 * Usado para polling durante processamento assíncrono.
 *
 * @example
 * ```typescript
 * const progress = await client.authentication.getValidationProgress(authReqId);
 * console.log(`${progress.progress}% - ${progress.currentStep}`);
 * ```
 */
export interface ValidationProgressResponse {
  /** Status atual da validação */
  status: ValidationStatus;

  /** Progresso percentual (0-100) */
  progress: number;

  /** Descrição da etapa atual */
  currentStep: string;

  /** Tempo estimado restante em segundos */
  estimatedTimeSeconds?: number;

  // Quando concluído (VERIFIED ou REJECTED)
  /** Resultado completo da validação (apenas quando concluído) */
  result?: ValidationResult;

  /** Código de rejeição (apenas quando REJECTED) */
  rejectionCode?: ValidationErrorCode;

  /** Mensagem de rejeição amigável (apenas quando REJECTED) */
  rejectionMessage?: string;

  /** Dica de como corrigir o problema (apenas quando REJECTED) */
  rejectionHumanTip?: string;

  // Controle
  /** ID do job BullMQ (apenas quando IN_ANALYSIS) */
  jobId?: string;

  /** Se pode tentar novamente após erro */
  canRetry: boolean;
}

/**
 * Erro de validação pré-upload
 *
 * Retornado quando a imagem é rejeitada antes do processamento AI
 * (validação de qualidade básica no servidor).
 *
 * @example
 * ```typescript
 * try {
 *   await client.authentication.uploadDocument(authReqId, { file });
 * } catch (error) {
 *   const validationError = error.getValidationError();
 *   console.error(validationError.message);
 *   console.log('Dica:', validationError.humanTip);
 * }
 * ```
 */
export interface ValidationErrorResponse {
  status: 'REJECTED';
  code: ValidationErrorCode;
  message: string;
  humanTip: string;
  canRetry: boolean;
  metadata?: {
    fileSize?: number;
    dimensions?: { width: number; height: number };
    mimeType?: string;
  };
}

// ==========================================
// 🆕 EXTENDED RESPONSES
// ==========================================

/**
 * Resposta de upload de documento de autenticação
 *
 * @example
 * ```typescript
 * const result = await client.authentication.uploadDocument(authReqId, { file });
 *
 * if (result.job_id === 'AWAITING_OTHER_DOCUMENTS') {
 *   console.log('RG frente enviado. Aguardando verso...');
 * } else {
 *   console.log('Processamento iniciado. Job ID:', result.job_id);
 * }
 * ```
 */
export interface UploadAuthDocumentResponse {
  /** Se o upload foi realizado com sucesso */
  uploaded: boolean;

  /** Chave S3 do documento armazenado */
  s3Key: string;

  /** Data de expiração da URL assinada */
  expiresAt: string;

  /** ID do job BullMQ ou 'AWAITING_OTHER_DOCUMENTS' se aguardando mais uploads */
  jobId: string | 'AWAITING_OTHER_DOCUMENTS';
}

/**
 * Resposta estendida ao registrar IP e localização
 */
export interface RecordIpLocationResponse {
  /** Se o registro foi realizado com sucesso */
  recorded: boolean;

  /** Flag de risco de spoofing (se discrepância GPS/IP > 500km) */
  riskFlag?: 'RISK_SPOOFING';

  /** Mensagem adicional */
  message?: string;
}

// ==========================================
// AUTHENTICATION REQUIREMENT (EXTENDED)
// ==========================================

// Requisito de autenticação
export interface AuthenticationRequirement {
  id: string;
  method: AuthenticationMethod;
  description: string;
  isRequired: boolean;
  isSatisfied: boolean;
  satisfiedAt?: string;
  configuration?: Record<string, any>;
  evidence?: Record<string, any>;

  // Token (EMAIL_TOKEN, SMS_TOKEN, WHATSAPP_TOKEN)
  tokenValue?: string;
  tokenExpiresAt?: string;
  tokenUsed?: boolean;
  tokenUsedAt?: string;

  // Tentativas
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;

  // Documentos (OFFICIAL_DOCUMENT, SELFIE_WITH_DOCUMENT, ADDRESS_PROOF)
  documentS3Key?: string;
  documentUploadedAt?: string;
  documentExpiresAt?: string;
  documentMetadata?: Record<string, any>;

  // Geolocalização
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  ipLatitude?: number;   // 🆕 IP geolocation (para comparação anti-spoofing)
  ipLongitude?: number;  // 🆕 IP geolocation

  // IP
  ipAddress?: string;
  ipMetadata?: Record<string, any>;

  // 🆕 Validation Layer - Processamento Assíncrono
  /** Status atual da validação do documento */
  validationStatus?: ValidationStatus;

  /** Data/hora de início da validação */
  validationStartedAt?: string;

  /** Data/hora de conclusão da validação */
  validationFinishedAt?: string;

  /** Resultado completo da validação (retornado pelo AI Service) */
  validationResult?: ValidationResult;

  /** Código de rejeição (se validationStatus === 'REJECTED') */
  rejectionReason?: ValidationErrorCode;

  /** ID do job BullMQ de processamento forense */
  jobId?: string;

  signerId: string;
  createdAt: string;
  updatedAt: string;
}

// Input para criar requisito de autenticação
export interface CreateAuthenticationRequirementDto {
  method: AuthenticationMethod;
  description: string; // Obrigatório no backend
  isRequired?: boolean;
  configuration?: Record<string, any>;
}

// Input para verificar token
export interface VerifyTokenDto {
  token: string; // 6 caracteres
}

// Input para registrar IP e localização
export interface RecordIpLocationDto {
  ipAddress: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

// Input para upload de documento de autenticação
export interface UploadAuthDocumentDto {
  file: File | Buffer | Blob;
  /** 🆕 FASE 10: Tipo de documento (opcional, para OFFICIAL_DOCUMENT) */
  documentType?: 'RG' | 'CNH';
  /** 🆕 FASE 10: Parte do documento (obrigatório para RG, opcional para CNH) */
  documentPart?: 'FRONT' | 'BACK';
}

// Resposta ao enviar token
export interface SendAuthTokenResponse {
  tokenSent: boolean;
  expiresAt: string;
}

// Resposta ao verificar token
export interface VerifyTokenResponse {
  verified: boolean;
  message: string;
}

// Resposta de status de autenticação
export interface AuthenticationStatusResponse {
  signerId: string;
  allSatisfied: boolean;
  requirements: {
    id: string;
    method: AuthenticationMethod;
    isRequired: boolean;
    isSatisfied: boolean;
    satisfiedAt?: string;
    evidence?: Record<string, any>;
    // 🆕 Validation Layer fields
    validationStatus?: ValidationStatus;
    validationStartedAt?: string;
    validationFinishedAt?: string;
    validationResult?: ValidationResult;
    rejectionReason?: ValidationErrorCode;
    jobId?: string;
  }[];
}

// Resposta ao reutilizar documento
export interface ReuseDocumentResponse {
  reused: boolean;
  authRequirementId: string;
  message: string;
  documentS3Key?: string;
  expiresAt?: string;
}

// ==========================================
// SCHEMAS ZOD
// ==========================================

export const ValidationStatusSchema = z.enum(['PENDING', 'IN_ANALYSIS', 'VERIFIED', 'REJECTED']);

export const ValidationErrorCodeSchema = z.enum([
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

export const AuthenticationRequirementSchema = z.object({
  id: z.string(),
  method: z.enum([
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
  description: z.string(),
  isRequired: z.boolean(),
  isSatisfied: z.boolean(),
  satisfiedAt: z.string().datetime().optional(),
  configuration: z.record(z.string(), z.any()).optional(),
  evidence: z.record(z.string(), z.any()).optional(),
  attempts: z.number(),
  maxAttempts: z.number(),
  // 🆕 Validation Layer
  validationStatus: ValidationStatusSchema.optional(),
  validationStartedAt: z.string().datetime().optional(),
  validationFinishedAt: z.string().datetime().optional(),
  validationResult: z.record(z.string(), z.any()).optional(),
  rejectionReason: ValidationErrorCodeSchema.optional(),
  jobId: z.string().optional(),
  signerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ==========================================
// 🆕 OAUTH TYPES
// ==========================================

/**
 * Provedor de autenticação do usuário
 */
export type AuthProvider = 'local' | 'google';

/**
 * Resposta da URL de autenticação Google
 * Usado quando o frontend precisa da URL de redirect
 */
export interface GoogleAuthUrlResponse {
  url: string;
}

/**
 * Usuário com campos OAuth
 * Extensão do User base com campos de autenticação externa
 */
export interface UserWithOAuth {
  id: string;
  email: string;
  name: string;
  organizationId?: string;
  role: string;
  isActive: boolean;
  googleId?: string | null;
  authProvider: AuthProvider;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Schema Zod para AuthProvider
 */
export const AuthProviderSchema = z.enum(['local', 'google']);

/**
 * Schema Zod para UserWithOAuth
 */
export const UserWithOAuthSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  organizationId: z.string().optional(),
  role: z.string(),
  isActive: z.boolean(),
  googleId: z.string().nullable().optional(),
  authProvider: AuthProviderSchema,
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
