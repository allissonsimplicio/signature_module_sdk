/**
 * Exemplo 6: Workflow de Assinatura Digital PAdES (FASE 3)
 *
 * Este exemplo demonstra o fluxo completo de assinatura digital com certificado
 * ICP-Brasil usando a estratégia HYBRID_SEALED (assinaturas visuais + selo final PAdES).
 *
 * Pré-requisitos:
 * - Certificado digital A1 (arquivo .p12/.pfx) válido
 * - Senha do certificado
 * - API configurada com chave de criptografia (ENCRYPTION_KEY)
 *
 * Estratégias disponíveis:
 * - VISUAL_ONLY: Apenas assinaturas visuais (padrão atual)
 * - PADES_EACH: PAdES em cada assinatura individual ✅ (incremental updates)
 * - PADES_FINAL: Múltiplas assinaturas visuais + PAdES único ao final ✅⭐
 * - HYBRID: Assinaturas visuais + PAdES seletivo por signatário ✅
 * - HYBRID_SEALED: Assinaturas visuais + selo organizacional automático ✅
 *
 * 🆕 MELHORIAS (Dez 2024):
 * - PADES_EACH agora usa incremental updates preservando assinaturas anteriores
 * - Suporte para múltiplas assinaturas PAdES no mesmo PDF
 * - Correções de bugs relacionados a versões de documentos
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 6: WORKFLOW PADES (HYBRID_SEALED) ==========\n');

  // Inicializar cliente
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token-aqui',
  });

  try {
    // ==================== PARTE 1: UPLOAD DE CERTIFICADO DIGITAL ====================
    console.log('📜 PARTE 1: Gerenciamento de Certificados Digitais\n');

    // 1.1 Estatísticas atuais
    console.log('1️⃣ Consultando estatísticas de certificados...');
    const statsBefore = await client.digitalSignatures.getCertificateStats();
    console.log('✅ Certificados atuais:');
    console.log(`   Total: ${statsBefore.total}`);
    console.log(`   Ativos: ${statsBefore.active}`);
    console.log(`   Expirados: ${statsBefore.expired}`);
    console.log(`   Revogados: ${statsBefore.revoked}`);
    console.log(`   ⚠️ Expiram em 30 dias: ${statsBefore.expiringWithin30Days}`);

    // 1.2 Upload de certificado (se não existir)
    console.log('\n2️⃣ Upload de certificado digital...');

    // Caminho para certificado de teste (ajuste conforme necessário)
    const certPath = process.env.CERTIFICATE_PATH || path.join(__dirname, '../../certificate.p12');
    const certPassword = process.env.CERTIFICATE_PASSWORD || 'senha123';

    let certificateId: string;

    if (fs.existsSync(certPath)) {
      console.log(`   📁 Carregando certificado: ${certPath}`);
      const certBuffer = fs.readFileSync(certPath);

      const uploadedCert = await client.digitalSignatures.uploadCertificate(
        certBuffer,
        certPassword,
        {
          passwordHint: 'Senha do certificado digital A1',
          certificateType: 'A1',
          storePassword: true, // 🔐 Armazena senha criptografada para automação
        },
      );

      certificateId = uploadedCert.id;
      console.log('✅ Certificado carregado com sucesso!');
      console.log(`   ID: ${uploadedCert.id}`);
      console.log(`   Titular: ${uploadedCert.commonName}`);
      console.log(`   CPF/CNPJ: ${uploadedCert.cpfCnpj || 'N/A'}`);
      console.log(`   Email: ${uploadedCert.emailAddress || 'N/A'}`);
      console.log(`   Emissor: ${uploadedCert.issuer}`);
      console.log(`   Válido até: ${uploadedCert.notAfter}`);
      console.log(`   Tipo: ${uploadedCert.certificateType}`);
      console.log(`   Nível: ${uploadedCert.certificateLevel}`);
    } else {
      console.log('   ⚠️ Arquivo de certificado não encontrado. Usando certificado existente...');

      // Listar certificados disponíveis
      const certificates = await client.digitalSignatures.listCertificates({
        includeExpired: false,
      });

      if (certificates.length === 0) {
        throw new Error('Nenhum certificado disponível. Por favor, faça upload de um certificado A1.');
      }

      const activeCert = certificates.find(c => c.isActive && !c.isRevoked);
      if (!activeCert) {
        throw new Error('Nenhum certificado ativo disponível.');
      }

      certificateId = activeCert.id;
      console.log('✅ Usando certificado existente:');
      console.log(`   ID: ${activeCert.id}`);
      console.log(`   Titular: ${activeCert.commonName}`);
      console.log(`   Válido até: ${activeCert.notAfter}`);
    }

    // ==================== PARTE 2: CONFIGURAÇÃO DA ORGANIZAÇÃO ====================
    console.log('\n\n🏢 PARTE 2: Configuração da Organização (HYBRID_SEALED)\n');

    console.log('3️⃣ Atualizando estratégia de assinatura para HYBRID_SEALED...');
    // Nota: A API /organization-settings pode variar conforme implementação
    // Este exemplo demonstra a configuração via SDK quando disponível
    console.log('   Estratégia: HYBRID_SEALED');
    console.log('   Certificado padrão:', certificateId);
    console.log('   Aplicação automática: Sim (usando senha armazenada)');
    console.log('   ℹ️ Configure manualmente via API se necessário:');
    console.log('      PATCH /organization-settings');
    console.log('      Body: {');
    console.log('        "signatureStrategy": "HYBRID_SEALED",');
    console.log(`        "defaultCertificateId": "${certificateId}",`);
    console.log('        "padesAutoApply": true,');
    console.log('        "requirePadesForAll": false');
    console.log('      }');

    // ==================== PARTE 3: CRIAÇÃO DE ENVELOPE COM PADES ====================
    console.log('\n\n📋 PARTE 3: Criação de Envelope e Documento\n');

    // 3.1 Criar envelope
    console.log('4️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato com Assinatura Digital ICP-Brasil',
      description: 'Contrato com validade jurídica - PAdES HYBRID_SEALED',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    });
    console.log('✅ Envelope criado:', envelope.id);

    // 3.2 Upload de documento PDF
    console.log('\n5️⃣ Fazendo upload de documento PDF...');
    const testPdfPath = path.join(__dirname, '../../tests/fixtures/sample-contract.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(testPdfPath)) {
      pdfBuffer = fs.readFileSync(testPdfPath);
      console.log('   Usando PDF de teste:', testPdfPath);
    } else {
      console.log('   ⚠️ PDF de teste não encontrado, criando PDF mínimo');
      pdfBuffer = Buffer.from('%PDF-1.4\n%Example PDF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000125 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF');
    }

    const document = await client.documents.create(envelope.id, {
      name: 'Contrato-ICP-Brasil.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento enviado:', document.id);

    // ==================== PARTE 4: SIGNATÁRIOS COM PADES ====================
    console.log('\n\n👥 PARTE 4: Configuração de Signatários\n');

    // 4.1 Signatário comum (assinatura visual apenas)
    console.log('6️⃣ Adicionando signatário comum (visual apenas)...');
    const signer1 = await client.signers.create(envelope.id, {
      name: 'João da Silva',
      email: 'joao@example.com',
      documentNumber: '12345678900',
      phoneNumber: '+5585999999999',
      preferredChannel: 'email',
      requirePades: false, // ❌ Apenas assinatura visual
    });
    console.log('✅ Signatário 1 (visual):', signer1.name);

    // 4.2 Signatário comum (assinatura visual)
    // Nota: Na estratégia HYBRID_SEALED, assinaturas individuais são visuais
    // O PAdES é aplicado apenas no seal final automático
    console.log('\n7️⃣ Adicionando segundo signatário...');
    const signer2 = await client.signers.create(envelope.id, {
      name: 'Maria Santos',
      email: 'maria@example.com',
      documentNumber: '98765432100',
      phoneNumber: '+5585988888888',
      preferredChannel: 'whatsapp',
      requirePades: false, // ❌ Apenas visual (HYBRID_SEALED aplica PAdES no final)
    });
    console.log('✅ Signatário 2 (visual):', signer2.name);
    console.log('   ℹ️ Seal PAdES será aplicado automaticamente ao final');

    // ==================== PARTE 5: CAMPOS DE ASSINATURA ====================
    console.log('\n\n✍️ PARTE 5: Campos de Assinatura\n');

    console.log('8️⃣ Criando campos de assinatura...');

    // Campo para signatário 1 (visual)
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
    console.log('✅ Campo criado para', signer1.name, '(visual apenas)');

    // Campo para signatário 2 (visual)
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
    console.log('✅ Campo criado para', signer2.name, '(visual apenas)');

    // ==================== PARTE 6: ATIVAÇÃO E ASSINATURAS ====================
    console.log('\n\n🚀 PARTE 6: Ativação e Workflow\n');

    console.log('9️⃣ Ativando envelope...');
    const activated = await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado!');
    console.log(`   📧 Notificações enviadas: ${activated.notificationsSent || 0}`);

    console.log('\n🔟 Workflow esperado (HYBRID_SEALED):');
    console.log('   1️⃣ João assina visualmente (stamp PNG)');
    console.log('   2️⃣ Maria assina visualmente (stamp PNG)');
    console.log('   3️⃣ Sistema aplica selo PAdES organizacional AUTOMÁTICO:');
    console.log(`      - Certificado: ${certificateId}`);
    console.log('      - Tipo: PAdES-B (baseline)');
    console.log('      - Motivo: "Final document seal - All signatures completed"');
    console.log('      - Senha: Recuperada de armazenamento criptografado');
    console.log('   4️⃣ Documento final: 2 stamps visuais + 1 selo PAdES organizacional');
    console.log('');
    console.log('   💡 Nota: Na estratégia HYBRID_SEALED, assinaturas individuais são visuais.');
    console.log('      O único PAdES aplicado é o seal final automático da organização.');

    // ==================== PARTE 7: DEMONSTRAÇÃO DE ASSINATURA MANUAL ====================
    console.log('\n\n🖊️ PARTE 7: Assinatura Manual com PAdES (Exemplo)\n');

    console.log('💡 Para assinar manualmente com PAdES (fora do workflow automático):');
    console.log('   await client.signatureFields.sign(fieldId, {');
    console.log('     // Dados do signatário');
    console.log('     signatureData: "data:image/png;base64,...",');
    console.log('     ipAddress: "192.168.1.100",');
    console.log('     geolocation: { latitude: -3.7319, longitude: -38.5267 },');
    console.log('');
    console.log('     // PAdES (opcional se requirePades=false)');
    console.log(`     digitalCertificateId: "${certificateId}",`);
    console.log('     certificatePassword: "senha123", // Ou omitir se storePassword=true');
    console.log('     padesReason: "Concordo com os termos do contrato",');
    console.log('     padesLocation: "Fortaleza, CE, Brasil",');
    console.log('     padesContactInfo: "maria@example.com",');
    console.log('   });');

    // ==================== PARTE 8: VERIFICAÇÃO E ESTATÍSTICAS ====================
    console.log('\n\n📊 PARTE 8: Verificação e Estatísticas\n');

    console.log('1️⃣1️⃣ Estatísticas atualizadas de certificados...');
    const statsAfter = await client.digitalSignatures.getCertificateStats();
    console.log('✅ Estatísticas:');
    console.log(`   Total: ${statsAfter.total}`);
    console.log(`   Ativos: ${statsAfter.active}`);

    // Obter detalhes do certificado usado
    console.log('\n1️⃣2️⃣ Detalhes do certificado usado...');
    const certDetails = await client.digitalSignatures.getCertificate(certificateId);
    console.log('✅ Certificado:');
    console.log(`   Titular: ${certDetails.commonName}`);
    console.log(`   Usado ${certDetails.usageCount} vez(es)`);
    console.log(`   Última utilização: ${certDetails.lastUsedAt || 'Nunca'}`);
    console.log(`   Status: ${certDetails.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    console.log(`   Expirado: ${certDetails.isExpired ? '⚠️ Sim' : '✅ Não'}`);

    // ==================== RESUMO FINAL ====================
    console.log('\n========== RESUMO FINAL ==========');
    console.log('✅ Certificado ID:', certificateId);
    console.log('✅ Envelope ID:', envelope.id);
    console.log('✅ Documento ID:', document.id);
    console.log('✅ Signatários:', 2);
    console.log('   - João (visual)');
    console.log('   - Maria (visual)');
    console.log('✅ Selo organizacional: Automático (HYBRID_SEALED)');
    console.log('✅ Total de assinaturas PAdES no documento final: 1');
    console.log('   - 1 organizacional (automático - cobre todo o documento)');

    if (document.publicVerificationUrl) {
      console.log('\n🔗 Verificação pública:', document.publicVerificationUrl);
    }

    console.log('\n========== BENEFÍCIOS DA ESTRATÉGIA HYBRID_SEALED ==========');
    console.log('📜 Validade jurídica: ICP-Brasil (MP 2.200-2/2001)');
    console.log('🔒 Integridade garantida: Assinatura criptográfica PAdES-B');
    console.log('👁️ UX amigável: Stamps visuais para usuários comuns');
    console.log('⚙️ Automação: Selo final aplicado sem intervenção manual');
    console.log('🏢 Autenticidade organizacional: Certificado da empresa valida o documento');
    console.log('💼 Compliance: Atende requisitos legais brasileiros');

    console.log('\n✨ Workflow PAdES HYBRID_SEALED completo!\n');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    if (error.response?.data) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.statusCode === 400 && error.message.includes('Certificate')) {
      console.error('\n💡 Dica: Certifique-se de que:');
      console.error('   1. O arquivo .p12/.pfx existe no caminho especificado');
      console.error('   2. A senha do certificado está correta');
      console.error('   3. O certificado não está expirado');
      console.error('   4. A API possui ENCRYPTION_KEY configurada');
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
