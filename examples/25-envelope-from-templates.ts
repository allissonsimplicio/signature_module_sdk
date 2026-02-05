import { SignatureClient } from '../src';

/**
 * Exemplo 25: Criar Envelope Completo a partir de Templates (Orquestração)
 *
 * Este exemplo demonstra como criar um envelope completo com múltiplos documentos
 * gerados a partir de templates DOCX em uma única chamada de API.
 *
 * Cenário: Um escritório de advocacia usa o CRM para criar automaticamente
 * todos os documentos necessários para um processo de divórcio.
 *
 * Features demonstradas:
 * - Criação de envelope com múltiplos templates
 * - Matching automático de roles (CLIENTE → João, ADVOGADO → Dra. Maria)
 * - Variáveis globais vs locais (precedência)
 * - Processamento assíncrono com tracking de progresso
 * - Ativação e notificação automáticas
 */

async function main() {
  // Configurar cliente
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000/api/v1',
    accessToken: process.env.API_TOKEN!,
  });

  console.log('🚀 Criando envelope a partir de templates...\n');

  try {
    // ========== ETAPA 1: Iniciar criação de envelope ==========
    const job = await client.envelopes.createFromTemplates({
      name: 'Processo #1234 - Divórcio Consensual',
      description: 'Documentos para processo de divórcio - Cliente: João da Silva',
      status: 'running', // Criar já em RUNNING
      autoActivate: true, // Ativar automaticamente
      notifySigners: true, // Enviar notificações

      // Signatários com roles customizados
      signers: [
        {
          role: 'CLIENTE',
          name: 'João da Silva Santos',
          email: 'joao.silva@email.com',
          documentNumber: '12345678900',
          phone: '85999887766',
          customFields: {
            profissao: 'Engenheiro Civil',
            estado_civil: 'Casado',
            rg: '1234567',
          },
          address: {
            full: 'Rua das Flores, 123, Centro, Russas/CE',
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'Russas',
            state: 'CE',
            zipCode: '62900000',
          },
        },
        {
          role: 'ADVOGADO',
          name: 'Dra. Maria Oliveira',
          email: 'maria@escritorio.adv.br',
          customFields: {
            oab_numero: '12345/CE',
            especializacao: 'Direito de Família',
          },
        },
      ],

      // Documentos a gerar (cada um de um template diferente)
      documents: [
        {
          templateId: 'tpl_procuracao_v1',
          name: 'Procuração Ad Judicia - João Silva.pdf',
          variables: {
            CIDADE: 'Russas',
            COMARCA: 'Russas - CE',
            TIPO_ACAO: 'Divórcio Consensual',
          },
        },
        {
          templateId: 'tpl_contrato_honorarios_v2',
          name: 'Contrato de Honorários.pdf',
          variables: {
            VALOR_HONORARIOS: '5000.00',
            PARCELAS: '5',
            VALOR_PARCELA: '1000.00',
          },
        },
      ],

      // Variáveis globais (usadas em todos os documentos, podem ser sobrescritas)
      globalVariables: {
        DATA: new Date().toLocaleDateString('pt-BR'),
        EMPRESA: 'Escritório Oliveira & Associados',
      },

      // Configurações adicionais
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      callbackUrl: 'https://crm.example.com/webhooks/signature-events',
    });

    console.log('✅ Job criado com sucesso!');
    console.log(`   Job ID: ${job.jobId}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Tempo estimado: ~${job.estimatedCompletionTimeSeconds}s\n`);

    // ========== ETAPA 2: Acompanhar progresso (Polling) ==========
    console.log('⏳ Acompanhando progresso...\n');

    let status = await client.envelopes.getJobStatus(job.jobId);
    let attempts = 0;
    const maxAttempts = 60; // Máximo 3 minutos (60 * 3s)

    while (
      (status.status === 'pending' || status.status === 'processing') &&
      attempts < maxAttempts
    ) {
      // Aguardar 3 segundos antes de consultar novamente
      await new Promise((resolve) => setTimeout(resolve, 3000));

      status = await client.envelopes.getJobStatus(job.jobId);
      attempts++;

      const progress = status.progressPercentage || 0;
      const currentStep = status.currentStep || 'Processing...';

      console.log(`   ${progress}% - ${currentStep}`);
    }

    console.log('');

    // ========== ETAPA 3: Verificar resultado ==========
    if (status.status === 'completed' && status.result) {
      console.log('🎉 Envelope criado com sucesso!\n');

      const result = status.result;

      console.log('📧 ENVELOPE:');
      console.log(`   ID: ${result.envelope.id}`);
      console.log(`   Nome: ${result.envelope.name}`);
      console.log(`   Status: ${result.envelope.status}`);
      console.log(`   Documentos: ${result.envelope.documentsCount}`);
      console.log(`   Signatários: ${result.envelope.signersCount}`);
      console.log('');

      console.log('📄 DOCUMENTOS GERADOS:');
      result.documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.name}`);
        console.log(`      Template: ${doc.templateName}`);
        console.log(`      Páginas: ${doc.pageCount}`);
        console.log(`      Tamanho: ${(doc.fileSize / 1024).toFixed(2)} KB`);
      });
      console.log('');

      console.log('👥 SIGNATÁRIOS:');
      result.signers.forEach((signer, index) => {
        console.log(`   ${index + 1}. ${signer.name} (${signer.role})`);
        console.log(`      Email: ${signer.email}`);
        console.log(`      Status: ${signer.status}`);
      });
      console.log('');

      console.log('✍️  CAMPOS DE ASSINATURA:');
      console.log(`   Total: ${result.signatureFields.length}`);
      result.signatureFields.forEach((field, index) => {
        const doc = result.documents.find((d) => d.id === field.documentId);
        const signer = result.signers.find((s) => s.id === field.signerId);
        console.log(
          `   ${index + 1}. ${doc?.name} → ${signer?.name} (Pág ${field.page}, X:${field.x}, Y:${field.y})`
        );
      });
      console.log('');

      if (result.notificationsSent) {
        console.log(`📨 Notificações enviadas: ${result.notificationsSent}`);
      }

      if (result.warnings && result.warnings.length > 0) {
        console.log('\n⚠️  AVISOS:');
        result.warnings.forEach((warning) => {
          console.log(`   - ${warning}`);
        });
      }

      console.log('\n✅ Processo concluído com sucesso!');
    } else if (status.status === 'failed') {
      console.error('❌ Falha ao criar envelope!\n');
      console.error(`   Código: ${status.errorCode}`);
      console.error(`   Mensagem: ${status.errorMessage}`);

      if (status.errors && status.errors.length > 0) {
        console.error('\n   Erros detalhados:');
        status.errors.forEach((error) => {
          console.error(`   - ${error}`);
        });
      }
    } else {
      console.error('⏰ Timeout: Job não concluído no tempo esperado');
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar envelope:', error.message);

    if (error.response?.data) {
      console.error('\nDetalhes do erro:', error.response.data);
    }
  }
}

// Executar exemplo
main().catch(console.error);
