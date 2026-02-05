/**
 * Exemplo 4: Notification Workflow
 *
 * Este exemplo demonstra:
 * - Criação de templates de notificação
 * - Preview de templates com variáveis
 * - Consulta de histórico de notificações
 * - Análise de falhas e retry
 */

import { SignatureClient } from '../src';

async function main() {
  console.log('========== EXEMPLO 4: NOTIFICATION WORKFLOW ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    console.log('========== FASE 1: CRIAR TEMPLATES DE NOTIFICAÇÃO ==========\n');

    // 1. Template de Email para Ativação
    console.log('1️⃣ Criando template de email (ativação)...');
    const emailTemplate = await client.notifications.createTemplate({
      name: 'Envelope Ativado - Email',
      channel: 'email',
      subject: '📄 Novo documento para assinatura: {{ENVELOPE_NAME}}',
      bodyTemplate: `
Olá {{SIGNER_NAME}},

Você tem um novo documento aguardando sua assinatura:

📋 Envelope: {{ENVELOPE_NAME}}
📄 Documento: {{DOCUMENT_NAME}}
✍️ Prazo: {{EXPIRES_AT}}

Clique no link abaixo para acessar:
{{SIGNATURE_URL}}

Atenciosamente,
{{ORGANIZATION_NAME}}
      `.trim(),
      variables: [
        'SIGNER_NAME',
        'ENVELOPE_NAME',
        'DOCUMENT_NAME',
        'EXPIRES_AT',
        'SIGNATURE_URL',
        'ORGANIZATION_NAME',
      ],
    });
    console.log('✅ Template Email criado:', emailTemplate.id);
    console.log('   Nome:', emailTemplate.name);
    console.log('   Canal:', emailTemplate.channel);
    console.log('   Variáveis:', emailTemplate.variables.length);

    // 2. Template de SMS
    console.log('\n2️⃣ Criando template de SMS...');
    const smsTemplate = await client.notifications.createTemplate({
      name: 'Envelope Ativado - SMS',
      channel: 'sms',
      bodyTemplate: '{{SIGNER_NAME}}, novo documento "{{ENVELOPE_NAME}}" aguardando assinatura. Acesse: {{SIGNATURE_URL}}',
      variables: ['SIGNER_NAME', 'ENVELOPE_NAME', 'SIGNATURE_URL'],
    });
    console.log('✅ Template SMS criado:', smsTemplate.id);
    console.log('   Nome:', smsTemplate.name);

    // 3. Template de WhatsApp
    console.log('\n3️⃣ Criando template de WhatsApp...');
    const whatsappTemplate = await client.notifications.createTemplate({
      name: 'Envelope Ativado - WhatsApp',
      channel: 'whatsapp',
      bodyTemplate: `
🔔 *Novo Documento para Assinatura*

Olá *{{SIGNER_NAME}}*,

📋 Envelope: {{ENVELOPE_NAME}}
✍️ Prazo: {{EXPIRES_AT}}

Acesse agora: {{SIGNATURE_URL}}
      `.trim(),
      variables: ['SIGNER_NAME', 'ENVELOPE_NAME', 'EXPIRES_AT', 'SIGNATURE_URL'],
    });
    console.log('✅ Template WhatsApp criado:', whatsappTemplate.id);

    // 4. Listar todos os templates
    console.log('\n4️⃣ Listando templates criados...');
    const allTemplates = await client.notifications.list();
    console.log(`✅ Total de templates: ${allTemplates.length}`);
    allTemplates.forEach((t, idx) => {
      console.log(`   ${idx + 1}. ${t.name} (${t.channel}) - Ativo: ${t.isActive}`);
    });

    // 🆕 PROBLEMA 3: Demonstrar filtros
    console.log('\n   🔍 Filtrando apenas templates de EMAIL...');
    const emailTemplates = await client.notifications.list({ channel: 'email' });
    console.log(`   ✅ Templates de email: ${emailTemplates.length}`);
    emailTemplates.forEach((t) => {
      console.log(`      - ${t.name}`);
    });

    console.log('\n   🔍 Filtrando templates por nome "Envelope"...');
    const envelopeTemplates = await client.notifications.list({ name: 'Envelope' });
    console.log(`   ✅ Templates com "Envelope" no nome: ${envelopeTemplates.length}`);
    envelopeTemplates.forEach((t) => {
      console.log(`      - ${t.name} (${t.channel})`);
    });

    console.log('\n========== FASE 2: PREVIEW DE TEMPLATE ==========\n');

    // 5. Preview com variáveis de exemplo
    console.log('5️⃣ Gerando preview do template de email...');
    const preview = await client.notifications.previewTemplate(emailTemplate.id, {
      variables: {
        SIGNER_NAME: 'Dr. João Silva',
        ENVELOPE_NAME: 'Contrato de Prestação de Serviços',
        DOCUMENT_NAME: 'contrato-honorarios.pdf',
        EXPIRES_AT: '05/02/2025',
        SIGNATURE_URL: 'https://app.signature.com/sign/abc123',
        ORGANIZATION_NAME: 'Escritório Advocacia XYZ',
      },
    });
    console.log('✅ Preview gerado:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(preview.rendered);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('========== FASE 3: WORKFLOW COMPLETO COM NOTIFICAÇÕES ==========\n');

    // 6. Criar envelope e ativar (isso dispara notificações)
    console.log('6️⃣ Criando envelope de exemplo...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Prestação de Serviços - Teste Notificação',
      description: 'Envelope para testar notificações',
    });
    console.log('✅ Envelope criado:', envelope.id);

    console.log('\n7️⃣ Adicionando signatários...');
    const signer1 = await client.signers.create(envelope.id, {
      name: 'Ana Paula Costa',
      email: 'ana@example.com',
      phoneNumber: '+5585911111111',
      preferredChannel: 'email',
    });
    console.log('✅ Signatário 1:', signer1.name, '- Canal:', signer1.preferredChannel);

    const signer2 = await client.signers.create(envelope.id, {
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      phoneNumber: '+5585922222222',
      preferredChannel: 'whatsapp',
    });
    console.log('✅ Signatário 2:', signer2.name, '- Canal:', signer2.preferredChannel);

    console.log('\n8️⃣ Ativando envelope (envia notificações)...');
    const activated = await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado!');
    console.log(`   📧 Notificações enviadas: ${activated.notificationsSent || 0}`);

    // Aguardar processamento assíncrono
    console.log('\n⏳ Aguardando 3 segundos para processamento das notificações...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n========== FASE 4: CONSULTA DE HISTÓRICO ==========\n');

    // 9. Histórico por envelope
    console.log('9️⃣ Consultando histórico de notificações do envelope...');
    const envelopeHistory = await client.notifications.getHistoryByEnvelope(envelope.id, {
      page: 1,
      perPage: 10,
    });

    console.log(`✅ Notificações encontradas: ${envelopeHistory.data.length}`);
    console.log(`   Total: ${envelopeHistory.meta.total}`);
    console.log(`   Páginas: ${envelopeHistory.meta.totalPages}`);

    if (envelopeHistory.data.length > 0) {
      console.log('\n   Detalhes:');
      envelopeHistory.data.forEach((notif, idx) => {
        const statusIcon = notif.status === 'sent' ? '✅' :
                          notif.status === 'failed' ? '❌' : '⏳';
        console.log(`   ${statusIcon} ${idx + 1}. ${notif.recipientName} (${notif.channel})`);
        console.log(`      Status: ${notif.status}`);
        console.log(`      Provider: ${notif.provider || 'N/A'}`);
        console.log(`      Tentativas: ${notif.attempts}/${notif.maxAttempts}`);
        if (notif.sentAt) {
          console.log(`      Enviado em: ${notif.sentAt}`);
        }
        if (notif.errorMessage) {
          console.log(`      Erro: ${notif.errorMessage}`);
        }
      });
    }

    // 10. Histórico por signatário
    console.log('\n🔟 Consultando histórico do signatário específico...');
    const signerHistory = await client.notifications.getHistoryBySigner(signer1.id);
    console.log(`✅ Notificações para ${signer1.name}: ${signerHistory.data.length}`);

    // 11. Notificações com falha
    console.log('\n1️⃣1️⃣ Consultando notificações com falha...');
    const failedNotifications = await client.notifications.getFailedNotifications({
      page: 1,
      perPage: 10,
    });

    if (failedNotifications.data.length > 0) {
      console.log(`⚠️ Notificações com falha: ${failedNotifications.data.length}`);
      failedNotifications.data.forEach((notif, idx) => {
        console.log(`   ${idx + 1}. ${notif.recipientName} (${notif.channel})`);
        console.log(`      Status: ${notif.status}`);
        console.log(`      Tentativas: ${notif.attempts}/${notif.maxAttempts}`);
        console.log(`      Erro: ${notif.errorMessage}`);
      });
    } else {
      console.log('✅ Nenhuma notificação com falha encontrada');
    }

    // Resumo
    console.log('\n========== RESUMO ==========');
    console.log('✅ Templates criados:', 3);
    console.log('   - Email (com subject customizado)');
    console.log('   - SMS (mensagem curta)');
    console.log('   - WhatsApp (formatação rich text)');
    console.log('✅ Envelope ID:', envelope.id);
    console.log('✅ Signatários:', 2);
    console.log('✅ Notificações enviadas:', activated.notificationsSent || 0);
    console.log('✅ Histórico consultado:', envelopeHistory.data.length, 'registros');

    console.log('\n✨ Notification workflow completo!');
    console.log('💡 Templates podem ser reutilizados para múltiplos envelopes');
    console.log('💡 Sistema de retry automático para falhas temporárias');

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
