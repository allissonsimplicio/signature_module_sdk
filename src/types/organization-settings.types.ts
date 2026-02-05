/**
 * Organization Settings Types (Seção 1.14)
 * Configurações globais da organização incluindo PAdES e Letterhead
 */

import { SignatureStrategy } from './digital-signature.types';
import { LetterheadPosition, LetterheadApplyTo } from './common.types';

// Re-export para conveniência
export { SignatureStrategy, LetterheadPosition };

/**
 * Páginas onde aplicar o papel timbrado
 * @deprecated Use LetterheadApplyTo from common.types
 */
export type LetterheadApplyPages = LetterheadApplyTo;

/**
 * Template de configuração do carimbo (stamp)
 * Layout padrão: 450x200 com header, logo, dados estruturados e QR code
 */
export interface StampTemplate {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  showLogo?: boolean;
  showQRCode?: boolean;
  fontSize?: number;
  [key: string]: any;
}

/**
 * Configurações completas da organização
 */
export interface OrganizationSettings {
  id: string;
  organizationId: string;
  userId: string;

  // Configurações básicas
  defaultPublicVerification: boolean;
  defaultPublicDownload: boolean;
  stampTemplate?: StampTemplate;
  stampPosition?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationLogoKey?: string; // 🆕 FASE 12: S3 key do logo
  organizationWebsite?: string;

  // FASE 3: Configurações de assinatura digital
  signatureStrategy: SignatureStrategy;
  defaultCertificateId?: string;
  requirePadesForAll: boolean;
  padesAutoApply: boolean;

  // FASE 10: Configurações de papel timbrado (letterhead)
  letterheadImageUrl?: string;
  letterheadImageKey?: string;
  useLetterhead: boolean;
  letterheadOpacity: number;
  letterheadPosition: LetterheadPosition;
  letterheadApplyToPages: LetterheadApplyTo;

  // 🆕 FASE 12: Níveis de Autenticação Padrão
  defaultAuthLevel: AuthenticationLevel;
  customAuthMethods?: string[]; // Array de métodos customizados (opcional)

  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para atualizar configurações da organização
 */
export interface UpdateOrganizationSettingsDto {
  // Configurações básicas
  defaultPublicVerification?: boolean;
  defaultPublicDownload?: boolean;
  stampTemplate?: StampTemplate;
  stampPosition?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationWebsite?: string;

  // 🆕 FASE 12: Níveis de Autenticação Padrão
  defaultAuthLevel?: AuthenticationLevel;

  // FASE 3: Configurações de assinatura digital
  signatureStrategy?: SignatureStrategy;
  defaultCertificateId?: string;
  requirePadesForAll?: boolean;
  padesAutoApply?: boolean;

  // FASE 10: Configurações de papel timbrado
  useLetterhead?: boolean;
  letterheadOpacity?: number;
  letterheadPosition?: LetterheadPosition;
  letterheadApplyToPages?: LetterheadApplyTo;

  // 🆕 FASE 14: Configuração de Stamp Layers
  stampConfiguration?: StampConfiguration;
}

/**
 * 🆕 FASE 14: Configuração de camadas (layers) de stamps
 */
export interface StampConfiguration {
  /** Array de layers ordenadas por ordem de aplicação */
  layers: StampLayer[];
  /** Se true, valida conflitos de sobreposição antes de aplicar */
  validateOverlap?: boolean;
  /** Modo de resolução de conflitos: 'skip' (pular) ou 'adjust' (ajustar posição) */
  conflictResolution?: 'skip' | 'adjust';
}

/**
 * Configuração de uma camada (layer) de stamp
 */
export interface StampLayer {
  /** Ordem de aplicação (1 = primeira camada) */
  order: number;
  /** Tipo de stamp */
  type: string;
  /** Posição no documento */
  position: string;
  /** Opacidade (0.0 a 1.0) */
  opacity?: number;
  /** Se true, aplica apenas na primeira página */
  firstPageOnly?: boolean;
  /** Se true, aplica apenas na última página */
  lastPageOnly?: boolean;
  /** Array de números de páginas específicas */
  specificPages?: number[];
  /** Se true, o stamp está desabilitado */
  disabled?: boolean;
  /** Coordenadas customizadas (se position = CUSTOM) */
  coordinates?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    page?: number;
  };
  /** Configurações adicionais */
  config?: Record<string, any>;
}

/**
 * Opções para upload de letterhead
 */
export interface UploadLetterheadOptions {
  /** Habilitar uso do letterhead após upload */
  useLetterhead?: boolean;
  /** Opacidade (0-100) - menor valor = mais transparente */
  opacity?: number;
  /** Posição no documento */
  position?: LetterheadPosition;
  /** Páginas onde aplicar */
  applyToPages?: LetterheadApplyPages;
}

/**
 * Resposta do upload de letterhead
 */
export interface UploadLetterheadResponse {
  /** URL público da imagem do letterhead */
  letterheadImageUrl: string;
  /** S3 key da imagem */
  letterheadImageKey: string;
  /** Configurações aplicadas */
  settings: {
    useLetterhead: boolean;
    letterheadOpacity: number;
    letterheadPosition: LetterheadPosition;
    letterheadApplyToPages: string;
  };
  /** Mensagem de sucesso */
  message: string;
}

/**
 * 🆕 FASE 12: Níveis de Autenticação para Signatários
 */
export enum AuthenticationLevel {
  /** Email token + IP + Geolocalização (mínimo recomendado) */
  BASIC = 'BASIC',
  /** BASIC + (WhatsApp ou SMS) + Documento + Selfie */
  STANDARD = 'STANDARD',
  /** STANDARD + Comprovante de endereço (obrigatório para PAdES) */
  STRICT = 'STRICT',
}

/**
 * 🆕 FASE 12: Opções para upload de logo
 */
export interface UploadLogoOptions {
  /** Usar logo como stamp padrão nos documentos */
  useAsStamp?: boolean;
}

/**
 * 🆕 FASE 12: Resposta do upload de logo
 */
export interface UploadLogoResponse {
  /** URL público do logo */
  organizationLogoUrl: string;
  /** S3 key do logo */
  organizationLogoKey: string;
  /** Configurações aplicadas */
  settings: {
    useAsStamp: boolean;
  };
  /** Mensagem de sucesso */
  message: string;
}
