# Exemplos de Uso do SDK

Este diretório contém **25+ exemplos práticos** demonstrando todas as funcionalidades do Signature Module SDK.

## 📋 Índice de Exemplos

### 1️⃣ Fluxo Básico (`01-basic-envelope.ts`)
**O que demonstra:**
- Criar envelope
- Upload de documento PDF
- Adicionar signatários
- Criar campos de assinatura
- Ativar envelope

**Quando usar:** Integração básica sem funcionalidades avançadas.

**Executar:**
```bash
ts-node sdk/examples/01-basic-envelope.ts
```

---

### 2️⃣ Template DOCX Workflow (`02-document-template-workflow.ts`)
**O que demonstra:**
- Upload de template DOCX e extração de variáveis
- Configuração de mapeamento e 9 transformações de dados
- Geração de documento PDF personalizado

**Quando usar:** Contratos repetitivos que precisam de personalização.

**Transforms disponíveis:**
- `formatCPF`, `formatCNPJ`, `formatPhone`, `formatCEP`
- `formatCurrency`, `formatDate` (customizável)
- `uppercase`, `lowercase`, `capitalize`

**Executar:**
```bash
ts-node sdk/examples/02-document-template-workflow.ts
```

---

### 3️⃣ Authentication Workflow (`03-authentication-workflow.ts`)
**O que demonstra:**
- Criação de 8+ requisitos de autenticação
- Envio e verificação de tokens (Email, SMS, WhatsApp)
- Upload de documentos de identidade e selfies

**Quando usar:** Aumentar a segurança e validade jurídica da assinatura.

**Métodos disponíveis:**
- `emailToken`, `smsToken`, `whatsappToken` (Tokens de 6 dígitos)
- `emailOtp`, `smsOtp` (Tokens de uso único)
- `officialDocument` (Upload de RG/CNH/Passaporte)
- `selfieWithDocument` (Selfie segurando documento)
- `selfie` (Selfie)
- `addressProof` (Comprovante de residência)
- `ipAddress` (Registro do IP)
- `geolocation` (Coordenadas GPS do dispositivo)

**Executar:**
```bash
ts-node sdk/examples/03-authentication-workflow.ts
```

---

### 4️⃣ Notification Workflow (`04-notification-workflow.ts`)
**O que demonstra:**
- Criação e preview de templates de notificação (Email, SMS, WhatsApp)
- Consulta de histórico de notificações e análise de falhas

**Quando usar:** Personalizar a comunicação com os signatários.

**Variáveis de template:**
- `{{signerName}}`, `{{signerEmail}}`
- `{{envelopeName}}`, `{{documentName}}`
- `{{deadline}}`, `{{remainingTime}}`
- `{{signLink}}`, `{{organizationName}}`, `{{senderName}}`

**Executar:**
```bash
ts-node sdk/examples/04-notification-workflow.ts
```

---

### 5️⃣ Complete Workflow (`05-complete-workflow.ts`)
**O que demonstra:**
- Integração completa de múltiplas funcionalidades do SDK
- Usa PAdES, templates, autenticação e notificações em um único fluxo

**Quando usar:** Referência completa para uma implementação complexa.

**Executar:**
```bash
ts-node sdk/examples/05-complete-workflow.ts
```

---

### 6️⃣ PAdES Digital Signatures (`06-pades-workflow.ts`)
**O que demonstra:**
- Gestão de certificados digitais (upload, listagem, ativação)
- Aplicação de assinaturas digitais PAdES com diferentes estratégias
- Validação de certificados ICP-Brasil

**Quando usar:** Processos que exigem assinatura digital com validade jurídica (ICP-Brasil).

**Executar:**
```bash
ts-node sdk/examples/06-pades-workflow.ts
```

---

### 7️⃣ Signature Fields (`07-signature-fields-workflow.ts`)
**O que demonstra:**
- Criação e gestão de 5 tipos de campos (assinatura, rubrica, texto, data, checkbox)
- Posicionamento preciso dos campos no documento
- Preenchimento e assinatura de campos individuais

**Quando usar:** Formulários e contratos que necessitam de preenchimento de dados além da assinatura.

**Executar:**
```bash
ts-node sdk/examples/07-signature-fields-workflow.ts
```

---

### 8️⃣ Webhook Integration (`08-webhook-integration.ts`)
**O que demonstra:**
- Criação, gestão e desativação de webhooks (Event Observers)
- Recebimento de notificações de 30+ tipos de eventos em tempo real
- Validação de segurança com HMAC-SHA256

**Quando usar:** Para ser notificado em tempo real sobre eventos como `envelope.completed` ou `signer.signed`.

