/**
 * Signing Session Types
 *
 * Types for the signing session endpoint that provides
 * complete context for a signer to complete their signature.
 */

export interface SigningSessionEnvelope {
  id: string;
  name: string;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELED';
  description?: string;
  deadline?: string;
}

export interface SigningSessionSigner {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  signingOrder?: number;
  status: string;
}

export interface SigningSessionDocument {
  id: string;
  name: string;
  pageCount: number;
  contentType: string;
  fileSize: number;
  fieldsCount: number;
  pendingFieldsCount: number;
  signedFieldsCount: number;
}

export interface SigningSessionAuthRequirement {
  id: string;
  method: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'FACIAL_BIOMETRY' | 'DOCUMENT_VALIDATION';
  status: 'PENDING' | 'SENT' | 'VERIFIED' | 'FAILED';
  required: boolean;
}

export interface SigningSessionAuthRequirements {
  stepUpRequired: boolean;
  stepUpSatisfied: boolean;
  requirements: SigningSessionAuthRequirement[];
}

export interface SigningSessionProgress {
  totalFields: number;
  signedFields: number;
  pendingFields: number;
  percentComplete: number;
}

export interface SigningSessionResponse {
  envelope: SigningSessionEnvelope;
  signer: SigningSessionSigner;
  documents: SigningSessionDocument[];
  authRequirements: SigningSessionAuthRequirements;
  progress: SigningSessionProgress;
}
