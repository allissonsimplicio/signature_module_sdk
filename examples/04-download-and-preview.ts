import * as dotenv from 'dotenv';
import { SignatureClient } from '../src';

// Carrega variáveis de ambiente
dotenv.config();

async function demonstrateDownloadAndPreview() {
  const client = new SignatureClient({
    baseURL: process.env.API_BASE_URL!,
    apiToken: process.env.API_TOKEN!,
  });

  try {
    console.log('🔍 Demonstração: Download e Preview de Documentos\n');

    // Exemplo com IDs fictícios - substitua pelos IDs reais da sua API
    const envelopeId = 'envelope-123';
    const documentId = 'document-456';

    // 1. Download de documento assinado
    console.log('📥 Fazendo download de documento assinado...');
    try {
      const downloadUrl = await client.downloadSignedDocument(documentId);
      console.log(`✅ URL de download obtida: ${downloadUrl}\n`);
    } catch (error) {
      console.log(`❌ Erro no download: ${error instanceof Error ? error.message : error}\n`);
    }

    // 2. Preview de documento
    console.log('👁️ Obtendo preview do documento...');
    try {
      const preview = await client.getDocumentPreview(documentId, {
        width: 800,
        height: 600,
        page: 1,
        format: 'png'
      });
      console.log(`✅ Preview gerado:`);
      console.log(`   URL: ${preview.preview_url}`);
      console.log(`   Expira em: ${preview.expires_at}\n`);
    } catch (error) {
      console.log(`❌ Erro no preview: ${error instanceof Error ? error.message : error}\n`);
    }

    // 3. Geração de ZIP com todos os documentos
    console.log('📦 Gerando ZIP com todos os documentos do envelope...');
    try {
      const zipJob = await client.generateEnvelopeZip(envelopeId);
      console.log(`✅ Job de ZIP criado: ${zipJob.jobId}`);

      // Monitora o status da geração
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const status = await client.getZipStatus(zipJob.jobId);
        console.log(`📊 Status do ZIP: ${status.status}`);

        if (status.status === 'completed') {
          console.log(`✅ ZIP pronto para download!`);
          console.log(`   URL: ${status.download_url}`);
          console.log(`   Expira em: ${status.expires_at}`);
          
          // Faz o download do ZIP
          const zipDownloadUrl = await client.downloadEnvelopeZip(zipJob.jobId);
          console.log(`📥 URL final de download: ${zipDownloadUrl}\n`);
          break;
        } else if (status.status === 'failed') {
          console.log(`❌ Falha na geração do ZIP: ${status.error_message}\n`);
          break;
        } else {
          console.log(`⏳ Aguardando... (tentativa ${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
        }
        
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.log(`⏰ Timeout: ZIP não foi gerado dentro do tempo limite\n`);
      }
    } catch (error) {
      console.log(`❌ Erro na geração do ZIP: ${error instanceof Error ? error.message : error}\n`);
    }

    // 4. Cancelamento de envelope com motivo
    console.log('❌ Cancelando envelope com motivo...');
    try {
      const canceledEnvelope = await client.cancelEnvelope(
        envelopeId, 
        'Cancelado para demonstração do SDK',
        true // Notificar signatários
      );
      console.log(`✅ Envelope cancelado:`);
      console.log(`   ID: ${canceledEnvelope.id}`);
      console.log(`   Status: ${canceledEnvelope.status}`);
      console.log(`   Motivo: ${(canceledEnvelope as any).cancellation_reason}\n`);
    } catch (error) {
      console.log(`❌ Erro no cancelamento: ${error instanceof Error ? error.message : error}\n`);
    }

  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
  }
}

// Executa a demonstração se este arquivo for executado diretamente
if (require.main === module) {
  demonstrateDownloadAndPreview()
    .then(() => {
      console.log('✅ Demonstração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { demonstrateDownloadAndPreview };