**Executar:**
```bash
ts-node sdk/examples/08-webhook-integration.ts
```

---

### 9️⃣ Multi-Tenancy (`09-multi-tenant-setup.ts`)
**O que demonstra:**
- Gestão de múltiplas organizações e usuários
- Isolamento de dados entre diferentes tenants
- Casos de uso para plataformas SaaS

**Quando usar:** Se sua aplicação atende múltiplos clientes com dados isolados.

**Executar:**
```bash
ts-node sdk/examples/09-multi-tenant-setup.ts
```

---

### 🔟 Error Handling (`10-error-handling.ts`)
**O que demonstra:**
- Como capturar e tratar erros da API de forma robusta
- Uso dos métodos `isValidationError()`, `isAuthenticationError()`, etc.
- Tratamento de erros de rede e retentativas (`isRetryable()`)

**Quando usar:** Essencial para todas as implementações em produção.

**Executar:**
```bash
ts-node sdk/examples/10-error-handling.ts
```

---

### 1️⃣1️⃣ API Token Management (`11-api-token-management.ts`)
**O que demonstra:**
- Ciclo de vida completo de API Tokens
- Criação, listagem, revogação e deleção de tokens
- Autenticação via Bearer Token para integrações server-to-server

**Quando usar:** Para autenticar sistemas externos sem uma sessão de usuário.

**Executar:**
```bash
ts-node sdk/examples/11-api-token-management.ts
```

---

### 1️⃣2️⃣ Organization Settings (`12-organization-settings.ts`)
**O que demonstra:**
- Configuração de definições globais da organização
- Gestão de branding, papel timbrado (letterhead) e estratégias PAdES
- 🆕 **Upload e gestão de logo da organização (FASE 12)**
- 🆕 **Níveis de autenticação padrão: BASIC, STANDARD, STRICT (FASE 12)**
- 🆕 **Assinatura e Rubrica do Perfil (FASE 9 - signature_fields)**
  - Upload de assinatura manuscrita no perfil do signatário
  - Upload de rubrica (iniciais) no perfil
  - Criação de carimbo verificado (verifiedStampV1, 450x200px)
  - Criação automática de rubricas em todas as páginas
  - Assinatura usando imagem do perfil (sem reenvio)
- Customização de carimbos de assinatura com logo automático
- Recomendações de authentication level por estratégia PAdES

**Quando usar:** Para personalizar a experiência e os padrões de assinatura da sua organização, incluindo marca visual, níveis de segurança e fluxo avançado de assinatura.

**Destaques FASE 12:**
- Logo em PNG/JPG/SVG (512x512px recomendado)
- Logo usado automaticamente como stamp padrão
- Níveis de autenticação alinhados com estratégia de assinatura
- STRICT obrigatório para máxima validade jurídica em PAdES

**Destaques FASE 9 (signature_fields):**
- Cliente desenha assinatura UMA VEZ e reutiliza em todos os documentos
- Backend busca imagens do perfil automaticamente
- Carimbo verificado com template rico (header, logo, QR code, dados estruturados)
- Rubricas em todas as páginas (exceto última) com um comando
- Processo muito mais rápido e assinaturas consistentes

**Executar:**
```bash
ts-node sdk/examples/12-organization-settings.ts
```

---

### 1️⃣3️⃣ Validation Layer Workflow (`13-validation-layer-workflow.ts`)
**O que demonstra:**
- Uso da camada de validação AI-powered para documentos pessoais
- Upload e validação de RG (frente/verso), CNH e selfies
- OCR automático de CPF, nome e dados biométricos
- Liveness detection e comparação facial 1:1
- Polling de progresso em tempo real (0-100%)
- Estados de validação: PENDING → IN_ANALYSIS → VERIFIED/REJECTED

**Quando usar:** Para processos que exigem validação automatizada de identidade com alta segurança.

**Executar:**
```bash
ts-node sdk/examples/13-validation-layer-workflow.ts
```

---

### 1️⃣4️⃣ Official Document Flexible Workflow (`14-official-document-flexible-workflow.ts`)
**O que demonstra:**
- Workflow flexível de autenticação com documentos oficiais
- Múltiplas combinações de documentos e selfies
- Validação de documentos e biometria facial
- Fluxo completo com diferentes cenários de autenticação

**Quando usar:** Para implementar autenticação avançada com validação de documentos oficiais.

**Executar:**
```bash
ts-node sdk/examples/14-official-document-flexible-workflow.ts
```

---

