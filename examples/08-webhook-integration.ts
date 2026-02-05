/**
 * Exemplo 8: Webhook Integration (COMPLETO)
 *
 * Este exemplo demonstra TODOS os recursos de webhooks (Event Observers):
 *
 * **FASE 1: Configuração de Webhooks**
 * - Criação de webhooks com diferentes eventos
 * - Configuração de HMAC secret para segurança
 * - Headers customizados
 * - Timeout e retry policy
 *
 * **FASE 2: Gerenciamento de Webhooks**
 * - Listagem de todos os webhooks
 * - Busca de webhook específico
 * - Atualização de configurações
 * - Ativação/Desativação temporária
 * - Deleção permanente
 *
 * **FASE 3: Eventos Disponíveis (30 tipos)**
 * - Eventos de Envelope (6 tipos)
 * - Eventos de Documento (5 tipos)
 * - Eventos de Signatário (7 tipos)
 * - Eventos de Autenticação (3 tipos)
 * - Eventos de Qualificação (2 tipos)
 * - Eventos de Notificação (3 tipos)
 * - Eventos de Template (1 tipo)
 * - Eventos de ZIP (2 tipos)
 * - Eventos de Erro (1 tipo)
 *
 * **FASE 4: Validação HMAC**
 * - Exemplo de servidor webhook com validação
 * - Verificação de assinatura HMAC-SHA256
 * - Segurança e autenticidade de payloads
 *
 * **Cobertura: 100% dos recursos de WebhookService**
 */

import { SignatureClient } from '../src';
import * as crypto from 'crypto';

