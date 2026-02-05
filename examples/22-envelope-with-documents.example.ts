/**
 * Exemplo 22: Recuperar Envelope com Documentos e URLs Assinadas
 *
 * Este exemplo demonstra como usar o parâmetro "include" para recuperar
 * um envelope com seus documentos, incluindo URLs assinadas temporárias
 * para download e preview.
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 22: ENVELOPE COM DOCUMENTOS ==========\n');

  // Inicializar cliente
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token-aqui',
  });

  try {
    // 1. Criar envelope
    console.log('1️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Serviços - Com Documentos',
      description: 'Exemplo de recuperação de documentos com URLs assinadas',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log('✅ Envelope criado:', envelope.id);

    // 2. Upload de múltiplos documentos
    console.log('\n2️⃣ Fazendo upload de documentos...');

    const testPdfPath = path.join(__dirname, '../../tests/fixtures/sample-contract.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(testPdfPath)) {
      pdfBuffer = fs.readFileSync(testPdfPath);
    } else {
      // Criar um PDF mínimo válido para exemplo
      pdfBuffer = Buffer.from('%PDF-1.4\n%Example PDF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000125 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF');
    }

    // Upload do primeiro documento
    const document1 = await client.documents.create(envelope.id, {
      name: 'Contrato-Principal.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento 1:', document1.name);

    // Upload do segundo documento
    const document2 = await client.documents.create(envelope.id, {
      name: 'Anexo-A.pdf',
      content: pdfBuffer.toString('base64'),
      contentType: 'application/pdf',
      fileSize: pdfBuffer.length,
    });
    console.log('✅ Documento 2:', document2.name);

    // 3. Recuperar envelope SEM documentos (padrão)
    console.log('\n3️⃣ Recuperando envelope sem incluir documentos/signatários...');
    const envelopeBasic = await client.envelopes.findById(envelope.id);
    console.log('✅ Envelope recuperado (básico):');
    console.log('   - ID:', envelopeBasic.id);
    console.log('   - Nome:', envelopeBasic.name);
    console.log('   - Contagem de documentos:', envelopeBasic.documentsCount);
    console.log('   - Contagem de signatários:', envelopeBasic.signersCount);
    console.log('   - Array de documentos:', envelopeBasic.documents ? 'Incluído' : 'Não incluído');
    console.log('   - Array de signatários:', envelopeBasic.signers ? 'Incluído' : 'Não incluído');

    // 4. Adicionar signatário para demonstração
    console.log('\n4️⃣ Adicionando signatário...');
    const signer = await client.signers.create(envelope.id, {
      name: 'Signatário Demo',
      email: 'demo@example.com',
      role: 'SIGNER',
    });
    console.log('✅ Signatário adicionado:', signer.name);

    // 5. Recuperar envelope COM documentos e signatários
    console.log('\n5️⃣ Recuperando envelope com documentos e signatários incluídos...');

    // ✅ Usando o método oficial do SDK v3.0
    const envelopeFull = await client.envelopes.findById(envelope.id, { 
      include: 'documents,signers' 
    });

    console.log('✅ Envelope recuperado (completo):');
    console.log('   - ID:', envelopeFull.id);
    console.log('   - Nome:', envelopeFull.name);
    console.log('   - Contagem de documentos:', envelopeFull.documentsCount);
    console.log('   - Array de documentos:', envelopeFull.documents ? `Incluído (${envelopeFull.documents.length} itens)` : 'Não incluído');
    console.log('   - Array de signatários:', envelopeFull.signers ? `Incluído (${envelopeFull.signers.length} itens)` : 'Não incluído');

    // 6. Verificar Acesso sob Demanda (Arquitetura Correta)
    if (envelopeFull.documents && envelopeFull.documents.length > 0) {
      console.log('\n6️⃣ Demonstrando acesso seguro aos documentos (On-Demand)...');

      // Vamos pegar o primeiro documento para demonstração
      const doc = envelopeFull.documents[0];
      
      console.log(`\n📄 Processando documento: ${doc.name} (ID: ${doc.id})`);
      console.log('   - Tamanho:', doc.fileSize, 'bytes');
      console.log('   - Páginas:', doc.pageCount);

      // Acesso correto via API (Download)
      try {
        console.log('   🔄 Solicitando URL de download segura...');
        const downloadUrl = await client.documents.getDownloadUrl(doc.id);
        console.log('   ✅ Download URL gerada:', downloadUrl.substring(0, 80) + '...');
        console.log('      (Válida por curto período, gerada sob demanda)');
      } catch (err: any) {
        console.log('   ❌ Falha ao obter download URL:', err.message);
      }

      // Acesso correto via API (Preview)
      try {
        console.log('   🔄 Solicitando preview da página 1...');
        const preview = await client.documents.preview(doc.id, { page: 1 });
        
        if (preview.success && preview.pdfUrl) {
          console.log('   ✅ Preview URL gerada:', preview.pdfUrl.substring(0, 80) + '...');
        } else {
          console.log('   ❌ Preview indisponível:', preview.error);
        }
      } catch (err: any) {
        console.log('   ❌ Falha ao obter preview:', err.message);
      }
    }

    // 7. Verificar dados dos signatários
    if (envelopeFull.signers && envelopeFull.signers.length > 0) {
      console.log('\n7️⃣ Analisando dados dos signatários...');
      envelopeFull.signers.forEach((s: any, index: number) => {
        console.log(`\n👤 Signatário ${index + 1}:`);
        console.log('   - ID:', s.id);
        console.log('   - Nome:', s.name);
        console.log('   - Email:', s.email);
        console.log('   - Status:', s.status);
      });
    }

    // Resumo final
    console.log('\n========== RESUMO ==========');
    console.log('✅ Envelope ID:', envelope.id);
    console.log('✅ Documentos recuperados:', envelopeFull.documents?.length || 0);
    console.log('✅ Signatários recuperados:', envelopeFull.signers?.length || 0);
    console.log('✅ Acesso sob demanda testado: Sim');

    console.log('\n💡 Nota Arquitetural: Para segurança e consistência, as URLs de acesso');
    console.log('   não são retornadas no objeto do documento. Utilize sempre os métodos');
    console.log('   client.documents.getDownloadUrl() e client.documents.preview().');

    console.log('\n✨ Exemplo completo!');

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
