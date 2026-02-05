# ETags no SDK - Guia de Uso

## 📚 Visão Geral

O SDK agora suporta **ETags** para cache HTTP e **optimistic locking**, permitindo:
- ✅ Economizar largura de banda com 304 Not Modified
- ✅ Cache local opcional de ETags
- ✅ Prevenir conflitos com If-Match (optimistic locking)

---

## 🚀 Configuração

### Habilitando Cache de ETags

```typescript
import { SignatureClient } from '@signature-module/sdk';

const client = new SignatureClient({
  baseURL: 'https://api.example.com',
  accessToken: 'your-jwt-token',
  // 🆕 Habilitar cache de ETags
  enableEtagCache: true,
  etagCacheOptions: {
    defaultTtl: 300000, // 5 minutos (padrão)
    maxSize: 500,       // Máximo de 500 entradas (padrão)
    debug: false,       // Logging (padrão: false)
  },
});
```

---

## 📖 Uso Básico

### 1. GET com Cache Automático (304 Not Modified)

Quando o cache está habilitado, o SDK envia automaticamente `If-None-Match`:

```typescript
// Primeira requisição - 200 OK com ETag
const doc1 = await client.documents.findById('doc123');
// → GET /documents/doc123
// ← 200 OK
// ← ETag: "abc123"
// ← Cache-Control: private, max-age=300

// Segunda requisição (dentro do TTL) - 304 Not Modified
const doc2 = await client.documents.findById('doc123');
// → GET /documents/doc123
// → If-None-Match: "abc123"
// ← 304 Not Modified (retorna dados do cache local)
```

### 2. GET com ETag Manual (sem cache local)

Se você não quer cache automático, pode enviar ETag manualmente:

```typescript
const document = await client.documents.findById('doc123', {
  ifNoneMatch: '"abc123"', // ETag que você conhece
});
```

---

## 🔒 Optimistic Locking

### PUT/DELETE com If-Match

Para prevenir conflitos em operações concorrentes:

```typescript
// 1. Buscar recurso e obter ETag
const field = await client.signatureFields.findById('field123');
// ETag recebido: "v1-abc123"

// 2. Modificar com If-Match
try {
  await client.signatureFields.update('field123', {
    posX: 150,
    posY: 200,
  }, {
    ifMatch: field.etag, // Envia If-Match: "v1-abc123"
  });
  console.log('✅ Atualizado com sucesso');
} catch (error) {
  if (error.status === 412) {
    // 412 Precondition Failed - outro cliente modificou antes
    console.error('❌ Conflito: recurso foi modificado por outro cliente');
    console.error('ETag atual:', error.currentEtag);
    // Refazer GET para obter versão atual
  }
}
```

---

## 🔧 API Detalhada

### EtagCacheManager

Gerencia cache local de ETags:

```typescript
import { EtagCacheManager } from '@signature-module/sdk';

const cache = new EtagCacheManager({
  defaultTtl: 300000,  // 5 minutos
  maxSize: 500,        // 500 entradas
  debug: true,         // Logging
});

// Armazenar
cache.set('/api/v1/documents/123', '"etag123"', documentData, 300);

// Recuperar
const cached = cache.get('/api/v1/documents/123');
if (cached) {
  console.log('Cache hit!', cached.etag);
}

// Invalidar
cache.invalidate('/api/v1/documents/123');

// Limpar tudo
cache.clear();

// Estatísticas
const stats = cache.getStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
```

### RequestOptions

Opções para requisições com ETags:

```typescript
interface RequestOptions {
  /** ETag para If-None-Match (GET) */
  ifNoneMatch?: string;

  /** ETag para If-Match (PUT/DELETE) */
  ifMatch?: string;

  /** Usar cache local (padrão: true) */
  useCache?: boolean;
}
```

### CachedResponse

Resposta enriquecida com metadados de cache:

```typescript
interface CachedResponse<T> {
  data: T;
  etag?: string;
  lastModified?: string;
  fromCache: boolean;  // true se 304 Not Modified
  expiresAt?: number;  // Timestamp de expiração
}
```

---

## 📋 Endpoints com Suporte a ETags

### Leitura (GET)

| Endpoint | ETag Type | Cache-Control |
|----------|-----------|---------------|
| `GET /documents/:id` | strong | 300s |
| `GET /documents` | weak | 120s |
| `GET /events` | weak | 60s |
| `GET /notifications/*` | weak | 30s |
| `GET /signature-fields/:id` | strong | 300s |

