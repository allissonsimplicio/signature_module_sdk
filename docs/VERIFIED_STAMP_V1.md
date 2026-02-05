# Template verifiedStampV1 - Carimbo de Assinatura Verificado

## Visão Geral

O template **verifiedStampV1** é o novo padrão para carimbos de assinatura digital, substituindo o layout antigo por um design mais rico e profissional que inclui todas as informações de verificação.

## Características

### Layout Visual

```
┌──────────────────────────────────────────────────────────┐
│          ASSINATURA DIGITAL VERIFICADA (Header)          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [LOGO]  Nome: João Silva Santos              [QR CODE] │
│  60x60   Cargo: ADVOGADO                       90x90     │
│          Data: 27/10/2025 15:30:00                       │
│          Hash: a1b2c3d4e5f6g7h8i9j0...                   │
│          Verificar: api.exemplo.com                      │
│                                                           │
│          Organização Teste LTDA                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Dimensões

O template suporta três presets de tamanho (em PDF points, não pixels):

- **P (Pequeno):** 300x130 points
- **M (Médio - padrão):** 450x200 points
- **G (Grande):** 600x250 points

Dimensões customizadas também são aceitas:
- **Mínimo:** 150x50 points
- **Máximo:** 600x250 points

### Componentes

1. **Header** (azul claro, #eff6ff)
   - Texto: "ASSINATURA DIGITAL VERIFICADA"
   - Centralizado, fonte bold

2. **Logo da Organização** (esquerda)
   - Dimensões: 60x60 pixels
   - Usa `organizationLogoUrl` do OrganizationSettings
   - Opcional (configurável via `showLogo`)

3. **Dados Estruturados** (centro)
   - **Nome:** Nome completo do signatário
   - **Cargo:** Papel/qualificação do signatário
   - **Data:** Formato DD/MM/YYYY HH:mm:ss (timezone America/Sao_Paulo)
   - **Hash:** Hash SHA256 truncado (20 primeiros caracteres + "...")
   - **Verificar:** Domínio da URL de verificação

4. **QR Code** (direita)
   - Dimensões: 90x90 pixels
   - Aponta para URL de verificação pública
   - Opcional (configurável via `showQRCode`)

5. **Nome da Organização** (rodapé)
   - Usa `organizationName` do OrganizationSettings
   - Opcional

### Cores Padrão

- **Fundo:** `#FFFFFF` (branco)
- **Borda:** `#2563eb` (azul)
- **Texto:** `#1f2937` (cinza escuro)
- **Header:** `#1e40af` (azul escuro)
- **Labels:** `#6b7280` (cinza médio)

## Uso no SDK

### Criação de Carimbo Verificado

```typescript
import { SignatureClient } from '@protonsign/sdk';

const client = new SignatureClient({
  apiUrl: 'https://api.exemplo.com',
  apiToken: 'seu_token_aqui',
});

// Criar carimbo verificado em um documento (tamanho médio - padrão)
const stampFields = await client.signatureFields.createStampGroup(documentId, {
  signerId: 'signer_123',
  page: 1,
  x: 100,
  y: 650,
});

console.log('Campos criados:', stampFields.length); // 1
console.log('Dimensões:', stampFields[0].width, 'x', stampFields[0].height); // 450x200
console.log('Template: verifiedStampV1');

// Criar carimbo com tamanho específico
const smallStamp = await client.signatureFields.createStampGroup(documentId, {
  signerId: 'signer_123',
  page: 1,
  x: 100,
  y: 650,
  size: 'P', // Pequeno: 300x130
});

const largeStamp = await client.signatureFields.createStampGroup(documentId, {
  signerId: 'signer_123',
  page: 1,
  x: 100,
  y: 650,
  size: 'G', // Grande: 600x250
});
```

### Configuração do Template

Você pode customizar o template através do `OrganizationSettings`:

```typescript
// Configurar template na organização
await client.organizationSettings.update({
  stampTemplate: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563eb',
    textColor: '#1f2937',
    showLogo: true,
    showQRCode: true,
    fontSize: 10,
  },
  organizationName: 'Minha Empresa LTDA',
  organizationLogoUrl: 'https://cdn.exemplo.com/logo.png',
});
```

## Melhores Práticas

### 1. Escolha do Tamanho

Escolha o preset de tamanho adequado para o seu documento:

- **P (300x130pt)**: Ideal para documentos com múltiplas assinaturas ou espaço limitado
- **M (450x200pt)**: Padrão recomendado para a maioria dos casos
- **G (600x250pt)**: Para documentos importantes que requerem destaque visual

**Referência**: Em documentos A4 (595x842pt), o tamanho M ocupa ~10% da altura e ~75% da largura.

```typescript
// Para documentos com múltiplas assinaturas
const stampFields = await client.signatureFields.createStampGroup(documentId, {
  signerId: signer.id,
  page: document.pageCount,
  x: 50,
  y: 600,
  size: 'P', // Menor, permite mais assinaturas
});

// Para contratos importantes
const stampFields = await client.signatureFields.createStampGroup(documentId, {
  signerId: signer.id,
  page: document.pageCount,
  x: 50,
  y: 550,
  size: 'G', // Maior destaque visual
});
```