### 🆕 1️⃣5️⃣ User & Organization Management (`15-user-organization-management.ts`)
**O que demonstra:**
- **Fase 1**: Criar organização com primeiro usuário (OWNER)
- **Fase 2**: Adicionar membros (ADMIN, MEMBER) a organização existente
- **Fase 3**: Gerenciar roles (promover MEMBER → ADMIN, rebaixar ADMIN → MEMBER)
- **Fase 4**: Remover membros da organização (com validações de permissão)
- **Fase 5**: Consultas, estatísticas e filtros de usuários

**Quando usar:** Para implementar gestão completa de equipes e organizações multi-usuário.

**Recursos demonstrados:**
- Criação de usuários vinculados a organizações existentes
- Controle granular de permissões (OWNER, ADMIN, MEMBER)
- Validação de limites de usuários por plano
- Estatísticas de uso da organização

**Executar:**
```bash
ts-node sdk/examples/15-user-organization-management.ts
```

---

### 🆕 1️⃣6️⃣ Signer JWT Tokens (`16-signer-jwt-tokens.ts`)
**O que demonstra:**
- **Sistema de autenticação JWT** para signatários com tokens de curta duração
- **Access Token**: JWT assinado (15 minutos padrão) para requisições de assinatura
- **Refresh Token**: UUID de longa duração (7 dias padrão) para renovação
- **Token Rotation**: Geração de novos tokens ao renovar (previne reutilização)
- **Revogação de tokens**: Logout seguro e irreversível
- **Auto-refresh**: Best practice para renovação automática antes da expiração

**Quando usar:**
- Implementar autenticação segura para signatários na interface de assinatura
- Gerenciar sessões de signatários com tokens de curta duração
- Implementar logout e revogação de acesso

**Recursos demonstrados:**
- Obtenção de URL de assinatura com par de tokens JWT
- Preview/pages/fields usando JWT do signatário
- Renovação automática de access token usando refresh token
- Implementação de auto-refresh (renovar 2-5 min antes de expirar)
- Revogação de tokens para logout
- Tratamento de erros de token expirado/revogado
- Boas práticas de segurança (HTTPS, storage, rotation)

**Segurança:**
- JWT assinado criptograficamente (HMAC SHA-256)
- Validação de expiração em cada requisição (defense in depth)
- Token mismatch detection (previne replay attacks)
- Revogação instantânea no banco de dados
- Cleanup automático de tokens expirados/revogados

**Executar:**
```bash
ts-node sdk/examples/16-signer-jwt-tokens.ts
```

---

### 🆕 1️⃣7️⃣ Digital Certificate Management (`17-digital-certificate-management.ts`)
**O que demonstra:**
- **Ciclo de vida completo** de certificados digitais A1
- **Upload** de arquivo de certificado (.p12) com senha
- **Listagem**, ativação e obtenção de detalhes de certificados
- **Vinculação** de um certificado como padrão da organização
- **Automação de PAdES** com a estratégia `HYBRID_SEALED`
- **Exclusão** e limpeza de certificados de teste

**Quando usar:**
- Para gerenciar os certificados A1 que serão usados para assinaturas digitais automáticas pela organização (selo digital).

**Recursos demonstrados:**
- `client.digitalSignatures.uploadCertificate()`
- `client.digitalSignatures.listCertificates()`
- `client.digitalSignatures.deleteCertificate()`
- `client.organizationSettings.update()` para definir `defaultCertificateId`

**Executar:**
```bash
ts-node sdk/examples/17-digital-certificate-management.ts
```

---

### 🆕 1️⃣8️⃣ Simple Receipt Workflow (`18-simple-receipt-workflow.ts`)
**O que demonstra:**
- Criação de um envelope do tipo `RECEIPT`.
- Adição de `receivers` (recebedores) ao envelope.
- Ativação do envelope, que dispara notificações com token de 6 dígitos.
- Como o recebedor usa o token para confirmar o recebimento através de um endpoint público.
- Verificação do selo "RECEBIDO DIGITALMENTE" aplicado ao documento.

**Quando usar:** Para enviar documentos (e.g., notificações, políticas atualizadas) e obter uma prova de que foram recebidos, sem a complexidade de uma assinatura digital.

**Executar:**
```bash
ts-node sdk/examples/18-simple-receipt-workflow.ts
```

---

### 🆕 1️⃣9️⃣ Document Approval Workflow (`19-document-approval-workflow.ts`)
**O que demonstra:**
- Criação de um envelope do tipo `APPROVAL`.
- Adição de `approvers` (aprovadores).
- Configuração de um fluxo de aprovação `SEQUENCIAL` e `PARALELO`.
- Configuração da opção `blockOnRejection`.
- Como o aprovador usa o token para `APROVAR` ou `REJEITAR` o documento, com comentários.
- Verificação do selo de decisão ("APROVADO" ou "REJEITADO") no PDF final.