### Modificação (PUT/DELETE)

| Endpoint | Optimistic Locking |
|----------|--------------------|
| `PUT /signature-fields/:id` | ✅ If-Match |
| `DELETE /signature-fields/:id` | ✅ If-Match |

---

## 🎯 Exemplos Práticos

### Exemplo 1: Cache Automático de Documentos

```typescript
const client = new SignatureClient({
  baseURL: 'https://api.example.com',
  accessToken: token,
  enableEtagCache: true,
});

// Buscar documento várias vezes
for (let i = 0; i < 5; i++) {
  const doc = await client.documents.findById('doc123');
  console.log(`Requisição ${i + 1}:`, doc.fromCache ? '304 (cache)' : '200 (servidor)');
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Saída esperada:
// Requisição 1: 200 (servidor)
// Requisição 2: 304 (cache)
// Requisição 3: 304 (cache)
// Requisição 4: 304 (cache)
// Requisição 5: 304 (cache)
```

### Exemplo 2: Prevenir Race Conditions

```typescript
async function updateFieldSafely(fieldId: string, updates: any) {
  // 1. GET para obter ETag atual
  const field = await client.signatureFields.findById(fieldId);

  // 2. Atualizar com If-Match
  try {
    await client.signatureFields.update(fieldId, updates, {
      ifMatch: field.etag,
    });
    return { success: true };
  } catch (error) {
    if (error.status === 412) {
      // Conflito detectado!
      return {
        success: false,
        reason: 'conflict',
        message: 'Outro usuário modificou o recurso. Tente novamente.',
      };
    }
    throw error;
  }
}

// Uso
const result = await updateFieldSafely('field123', { posX: 150 });
if (!result.success) {
  console.error(result.message);
}
```

### Exemplo 3: Cache Manual com Controle Fino

```typescript
// Desabilitar cache automático
const client = new SignatureClient({
  baseURL: 'https://api.example.com',
  accessToken: token,
  enableEtagCache: false,  // Cache desabilitado
});

// Gerenciar cache manualmente
let cachedEtag: string | undefined;

const doc = await client.documents.findById('doc123', {
  ifNoneMatch: cachedEtag,  // Enviar ETag manual
});

if (doc.fromCache) {
  console.log('304 - Dados não mudaram');
} else {
  console.log('200 - Dados atualizados');
  cachedEtag = doc.etag;  // Armazenar ETag para próxima vez
}
```

---

## ⚠️ Notas Importantes

1. **ETags e Assinaturas PAdES**:
   - Quando um documento recebe assinatura PAdES, o `documentHash` muda
   - O ETag é automaticamente invalidado no servidor
   - O SDK detecta isso e atualiza o cache local

2. **Cache Híbrido**:
   - O servidor usa `updatedAt` timestamp + eventos para invalidar
   - O SDK usa TTL local + validação condicional
   - Combinação garante consistência sem staleness

3. **Performance**:
   - Cache local reduz requisições em ~70% (dependendo do workload)
   - 304 Not Modified economiza largura de banda
   - Optimistic locking previne conflitos sem locks pessimistas

4. **Debugging**:
   ```typescript
   const client = new SignatureClient({
     baseURL: '...',
     accessToken: '...',
     enableEtagCache: true,
     etagCacheOptions: {
       debug: true,  // Habilitar logs
     },
   });

   // Console mostrará:
   // [EtagCache] Cached /api/v1/documents/123 with ETag "abc" (expires in 300000ms)
   // [EtagCache] Cache hit for /api/v1/documents/123: "abc"
   ```

---

## 📚 Referências

- [RFC 7232 - HTTP Conditional Requests](https://datatracker.ietf.org/doc/html/rfc7232)
- [Documentação da API - ETags](/docs/etags-implementation.md)
- [Optimistic Concurrency Control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)

---

## 🆕 Novidades na v2.1.0

- ✅ Suporte a ETags strong e weak
- ✅ Cache local de ETags com `EtagCacheManager`
- ✅ Validação condicional automática (If-None-Match)
- ✅ Optimistic locking (If-Match)
- ✅ Tratamento de 304 Not Modified
- ✅ Tratamento de 412 Precondition Failed
- ✅ Metadados de cache em respostas (`CachedResponse<T>`)