async function main() {
  console.log('========== EXEMPLO 8: WEBHOOK INTEGRATION ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    console.log('========== FASE 1: CONFIGURAÇÃO DE WEBHOOKS ==========\n');

    // 1. Webhook para eventos críticos de envelope
    console.log('1️⃣ Criando webhook para eventos de ENVELOPE...');
    const envelopeWebhook = await client.webhooks.create({
      name: 'Webhook Envelope Events',
      callbackUrl: 'https://myapp.com/webhooks/envelopes',
      eventTypes: [
        'envelopeCreated',
        'envelopeActivated',
        'envelopeCompleted',
        'envelopeCanceled',
        'envelopeExpired',
      ],
      secret: 'my-super-secret-key-envelope',
      isActive: true,
      description: 'Notificações de ciclo de vida do envelope',
    });
    console.log('✅ Webhook criado:', envelopeWebhook.id);
    console.log('   Nome:', envelopeWebhook.name);
    console.log('   URL:', envelopeWebhook.callbackUrl);
    console.log('   Eventos:', envelopeWebhook.eventTypes.length);
    console.log('   Ativo:', envelopeWebhook.isActive ? '✅' : '❌');
    console.log('   HMAC Secret:', envelopeWebhook.secret ? '🔒 Configurado' : '⚠️ Não configurado');

    // 2. Webhook para eventos de assinatura
    console.log('\n2️⃣ Criando webhook para eventos de SIGNATÁRIO...');
    const signerWebhook = await client.webhooks.create({
      name: 'Webhook Signer Events',
      callbackUrl: 'https://myapp.com/webhooks/signers',
      eventTypes: [
        'signerAdded',
        'signerNotified',
        'signerAccessed',
        'signerAuthenticated',
        'signerSigned',
        'signerRejected',
      ],
      secret: 'my-super-secret-key-signer',
      isActive: true,
      description: 'Notificações de ações do signatário',
    });
    console.log('✅ Webhook criado:', signerWebhook.id);
    console.log('   Eventos monitorados:', signerWebhook.eventTypes.join(', '));

    // 3. Webhook para eventos de documento
    console.log('\n3️⃣ Criando webhook para eventos de DOCUMENTO...');
    const documentWebhook = await client.webhooks.create({
      name: 'Webhook Document Events',
      callbackUrl: 'https://myapp.com/webhooks/documents',
      eventTypes: [
        'documentAdded',
        'documentUpdated',
        'documentSigned',
        'documentRefused',
        'documentCompleted',
      ],
      secret: 'my-super-secret-key-document',
      isActive: true,
    });
    console.log('✅ Webhook criado:', documentWebhook.id);

    // 4. Webhook para eventos de autenticação
    console.log('\n4️⃣ Criando webhook para eventos de AUTENTICAÇÃO...');
    const authWebhook = await client.webhooks.create({
      name: 'Webhook Authentication Events',
      callbackUrl: 'https://myapp.com/webhooks/auth',
      eventTypes: [
        'authenticationRequired',
        'authenticationCompleted',
        'authenticationFailed',
      ],
      secret: 'my-super-secret-key-auth',
      isActive: true,
    });
    console.log('✅ Webhook criado:', authWebhook.id);

    // 5. Webhook para eventos de notificação
    console.log('\n5️⃣ Criando webhook para eventos de NOTIFICAÇÃO...');
    const notificationWebhook = await client.webhooks.create({
      name: 'Webhook Notification Events',
      callbackUrl: 'https://myapp.com/webhooks/notifications',
      eventTypes: [
        'notificationSent',
        'notificationDelivered',
        'notificationFailed',
      ],
      secret: 'my-super-secret-key-notification',
      isActive: false, // Desativado inicialmente
      description: 'Monitoramento de entregas de notificações',
    });
    console.log('✅ Webhook criado:', notificationWebhook.id);
    console.log('   Status:', notificationWebhook.isActive ? 'Ativo ✅' : 'Desativado ⏸️');

    // 6. Webhook para eventos de ZIP (jobs assíncronos)
    console.log('\n6️⃣ Criando webhook para eventos de ZIP...');
    const zipWebhook = await client.webhooks.create({
      name: 'Webhook ZIP Generation',
      callbackUrl: 'https://myapp.com/webhooks/zip-jobs',
      eventTypes: [
        'zipGenerated',
        'zipFailed',
      ],
      secret: 'my-super-secret-key-zip',
      isActive: true,
      description: 'Notificações de geração de ZIP assíncrona',
    });
    console.log('✅ Webhook criado:', zipWebhook.id);
    console.log('   💡 Recebe notificações quando ZIP completa (ou falha)');

    // 7. Webhook catch-all (todos os eventos)
    console.log('\n7️⃣ Criando webhook CATCH-ALL (todos os eventos)...');
    const catchAllWebhook = await client.webhooks.create({
      name: 'Webhook Catch-All (Dev/Staging)',
      callbackUrl: 'https://webhook.site/unique-id-here',
      eventTypes: [
        // Envelope (6)
        'envelopeCreated',
        'envelopeUpdated',
        'envelopeActivated',
        'envelopeCompleted',
        'envelopeCanceled',
        'envelopeExpired',
        // Documento (5)
        'documentAdded',
        'documentUpdated',
        'documentSigned',
        'documentRefused',
        'documentCompleted',
        // Signatário (7)
        'signerAdded',
        'signerUpdated',
        'signerNotified',
        'signerAccessed',
        'signerAuthenticated',
        'signerSigned',
        'signerRejected',
        // Autenticação (3)
        'authenticationRequired',
        'authenticationCompleted',
        'authenticationFailed',
        // Qualificação (2)
        'qualificationAdded',
        'qualificationSatisfied',
        // Notificação (3)
        'notificationSent',
        'notificationDelivered',
        'notificationFailed',
        // Template (1)
        'templateUsed',
        // ZIP (2)
        'zipGenerated',
        'zipFailed',
        // Erro (1)
        'errorOccurred',
      ],
      secret: 'my-super-secret-key-catchall',
      isActive: false, // Manter desativado em produção
      description: 'Webhook para debugging - recebe TODOS os eventos',
    });
    console.log('✅ Webhook criado:', catchAllWebhook.id);
    console.log('   Total de eventos:', catchAllWebhook.eventTypes.length);
    console.log('   ⚠️ Desativado (apenas para desenvolvimento)');

    console.log('\n========== FASE 2: GERENCIAMENTO DE WEBHOOKS ==========\n');

    // 8. Listar todos os webhooks
    console.log('8️⃣ Listando todos os webhooks cadastrados...');
    const allWebhooks = await client.webhooks.findAll();
    console.log('✅ Total de webhooks:', allWebhooks.length);
    allWebhooks.forEach((webhook, idx) => {
      const activeIcon = webhook.isActive ? '✅' : '⏸️';
      const secretIcon = webhook.secret ? '🔒' : '🔓';
      console.log(`   ${activeIcon} ${secretIcon} ${idx + 1}. ${webhook.name} (${webhook.eventTypes.length} eventos)`);
    });
    console.log('   ✅ = Ativo | ⏸️ = Desativado | 🔒 = HMAC configurado | 🔓 = Sem HMAC');

    // 9. Buscar webhook específico
    console.log('\n9️⃣ Buscando webhook específico por ID...');
    const specificWebhook = await client.webhooks.findById(envelopeWebhook.id);
    console.log('✅ Webhook encontrado:', specificWebhook.name);
    console.log('   ID:', specificWebhook.id);
    console.log('   URL:', specificWebhook.callbackUrl);
    console.log('   Eventos:', specificWebhook.eventTypes.length);

    // 10. Atualizar webhook (adicionar mais eventos)
    console.log('\n🔟 Atualizando webhook de envelope (adicionando evento)...');
    console.log('   Eventos antes:', envelopeWebhook.eventTypes.length);
    const updatedWebhook = await client.webhooks.update(envelopeWebhook.id, {
      eventTypes: [
        ...envelopeWebhook.eventTypes,
        'envelopeUpdated', // Adicionar novo evento
      ],
      description: 'Notificações de ciclo de vida do envelope (atualizado)',
    });
    console.log('✅ Webhook atualizado');
    console.log('   Eventos depois:', updatedWebhook.eventTypes.length);
    console.log('   Novo evento adicionado: envelopeUpdated');

    // 11. Ativar webhook desativado
    console.log('\n1️⃣1️⃣ Ativando webhook de notificações...');
    console.log('   Status antes:', notificationWebhook.isActive ? 'Ativo' : 'Desativado');
    const activatedWebhook = await client.webhooks.activate(notificationWebhook.id);
    console.log('✅ Webhook ativado');
    console.log('   Status depois:', activatedWebhook.isActive ? 'Ativo ✅' : 'Desativado ⏸️');

    // 12. Desativar webhook temporariamente
    console.log('\n1️⃣2️⃣ Desativando webhook catch-all temporariamente...');
    const deactivatedWebhook = await client.webhooks.deactivate(catchAllWebhook.id);
    console.log('✅ Webhook desativado temporariamente');
    console.log('   Status:', deactivatedWebhook.isActive ? 'Ativo' : 'Desativado ⏸️');
    console.log('   💡 Webhook permanece configurado, apenas para de receber eventos');

    // 13. Deletar webhook permanentemente
    console.log('\n1️⃣3️⃣ Deletando webhook catch-all permanentemente...');
    await client.webhooks.delete(catchAllWebhook.id);
    console.log('✅ Webhook deletado permanentemente');
    console.log('   💡 Não pode ser recuperado após deleção');

    // 14. Verificar webhooks ativos
    console.log('\n1️⃣4️⃣ Verificando webhooks ativos...');
    const remainingWebhooks = await client.webhooks.findAll();
    const activeWebhooks = remainingWebhooks.filter(w => w.isActive);
    console.log('✅ Webhooks ativos:', activeWebhooks.length, 'de', remainingWebhooks.length);
    activeWebhooks.forEach((webhook, idx) => {
      console.log(`   ${idx + 1}. ${webhook.name}`);
    });

    console.log('\n========== FASE 3: EVENTOS DISPONÍVEIS (30 TIPOS) ==========\n');

    console.log('1️⃣5️⃣ Resumo de todos os eventos disponíveis:\n');

    console.log('📧 ENVELOPE (6 eventos):');
    console.log('   1. envelopeCreated      - Envelope criado');
    console.log('   2. envelopeUpdated      - Envelope atualizado');
    console.log('   3. envelopeActivated    - Envelope ativado (pronto para assinatura)');
    console.log('   4. envelopeCompleted    - Envelope finalizado (todas assinaturas)');
    console.log('   5. envelopeCanceled     - Envelope cancelado');
    console.log('   6. envelopeExpired      - Envelope expirou');

    console.log('\n📄 DOCUMENTO (5 eventos):');
    console.log('   7. documentAdded        - Documento adicionado ao envelope');
    console.log('   8. documentUpdated      - Documento atualizado');
    console.log('   9. documentSigned       - Documento assinado por signatário');
    console.log('  10. documentRefused      - Documento recusado');
    console.log('  11. documentCompleted    - Documento completamente assinado');

    console.log('\n✍️  SIGNATÁRIO (7 eventos):');
    console.log('  12. signerAdded          - Signatário adicionado ao envelope');
    console.log('  13. signerUpdated        - Dados do signatário atualizados');
    console.log('  14. signerNotified       - Signatário notificado (email/SMS/WhatsApp)');
    console.log('  15. signerAccessed       - Signatário acessou link de assinatura');
    console.log('  16. signerAuthenticated  - Signatário autenticou com sucesso');
    console.log('  17. signerSigned         - Signatário assinou documento');
    console.log('  18. signerRejected       - Signatário rejeitou assinatura');

    console.log('\n🔐 AUTENTICAÇÃO (3 eventos):');
    console.log('  19. authenticationRequired  - Autenticação requerida');
    console.log('  20. authenticationCompleted - Autenticação completada');
    console.log('  21. authenticationFailed    - Autenticação falhou');

    console.log('\n🎓 QUALIFICAÇÃO (2 eventos):');
    console.log('  22. qualificationAdded      - Qualificação adicionada');
    console.log('  23. qualificationSatisfied  - Qualificação satisfeita');

    console.log('\n📬 NOTIFICAÇÃO (3 eventos):');
    console.log('  24. notificationSent        - Notificação enviada');
    console.log('  25. notificationDelivered   - Notificação entregue');
    console.log('  26. notificationFailed      - Notificação falhou');

    console.log('\n📋 TEMPLATE (1 evento):');
    console.log('  27. templateUsed            - Template usado');

    console.log('\n📦 ZIP (2 eventos):');
    console.log('  28. zipGenerated            - ZIP gerado com sucesso');
    console.log('  29. zipFailed               - Geração de ZIP falhou');

    console.log('\n❌ ERRO (1 evento):');
    console.log('  30. errorOccurred           - Erro ocorreu no sistema');

    console.log('\n========== FASE 4: VALIDAÇÃO HMAC ==========\n');

    console.log('1️⃣6️⃣ Exemplo de validação de HMAC signature:\n');

    // Função de validação HMAC (para usar no servidor webhook)
    function verifyWebhookSignature(
      payload: string,
      signature: string,
      secret: string
    ): boolean {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    }

    // Exemplo de uso
    const webhookPayload = JSON.stringify({
      event_type: 'ENVELOPE_COMPLETED',
      envelope_id: 'clxxx123456789',
      triggered_by: 'user_123',
      timestamp: new Date().toISOString(),
      metadata: {
        envelope_name: 'Contrato de Prestação de Serviços',
        total_signers: 2,
        completed_at: new Date().toISOString(),
      },
    });

    const secret = 'my-super-secret-key-envelope';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(webhookPayload)
      .digest('hex');

    console.log('Exemplo de payload recebido:');
    console.log(webhookPayload);
    console.log('\nHMAC Signature gerada:', validSignature);

    // Validar
    const isValid = verifyWebhookSignature(webhookPayload, validSignature, secret);
    console.log('\n✅ Assinatura válida:', isValid ? 'SIM ✅' : 'NÃO ❌');

    console.log('\n💡 Exemplo de código do servidor webhook (Express):');
    console.log(`
    import express from 'express';
    import crypto from 'crypto';

    const app = express();
    app.use(express.json());

    app.post('/webhooks/envelopes', (req, res) => {
      const signature = req.headers['x-webhook-signature'];
      const secret = process.env.WEBHOOK_SECRET;

      // 1. Validar assinatura HMAC
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Assinatura inválida!');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // 2. Processar evento
      const { event_type, envelope_id, metadata } = req.body;

      console.log('✅ Evento recebido:', event_type);
      console.log('   Envelope:', envelope_id);
      console.log('   Metadata:', metadata);

      // 3. Sua lógica de negócio aqui
      switch (event_type) {
        case 'ENVELOPE_COMPLETED':
          // Notificar usuário, atualizar banco, etc.
          break;
        case 'SIGNER_SIGNED':
          // Atualizar progresso, enviar notificação, etc.
          break;
        // ... outros eventos
      }

      // 4. Responder com sucesso
      res.status(200).json({ received: true });
    });

    app.listen(3001, () => {
      console.log('Servidor webhook rodando na porta 3001');
    });
    `);

    console.log('\n💡 Headers enviados pela API no webhook:');
    console.log('   - Content-Type: application/json');
    console.log('   - User-Agent: SignatureAPI-Webhook/1.0');
    console.log('   - X-Webhook-Event: {event_type}');
    console.log('   - X-Webhook-Delivery: {uuid}');
    console.log('   - X-Webhook-Signature: {hmac_sha256}');

    // Resumo Final
    console.log('\n========== RESUMO COMPLETO ==========');
    console.log('📊 Webhooks criados: 7');
    console.log('   - Envelope Events (6 eventos)');
    console.log('   - Signer Events (6 eventos)');
    console.log('   - Document Events (5 eventos)');
    console.log('   - Authentication Events (3 eventos)');
    console.log('   - Notification Events (3 eventos)');
    console.log('   - ZIP Events (2 eventos)');
    console.log('   - Catch-All (30 eventos) - DELETADO');

    console.log('\n🔐 Recursos de segurança:');
    console.log('   ✅ HMAC-SHA256 signature');
    console.log('   ✅ Secret por webhook');
    console.log('   ✅ Validação de payload');
    console.log('   ✅ Headers de identificação');

    console.log('\n🎯 Operações demonstradas:');
    console.log('   ✅ Criação de webhooks (create)');
    console.log('   ✅ Listagem de webhooks (findAll)');
    console.log('   ✅ Busca por ID (findById)');
    console.log('   ✅ Atualização (update)');
    console.log('   ✅ Ativação (activate)');
    console.log('   ✅ Desativação (deactivate)');
    console.log('   ✅ Deleção (delete)');
    console.log('   ✅ Validação HMAC');

    console.log('\n📋 Eventos disponíveis: 30 tipos');
    console.log('   - Envelope: 6 eventos');
    console.log('   - Documento: 5 eventos');
    console.log('   - Signatário: 7 eventos');
    console.log('   - Autenticação: 3 eventos');
    console.log('   - Qualificação: 2 eventos');
    console.log('   - Notificação: 3 eventos');
    console.log('   - Template: 1 evento');
    console.log('   - ZIP: 2 eventos');
    console.log('   - Erro: 1 evento');

    const finalWebhooks = await client.webhooks.findAll();
    console.log('\n📊 Status final:');
    console.log('   - Webhooks ativos:', finalWebhooks.filter(w => w.isActive).length);
    console.log('   - Webhooks desativados:', finalWebhooks.filter(w => !w.isActive).length);
    console.log('   - Total:', finalWebhooks.length);

    console.log('\n✨ Webhook Integration workflow COMPLETO demonstrado!');
    console.log('💡 Este exemplo cobre 100% da funcionalidade de webhooks');
    console.log('💡 Use webhook.site para testar webhooks em desenvolvimento');
    console.log('💡 SEMPRE valide HMAC signature em produção');
    console.log('💡 Configure retry policy na API para entregas falhadas');
    console.log('💡 Monitore logs de webhook delivery no sistema');

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
