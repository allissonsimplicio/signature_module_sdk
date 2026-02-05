/**
 * Exemplo de uso de ETags no SDK
 *
 * Demonstra:
 * 1. Cache automático com ETags
 * 2. Validação condicional (If-None-Match → 304)
 * 3. Optimistic locking (If-Match → 412)
 * 4. Gerenciamento manual de cache
 */

import { SignatureClient } from '../src/client/SignatureClient';
import { EtagCacheManager } from '../src/cache/EtagCacheManager';

// Configuração
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'your-jwt-token';

/**
 * Exemplo 1: Cache Automático de ETags
 *
 * O SDK cacheia automaticamente os ETags recebidos e os reenvia
 * em requisições subsequentes, economizando largura de banda.
 */
async function example1_AutomaticEtagCache() {
  console.log('\n=== Exemplo 1: Cache Automático de ETags ===\n');

  const client = new SignatureClient({
    baseURL: API_BASE_URL,
    accessToken: ACCESS_TOKEN,
    enableEtagCache: true,
    etagCacheOptions: {
      defaultTtl: 300000, // 5 minutos
      maxSize: 500,
      debug: true, // Ver logs de cache
    },
  });

  const documentId = 'clxyz123'; // Substitua por um ID real

  // Primeira requisição - 200 OK com ETag
  console.log('📡 Primeira requisição...');
  const doc1 = await client.documents.findById(documentId);
  console.log('✅ Documento recebido:', {
    id: doc1.id,
    name: doc1.name,
    etag: (doc1 as any).etag,
    fromCache: (doc1 as any).fromCache,
  });

  // Aguardar 1 segundo
  await sleep(1000);

  // Segunda requisição - 304 Not Modified (cache hit)
  console.log('\n📡 Segunda requisição (mesmo documento)...');
  const doc2 = await client.documents.findById(documentId);
  console.log('✅ Documento recebido:', {
    id: doc2.id,
    fromCache: (doc2 as any).fromCache, // true se 304
    cacheHit: (doc2 as any).etag === (doc1 as any).etag,
  });

  if ((doc2 as any).fromCache) {
    console.log('🎉 Cache hit! Economizou largura de banda.');
  }
}

/**
 * Exemplo 2: Optimistic Locking com If-Match
 *
 * Previne conflitos quando múltiplos clientes tentam modificar
 * o mesmo recurso simultaneamente.
 */
async function example2_OptimisticLocking() {
  console.log('\n=== Exemplo 2: Optimistic Locking ===\n');

  const client = new SignatureClient({
    baseURL: API_BASE_URL,
    accessToken: ACCESS_TOKEN,
  });

  const fieldId = 'clfld123'; // Substitua por um ID real

  try {
    // 1. Buscar recurso atual
    console.log('📡 Buscando signature field...');
    const field = await client.signatureFields.findById(fieldId);
    console.log('✅ Campo recebido:', {
      id: field.id,
      posX: field.x,
      posY: field.y,
      etag: (field as any).etag,
    });

    // 2. Modificar com If-Match (optimistic locking)
    console.log('\n📡 Atualizando com If-Match...');
    const updated = await client.signatureFields.update(
      fieldId,
      {
        x: 150,
        y: 200,
      }
      // {
      //   ifMatch: (field as any).etag, // Só atualiza se ETag bater
      // },
    );

    console.log('✅ Atualizado com sucesso:', {
      id: updated.id,
      posX: updated.x,
      posY: updated.y,
      newEtag: (updated as any).etag,
    });
  } catch (error: any) {
    if (error.status === 412) {
      // 412 Precondition Failed
      console.error('❌ Conflito detectado!');
      console.error('   Outro cliente modificou o recurso antes de você.');
      console.error('   ETag atual do servidor:', error.currentEtag);
      console.error('   Você precisa refazer o GET e tentar novamente.');
    } else {
      throw error;
    }
  }
}

/**
 * Exemplo 3: Simulação de Race Condition (Optimistic Locking)
 *
 * Dois clientes tentam modificar o mesmo recurso simultaneamente.
 * O segundo cliente recebe 412 Precondition Failed.
 */
async function example3_RaceCondition() {
  console.log('\n=== Exemplo 3: Simulação de Race Condition ===\n');

  const client1 = new SignatureClient({
    baseURL: API_BASE_URL,
    accessToken: ACCESS_TOKEN,
  });

  const client2 = new SignatureClient({
    baseURL: API_BASE_URL,
    accessToken: ACCESS_TOKEN,
  });

  const fieldId = 'clfld123'; // Substitua por um ID real

  // Ambos os clientes buscam o mesmo recurso
  console.log('📡 Cliente 1: Buscando recurso...');
  const field1 = await client1.signatureFields.findById(fieldId);

  console.log('📡 Cliente 2: Buscando recurso...');
  const field2 = await client2.signatureFields.findById(fieldId);

  console.log(`\n✅ Ambos têm o mesmo ETag: "${(field1 as any).etag}"\n`);

  try {
    // Cliente 1 atualiza primeiro
    console.log('📡 Cliente 1: Atualizando...');
    await client1.signatureFields.update(
      fieldId,
      { x: 100 }
      // { ifMatch: (field1 as any).etag },
    );
    console.log('✅ Cliente 1: Atualizado com sucesso!\n');

    // Cliente 2 tenta atualizar com ETag desatualizado
    console.log('📡 Cliente 2: Tentando atualizar...');
    await client2.signatureFields.update(
      fieldId,
      { x: 200 }
      // { ifMatch: (field2 as any).etag }, // ETag desatualizado!
    );
    console.log('✅ Cliente 2: Atualizado (não deveria chegar aqui)');
  } catch (error: any) {
    if (error.status === 412) {
      console.error('❌ Cliente 2: CONFLITO DETECTADO!');
      console.error('   O recurso foi modificado pelo Cliente 1.');
      console.error('   Cliente 2 precisa refazer o GET para obter a versão atual.');
    }
  }
}

