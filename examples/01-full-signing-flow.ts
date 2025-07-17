import * as dotenv from 'dotenv';
import * as path from 'path';
import { SignatureClient, ApiError } from '../src';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Exemplo completo do fluxo de assinatura digital
 * 
 * Este exemplo demonstra:
 * 1. Criação de envelope
 * 2. Adição de documento via upload
 * 3. Adição de signatário
 * 4. Configuração de requisitos de autenticação
 * 5. Configuração de requisitos de qualificação
 * 6. Ativação do envelope
 * 7. Notificação dos signatários
 * 8. Consulta de eventos
 */
async function fullSigningFlow() {
  try {
    console.log('🚀 Iniciando exemplo de fluxo completo de assinatura...\n');

    // Configuração do cliente
    const client = new SignatureClient({
      baseURL: process.env.API_BASE_URL || 'https://api.assinatura-digital.com/v1',
      apiToken: process.env.API_TOKEN || '',
    });

    // Teste de conectividade
    console.log('📡 Testando conectividade com a API...');
    const healthCheck = await client.healthCheck();
    console.log(`✅ API Status: ${healthCheck.status} (${healthCheck.timestamp})\n`);

    // 1. Criar envelope
    console.log('📋 Criando envelope...');
    const envelope = await client.createEnvelope({
      name: 'Contrato de Prestação de Serviços - Exemplo',
      description: 'Contrato para prestação de serviços de desenvolvimento de software',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      auto_close: true,
      notification_settings: {
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        reminder_enabled: true,
        reminder_interval_hours: 24,
        custom_message: 'Por favor, assine o contrato de prestação de serviços.',
      },
      block_on_refusal: false,
      custom_fields: {
        projeto: 'Sistema de Gestão',
        valor_contrato: 'R$ 50.000,00',
      },
    });

    console.log(`✅ Envelope criado com sucesso!`);
    console.log(`   ID: ${envelope.id}`);
    console.log(`   Status: ${envelope.status}`);
    console.log(`   Pode ser ativado: ${envelope.can_be_activated}\n`);

    // 2. Adicionar documento via upload
    console.log('📄 Adicionando documento ao envelope...');
    const documentPath = process.env.EXAMPLE_DOCUMENT_PATH || './test-files/contrato.pdf';
    
    // Verifica se o arquivo existe, senão cria um arquivo de exemplo
    const fs = require('fs');
    if (!fs.existsSync(documentPath)) {
      console.log('⚠️  Arquivo de exemplo não encontrado. Criando arquivo de teste...');
      const testDir = path.dirname(documentPath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // Cria um PDF simples de exemplo (base64)
      const simplePdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihDb250cmF0byBkZSBFeGVtcGxvKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzIyIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE0CiUlRU9G';
      fs.writeFileSync(documentPath, Buffer.from(simplePdfBase64, 'base64'));
      console.log(`✅ Arquivo de teste criado: ${documentPath}`);
    }

    const document = await client.addDocumentByUpload(
      envelope.id,
      documentPath,
      'Contrato de Prestação de Serviços.pdf'
    );

    console.log(`✅ Documento adicionado com sucesso!`);
    console.log(`   ID: ${document.id}`);
    console.log(`   Nome: ${document.name}`);
    console.log(`   Tamanho: ${document.file_size} bytes`);
    console.log(`   Páginas: ${document.page_count}\n`);

    // 3. Adicionar signatário
    console.log('👤 Adicionando signatário...');
    const signer = await client.addSigner(envelope.id, {
      name: process.env.EXAMPLE_SIGNER_NAME || 'João da Silva',
      email: process.env.EXAMPLE_SIGNER_EMAIL || 'joao@exemplo.com',
      phone_number: process.env.EXAMPLE_SIGNER_PHONE || '+5511999999999',
      document_number: '12345678901',
      document_type: 'cpf',
      signature_order: 1,
      notification_preferences: {
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        language: 'pt-BR',
      },
      custom_fields: {
        cargo: 'Desenvolvedor Senior',
        empresa: 'Tech Solutions Ltda',
      },
    });

    console.log(`✅ Signatário adicionado com sucesso!`);
    console.log(`   ID: ${signer.id}`);
    console.log(`   Nome: ${signer.name}`);
    console.log(`   Email: ${signer.email}`);
    console.log(`   Status: ${signer.status}\n`);

    // 4. Adicionar requisitos de autenticação
    console.log('🔐 Configurando requisitos de autenticação...');
    
    // Token via email
    await client.addAuthenticationRequirement(signer.id, {
      method: 'email_token',
      is_required: true,
      configuration: {
        token_length: 6,
        token_expiry_minutes: 15,
        max_attempts: 3,
      },
      description: 'Código de verificação enviado por email',
    });

    // Token via WhatsApp
    await client.addAuthenticationRequirement(signer.id, {
      method: 'whatsapp_token',
      is_required: false,
      configuration: {
        token_length: 6,
        token_expiry_minutes: 15,
        max_attempts: 3,
      },
      description: 'Código de verificação enviado via WhatsApp',
    });

    // Geolocalização
    await client.addAuthenticationRequirement(signer.id, {
      method: 'geolocation',
      is_required: false,
      configuration: {
        required_accuracy_meters: 100,
      },
      description: 'Localização geográfica no momento da assinatura',
    });

    console.log(`✅ Requisitos de autenticação configurados!\n`);

    // 5. Adicionar requisitos de qualificação
    console.log('📝 Configurando requisitos de qualificação...');
    await client.addQualificationRequirement(document.id, signer.id, {
      qualification_type: 'parte',
      description: 'Signatário como parte contratante',
    });

    console.log(`✅ Requisitos de qualificação configurados!\n`);

    // 6. Verificar se o envelope pode ser ativado
    console.log('🔍 Verificando status do envelope...');
    const updatedEnvelope = await client.getEnvelope(envelope.id);
    
    console.log(`   Status: ${updatedEnvelope.status}`);
    console.log(`   Pode ser ativado: ${updatedEnvelope.can_be_activated}`);
    console.log(`   Requisitos de ativação:`);
    updatedEnvelope.activation_requirements.forEach((req, index) => {
      console.log(`     ${index + 1}. ${req.description} - ${req.is_satisfied ? '✅' : '❌'}`);
    });

    if (updatedEnvelope.can_be_activated) {
      // 7. Ativar envelope
      console.log('\n🚀 Ativando envelope...');
      const activatedEnvelope = await client.activateEnvelope(envelope.id);
      
      console.log(`✅ Envelope ativado com sucesso!`);
      console.log(`   Status: ${activatedEnvelope.status}`);
      console.log(`   Ativo: ${activatedEnvelope.is_active}\n`);

      // 8. Notificar signatários
      console.log('📧 Enviando notificações...');
      await client.notifyAllSignersInEnvelope(envelope.id);
      console.log(`✅ Notificações enviadas para todos os signatários!\n`);

      // Aguarda um pouco para gerar alguns eventos
      console.log('⏳ Aguardando geração de eventos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('\n⚠️  Envelope não pode ser ativado. Verifique os requisitos acima.\n');
    }

    // 9. Consultar eventos do envelope
    console.log('📊 Consultando eventos do envelope...');
    const events = await client.getEnvelopeEvents(envelope.id, {
      sort_by: 'occurred_at',
      sort_order: 'desc',
      per_page: 10,
    });

    console.log(`✅ Encontrados ${events.length} eventos:`);
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. [${event.severity.toUpperCase()}] ${event.title}`);
      console.log(`      ${event.description}`);
      console.log(`      Ocorrido em: ${new Date(event.occurred_at).toLocaleString('pt-BR')}`);
      if (Object.keys(event.data).length > 0) {
        console.log(`      Dados: ${JSON.stringify(event.data, null, 2)}`);
      }
      console.log('');
    });

    // 10. Informações finais
    console.log('📋 Resumo do envelope:');
    console.log(`   ID: ${updatedEnvelope.id}`);
    console.log(`   Nome: ${updatedEnvelope.name}`);
    console.log(`   Status: ${updatedEnvelope.status}`);
    console.log(`   Documentos: ${updatedEnvelope.documents_count}`);
    console.log(`   Signatários: ${updatedEnvelope.signers_count}`);
    console.log(`   Assinados: ${updatedEnvelope.signed_count}`);
    console.log(`   Pendentes: ${updatedEnvelope.pending_count}`);
    console.log(`   Progresso: ${updatedEnvelope.completion_percentage}%`);
    
    if (updatedEnvelope.deadline) {
      console.log(`   Prazo: ${new Date(updatedEnvelope.deadline).toLocaleString('pt-BR')}`);
    }

    console.log('\n🎉 Exemplo concluído com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. O signatário receberá um email/WhatsApp com o link para assinatura');
    console.log('   2. Ele precisará se autenticar usando os métodos configurados');
    console.log('   3. Após a autenticação, poderá assinar o documento');
    console.log('   4. Você pode monitorar o progresso através dos eventos da API');

  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error);
    
    if (error instanceof ApiError) {
      console.error(`   Status: ${error.status}`);
      console.error(`   Mensagem: ${error.message}`);
      if (error.errors && error.errors.length > 0) {
        console.error(`   Erros de validação:`);
        error.errors.forEach(err => console.error(`     - ${err}`));
      }
    }
    
    process.exit(1);
  }
}

// Executa o exemplo se este arquivo for executado diretamente
if (require.main === module) {
  fullSigningFlow();
}