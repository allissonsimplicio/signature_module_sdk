/**
 * Exemplo 23: Signing Session - Contexto Agregado de Assinatura
 *
 * Este exemplo demonstra o uso do endpoint GET /api/v1/signing-session que
 * retorna todo o contexto necessário para o signatário completar sua assinatura.
 *
 * **RECURSOS DEMONSTRADOS:**
 * - Obter contexto completo da sessão de assinatura
 * - Descobrir documentos disponíveis para assinatura
 * - Ver progresso da assinatura (campos pendentes/assinados)
 * - Validar status de autenticação (step-up)
 * - Eliminar necessidade de múltiplas chamadas ou proxies
 *
 * **BENEFÍCIOS:**
 * - ✅ Endpoint agregado elimina proxy no CRM
 * - ✅ Padrão de mercado (DocuSign, Adobe Sign)
 * - ✅ UX melhorada (mostra progresso)
 * - ✅ Validação de acesso e step-up
 * - ✅ Performance otimizada (1 chamada vs múltiplas)
 *
 * **CASOS DE USO:**
 * - Frontend público do signatário
 * - Mobile apps de assinatura
 * - Integrações de terceiros
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 23: SIGNING SESSION ==========\n');

  // Inicializar cliente com credenciais de usuário da API
  const adminClient = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token-aqui',
  });

  try {
    // ===========================
    // SETUP: Criar envelope completo
    // ===========================
    console.log('========== SETUP: CRIANDO ENVELOPE COMPLETO ==========\n');

    console.log('1️⃣ Criando envelope...');
    const envelope = await adminClient.envelopes.create({
      name: 'Contrato de Serviços - Signing Session Demo',
      description: 'Demonstração do endpoint signing-session',
    });
    console.log('✅ Envelope criado:', envelope.id);

    console.log('\n2️⃣ Adicionando signatário...');
    const signer = await adminClient.signers.create(envelope.id, {
      name: 'João Silva',
      email: 'joao@example.com',
      phoneNumber: '+5585987654321',
    });
    console.log('✅ Signatário criado:', signer.id);

    console.log('\n3️⃣ Fazendo upload de documentos...');

    const testPdfPath = path.join(__dirname, '../../tests/fixtures/sample-contract.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(testPdfPath)) {
      pdfBuffer = fs.readFileSync(testPdfPath);
    } else {
      // Criar um PDF mínimo válido para exemplo
      pdfBuffer = Buffer.from('%PDF-1.4\n%Example PDF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000125 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF');
    }

    // Upload de múltiplos documentos
    const doc1 = await adminClient.documents.create(envelope.id, {
      name: 'Contrato-Principal.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento 1:', doc1.name);

    const doc2 = await adminClient.documents.create(envelope.id, {
      name: 'Anexo-A.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento 2:', doc2.name);

    console.log('\n4️⃣ Adicionando campos de assinatura...');

    // Adicionar stamp group no primeiro documento
    const [stamp1] = await adminClient.signatureFields.createStampGroup(doc1.id, {
      signerId: signer.id,
      page: 1,
      x: 100,
      y: 650,
      size: 'M',
    });
    console.log('✅ Stamp group criado no doc 1');

    // Adicionar campos individuais no segundo documento
    await adminClient.signatureFields.create(doc2.id, {
      signerId: signer.id,
      page: 1,
      x: 100,
      y: 700,
      width: 200,
      height: 80,
      type: 'signature',
      required: true,
    });
    console.log('✅ Campo de assinatura criado no doc 2');

    await adminClient.signatureFields.create(doc2.id, {
      signerId: signer.id,
      page: 1,
      x: 100,
      y: 600,
      width: 150,
      height: 30,
      type: 'date',
      required: true,
    });
    console.log('✅ Campo de data criado no doc 2');

    console.log('\n5️⃣ Ativando envelope...');
    await adminClient.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado');

    // ===========================
    // FLUXO: Obter JWT do Signatário
    // ===========================
    console.log('\n========== FLUXO: OBTER JWT DO SIGNATÁRIO ==========\n');

    console.log('6️⃣ Gerando URL de assinatura com JWT...');
    const { url, accessToken, expiresAt } = await adminClient.signers.getSigningUrl(signer.id);

    console.log('✅ URL de assinatura gerada:');
    console.log('   URL:', url);
    console.log('   Access Token (primeiros 50 chars):', accessToken.substring(0, 50) + '...');
    console.log('   Expira em:', expiresAt);

    // ===========================
    // FLUXO: Signing Session (JWT do Signatário)
    // ===========================
    console.log('\n========== FLUXO: SIGNING SESSION (NOVO ENDPOINT) ==========\n');

    console.log('7️⃣ Criando client com JWT do signatário...');
    const signerClient = new SignatureClient({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      accessToken: accessToken, // ← JWT do signatário
    });
    console.log('✅ Client criado com token do signatário');

    console.log('\n8️⃣ Obtendo contexto da sessão de assinatura...');
    console.log('   🔄 Chamando GET /api/v1/signing-session...\n');

    const session = await signerClient.signers.getSigningSession();

    console.log('✅ Sessão de assinatura recuperada com sucesso!\n');

    // ===========================
    // ANALISANDO O CONTEXTO DA SESSÃO
    // ===========================
    console.log('========== CONTEXTO DA SESSÃO ==========\n');

    console.log('📋 ENVELOPE:');
    console.log('   ID:', session.envelope.id);
    console.log('   Nome:', session.envelope.name);
    console.log('   Status:', session.envelope.status);
    console.log('   Descrição:', session.envelope.description || 'N/A');
    console.log('   Deadline:', session.envelope.deadline || 'N/A');

    console.log('\n👤 SIGNATÁRIO:');
    console.log('   ID:', session.signer.id);
    console.log('   Nome:', session.signer.name);
    console.log('   Email:', session.signer.email);
    console.log('   Telefone:', session.signer.phoneNumber || 'N/A');
    console.log('   Ordem:', session.signer.signingOrder || 'N/A');
    console.log('   Status:', session.signer.status);

    console.log('\n📄 DOCUMENTOS (' + session.documents.length + ' total):');
    session.documents.forEach((doc, index) => {
      console.log(`\n   Documento ${index + 1}:`);
      console.log('   - Nome:', doc.name);
      console.log('   - ID:', doc.id);
      console.log('   - Páginas:', doc.pageCount);
      console.log('   - Tamanho:', (doc.fileSize / 1024).toFixed(2), 'KB');
      console.log('   - Tipo:', doc.contentType);
      console.log('   - Campos totais:', doc.fieldsCount);
      console.log('   - Campos pendentes:', doc.pendingFieldsCount);
      console.log('   - Campos assinados:', doc.signedFieldsCount);

      const percentage = doc.fieldsCount > 0
        ? Math.round((doc.signedFieldsCount / doc.fieldsCount) * 100)
        : 0;
      console.log('   - Progresso:', percentage + '%');
    });

    console.log('\n🔐 AUTENTICAÇÃO:');
    console.log('   Step-up necessário:', session.authRequirements.stepUpRequired);
    console.log('   Step-up satisfeito:', session.authRequirements.stepUpSatisfied);
    console.log('   Requisitos (' + session.authRequirements.requirements.length + ' total):');
    session.authRequirements.requirements.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.method} - ${req.status}${req.required ? ' (obrigatório)' : ''}`);
    });

    console.log('\n📊 PROGRESSO GERAL:');
    console.log('   Total de campos:', session.progress.totalFields);
    console.log('   Campos assinados:', session.progress.signedFields);
    console.log('   Campos pendentes:', session.progress.pendingFields);
    console.log('   Percentual completo:', session.progress.percentComplete + '%');

    // ===========================
    // DEMONSTRANDO USO PRÁTICO
    // ===========================
    console.log('\n========== USO PRÁTICO ==========\n');

    console.log('9️⃣ Iterando sobre documentos para preview e campos...\n');

    for (const doc of session.documents) {
      console.log(`📄 Processando: ${doc.name}`);

      // Preview do documento
      try {
        const preview = await signerClient.documents.preview(doc.id, { page: 1 });
        if (preview.success && preview.pdfUrl) {
          console.log('   ✅ Preview URL:', preview.pdfUrl.substring(0, 60) + '...');
        }
      } catch (err: any) {
        console.log('   ⚠️ Preview não disponível:', err.message);
      }

      // Metadata de páginas
      try {
        const pages = await signerClient.documents.getPagesMetadata(doc.id);
        console.log('   ✅ Metadata de páginas:', pages.totalPages, 'páginas');
      } catch (err: any) {
        console.log('   ⚠️ Metadata não disponível:', err.message);
      }

      // Campos de assinatura
      try {
        const fields = await signerClient.signatureFields.findByDocument(doc.id);
        console.log('   ✅ Campos recuperados:', fields.length);
        console.log('   - Tipos:', [...new Set(fields.map(f => f.type))].join(', '));
      } catch (err: any) {
        console.log('   ⚠️ Campos não disponíveis:', err.message);
      }

      console.log('');
    }

    // ===========================
    // COMPARAÇÃO: ANTES vs DEPOIS
    // ===========================
    console.log('========== COMPARAÇÃO: ANTES vs DEPOIS ==========\n');

    console.log('❌ ANTES (Workaround - Múltiplas Chamadas):');
    console.log('   1. Client admin busca envelope');
    console.log('   2. Client admin busca documentos do envelope');
    console.log('   3. Para cada documento:');
    console.log('      - Busca campos do signatário');
    console.log('      - Calcula contagens manualmente');
    console.log('   4. Client admin passa IDs para frontend público');
    console.log('   5. Frontend usa JWT do signatário para preview/campos');
    console.log('   ⚠️ Múltiplas chamadas, complexo, propenso a erros\n');

    console.log('✅ DEPOIS (Signing Session - 1 Chamada):');
    console.log('   1. Frontend obtém JWT do signatário (via URL)');
    console.log('   2. Chama GET /api/v1/signing-session com JWT');
    console.log('   3. Recebe tudo: envelope, signer, documentos, campos, progresso');
    console.log('   4. Usa documentos para preview/campos individuais');
    console.log('   ✅ Simples, performático, menos propenso a erros\n');

    // ===========================
    // RESUMO E BOAS PRÁTICAS
    // ===========================
    console.log('========== RESUMO E BOAS PRÁTICAS ==========\n');

    console.log('📋 Fluxo completo:');
    console.log('   1. Admin cria envelope e obtém URL de assinatura (getSigningUrl)');
    console.log('   2. Signatário recebe email/SMS com URL');
    console.log('   3. Frontend público extrai accessToken da URL');
    console.log('   4. Cria client com accessToken do signatário');
    console.log('   5. Chama getSigningSession() para obter contexto');
    console.log('   6. Exibe documentos e permite preview/assinatura');

    console.log('\n✅ Benefícios do endpoint agregado:');
    console.log('   ✓ Elimina proxy no CRM');
    console.log('   ✓ Reduz latência (1 chamada vs múltiplas)');
    console.log('   ✓ Mostra progresso em tempo real');
    console.log('   ✓ Valida step-up automaticamente');
    console.log('   ✓ Padrão de mercado (DocuSign, Adobe Sign)');
    console.log('   ✓ Facilita UX (contexto completo)');

    console.log('\n⚠️ Requisitos importantes:');
    console.log('   ✓ Envelope deve estar RUNNING');
    console.log('   ✓ Step-up obrigatório deve estar satisfeito');
    console.log('   ✓ JWT do signatário deve ser válido');
    console.log('   ✓ Retorna apenas documentos com campos do signatário');

    console.log('\n🎯 Casos de erro comuns:');
    console.log('   401 - Token JWT inválido ou expirado → reabrir link');
    console.log('   403 - Envelope DRAFT/COMPLETED/CANCELED → não disponível');
    console.log('   403 - Step-up pendente → solicitar verificação');
    console.log('   404 - Signatário/envelope não encontrado → link inválido');

    console.log('\n✨ Exemplo completo executado com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Implementar frontend com getSigningSession()');
    console.log('   2. Remover proxies legados do CRM');
    console.log('   3. Adicionar tratamento de erro para 403 (step-up)');
    console.log('   4. Implementar auto-refresh de token');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    if (error.response?.data) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('   Status HTTP:', error.response.status);

      // Dicas baseadas no status
      if (error.response.status === 403) {
        console.error('\n💡 Dica: Erro 403 pode significar:');
        console.error('   - Envelope não está RUNNING (ainda DRAFT ou já COMPLETED)');
        console.error('   - Step-up obrigatório não foi satisfeito');
        console.error('   - Verificar status do envelope e auth requirements');
      } else if (error.response.status === 401) {
        console.error('\n💡 Dica: Erro 401 pode significar:');
        console.error('   - Token JWT expirado (validade padrão: 15 minutos)');
        console.error('   - Token inválido ou revogado');
        console.error('   - Usar refreshSignerToken() para renovar');
      }
    }
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main().catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export { main };