### 2. Logo da Organização

- **Formato:** PNG com transparência
- **Dimensões:** 512x512px (será redimensionado para 60x60)
- **Tamanho:** Máximo 2MB
- **Fundo:** Transparente (para melhor integração)

### 3. Posicionamento

- **Página final:** Recomendado posicionar na última página
- **Coordenadas:** Deixe margem de 50pt das bordas do documento
- **Espaço:** Garanta espaço suficiente conforme o preset escolhido (P: 300x130pt, M: 450x200pt, G: 600x250pt)
- **Unidade:** Use PDF points (1pt = 1/72 polegada), não pixels
- **Metadata de páginas:** Use o endpoint `GET /documents/:id/pages` para obter as dimensões exatas de cada página
  - Também pode ser acessado com JWT do signatário (Bearer), sem usuário interno.

```typescript
// Obter dimensões das páginas para posicionamento preciso
const metadata = await client.documents.getPagesMetadata(documentId);

// Usar dimensões da última página para posicionar carimbo
const lastPage = metadata.pages[metadata.pages.length - 1];
const stampFields = await client.signatureFields.createStampGroup(documentId, {
  signerId: signer.id,
  page: lastPage.pageNumber,
  x: 50,
  y: lastPage.heightPt - 250, // 50pt de margem inferior
  size: 'M',
});
```

### 4. Customização de Cores

Use cores que contrastem com o fundo branco:

```typescript
stampTemplate: {
  borderColor: '#1e40af',    // Azul escuro
  textColor: '#1f2937',      // Cinza escuro
  // Evite cores muito claras que dificultam leitura
}
```

### 5. Timezone

O template usa **America/Sao_Paulo** por padrão. Se sua organização opera em outro timezone, considere:

- Documentar o timezone usado
- Informar aos signatários sobre o horário de referência
- O timestamp é UTC no banco, apenas exibição é localizada

## Exemplos Completos

### Exemplo 1: Carimbo Básico

```typescript
// Criar documento e signatário
const document = await client.documents.create(envelopeId, {
  name: 'Contrato.pdf',
  file: pdfBuffer,
});

const signer = await client.signers.create(envelopeId, {
  name: 'João Silva Santos',
  email: 'joao@exemplo.com',
  qualificationRole: 'CONTRATANTE',
});

// Criar carimbo na última página
const [stampField] = await client.signatureFields.createStampGroup(document.id, {
  signerId: signer.id,
  page: document.pageCount,
  x: 100,
  y: 600,
});

console.log('Carimbo criado:', stampField.id);
console.log('Aguardando assinatura...');
```

### Exemplo 2: Carimbo Customizado

```typescript
// Primeiro, configure a organização
await client.organizationSettings.update({
  organizationName: 'ProtonSign LTDA',
  organizationLogoUrl: 'https://cdn.protonsign.com/logo.png',
  stampTemplate: {
    version: 'verifiedStampV1',
    backgroundColor: '#F8FAFC',
    borderColor: '#0EA5E9',
    textColor: '#0F172A',
    showLogo: true,
    showQRCode: true,
    fontSize: 10,
  },
});

// Depois, crie o carimbo
const [stampField] = await client.signatureFields.createStampGroup(document.id, {
  signerId: signer.id,
  page: document.pageCount,
  x: 100,
  y: 600,
});

// O carimbo usará as configurações da organização
```

## Verificação Pública

O QR Code e a URL no carimbo apontam para o endpoint público curto de verificação:

```
GET /api/v1/v/{token}
```

Exemplo de URL completa:
```
https://api.protonsign.com/api/v1/v/d4b7c0f5a1c94e67b8f21d3a4b9c2d8f
```

O endpoint retorna:
- Status da assinatura
- Nome do signatário
- Data e hora da assinatura
- Hash do documento
- Nome da organização

### Hash (avançado)

Para uso técnico/auditoria, o endpoint por hash do documento continua disponível:

```
GET /api/v1/public/verify/{documentHash}
```

Use este formato quando você já possui o `documentHash` (ex.: integrações técnicas).

## Suporte

Para dúvidas ou problemas com o template verifiedStampV1:

1. Verifique a documentação completa em `/docs/signature_fields/`
2. Execute o exemplo 12: `ts-node sdk/examples/12-organization-settings.ts`
3. Abra uma issue no repositório do projeto

## Changelog

### v3.0.0 (2026-01-13)
- ✨ Novo template verifiedStampV1 como padrão
- 🎨 Layout rico com header, logo, QR code e dados estruturados
- 📐 Dimensões padrão: 450x200 (antes: 200x70)
- 🕐 Timezone: America/Sao_Paulo
- 📝 Retorno de createStampGroup mudou de 3 campos para 1
