# Signature Module SDK v3.1.0

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

SDK completo em TypeScript para integração com a API de Assinatura Digital. Inclui suporte avançado para gestão de usuários e organizações, API tokens, templates DOCX com variáveis, notificações multi-canal, autenticação de assinantes, verificação pública e arquitetura multi-tenant.

## 📦 Instalação

```bash
npm install @alos32/signature-module-sdk
```

## 📋 Índice

- [Recursos Principais](#-recursos-principais)
- [Documentação](#-documentação)
- [Exemplos](#-exemplos)
- [Migration Guide](#-migration-guide)
- [Suporte](#-suporte)

## ✨ Recursos Principais

### 📦 Envelopes
- Criar, listar, atualizar e deletar envelopes
- Ativar envelopes (inicia processo de assinatura)
- Cancelar envelopes com notificação aos signatários
- Suporte multi-organização (multitenancy)

### 📄 Documentos
- Upload de PDFs reais para S3
- Geração de documentos a partir de templates DOCX
- Download de documentos assinados
- Preview de documentos
- Versionamento automático

### 📝 Templates DOCX (Fase 7)
- Upload de templates .docx com variáveis `[[VARIAVEL]]`
- Extração automática de variáveis
- Mapeamento de variáveis para signatários, campos customizados ou sistema
- Geração de PDFs a partir de templates configurados
- Suporte a 9 transformações: `formatCPF`, `formatCNPJ`, `formatPhone`, `formatCEP`, `formatCurrency`, `formatDate` (customizável), `uppercase`, `lowercase`, `capitalize`

### 🚀 Criação Automatizada de Envelopes via Templates (v3.0.1)
- **Orquestração em uma chamada**: `envelopeService.createFromTemplates()`
- **Processamento assíncrono**: Retorna 202 Accepted com jobId
- **Polling de status**: `envelopeService.getJobStatus(jobId)`
- **Cancelamento**: `envelopeService.cancelJob(jobId)`
- **Recursos avançados**:
  - Múltiplos templates + múltiplos signatários
  - Deduplicação automática por email
  - Variáveis globais com sobrescrita local
  - Anchor strings para posicionamento inteligente
  - Ativação e notificação opcionais
- **Exemplo completo**: Ver `sdk/examples/25-envelope-from-templates.ts`
- **Integração CRM**: Ideal para automação de processos documentais

### ✍️ Assinantes
- Adicionar múltiplos signatários
- Configurar ordem de assinatura
- Campos customizados por signatário
- Qualificação (parte, testemunha)
- Endereços completos

### 🧾 Recebimento Simples (Fase 13)
- **Tipo de Envelope**: Crie envelopes do tipo `RECEIPT` para confirmação de recebimento.
- **Papel do Participante**: Adicione `Receivers` que apenas confirmam o recebimento, sem assinatura digital.
- **Autenticação Simplificada**: Use tokens de 6 dígitos via Email, SMS ou WhatsApp para confirmar.
- **Selo Visual**: O PDF é carimbado com "RECEBIDO DIGITALMENTE" e todas as evidências.
- **Endpoints Públicos**: Permite a confirmação sem login de usuário, ideal para interfaces web simples.

### ✅ Aprovação de Documentos (Fase 13)
- **Tipo de Envelope**: Suporte ao tipo `APPROVAL` para fluxos de aprovação formais.
- **Papel do Participante**: Adicione `Approvers` com poder de `APROVAR` ou `REJEITAR`.
- **Fluxos de Aprovação**: Configure aprovações em `PARALELO` (todos juntos) ou `SEQUENCIAL` (em ordem).
- **Lógica de Rejeição**: Cancele o envelope automaticamente se um aprovador rejeitar (`blockOnRejection`).
- **Comentários e Selos**: Aprovadores podem deixar comentários, e o PDF recebe um selo visual da decisão.
- **Endpoints Públicos**: Permite a decisão (aprovar/rejeitar) através de uma URL pública com token.

### ✍️ Assinatura e Rubrica do Perfil (signatureFields)
- **Upload de assinatura manuscrita**: Salvar assinatura PNG no perfil do signatário
- **Upload de rubrica (iniciais)**: Salvar rubrica PNG no perfil do signatário
- **Reutilização automática**: Backend busca imagens do perfil automaticamente ao assinar
- **Stamp Group**: Criar carimbo de assinatura (SIGNATURE + TEXT + DATE) com posicionamento relativo automático
- **Rubricas automáticas**: Criar campos INITIAL em todas as páginas (exceto última) com um único comando
- **Gerenciamento**: Atualizar ou remover assinatura/rubrica salva
- **Benefícios**:
  - ✅ Cliente desenha assinatura UMA VEZ e reutiliza em todos os documentos
  - ✅ Assinaturas consistentes em múltiplos contratos
  - ✅ Processo muito mais rápido (sem reenvio de imagem)
  - ✅ Layout profissional de carimbos automatizado
  - ✅ Backend abstrai lógica de paginação e posicionamento

### 🔐 Autenticação de Assinantes (Fase 8)
- **10+ métodos de autenticação**:
  - `EMAIL_TOKEN` - Token de 6 dígitos por email
  - `SMS_TOKEN` - Token por SMS
  - `WHATSAPP_TOKEN` - Token por WhatsApp
  - `IP_ADDRESS` - Validação de endereço IP
  - `GEOLOCATION` - Validação de localização GPS
  - `OFFICIAL_DOCUMENT` - Processa automáticamente RG ou CNH - Usado em Validation Layer
  - `SELFIE` - Selfie simples sem documento
  - `SELFIE_WITH_DOCUMENT` - Selfie para comparação biométrica com documento
  - `ADDRESS_PROOF` - Comprovante de residência
  - `RG_FRONT` - RG Frente (Validation Layer)
  - `RG_BACK` - RG Verso (Validation Layer)
  - `CNH_FRONT` - CNH Frente (Validation Layer)

### 🤖 Validation Layer (AI-Powered)
- **Novos métodos específicos de documentos**:
  - `RG_FRONT` - RG Frente (foto do rosto)
  - `RG_BACK` - RG Verso (CPF e nome completo)
  - `CNH_FRONT` - CNH Frente (foto, CPF e nome)
- **Validação automatizada por IA**:
  - **OCR**: Extração automática de CPF, nome e dados do documento
  - **Biometria Facial**: Comparação 1:1 entre documento e selfie
  - **Liveness Detection**: Anti-spoofing e detecção de fraudes
  - **Quality Check**: Análise de nitidez, iluminação e enquadramento
- **Estados de validação**: `PENDING` → `IN_ANALYSIS` → `VERIFIED` / `REJECTED`
- **Processamento assíncrono**: BullMQ para filas e jobs paralelos
- **Polling de progresso**: Consulta em tempo real (0-100%)
- **Códigos de erro detalhados**: 15+ códigos com dicas amigáveis
- **Gatekeeper contextual**: Validação de IP whitelist/blacklist e geofencing

### 🔑 JWT Token System para Signatários (Fase 12)
- **Autenticação segura** com tokens JWT assinados criptograficamente
- **Access Token**: JWT de curta duração (15 minutos padrão)
  - Assinado com algoritmo HMAC SHA-256
  - Payload contém: signerId, envelopeId, email
  - Validação automática de expiração e revogação
- **Refresh Token**: UUID de longa duração (7 dias padrão)
  - Armazenado no banco de dados
  - Token rotation: gera novo par ao renovar
  - Previne reutilização de tokens comprometidos
- **Endpoints públicos** (não requerem autenticação de usuário):
  - `POST /api/v1/signers/refresh-token` - Renovar access token
  - `POST /api/v1/signers/revoke-token` - Logout/revogação
- **Segurança multicamada**:
  - Defense in depth: validação JWT + banco de dados
  - Token mismatch detection (previne replay attacks)
  - Revogação instantânea e irreversível
  - Cleanup automático de tokens expirados/revogados
- **Auto-refresh recomendado**: Renovar 2-5 minutos antes da expiração
- **Configurável via ENV**: `SIGNER_JWT_EXPIRES_IN` e `SIGNER_JWT_REFRESH_EXPIRES_IN`
- **Uso com preview**: o JWT do signatário pode acessar `GET /documents/:id/preview`, `GET /documents/:id/pages` e `GET /documents/:id/fields` (sem usuário interno).

### 🧭 Signing Session (Signer JWT)
- **Endpoint agregado**: `GET /api/v1/signing-session`
- **Contexto completo**: envelope, signatário, documentos (com contagens de fields) e progresso
- **Autenticação**: JWT do signatário (Bearer)
- **Regras**: envelope precisa estar `RUNNING` e step-up obrigatório deve estar satisfeito
- **Uso típico**: frontends públicos de assinatura sem proxies

### 📢 Notificações Multi-Canal (Fase 6)
- Notificações por **Email**, **SMS** e **WhatsApp**
- Templates de notificação customizáveis
- Lembretes automáticos agendados
- Histórico completo de notificações
- Retentativas automáticas para falhas

### 🔍 Verificação Pública (Fase 4)
- Verificação de documentos assinados por hash SHA256 (uso técnico/auditoria)
- QR Code oficial usa token curto (`/api/v1/v/:token`)
- Download público por hash existe apenas como fluxo avançado/auditoria
- Exibição de signatários e status de assinaturas
- Validação de integridade do documento

### 🔐 Assinatura Digital PAdES (Fase 3)
- Gerenciamento de certificados digitais ICP-Brasil (A1, A3, A4)
- Upload seguro de certificados P12/PFX
- Múltiplas estratégias de assinatura:
- `VISUAL_ONLY`: Apenas carimbos visuais (padrão atual)
  - `PADES_EACH`: PAdES em cada assinatura individual
  - `PADES_FINAL`: Múltiplas assinaturas visuais + PAdES único ao final ⭐
  - `HYBRID`: Assinaturas visuais + PAdES seletivo por signatário
  - `HYBRID_SEALED`: Assinaturas visuais + selo organizacional automático
- Assinatura PAdES-B compatível com Adobe Reader
- Estatísticas de certificados (total, ativos, expirando)
- Ativação/desativação e revogação de certificados
- Armazenamento seguro de senhas para automação

### 📄 Papel Timbrado (Fase 10)
- Upload de papel timbrado/letterhead PNG
- Aplicação automática em documentos PDF
- Configuração de opacidade, posição e páginas
- Download e gerenciamento via API
- Integração transparente no workflow

### 🖼️ Logo da Organização (Fase 12)
- Upload de logo (PNG, JPG, SVG)
- Dimensões recomendadas: 512x512px (quadrado)
- Tamanho máximo: 5MB
- Uso como stamp padrão nos documentos
- Download e gerenciamento via API
- Integração automática com stampTemplate

### 🔐 Autenticação Híbrida de Usuários (JWT + API Token)
- **JWT (JSON Web Token)**: Para usuários humanos com sessões
  - Obtido via `POST /api/v1/auth/login` com email/senha
  - Curta duração (15 minutos padrão)
  - Refresh automático com refreshToken
  - Ideal para: aplicações web, mobile apps, sessões interativas
- **API Token**: Para integrações M2M (machine-to-machine)
  - Criado via `POST /api/v1/api-tokens` (requer JWT)
  - Longa duração ou permanente (configurável)
  - Sem refresh - token estático até expirar/revogar
  - Ideal para: CI/CD, webhooks, integrações, scripts automatizados
- **Autenticação Unificada**: Ambos funcionam no mesmo header `Authorization: Bearer <token>`
- **Prioridade**: API Token verificado primeiro (DB lookup), fallback para JWT (in-memory)
- **Performance**: API Token ~2-5ms | JWT <1ms

### 🚀 Performance: ETag Caching

O SDK possui suporte integrado a **cache automático via ETags** para economizar largura de banda e melhorar performance.

**O que são ETags?**
- ETags (Entity Tags) são identificadores únicos retornados pelo servidor para cada versão de um recurso
- Permitem validação condicional: cliente pergunta "mudou desde a última vez?" em vez de baixar tudo novamente
- Se não mudou, servidor retorna `304 Not Modified` (sem corpo, ~100 bytes) em vez de `200 OK` com dados completos

**Benefícios:**
- ✅ Economiza largura de banda (até 95% em cache hits)
- ✅ Reduz latência de rede
- ✅ Menos processamento no servidor
- ✅ Previne conflitos com optimistic locking

### 🔐 Níveis de Autenticação Padrão para Assinantes (Fase 12)
- **BASIC**: Email + IP + Geolocalização (mínimo recomendado)
- **STANDARD**: BASIC + WhatsApp/SMS + Documento + Selfie
- **STRICT**: STANDARD + Comprovante de endereço (obrigatório para PAdES)
- Configuração por organização com override por envelope/signatário
- Recomendação automática baseada na estratégia de assinatura

### 🏢 Gestão de Usuários e Organizações (Fase 11 + Fase 12)
- **Registro de Usuários**: Criar novos usuários via API pública
- **API Tokens**: CRUD completo de tokens para acesso programático
- **Organizações**: Gerenciar organizações, planos e limites
- **Roles**: OWNER, ADMIN, MEMBER com controle de permissões
- **Multi-tenancy**: Isolamento completo de dados por organização
- **Estatísticas**: Usuários ativos, envelopes do mês, storage usado
- **Planos**: FREE, BASIC, PREMIUM, ENTERPRISE
- **🆕 Gerenciamento de Membros (Fase 12)**:
  - Adicionar usuários a organizações existentes
  - Vincular novos usuários sem criar nova organização
  - Alterar roles de membros (promover/rebaixar)
  - Remover membros da organização
  - Validação de limites e permissões
  - Controle granular de acesso (OWNER, ADMIN, MEMBER)

### 🏗️ Setores Organizacionais
- **Hierarquia de Setores**: Estrutura em árvore (Diretoria > Gerência > Equipe)
- **Códigos Únicos**: Identificadores customizados (`JUR`, `TI`, `RH`)
- **Path Automático**: Navegação hierárquica (`/diretoria/gerencia`)
- **Gestores**: Atribuição de responsável por setor
- **Membros N:N**: Usuário pode pertencer a múltiplos setores
- **Destinatários Internos**: Vincular signatários a usuários via `userId`
- **Busca por Setor**: Listar membros para adicionar como signatários
- **Soft Delete**: Desativação sem perda de dados

## 📖 Exemplos

O SDK inclui **26+ exemplos práticos** no diretório `examples/` com um README.md próprio:

**Destaque v3.0.1:**
- **Exemplo 25**: Criação automatizada de envelopes via templates com processamento assíncrono
- **Exemplo 26**: Gestão de setores organizacionais e destinatários internos

Veja [examples/README.md](./examples/README.md) para a lista completa.

---

## ⚠️ Convenção de Nomenclatura (camelCase)

O SDK segue o padrão **camelCase** para todos os campos (convenção JavaScript/TypeScript).

**Exemplo de uso do SDK:**
```typescript
const envelope = await client.envelopes.create({
  name: 'Contrato',
  deadline: '2024-02-15T23:59:59Z',
  customFields: {
    contractNumber: '2024/001'
  }
});
```

### Integração com Sistemas snake_case

Se o seu sistema usa **snake_case** (comum em PostgreSQL, Python, Ruby), você precisará fazer transformação bidirecional dos dados antes de enviar ao SDK e após receber respostas.

**Bibliotecas Recomendadas:**
- **JavaScript/Node.js**: [`camelcase-keys`](https://www.npmjs.com/package/camelcase-keys), [`snakecase-keys`](https://www.npmjs.com/package/snakecase-keys)
- **Python**: Módulos built-in ou [`humps`](https://github.com/nficano/humps)
- **Ruby**: [`plissken`](https://github.com/Gaelan/plissken) gem

**Exemplo de transformação (JavaScript):**
```javascript
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { SignatureClient } from 'signature-module';

const client = new SignatureClient({
  baseURL: 'https://api.example.com',
  accessToken: 'your_token'
});

// Dados do seu sistema (snake_case)
const localData = {
  envelope_name: 'Contrato',
  created_at: '2024-01-15',
  custom_fields: { contract_number: '2024/001' }
};

// Converter para camelCase antes de enviar ao SDK
const sdkPayload = camelcaseKeys(localData, { deep: true });
const envelope = await client.envelopes.create(sdkPayload);

// Converter resposta para snake_case para uso local
const responseInSnakeCase = snakecaseKeys(envelope, { deep: true });
// { id: 'env_123', envelope_name: 'Contrato', created_at: '2024-01-15', ... }
```

**Nota:** O SDK não oferece conversão automática para manter a biblioteca leve e previsível. A transformação é responsabilidade da aplicação cliente.

---

## 💡 Exemplos de Uso

### Setores Organizacionais

```typescript
// Criar setor
const setor = await client.sectors.create({
  name: 'Diretoria Jurídica',
  code: 'JUR',
});

// Criar sub-setor
const subSetor = await client.sectors.create({
  name: 'Equipe Contratos',
  code: 'CONTR',
  parentId: setor.id,
});

// Obter árvore completa
const tree = await client.sectors.getTree();

// Adicionar membro
await client.sectors.addUser(setor.id, {
  userId: 'user-123',
  isPrimary: true,
});

// Listar membros de um setor
const membros = await client.sectors.getUsers(setor.id);
```

### Destinatários Internos

```typescript
// Adicionar signatário interno (name e email preenchidos do User)
const signer = await client.signers.create(envelopeId, {
  userId: 'user-123',
  signingOrder: 1,
});
console.log(signer.isInternal); // true
console.log(signer.user?.name); // Nome do usuário
```

---

## 📖 Quick Start e Documentação rápida

Veja [QUICKSTART_DOCUMENTACAO.md](./QUICKSTART_DOCUMENTACAO.md) para acessar.

**Cobertura de Testes:**
- ✅ **56 testes unitários** dos validadores (100% cobertura das validações client-side)
- ✅ **19 exemplos funcionais** que servem como documentação viva
- ✅ **API completamente testada** (unit + integration + e2e)

**Por que não temos testes de integração extensivos no SDK?**

O SDK é essencialmente um cliente HTTP. Como a API já possui cobertura completa de testes, focamos em:
1. Validar as **validações client-side** (tamanho arquivo, MIME types, etc.)
2. Garantir que os **tipos TypeScript estão corretos** (typecheck)
3. Manter **exemplos funcionais e atualizados**

## 📊 API Swagger

Para documentação interativa completa da API, acesse:

```
https://sua-api.com/api/docs
```

A documentação Swagger inclui:
- Todos os endpoints disponíveis
- Exemplos de request/response
- Schemas detalhados
- Interface para testar endpoints

## 🔗 Links Úteis

- **Swagger/OpenAPI**: `/api/docs` (documentação interativa)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Examples**: [examples/](./examples/)
- **Types**: [src/types/](./src/types/)

## 🤝 Suporte

Para questões, bugs ou sugestões:

1. Abra uma issue no repositório
2. Consulte a documentação Swagger
3. Veja os exemplos práticos em `examples/`

## 📄 Licença

MIT

---