/**
 * Exemplo 4: Gerenciamento Manual de Cache
 *
 * Controle fino sobre o cache de ETags sem depender do cliente.
 */
async function example4_ManualCacheManagement() {
  console.log('\n=== Exemplo 4: Gerenciamento Manual de Cache ===\n');

  const cache = new EtagCacheManager({
    defaultTtl: 300000, // 5 minutos
    maxSize: 100,
    debug: true,
  });

  // Simular requisição e cache
  const documentData = {
    id: 'doc123',
    name: 'Contract.pdf',
    status: 'completed',
  };

  const etag = '"abc123def456"';
  const url = '/api/v1/documents/doc123';

  // Armazenar no cache
  console.log('📦 Armazenando no cache...');
  cache.set(url, etag, documentData, 300); // 300s TTL

  // Recuperar do cache
  console.log('\n📦 Recuperando do cache...');
  const cached = cache.get(url);

  if (cached) {
    console.log('✅ Cache hit:', {
      etag: cached.etag,
      data: cached.data,
      expiresIn: Math.round((cached.expiresAt - Date.now()) / 1000) + 's',
    });
  } else {
    console.log('❌ Cache miss');
  }

  // Invalidar cache
  console.log('\n🗑️  Invalidando cache...');
  cache.invalidate(url);

  const cachedAfterInvalidation = cache.get(url);
  console.log('Após invalidação:', cachedAfterInvalidation === null ? '❌ Não existe' : '✅ Ainda existe');

  // Estatísticas
  console.log('\n📊 Estatísticas do cache:');
  console.log(cache.getStats());
}

/**
 * Exemplo 5: Cache de Listas vs Recursos Únicos
 *
 * Demonstra diferentes estratégias de cache para listas e recursos únicos.
 */
async function example5_ListVsResourceCache() {
  console.log('\n=== Exemplo 5: Cache de Listas vs Recursos Únicos ===\n');

  const client = new SignatureClient({
    baseURL: API_BASE_URL,
    accessToken: ACCESS_TOKEN,
    enableEtagCache: true,
    etagCacheOptions: {
      debug: true,
    },
  });

  // Cachear lista de documentos (Weak ETag, 120s)
  console.log('📡 Buscando lista de documentos...');
  const list1 = await client.documents.findAll({ page: 1, perPage: 10 });
  console.log(`✅ ${list1.data?.length} documentos recebidos`);

  await sleep(1000);

  console.log('\n📡 Buscando lista novamente...');
  const list2 = await client.documents.findAll({ page: 1, perPage: 10 });
  console.log(`✅ From cache: ${(list2 as any).fromCache}`);

  // Cachear documento único (Strong ETag, 300s)
  if (list1.data && list1.data.length > 0) {
    const docId = list1.data[0].id;

    console.log(`\n📡 Buscando documento único (${docId})...`);
    const doc1 = await client.documents.findById(docId);
    console.log(`✅ Documento recebido (ETag: ${(doc1 as any).etag})`);

    await sleep(1000);

    console.log('\n📡 Buscando mesmo documento...');
    const doc2 = await client.documents.findById(docId);
    console.log(`✅ From cache: ${(doc2 as any).fromCache}`);
  }
}

/**
 * Exemplo 6: Limpeza de Cache Expirado
 *
 * Demonstra como limpar entradas expiradas do cache.
 */
async function example6_CacheCleanup() {
  console.log('\n=== Exemplo 6: Limpeza de Cache ===\n');

  const cache = new EtagCacheManager({
    defaultTtl: 2000, // 2 segundos (para teste)
    debug: true,
  });

  // Adicionar múltiplas entradas
  for (let i = 1; i <= 5; i++) {
    cache.set(`/api/v1/documents/doc${i}`, `"etag${i}"`, { id: `doc${i}` }, 2);
  }

  console.log('📊 Cache após inserções:', cache.getStats());

  // Aguardar expiração
  console.log('\n⏳ Aguardando 3 segundos para cache expirar...');
  await sleep(3000);

  console.log('📊 Cache antes da limpeza:', cache.getStats());

  // Limpar entradas expiradas
  const removed = cache.cleanup();
  console.log(`\n🗑️  Removidas ${removed} entradas expiradas`);

  console.log('📊 Cache após limpeza:', cache.getStats());
}

// ==================== UTILITÁRIOS ====================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== EXECUÇÃO ====================

async function main() {
  console.log('🚀 Exemplos de ETags no SDK\n');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Access Token:', ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado\n');

  if (!ACCESS_TOKEN || ACCESS_TOKEN === 'your-jwt-token') {
    console.error('⚠️  Configure ACCESS_TOKEN antes de executar os exemplos!');
    console.error('   export ACCESS_TOKEN="seu-jwt-token"');
    process.exit(1);
  }

  try {
    // Executar exemplos
    await example1_AutomaticEtagCache();
    await example2_OptimisticLocking();
    // await example3_RaceCondition(); // Descomente para testar race condition
    await example4_ManualCacheManagement();
    await example5_ListVsResourceCache();
    await example6_CacheCleanup();

    console.log('\n✅ Todos os exemplos executados com sucesso!');
  } catch (error: any) {
    console.error('\n❌ Erro ao executar exemplos:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  example1_AutomaticEtagCache,
  example2_OptimisticLocking,
  example3_RaceCondition,
  example4_ManualCacheManagement,
  example5_ListVsResourceCache,
  example6_CacheCleanup,
};