**Quando usar:** Para processos internos ou externos que necessitam de uma aprovação formal antes de prosseguir, como aprovação de minutas de contrato, orçamentos ou designs.

**Executar:**
```bash
ts-node sdk/examples/19-document-approval-workflow.ts
```
---

### 🆕 2️⃣0️⃣ Approval With PADES (`20-approval-with-pades.example.ts`)
**O que demonstra:**
- Criação de um envelope do tipo `APPROVAL` e aplica PADES ao final.

**Quando usar:** Para processos internos ou externos que necessitam de uma aprovação formal com PADES antes de prosseguir, como aprovação de minutas de contrato, orçamentos ou designs.

**Executar:**
```bash
ts-node sdk/examples/20-approval-with-pades.example.ts
```

---

### 🆕 2️⃣1️⃣ Etag Caching (`21-etag-caching.example.ts`)
**O que demonstra:**
- Uso de Etag caching nesta API.

**Executar:**
```bash
ts-node sdk/examples/21-etag-caching.example.ts
```

---

### 🆕 2️⃣2️⃣ Envelope With Documents and Signed URLs (`22-envelope-with-documents.example.ts`)
**O que demonstra:**
- Como usar o parâmetro `include=documents` ao recuperar um envelope
- Como obter URLs assinadas **apenas** para documentos COMPLETED
- Diferença entre recuperar um envelope com e sem documentos incluídos
- Acesso sob demanda via endpoints dedicados para documentos não finalizados

**Quando usar:**
- Quando você precisa acessar documentos COMPLETED de um envelope sem fazer múltiplas requisições
- Para exibir previews ou permitir downloads de documentos finais de forma segura
- Para integrar com sistemas que precisam acessar documentos assinados diretamente via URLs temporárias

**Recursos demonstrados:**
- Uso do query parameter `include=documents` no endpoint GET `/envelopes/:id`
- Geração de URLs assinadas com expiração de 1 hora **somente** para documentos COMPLETED
- Para DRAFT/RUNNING, usar `client.documents.preview()` e `client.documents.getDownloadUrl()` sob demanda

**Executar:**
```bash
ts-node sdk/examples/22-envelope-with-documents.example.ts
```

---

### 🆕 2️⃣3️⃣ Signing Session (`23-signing-session.example.ts`)
**O que demonstra:**
- Uso do endpoint agregado `signers.getSigningSession()`
- Contexto completo de assinatura (envelope, signatário, documentos, auth requirements e progresso)
- Acesso com JWT do signatário

**Quando usar:**
- Para montar a UI pública do signatário com todas as informações necessárias
- Para eliminar proxies no frontend e validar status/step-up antes de assinar

**Recursos demonstrados:**
- `client.signers.getSigningSession()`

**Executar:**
```bash
ts-node sdk/examples/23-signing-session.example.ts
```

---

### 🆕 2️⃣3️⃣ Audit Trail & History (`23-audit-trail-and-history.ts`)
**O que demonstra:**
- **Trilha de Auditoria**: Como obter o histórico completo de ações de um envelope (`getAuditTrail`)
- **Listagem de Signatários**: Novo método simplificado para listar signatários de um envelope (`signers.findByEnvelope`)
- **Histórico de Notificações**: Verificação de emails e mensagens enviadas (`notifications.getHistoryByEnvelope`)
- **Compliance**: Visualização de atores, ações e timestamps para fins legais

**Quando usar:**
- Para exibir o histórico de atividades (timeline) na interface do usuário
- Para auditoria de conformidade e segurança
- Para debugging de fluxos de assinatura

**Recursos demonstrados:**
- `client.envelopes.getAuditTrail(envelopeId)`
- `client.signers.findByEnvelope(envelopeId)`
- Estrutura de eventos padronizada (Actor, Action, Target)

**Executar:**
```bash
ts-node sdk/examples/23-audit-trail-and-history.ts
```

---

### 🆕 2️⃣4️⃣ Document Preview & Coordinates (`24-document-preview-coordinates.ts`)
**O que demonstra:**
- **Preview Avançado**: Obtenção de metadados do PDF (dimensões, MediaBox, CropBox)
- **Conversão de Coordenadas Bidirecional**:
  - `pixelToPoint`: Converte clique na tela (pixels) para sistema PDF (points)
  - `pointToPixel`: Converte posição do PDF (points) para renderização na tela (pixels)
- **Posicionamento Preciso**: Como garantir que o campo de assinatura fique exatamente onde o usuário clicou, independentemente da resolução ou rotação da página.

