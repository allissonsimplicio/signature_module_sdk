# Signature Module SDK v2.1.0

Quick Start e exemplos de documentação

## 📋 Índice

- [Instalação](#-instalação)
- [Quick Start](#-quick-start)

## 📚 Quick Start & Documentação

### Serviços Disponíveis

O `SignatureClient` expõe 14 serviços especializados:

```typescript
client.users              // UserService (Fase 11)
client.apiTokens          // ApiTokenService (Fase 11)
client.organizations      // OrganizationService (Fase 11)
client.envelopes          // EnvelopeService
client.documents          // DocumentService
client.signers            // SignerService
client.signatureFields    // SignatureFieldService
client.templates          // DocumentTemplateService
client.notifications      // NotificationService
client.authentication     // AuthenticationService
client.publicVerification // PublicVerificationService
client.digitalSignatures  // DigitalSignatureService (Fase 3)
client.webhooks           // WebhookService (Fase 1.8)
client.events             // EventService (Fase 1.10)
```

### EnvelopeService

```typescript
// Criar envelope
const envelope = await client.envelopes.create({
  name: 'Contrato de Serviços',
  description: 'Contrato com João da Silva',
  deadline: '2025-12-31T23:59:59Z',
  notificationSettings: {
    emailEnabled: true,
    reminderEnabled: true,
    reminderEntervalHours: 24,
  },
});

// Listar envelopes
const envelopes = await client.envelopes.findAll({
  status: 'RUNNING',
  page: 1,
  perPage: 20,
});

// Ativar envelope (envia notificações)
const activated = await client.envelopes.activate(envelope.id);
console.log(`Notificações enviadas: ${activated.notificationsSent}`);

// Cancelar envelope
await client.envelopes.cancel(envelope.id, 'Motivo do cancelamento');
```

### DocumentTemplateService (Fase 7)

```typescript
// 1. Upload de template DOCX
const templateBuffer = fs.readFileSync('contrato-honorarios.docx');
const template = await client.templates.uploadAndExtract({
  file: templateBuffer,
});

console.log('Variáveis encontradas:', template.extractedVariables);
// ['{{CLIENTE_NOME}}', '{{ADVOGADO_OAB}}', '{{VALOR_HONORARIOS}}', ...]

// 2. Configurar mapeamento de variáveis
await client.templates.configure(template.id, {
  variableSchema: {
    '{{CLIENTE_NOME}}': {
      source: 'signer',
      role: 'CONTRATANTE',
      field: 'name',
      required: true,
    },
    '{{ADVOGADO_OAB}}': {
      source: 'signer',
      role: 'ADVOGADO',
      field: 'customFields.oab_numero',
      required: true,
    },
    '{{VALOR_HONORARIOS}}': {
      source: 'document',
      field: 'valor_honorarios',
      required: false,
      transform: 'formatCurrency',
    },
    '{{DATA_ASSINATURA}}': {
      source: 'system',
      field: 'currentDate',
      required: true,
      transform: 'formatDate:DD/MM/YYYY',
    },
    '{{CLIENTE_CPF}}': {
      source: 'signer',
      role: 'CONTRATANTE',
      field: 'documentNumber',
      transform: 'formatCPF',
    },
    '{{ADVOGADO_CNPJ}}': {
      source: 'signer',
      role: 'ADVOGADO',
      field: 'customFields.cnpj',
      transform: 'formatCNPJ',
    },
    '{{TELEFONE_CLIENTE}}': {
      source: 'signer',
      role: 'CONTRATANTE',
      field: 'phone',
      transform: 'formatPhone',
    },
    '{{CEP_CLIENTE}}': {
      source: 'signer',
      role: 'CONTRATANTE',
      field: 'address.zipCode',
      transform: 'formatCEP',
    },
    '{{NOME_EM_MAIUSCULAS}}': {
      source: 'signer',
      role: 'CONTRATANTE',
      field: 'name',
      transform: 'uppercase',
    },
  },
  requiredRoles: [
    {
      role: 'CONTRATANTE',
      displayName: 'Cliente',
      signingOrder: 1,
      signatureFieldPosition: { page: 1, x: 100, y: 650, width: 150, height: 50 },
    },
    {
      role: 'ADVOGADO',
      displayName: 'Advogado',
      signingOrder: 2,
      signatureFieldPosition: { page: 1, x: 350, y: 650, width: 150, height: 50 },
    },
  ],
});

// 3. Gerar documento a partir do template
const generated = await client.templates.generateDocument(template.id, {
  envelopeId: envelope.id,
  signers: [
    {
      role: 'CONTRATANTE',
      name: 'João da Silva Santos',
      email: 'joao@exemplo.com',
      documentNumber: '12345678900',
      phone: '5511987654321',
      address: { zipCode: '01000000' },
    },
    {
      role: 'ADVOGADO',
      name: 'Dr. Pedro Oliveira',
      email: 'pedro@adv.com',
      customFields: { oabNumero: '12345/CE', cnpj: '12345678000100' },
    },
  ],
  documentCustomFields: {
    valorHonorarios: 1500.75,
  },
});

console.log('Documento gerado:', generated.document.id);
console.log('Signatários criados:', generated.signers.length);
```

### AuthenticationService (Fase 8)

```typescript
// 1. Adicionar requisito de autenticação por token de email
const authReq = await client.authentication.create(signerId, {
  method: 'emailToken',
  description: 'Token de verificação por email',
  isRequired: true,
});

// 2. Enviar token
const sent = await client.authentication.sendToken(authReq.id);
console.log('Token expira em:', sent.expiresAt);

// 3. Verificar token (pelo assinante)
const verified = await client.authentication.verifyToken(authReq.id, {
  token: '123456',
});

// 4. Upload de documento oficial
const documentBuffer = fs.readFileSync('rg.jpg');
const uploaded = await client.authentication.uploadDocument(authReq.id, {
  file: documentBuffer,
});

// 5. Registrar IP e localização
await client.authentication.recordIpLocation(authReq.id, {
  ipAddress: '192.168.1.100',
  latitude: -3.7172,
  longitude: -38.5433,
  accuracy: 10,
});

// 6. Verificar status completo
const status = await client.authentication.getStatus(signerId);
console.log('Todas autenticações satisfeitas?', status.allSatisfied);
```

### Validation Layer - AI-Powered (Novo!)

```typescript
// 1. Criar requisitos de documentos específicos
const rgFrontReq = await client.authentication.create(signerId, {
  method: 'rgFront',
  description: 'RG Frente (foto do rosto)',
  isRequired: true,
});

const rgBackReq = await client.authentication.create(signerId, {
  method: 'rgBack',
  description: 'RG Verso (CPF e nome)',
  isRequired: true,
});

const selfieReq = await client.authentication.create(signerId, {
  method: 'selfieWithDocument',
  description: 'Selfie para comparação biométrica e validação por IA',
  isRequired: true,
});

// 2. Upload dos documentos
const rgFrontFile = fs.readFileSync('rg-frente.jpg');
const frontUpload = await client.authentication.uploadDocument(rgFrontReq.id, {
  file: rgFrontFile,
});

console.log('Job ID:', frontUpload.jobId);
// Retorna "AWAITING_OTHER_DOCUMENTS" até receber todos os documentos necessários

// 3. Upload da selfie (selfie com documento para biometria)
const selfieFile = fs.readFileSync('selfie.jpg');
await client.authentication.uploadDocument(selfieReq.id, {
  file: selfieFile,
});
// Para selfie simples sem documento, use method: 'selfie' ao invés de 'selfieWithDocument'

// 4. Upload do RG verso (dispara processamento por IA)
const rgBackFile = fs.readFileSync('rg-verso.jpg');
const backUpload = await client.authentication.uploadDocument(rgBackReq.id, {
  file: rgBackFile,
});

if (backUpload.jobId !== 'AWAITING_OTHER_DOCUMENTS') {
  console.log('🤖 Processamento iniciado. Job ID:', backUpload.jobId);

  // 5. Polling automático de progresso com callback
  const result = await client.authentication.pollValidationProgress(
    rgFrontReq.id,
    { intervalMs: 2000, timeoutMs: 60000 },
    (progress) => {
      console.log(`[${progress.progress}%] ${progress.currentStep}`);
      if (progress.estimatedTimeSeconds) {
        console.log(`   ETA: ${progress.estimatedTimeSeconds}s`);
      }
    }
  );

  // 6. Verificar resultado
  if (result.status === 'VERIFIED') {
    console.log('✅ Validação aprovada!');
    console.log('   Confiança:', result.result?.confidence_score);
    console.log('   Face match:', result.result?.details.face_match?.similarity);
    console.log('   Liveness:', result.result?.details.liveness?.score);
    console.log('   OCR - Nome:', result.result?.details.ocr?.extracted_name);
    console.log('   OCR - CPF:', result.result?.details.ocr?.extracted_cpf);
  } else {
    console.error('❌ Validação rejeitada:', result.rejectionMessage);
    console.log('   Código:', result.rejectionCode);
    console.log('   Dica:', result.rejectionHumanTip);
  }
}

// 7. Tratamento de erros de pré-validação
try {
  const file = fs.readFileSync('imagem-borrada.jpg');
  await client.authentication.uploadDocument(authReqId, { file });
} catch (error) {
  if (error.status === 400 && error.code) {
    console.error('Código:', error.code); // "IMAGE_TOO_BLURRY"
    console.error('Mensagem:', error.message);
    console.error('Dica:', error.errors[0]); // Dica amigável para o usuário
  }
}
```

### 🆕 OFFICIAL_DOCUMENT Flexível (Fase 10)

**Nova funcionalidade que permite ao assinante escolher entre RG ou CNH!**

O método `officialDocument` agora aceita metadados opcionais que permitem ao assinante decidir qual documento pessoal deseja usar para autenticação. O advogado não precisa se preocupar com qual documento o cliente tem disponível.

**Benefícios:**
- ✅ Máxima flexibilidade: Assinante escolhe RG ou CNH
- ✅ CNH é mais rápida: 2 uploads vs 3 do RG
- ✅ Validação universal: Biometria funciona para ambos
- ✅ Backward compatibility: Código antigo continua funcionando

#### Cenário A: CNH (Recomendado - Mais Rápido)

```typescript
// 1. Advogado cria requisito flexível
const docReq = await client.authentication.create(signerId, {
  method: 'officialDocument',  // 🆕 Flexível - aceita RG ou CNH
  description: 'Documento pessoal (RG ou CNH)',
  isRequired: true,
});

const selfieReq = await client.authentication.create(signerId, {
  method: 'selfie',  // 🆕 Mais moderno que 'selfieWithDocument'
  description: 'Selfie para validação biométrica',
  isRequired: true,
});

// 2. Assinante envia CNH (apenas 1 upload)
const cnhFile = fs.readFileSync('cnh.jpg');
const cnhUpload = await client.authentication.uploadDocument(docReq.id, {
  file: cnhFile,
  documentType: 'CNH',  // 🆕 Especifica que é CNH
});

console.log('Status:', cnhUpload.jobId);
// Output: "AWAITING_OTHER_DOCUMENTS" (aguardando selfie)

// 3. Assinante envia selfie (dispara validação)
const selfieFile = fs.readFileSync('selfie.jpg');
const selfieUpload = await client.authentication.uploadDocument(selfieReq.id, {
  file: selfieFile,
});

console.log('Job ID:', selfieUpload.jobId); // "12345" (processamento iniciado)

// 4. Polling de progresso
const result = await client.authentication.pollValidationProgress(
  docReq.id,
  { intervalMs: 2000, timeoutMs: 60000 },
  (progress) => {
    console.log(`[${progress.progress}%] ${progress.currentStep}`);
  }
);

// ✅ Total: 2 uploads (CNH + Selfie) | Tempo: ~8-12s
```

#### Cenário B: RG (Completo)

```typescript
// 1. Mesmo setup do advogado (requisito flexível)
const docReq = await client.authentication.create(signerId, {
  method: 'officialDocument',
  description: 'Documento pessoal (RG ou CNH)',
  isRequired: true,
});

// 2. Assinante envia RG FRENTE
const rgFrenteFile = fs.readFileSync('rg-frente.jpg');
const rgFrontUpload = await client.authentication.uploadDocument(docReq.id, {
  file: rgFrenteFile,
  documentType: 'RG',       // 🆕 Especifica que é RG
  documentPart: 'FRONT',    // 🆕 Especifica que é a frente
});

console.log('Status:', rgFrontUpload.jobId);
// Output: "AWAITING_OTHER_DOCUMENTS" (aguardando verso)

// 3. Assinante envia RG VERSO
const rgVersoFile = fs.readFileSync('rg-verso.jpg');
const rgBackUpload = await client.authentication.uploadDocument(docReq.id, {
  file: rgVersoFile,
  documentType: 'RG',       // 🆕 Especifica que é RG
  documentPart: 'BACK',     // 🆕 Especifica que é o verso
});

console.log('Status:', rgBackUpload.jobId);
// Output: "AWAITING_OTHER_DOCUMENTS" (aguardando selfie)

// 4. Assinante envia selfie (dispara validação)
const selfieFile = fs.readFileSync('selfie.jpg');
await client.authentication.uploadDocument(selfieReq.id, {
  file: selfieFile,
});

// 5. Polling de progresso (mesmo código do Cenário A)
const result = await client.authentication.pollValidationProgress(docReq.id, ...);

// ✅ Total: 3 uploads (RG Frente + Verso + Selfie) | Tempo: ~10-14s
```

#### Cenário C: Auto-Detecção (Backward Compatibility)

```typescript
// Upload sem especificar tipo (detecção automática)
const docFile = fs.readFileSync('documento.jpg');
const upload = await client.authentication.uploadDocument(docReq.id, {
  file: docFile,
  // Sem documentType nem documentPart
});

// ⚠️ Sistema tenta detectar automaticamente
// Recomenda-se especificar documentType para melhor precisão
```

**📊 Comparação:**

| Cenário | Uploads | Tempo | Recomendação |
|---------|---------|-------|--------------|
| CNH | 2 | ~8-12s | ⭐⭐⭐⭐⭐ Mais rápido |
| RG | 3 | ~10-14s | ⭐⭐⭐⭐ Completo |
| Auto | 1-2 | ~8-14s | ⭐⭐⭐ Compatibilidade |

**📚 Ver exemplo completo:** `sdk/examples/14-official-document-flexible-workflow.ts`

### NotificationService (Fase 6)

```typescript
// 1. Criar template de notificação customizado
const notifTemplate = await client.notifications.createTemplate({
  name: 'Lembrete Personalizado',
  channel: 'email',
  subject: 'Documento aguardando sua assinatura',
  bodyTemplate: 'Olá {{signerName}}, o documento {{documentName}} precisa da sua assinatura. Link: {{signLink}}',
});

// 2. Listar templates
const templates = await client.notifications.findAllTemplates();

// 3. Preview de template
const preview = await client.notifications.previewTemplate(notifTemplate.id, {
  signerName: 'João Silva',
  signerEmail: 'joao.silva@example.com',
  envelopeName: 'Contrato de Serviços',
  documentName: 'Contrato de Serviços',
  deadline: '2025-12-31T23:59:59Z',
  signLink: 'https://app.example.com/sign/123',
  organizationName: 'Minha Empresa',
  remainingTime: '2 dias',
  senderName: 'Maria',
});

// 4. Consultar histórico de notificações por envelope
const history = await client.notifications.getHistoryByEnvelope(envelopeId, {
  channel: 'email',
  status: 'sent',
});

// 5. Consultar notificações falhadas
const failed = await client.notifications.getFailedNotifications({
  createdFrom: '2025-01-01',
  createdTo: '2025-01-31',
});
```

### PublicVerificationService (Fase 4)

```typescript
// Verificar documento por hash (SEM autenticação)
const verification = await client.publicVerification.verify(
  'abc123...hash_sha256'
);

console.log('Documento válido:', verification.isValid);
console.log('Assinantes:', verification.signers);
console.log('Status:', verification.envelope.status);

// Download público do documento assinado (SEM autenticação)
const download = await client.publicVerification.download(
  'abc123...hash_sha256'
);

console.log('URL de download:', download.downloadUrl);
```

### UserService (Fase 11 + Fase 12)

```typescript
// 🆕 CENÁRIO 1: Criar usuário com nova organização (comportamento original)
const newUser = await client.users.create({
  name: 'Maria Santos',
  email: 'maria@exemplo.com',
  password: 'SenhaForte123!',
  organizationName: 'Empresa ABC', // Opcional - cria organização
  generateApiToken: true,
});

console.log(`Usuário criado: ${newUser.user.id}`);
console.log(`Mensagem: ${newUser.message}`); // "Usuário e organização criados"
console.log(`API Token: ${newUser.apiToken}`);

// 🆕 CENÁRIO 2: Adicionar usuário a organização EXISTENTE (Fase 12)
const memberUser = await client.users.create({
  name: 'João Silva',
  email: 'joao@exemplo.com',
  password: 'SenhaForte456!',
  organizationId: 'org-123', // Vincula a organização existente
  role: 'MEMBER', // OWNER, ADMIN ou MEMBER (default: MEMBER)
  generateApiToken: true,
});

console.log(`Usuário criado: ${memberUser.user.id}`);
console.log(`Mensagem: ${memberUser.message}`); // "Usuário adicionado à organização"

// Obter usuário atual
const me = await client.users.getCurrentUser();
console.log(`Logado como: ${me.name}`);

// Listar usuários da organização
const users = await client.users.findAll({
  name: 'Maria',
});

console.log(`Total de usuários: ${users.length}`);

// Atualizar usuário
const updated = await client.users.update(userId, {
  name: 'Maria Santos Silva',
});

// Deletar usuário
await client.users.remove(userId);
```

### ApiTokenService (Fase 11)

```typescript
// Criar novo token com expiração em 90 dias
const token = await client.apiTokens.create({
  name: 'Token de Produção',
  expiresInDays: 90,
});

console.log(`✅ Token criado: ${token.token}`);
console.log(`⚠️  Guarde este token! Ele não será exibido novamente.`);
console.log(`📅 Expira em: ${token.expiresAt}`);

// Criar token com data de expiração específica
const tokenWithDate = await client.apiTokens.create({
  name: 'Token Temporário',
  expiresAt: '2025-12-31T23:59:59Z',
});

// Criar token sem expiração
const permanentToken = await client.apiTokens.create({
  name: 'Token Permanente',
  // Sem expiresInDays ou expiresAt = sem expiração
});

// Listar todos tokens
const tokens = await client.apiTokens.findAll();
console.log(`Total de tokens: ${tokens.length}`);

// Filtrar tokens ativos
const activeTokens = await client.apiTokens.findAll({
  isActive: true,
});

// Atualizar token (renomear)
await client.apiTokens.update(token.id, {
  name: 'Token de Produção v2',
});

// Revogar token temporariamente
await client.apiTokens.revoke(token.id);
console.log('Token revogado');

// Reativar token
await client.apiTokens.activate(token.id);
console.log('Token reativado');

// Deletar token permanentemente
await client.apiTokens.remove(token.id);
console.log('Token deletado');
```

### OrganizationService (Fase 11 + Fase 12)

```typescript
// Obter minha organização com estatísticas
const myOrg = await client.organizations.getMyOrganization();

console.log(`Organização: ${myOrg.name}`);
console.log(`Plano: ${myOrg.plan}`);
console.log(`Slug: ${myOrg.slug}`);
console.log(`\nEstatísticas:`);
console.log(`  - Usuários: ${myOrg.currentUsers}/${myOrg.maxUsers}`);
console.log(`  - Envelopes este mês: ${myOrg.currentMonthEnvelopes}`);
console.log(`  - Storage usado: ${Math.round(myOrg.storageUsed / 1024 / 1024)} MB`);

// Atualizar minha organização (requer OWNER ou ADMIN)
const updated = await client.organizations.updateMyOrganization({
  name: 'Nova Empresa Ltda',
  maxUsers: 10,
  maxEnvelopes: 500,
});

console.log(`Organização atualizada: ${updated.name}`);

// 🆕 FASE 12: Gerenciamento de Membros

// Adicionar membro à organização (requer OWNER ou ADMIN)
const newMember = await client.organizations.addMember(organizationId, {
  email: 'novomembro@exemplo.com',
  name: 'Novo Membro',
  password: 'Senha@123',
  role: 'MEMBER', // 'ADMIN' ou 'MEMBER'
  generateApiToken: true,
});

console.log(`Membro adicionado: ${newMember.user.name}`);
console.log(`Mensagem: ${newMember.message}`);

// Alterar role de membro (requer OWNER)
const roleUpdate = await client.organizations.updateMemberRole(
  organizationId,
  userId,
  { role: 'ADMIN' } // Promover para ADMIN
);

console.log(`Role atualizada: ${roleUpdate.message}`);
console.log(`Novo role: ${roleUpdate.user.role}`);

// Remover membro da organização (requer OWNER ou ADMIN)
const removed = await client.organizations.removeMember(organizationId, userId);
console.log(`Membro removido: ${removed.message}`);

// Listar todas organizações (admin/super-user)
const allOrgs = await client.organizations.findAll({
  isActive: true,
  plan: 'PREMIUM',
});

// Obter organização específica com estatísticas (admin)
const orgStats = await client.organizations.findOneWithStats(orgId);
console.log(`${orgStats.name}: ${orgStats.currentUsers} usuários`);

// Criar nova organização (admin)
const newOrg = await client.organizations.create({
  name: 'Cliente XYZ',
  slug: 'cliente-xyz',
  plan: 'BASIC',
  maxUsers: 5,
  maxEnvelopes: 100,
});

// Deletar organização (admin)
await client.organizations.remove(orgId);
```

### OrganizationSettingsService (Fase 12)

```typescript
// ==================== CONFIGURAÇÕES GERAIS ====================

// Obter configurações atuais da organização
const settings = await client.organizationSettings.get();

console.log('Verificação pública:', settings.defaultPublicVerification);
console.log('Download público:', settings.defaultPublicDownload);
console.log('Estratégia de assinatura:', settings.signatureStrategy);
console.log('Nível de autenticação padrão:', settings.defaultAuthLevel);

// Atualizar configurações gerais
await client.organizationSettings.update({
  defaultPublicVerification: true,
  defaultPublicDownload: false,
  organizationName: 'Minha Empresa',
  organizationWebsite: 'https://minhaempresa.com',
});

// ==================== LOGO DA ORGANIZAÇÃO ====================

// Verificar se logo está configurado
const hasLogo = await client.organizationSettings.hasLogo();
console.log('Logo configurado:', hasLogo);

// Upload de logo (PNG, JPG ou SVG)
import fs from 'fs';

const logoBuffer = fs.readFileSync('./logo.png');
const logoResult = await client.organizationSettings.uploadLogo(logoBuffer, {
  useAsStamp: true, // Usar logo como stamp padrão nos documentos
});

console.log('Logo URL:', logoResult.organizationLogoUrl);
console.log('Usado como stamp:', logoResult.settings.useAsStamp);
console.log('Mensagem:', logoResult.message);
// Output: "Logo carregado com sucesso e configurado como stamp padrão"

// Download do logo
const logoBlob = await client.organizationSettings.downloadLogo();
const logoData = Buffer.from(await logoBlob.arrayBuffer());
fs.writeFileSync('./logo-downloaded.png', logoData);

// Deletar logo
await client.organizationSettings.deleteLogo();
console.log('Logo removido com sucesso');

// ==================== PAPEL TIMBRADO (LETTERHEAD) ====================

// Verificar se letterhead está configurado
const hasLetterhead = await client.organizationSettings.hasLetterhead();
console.log('Letterhead configurado:', hasLetterhead);

// Upload de letterhead (apenas PNG)
const letterheadBuffer = fs.readFileSync('./letterhead.png');
const letterheadResult = await client.organizationSettings.uploadLetterhead(
  letterheadBuffer,
  {
    useLetterhead: true,
    opacity: 20, // 0-100 (20% recomendado para não atrapalhar leitura)
    position: 'BACKGROUND', // 'BACKGROUND' | 'OVERLAY' | 'WATERMARK'
    applyToPages: 'ALL', // 'ALL' | 'FIRST' | 'LAST' | 'FIRST_LAST'
  }
);

console.log('Letterhead URL:', letterheadResult.letterheadImageUrl);
console.log('Configurações:', letterheadResult.settings);

// Download do letterhead
const letterheadBlob = await client.organizationSettings.downloadLetterhead();
const letterheadData = Buffer.from(await letterheadBlob.arrayBuffer());
fs.writeFileSync('./letterhead-downloaded.png', letterheadData);

// Deletar letterhead
await client.organizationSettings.deleteLetterhead();

// ==================== NÍVEIS DE AUTENTICAÇÃO ====================

// Obter nível de autenticação padrão
const authLevel = await client.organizationSettings.getAuthenticationLevel();
console.log('Nível de autenticação:', authLevel);
// Output: 'BASIC' | 'STANDARD' | 'STRICT'

// Configurar nível de autenticação padrão
await client.organizationSettings.setAuthenticationLevel('STRICT');
console.log('Nível atualizado para STRICT');

/**
 * Níveis de autenticação disponíveis:
 *
 * BASIC (mínimo recomendado):
 *   - Email token
 *   - IP Address
 *   - Geolocalização
 *
 * STANDARD (recomendado):
 *   - Tudo do BASIC +
 *   - WhatsApp ou SMS token
 *   - Documento oficial (RG, CNH)
 *   - Selfie com documento
 *
 * STRICT (máxima segurança - obrigatório para PAdES):
 *   - Tudo do STANDARD +
 *   - Comprovante de endereço
 *
 * RECOMENDAÇÃO: Para assinaturas PAdES, sempre use STRICT
 * para garantir máxima validade jurídica.
 */

// ==================== ASSINATURA DIGITAL (PADES) ====================

// Obter configurações de PAdES
const padesConfig = await client.organizationSettings.getPadesConfig();
console.log('Estratégia:', padesConfig.signatureStrategy);
console.log('Certificado padrão:', padesConfig.defaultCertificateId);
console.log('Obrigatório:', padesConfig.requirePadesForAll);
console.log('Auto-aplicar:', padesConfig.padesAutoApply);

// Configurar estratégia de assinatura
await client.organizationSettings.setSignatureStrategy('HYBRID_SEALED');
console.log('Estratégia configurada: HYBRID_SEALED');

/**
 * Estratégias de assinatura disponíveis:
 *
 * VISUAL_ONLY: Apenas assinatura eletrônica (sem certificado digital)
 * PADES_EACH: PAdES em cada assinatura
 * PADES_FINAL: PAdES apenas na última assinatura
 * HYBRID: Permite assinatura eletrônica OU digital
 * HYBRID_SEALED: Assinatura eletrônica + selo digital da organização
 */

// Atualizar todas configurações PAdES
await client.organizationSettings.update({
  signatureStrategy: 'HYBRID_SEALED',
  requirePadesForAll: true,
  padesAutoApply: true,
  defaultCertificateId: 'cert-123',
});

// ==================== STAMPS E CARIMBOS ====================

// Configurar template de stamp
await client.organizationSettings.update({
  stampTemplate: {
    backgroundColor: '#1a73e8', // Azul
    borderColor: '#0d47a1', // Azul escuro
    textColor: '#ffffff', // Branco
    showLogo: true, // Mostrar logo da organização
    showQRCode: true, // Mostrar QR code de verificação
    fontSize: 12,
  },
  stampPosition: 'BOTTOM_RIGHT', // Canto inferior direito
});
```

### SignerService (signature_fields)

```typescript
// ==================== ASSINATURA E RUBRICA DO PERFIL ====================

// Upload de assinatura manuscrita do signatário
import fs from 'fs';

const signatureImage = fs.readFileSync('./assinatura.png');
const signerWithSignature = await client.signers.uploadSignature(signerId, signatureImage);

console.log('Assinatura salva no perfil!');
console.log('URL:', signerWithSignature.signatureImageUrl);
console.log('S3 Key:', signerWithSignature.signatureImageKey);
// Output:
// URL: https://bucket.s3.amazonaws.com/signers/abc123/signature.png
// S3 Key: signers/abc123/signature.png

// Upload de rubrica (iniciais) do signatário
const initialImage = fs.readFileSync('./rubrica.png');
const signerWithInitial = await client.signers.uploadInitial(signerId, initialImage);

console.log('Rubrica salva no perfil!');
console.log('URL:', signerWithInitial.initialImageUrl);
console.log('S3 Key:', signerWithInitial.initialImageKey);

// Atualizar assinatura (remove antiga automaticamente)
const newSignature = fs.readFileSync('./nova-assinatura.png');
const updated = await client.signers.uploadSignature(signerId, newSignature);
console.log('Assinatura atualizada!');
console.log('Nova URL:', updated.signatureImageUrl);

// Remover assinatura do perfil
await client.signers.deleteSignature(signerId);
console.log('Assinatura removida');
// signatureImageUrl e signatureImageKey são limpos
// Cliente precisará fazer novo upload antes de assinar

// Remover rubrica do perfil
await client.signers.deleteInitial(signerId);
console.log('Rubrica removida');

/**
 * BENEFÍCIOS DO PERFIL:
 *
 * ✅ Cliente desenha assinatura UMA VEZ e reutiliza em todos os documentos
 * ✅ Backend busca automaticamente a imagem ao assinar (sem reenvio)
 * ✅ Assinaturas consistentes em múltiplos contratos
 * ✅ Processo muito mais rápido
 * ✅ Melhor UX para o cliente final
 *
 * FORMATOS RECOMENDADOS:
 * - Assinatura: PNG 200x80px (fundo transparente)
 * - Rubrica: PNG 80x40px (fundo transparente)
 * - Tamanho máximo: 2 MB
 * - Formatos aceitos: PNG, JPG, JPEG
 */
```

### SignatureFieldService (signatureFields)

```typescript
// ==================== STAMP GROUP (CARIMBO DE ASSINATURA) ====================

// Criar grupo de 3 campos de uma vez:
// - SIGNATURE: Assinatura manuscrita (200x70px)
// - TEXT: Nome do signatário (200x25px, abaixo)
// - DATE: Data da assinatura (200x25px, abaixo do texto)
const stampFields = await client.signatureFields.createStampGroup(documentId, {
  signerId: signerId,
  page: 3, // Última página
  x: 100, // Posição X
  y: 650, // Posição Y
});

console.log('Stamp group criado!');
console.log('Campos:', stampFields.length); // 3
stampFields.forEach((field) => {
  console.log(`- ${field.type}: (${field.x}, ${field.y}) ${field.width}x${field.height}`);
});
// Output:
// - SIGNATURE: (100, 650) 200x70
// - TEXT: (100, 725) 200x25
// - DATE: (100, 755) 200x25

/**
 * BENEFÍCIOS DO STAMP GROUP:
 *
 * ✅ Backend calcula posições relativas automaticamente
 * ✅ Layout profissional de carimbo garantido
 * ✅ Reduz erros de posicionamento manual
 * ✅ Um único comando cria 3 campos
 *
 * COMO FUNCIONA:
 * 1. Você define apenas a posição inicial (x, y)
 * 2. Backend cria SIGNATURE na posição fornecida
 * 3. Backend cria TEXT 5px abaixo da SIGNATURE
 * 4. Backend cria DATE 5px abaixo do TEXT
 * 5. Todos os campos têm mesma largura (200px)
 */

// ==================== RUBRICAS AUTOMÁTICAS ====================

// Criar rubricas em TODAS as páginas (exceto a última) com um único comando
const initialFields = await client.signatureFields.createInitialFields(documentId, {
  signerId: signerId,
});

console.log('Rubricas criadas!');
console.log('Total:', initialFields.length);
initialFields.forEach((field, idx) => {
  console.log(`Rubrica ${idx + 1}: Página ${field.page}, Posição (${field.x}, ${field.y})`);
});
// Output (documento de 5 páginas):
// Rubrica 1: Página 1, Posição (450, 20)
// Rubrica 2: Página 2, Posição (450, 20)
// Rubrica 3: Página 3, Posição (450, 20)
// Rubrica 4: Página 4, Posição (450, 20)
// (Não cria na página 5, que é a última)

/**
 * BENEFÍCIOS DAS RUBRICAS AUTOMÁTICAS:
 *
 * ✅ Backend obtém número de páginas do PDF automaticamente
 * ✅ Cria INITIAL em todas as páginas (exceto última)
 * ✅ Posiciona no canto inferior direito de forma consistente
 * ✅ Um único comando substitui múltiplas chamadas
 * ✅ Abstrai lógica de paginação
 *
 * POSICIONAMENTO PADRÃO:
 * - x: 450 (canto direito, com margem)
 * - y: 20 (topo da página)
 * - width: 80px
 * - height: 40px
 * - Todas as páginas EXCETO a última (reservada para assinatura final)
 */

// ==================== ASSINAR USANDO PERFIL ====================

// Obter access token do signatário
const signingUrl = await client.signers.getSigningUrl(signerId);
// Preview/pages/fields podem ser acessados usando o JWT do signatário (Bearer).

// Assinar campo SIGNATURE (backend busca imagem do perfil automaticamente!)
const signatureField = stampFields.find((f) => f.type === 'SIGNATURE');
await client.signatureFields.sign(signatureField.id, {
  accessToken: signingUrl.accessToken,
  // Sem signatureImageUrl! Backend busca automaticamente de signer.signatureImageUrl
  metadata: {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
  },
});

console.log('✅ Campo assinado usando imagem do perfil!');

// Assinar todas as rubricas (também sem enviar imagem!)
for (const initialField of initialFields) {
  await client.signatureFields.sign(initialField.id, {
    accessToken: signingUrl.accessToken,
    // Sem signatureImageUrl! Backend busca de signer.initialImageUrl
  });
}

console.log('✅ Todas as rubricas assinadas usando imagem do perfil!');

/**
 * FLUXO COMPLETO RECOMENDADO:
 *
 * 1️⃣ Cliente faz upload de assinatura e rubrica NO PERFIL (uma vez)
 * 2️⃣ Advogado cria envelope e documento
 * 3️⃣ Advogado usa createStampGroup para criar carimbo
 * 4️⃣ Advogado usa createInitialFields para criar rubricas
 * 5️⃣ Cliente assina SEM precisar reenviar imagens
 * 6️⃣ Backend busca automaticamente do perfil
 *
 * ANTES (fluxo antigo):
 * - Cliente enviava imagem em CADA assinatura ❌
 * - Lento e repetitivo ❌
 * - Inconsistência entre assinaturas ❌
 *
 * AGORA (com perfil):
 * - Imagem salva UMA VEZ ✅
 * - Reutilizada automaticamente ✅
 * - Assinaturas sempre consistentes ✅
 * - Processo muito mais rápido ✅
 */
```
