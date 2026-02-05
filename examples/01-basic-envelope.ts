/**
 * Exemplo 1: Fluxo Básico de Assinatura
 *
 * Este exemplo demonstra o fluxo básico de criação de um envelope,
 * upload de documento PDF, adição de signatários e ativação.
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 1: FLUXO BÁSICO ==========\n');

  // Inicializar cliente
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token-aqui',
  });

  try {
    // 1. Criar envelope
    console.log('1️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Prestação de Serviços',
      description: 'Cliente João da Silva',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    });
    console.log('✅ Envelope criado:', envelope.id);
    console.log('   Status:', envelope.status);

    // 2. Upload de documento PDF
    console.log('\n2️⃣ Fazendo upload de documento PDF...');

    // Tentar carregar PDF de teste (ajuste o caminho conforme necessário)
    const testPdfPath = path.join(__dirname, '../../tests/fixtures/sample-contract.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(testPdfPath)) {
      pdfBuffer = fs.readFileSync(testPdfPath);
      console.log('   Usando PDF de teste:', testPdfPath);
    } else {
      console.log('   ⚠️ PDF de teste não encontrado, criando PDF mínimo para exemplo');
      // Criar um PDF mínimo válido para exemplo (apenas para demonstração)
      pdfBuffer = Buffer.from('%PDF-1.4\n%Example PDF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000125 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF');
    }

    const document = await client.documents.create(envelope.id, {
      name: 'Contrato.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento enviado:', document.id);
    console.log('   Nome:', document.name);
    console.log('   Hash:', document.hash || 'N/A');

    // 3. Adicionar signatários
    console.log('\n3️⃣ Adicionando signatários...');

    const signer1 = await client.signers.create(envelope.id, {
      name: 'João da Silva',
      email: 'joao@example.com',
      documentNumber: '12345678900',
      phoneNumber: '+5585999999999',
      preferredChannel: 'email',
    });
    console.log('✅ Signatário 1:', signer1.name, '-', signer1.email);

    const signer2 = await client.signers.create(envelope.id, {
      name: 'Dr. Pedro Oliveira',
      email: 'pedro@adv.com',
      documentNumber: '98765432100',
      preferredChannel: 'whatsapp',
    });
    console.log('✅ Signatário 2:', signer2.name, '-', signer2.email);

    // 4. Criar signature fields
    console.log('\n4️⃣ Criando campos de assinatura...');

    const field1 = await client.signatureFields.create(document.id, {
      page: 1,
      x: 100,
      y: 650,
      width: 150,
      height: 50,
      type: 'signature',
      required: true,
      signerId: signer1.id,
    });
    console.log('✅ Campo criado para', signer1.name, '- Posição: (100, 650)');

    const field2 = await client.signatureFields.create(document.id, {
      page: 1,
      x: 350,
      y: 650,
      width: 150,
      height: 50,
      type: 'signature',
      required: true,
      signerId: signer2.id,
    });
    console.log('✅ Campo criado para', signer2.name, '- Posição: (350, 650)');

    // 5. Ativar envelope (envia notificações)
    console.log('\n5️⃣ Ativando envelope...');
    const activated = await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado!');
    console.log(`   📧 Notificações enviadas: ${activated.notificationsSent || 0}`);
    console.log('   Status:', activated.envelope.status);

    // 🆕 PROBLEMA 4: Demonstrar query parameters
    console.log('\n6️⃣ Consultando envelope com query parameters...');

    // Buscar envelope incluindo documentos
    console.log('   📄 Buscando com include=documents...');
    const envelopeWithDocs = await client.envelopes.findById(envelope.id, { include: 'documents' });
    console.log('   ✅ Documentos incluídos:', envelopeWithDocs.documents?.length || 0);

    // Buscar envelope incluindo signatários
    console.log('   👥 Buscando com include=signers...');
    const envelopeWithSigners = await client.envelopes.findById(envelope.id, { include: 'signers' });
    console.log('   ✅ Signatários incluídos:', envelopeWithSigners.signers?.length || 0);

    // Buscar envelope incluindo documentos E signatários
    console.log('   📋 Buscando com include=documents,signers...');
    const envelopeComplete = await client.envelopes.findById(envelope.id, { include: 'documents,signers' });
    console.log('   ✅ Envelope completo:');
    console.log('      - Documentos:', envelopeComplete.documents?.length || 0);
    console.log('      - Signatários:', envelopeComplete.signers?.length || 0);

    // Resumo final
    console.log('\n========== RESUMO ==========');
    console.log('✅ Envelope ID:', envelope.id);
    console.log('✅ Documento ID:', document.id);
    console.log('✅ Signatários:', 2);
    console.log('✅ Campos de assinatura:', 2);
    console.log('✅ Status:', activated.envelope.status);

    if (document.publicVerificationUrl) {
      console.log('🔗 Verificação pública:', document.publicVerificationUrl);
    }

    console.log('\n✨ Fluxo básico completo!');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    if (error.response?.data) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
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