**Quando usar:**
- Ao implementar um visualizador de documentos (frontend) onde o usuário arrasta e solta campos.
- Para resolver problemas de alinhamento entre o que o usuário vê e onde a assinatura aparece no PDF final.

**Recursos demonstrados:**
- `client.documents.preview(id, { page: 1 })`
- `client.documents.convertCoordinates(...)`
- Manipulação de `PdfPageMetadata`

**Executar:**
```bash
ts-node sdk/examples/24-document-preview-coordinates.ts
```

---

### 2️⃣5️⃣ Automated Envelope Creation from Templates (`25-envelope-from-templates.ts`) 🆕
**O que demonstra:**
- Criação orquestrada de envelope completo em uma única chamada
- Processamento assíncrono com BullMQ (job queue)
- Polling de status do job até completar/falhar
- Múltiplos templates + múltiplos signatários
- Deduplicação automática de signatários por email
- Variáveis globais com sobrescrita por documento
- Anchor strings para posicionamento inteligente de campos
- Ativação automática e notificação opcional

**Quando usar:**
- Automação de processos documentais para CRM/ERP
- Criação em massa de contratos padronizados
- Workflows que precisam de múltiplos documentos relacionados

**Fluxo demonstrado:**
1. Criar job de envelope via `/api/v1/envelopes/from-templates` (202 Accepted)
2. Receber jobId para tracking
3. Fazer polling de status via `/api/v1/envelopes/jobs/:jobId`
4. Obter resultado final (envelope completo com documentos e signatários)

**Recursos demonstrados:**
- `client.envelopeService.createFromTemplates(input)`
- `client.envelopeService.getJobStatus(jobId)`
- `client.envelopeService.cancelJob(jobId)` (opcional)
- Validação fail-fast (templates, roles, variáveis)
- Geração automática de PDFs a partir de DOCX
- Posicionamento via anchor strings

**Executar:**
```bash
ts-node sdk/examples/25-envelope-from-templates.ts
```

**Nota:** Requer templates DOCX pré-configurados. Ver exemplo 02 para criar templates.

---

## 🚀 Como Executar

### Pré-requisitos

1. **API rodando:**
   A API `signature-module-server` deve estar em execução.
   ```bash
   # No diretório do servidor
   npm run start:dev
   ```

2. **Variáveis de Ambiente:**
   Configure as variáveis de ambiente no diretório `sdk/`. Você pode criar um arquivo `.env` baseado no `.env.example`.
   ```bash
   # sdk/.env
   API_URL="http://localhost:3000"
   API_TOKEN="seu-jwt-token-aqui"
   ```

3. **Dependências do SDK:**
   ```bash
   cd sdk
   npm install
   ```

### Executar Exemplos

Os exemplos podem ser executados diretamente com `ts-node`.

```bash
# Executar um exemplo específico (e.g., 06-pades-workflow.ts)
npx ts-node examples/06-pades-workflow.ts
```

Os scripts `npm run example:*` no `package.json` existem para os 5 primeiros exemplos, mas o uso de `ts-node` é recomendado para todos.

---

## 🔧 Troubleshooting

### Erro: "API_TOKEN não definido"
Certifique-se de que a variável `API_TOKEN` está definida no seu arquivo `sdk/.env`.

### Erro: "Connection refused"
Verifique se a API está rodando e acessível na `API_URL` configurada.
```bash
curl http://localhost:3000/api/v1/health
```

### Erro: "Unauthorized"
Seu `API_TOKEN` (JWT) pode ter expirado. Obtenha um novo token via `POST /auth/login` e atualize seu `.env`.

---

## 📚 Recursos Adicionais

- **Documentação do Projeto:** `/docs`
- **API Reference (Swagger):** `http://localhost:3000/api/docs`
- **Migration Guide:** `sdk/MIGRATION_GUIDE.md`
- **SDK README:** `sdk/README.md`

---

## 💡 Dicas de Uso

1. **Comece pelo exemplo 1** (`basic`) para entender o fluxo principal.
2. **Use o exemplo 5** (`complete`) como uma referência mais robusta.
3. **Explore os exemplos 6-12** para funcionalidades avançadas como PAdES, webhooks e multitenancy.
4. **Habilite o `DEBUG_MODE`** no `SignatureClient` para ver logs detalhados das requisições.

---

## 🤝 Suporte

Encontrou algum problema ou tem dúvidas?
- Abra uma issue no repositório do projeto.
- Consulte a documentação na pasta `/docs`.

---

**Última atualização:** 08 de Dezembro de 2025
**Versão do SDK:** 2.2.0 (Fase 13 - Recebimento e Aprovação)
