# Common Errors - API de Assinatura Digital

Este documento lista os erros mais comuns da API de Assinatura Digital, suas causas e soluções.

---

## 📋 Índice

- [Erros HTTP Padrão](#erros-http-padrão)
- [Erros de Envelope](#erros-de-envelope)
- [Erros de Signatário](#erros-de-signatário)
- [Erros de Documento](#erros-de-documento)
- [Erros de Template](#erros-de-template)
- [Erros de Certificado Digital](#erros-de-certificado-digital)
- [Erros de Organização](#erros-de-organização)
- [Tratamento de Erros no SDK](#tratamento-de-erros-no-sdk)

---

## Erros HTTP Padrão

### 400 Bad Request
**Causa:** Requisição malformada ou dados inválidos
**Solução:** Verifique os dados enviados e consulte a documentação da API

### 401 Unauthorized
**Código:** `AUTHENTICATION_ERROR`
**Causa:** Token JWT inválido, expirado ou ausente
**Solução:**
```typescript
// Renovar token ou fazer novo login
const tokens = await client.auth.login(email, password);
client.setAccessToken(tokens.accessToken);
```

### 403 Forbidden
**Código:** `AUTHORIZATION_ERROR`
**Causa:** Usuário sem permissão para executar a ação
**Solução:** Verifique se o role do usuário permite a operação (OWNER, ADMIN, MEMBER)

### 404 Not Found
**Código:** `NOT_FOUND`
**Causa:** Recurso não existe ou foi deletado
**Solução:** Verifique se o ID está correto

### 422 Unprocessable Entity
**Código:** `VALIDATION_ERROR`
**Causa:** Dados não passaram nas regras de validação
**Solução:** Corrija os campos listados em `error.errors[]`

### 429 Too Many Requests
**Código:** `RATE_LIMIT_EXCEEDED`
**Causa:** Muitas requisições em curto período
**Solução:**
```typescript
if (error.isRateLimitError()) {
  const resetIn = error.rateLimitReset - Math.floor(Date.now() / 1000);
  console.log(`Aguarde ${resetIn}s antes de tentar novamente`);
  // Implementar retry automático com backoff
}
```

### 500 Internal Server Error
**Código:** `INTERNAL_SERVER_ERROR`
**Causa:** Erro interno do servidor
**Solução:** Erro temporário, implementar retry com exponential backoff

### 503 Service Unavailable
**Código:** `SERVICE_UNAVAILABLE`
**Causa:** Serviço temporariamente indisponível
**Solução:** Implementar retry automático

---

## Erros de Envelope

### ENVELOPE_NOT_FOUND
**HTTP:** 404
**Mensagem:** "Envelope não encontrado"
**Causa:** ID do envelope inválido ou envelope foi deletado
**Solução:**
```typescript
try {
  const envelope = await client.envelopes.findById(envelopeId);
} catch (error) {
  if (error.code === 'ENVELOPE_NOT_FOUND') {
    console.error('Envelope não existe');
    // Redirecionar para lista de envelopes
  }
}
```

### ENVELOPE_NO_DOCUMENTS
**HTTP:** 400
**Mensagem:** "Envelope não contém documentos"
**Causa:** Tentativa de ativar envelope sem documentos
**Solução:**
```typescript
// Adicione documentos antes de ativar
await client.documents.create(envelopeId, {
  file: pdfBuffer,
  filename: 'contrato.pdf'
});

// Então ative o envelope
await client.envelopes.activate(envelopeId);
```

### ENVELOPE_NO_SIGNERS
**HTTP:** 400
**Mensagem:** "Envelope não contém signatários"
**Causa:** Tentativa de ativar envelope sem signatários
**Solução:**
```typescript
// Adicione signatários antes de ativar
await client.signers.create(envelopeId, {
  name: 'João Silva',
  email: 'joao@example.com'
});

// Então ative o envelope
await client.envelopes.activate(envelopeId);
```

### ENVELOPE_ALREADY_ACTIVATED
**HTTP:** 400
**Mensagem:** "Envelope já está ativo"
**Causa:** Tentativa de ativar envelope que já foi ativado
**Solução:** Nenhuma ação necessária, envelope já está em andamento

### ENVELOPE_ALREADY_COMPLETED
**HTTP:** 400
**Mensagem:** "Envelope já foi concluído"
**Causa:** Tentativa de modificar envelope finalizado
**Solução:** Envelopes concluídos são imutáveis. Crie um novo envelope se necessário.

### ENVELOPE_ALREADY_CANCELED
**HTTP:** 400
**Mensagem:** "Envelope foi cancelado"
**Causa:** Tentativa de operar em envelope cancelado
**Solução:** Envelopes cancelados não podem ser reativados. Crie um novo envelope.

### ENVELOPE_EXPIRED
**HTTP:** 400
**Mensagem:** "Envelope expirou"
**Causa:** Prazo (deadline) do envelope passou
**Solução:**
```typescript
// Criar novo envelope com nova deadline
const newEnvelope = await client.envelopes.create({
  name: 'Contrato',
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});
```

---

## Erros de Signatário

### SIGNER_NOT_FOUND
**HTTP:** 404
**Mensagem:** "Signatário não encontrado"
**Causa:** ID do signatário inválido
**Solução:** Verifique se o ID está correto

### SIGNER_ALREADY_SIGNED
**HTTP:** 400
**Mensagem:** "Signatário já assinou"
**Causa:** Tentativa de assinar novamente
**Solução:** Nenhuma ação necessária

### SIGNER_NOT_AUTHENTICATED
**HTTP:** 403
**Mensagem:** "Signatário não completou autenticação"
**Causa:** Métodos de autenticação configurados não foram completados
**Solução:**
```typescript
// Verificar status de autenticação
const status = await client.signers.getAuthenticationStatus(signerId);

// Completar métodos pendentes
if (!status.email_verified) {
  await client.authentication.sendToken(requirementId);
}
```

### SIGNER_AUTHENTICATION_FAILED
**HTTP:** 403
**Mensagem:** "Falha na autenticação"
**Causa:** Token inválido, documento rejeitado, selfie não passou validação
**Solução:** Signatário deve refazer o processo de autenticação

### SIGNER_OUT_OF_ORDER
**HTTP:** 403
**Mensagem:** "Aguarde signatários anteriores"
**Causa:** Ordem de assinatura configurada não foi respeitada
**Solução:**
```typescript
// Verificar ordem de assinatura
const signers = await client.signers.findAll(envelopeId);
const orderedSigners = signers.sort((a, b) =>
  (a.signatureOrder || 0) - (b.signatureOrder || 0)
);

// Aguardar signatários anteriores assinarem
```

---

## Erros de Documento

### DOCUMENT_NOT_FOUND
**HTTP:** 404
**Mensagem:** "Documento não encontrado"
**Causa:** ID do documento inválido
**Solução:** Verifique se o ID está correto

### DOCUMENT_TOO_LARGE
**HTTP:** 413
**Mensagem:** "Arquivo muito grande. Máximo: 10 MB"
**Causa:** Arquivo PDF excede o tamanho máximo
**Solução:**
```typescript
// Validar tamanho antes de upload
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
if (fileSize > MAX_SIZE) {
  console.error(`Arquivo muito grande: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  // Solicitar ao usuário comprimir o PDF
}
```

### DOCUMENT_INVALID_FORMAT
**HTTP:** 400
**Mensagem:** "Formato inválido. Apenas PDF aceito"
**Causa:** Arquivo não é PDF válido
**Solução:**
```typescript
// Validar MIME type
if (file.mimetype !== 'application/pdf') {
  console.error('Apenas arquivos PDF são aceitos');
}
```

### DOCUMENT_CORRUPTED
**HTTP:** 400
**Mensagem:** "Arquivo corrompido"
**Causa:** PDF está corrompido ou mal-formado
**Solução:** Gerar novamente o PDF ou tentar repará-lo com ferramenta externa

---

## Erros de Template

### TEMPLATE_NOT_FOUND
**HTTP:** 404
**Mensagem:** "Template não encontrado"
**Causa:** ID do template inválido
**Solução:** Verifique se o template existe

### TEMPLATE_VARIABLES_MISSING
**HTTP:** 400
**Mensagem:** "Variáveis do template não fornecidas"
**Causa:** Variáveis obrigatórias não foram mapeadas
**Solução:**
```typescript
// Listar variáveis do template
const template = await client.templates.findById(templateId);
console.log('Variáveis:', template.variables);

// Fornecer todas as variáveis
await client.templates.generateDocument(templateId, {
  envelopeId,
  signers: [
    { role: 'CONTRATANTE', name: 'João', email: 'joao@example.com' }
  ]
});
```

### TEMPLATE_INVALID_MAPPING
**HTTP:** 400
**Mensagem:** "Mapeamento de variáveis incorreto"
**Causa:** Variável mapeada para fonte inválida
**Solução:** Verificar configuração de mapeamento do template

---

## Erros de Certificado Digital

### CERTIFICATE_NOT_FOUND
**HTTP:** 404
**Mensagem:** "Certificado não encontrado"
**Causa:** ID do certificado inválido
**Solução:** Verificar se certificado existe e pertence à organização

### CERTIFICATE_EXPIRED
**HTTP:** 400
**Mensagem:** "Certificado expirado"
**Causa:** Certificado digital passou da validade
**Solução:**
```typescript
// Upload de novo certificado
await client.certificates.upload({
  file: p12Buffer,
  password: 'senha-certificado',
  name: 'Certificado A1 - 2025'
});
```

### CERTIFICATE_INVALID_PASSWORD
**HTTP:** 400
**Mensagem:** "Senha do certificado incorreta"
**Causa:** Senha fornecida não consegue abrir o arquivo P12/PFX
**Solução:** Solicitar senha correta ao usuário

---

## Erros de Organização

### ORGANIZATION_QUOTA_EXCEEDED
**HTTP:** 402
**Mensagem:** "Quota de envelopes mensal excedida"
**Causa:** Organização atingiu limite de envelopes do plano
**Solução:**
```typescript
// Verificar quota atual
const stats = await client.organizations.getStats();
console.log(`Envelopes: ${stats.envelopesThisMonth}/${stats.envelopeLimit}`);

// Opções:
// 1. Aguardar próximo ciclo de faturamento
// 2. Fazer upgrade do plano
// 3. Contatar suporte para aumento temporário
```

### ORGANIZATION_PLAN_LIMIT_REACHED
**HTTP:** 402
**Mensagem:** "Limite do plano atingido"
**Causa:** Limite de usuários, storage ou outros recursos
**Solução:** Fazer upgrade do plano

### ORGANIZATION_STORAGE_FULL
**HTTP:** 507
**Mensagem:** "Armazenamento cheio"
**Causa:** Storage da organização atingiu limite
**Solução:**
```typescript
// Verificar uso de storage
const stats = await client.organizations.getStats();
console.log(`Storage: ${stats.storageUsedMB} MB / ${stats.storageLimitMB} MB`);

// Opções:
// 1. Deletar envelopes antigos
// 2. Upgrade do plano
// 3. Arquivar documentos externamente
```

---

## Tratamento de Erros no SDK

### Estrutura Básica

```typescript
import { ApiError } from 'signature-module';

try {
  await client.envelopes.activate(envelopeId);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);

    // Helpers úteis
    if (error.isAuthenticationError()) {
      // Redirecionar para login
    }

    if (error.isValidationError()) {
      // Mostrar erros de validação
      console.error('Erros:', error.errors);
    }

    if (error.isRetryable()) {
      // Implementar retry automático
    }
  }
}
```

### Switch-Case por Código de Erro

```typescript
try {
  await client.envelopes.activate(envelopeId);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'ENVELOPE_NO_DOCUMENTS':
        console.error('Adicione documentos antes de ativar');
        break;

      case 'ENVELOPE_NO_SIGNERS':
        console.error('Adicione signatários antes de ativar');
        break;

      case 'ENVELOPE_ALREADY_ACTIVATED':
        console.log('Envelope já está ativo');
        break;

      default:
        console.error('Erro inesperado:', error.message);
    }
  }
}
```

### Retry Automático

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ApiError && error.isRetryable()) {
        if (attempt === maxRetries) throw error;

        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Uso
const envelope = await withRetry(() =>
  client.envelopes.create({ name: 'Contrato' })
);
```

---

## Referências

- **Exemplo Completo:** `sdk/examples/10-error-handling.ts`
- **Documentação da API:** `/api/docs` (Swagger)
- **ApiError Class:** `sdk/src/ApiError.ts`

---

**Última atualização:** 2025-12-30
