/**
 * Exemplo 5: Complete End-to-End Workflow
 *
 * Este exemplo demonstra um workflow completo integrando TODAS as funcionalidades:
 * - Fase 1-5: Envelope, Document, Signer, SignatureField (base)
 * - Fase 6: Notificações multi-canal
 * - Fase 7: Templates DOCX com variáveis
 * - Fase 8: Autenticação de signatários
 * - Fase 4: Verificação pública
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function completeWorkflow() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       EXEMPLO 5: WORKFLOW COMPLETO END-TO-END                 ║');
  console.log('║       Integrando TODAS as funcionalidades (Fases 1-8)         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    FASE 1: SETUP INICIAL                      ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Criar envelope
    console.log('1️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Prestação de Serviços Advocatícios - Cliente Premium',
      description: 'Contrato com autenticação avançada, notificações e template personalizado',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      customFields: {
        tipo_contrato: 'HONORARIOS',
        prioridade: 'ALTA',
        departamento: 'Jurídico',
      },
    });
    console.log('✅ Envelope criado:', envelope.id);
    console.log('   Nome:', envelope.name);
    console.log('   Status:', envelope.status);
    console.log('   Expira em:', envelope.deadline);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('              FASE 2: TEMPLATE DOCX E GERAÇÃO DE PDF            ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 2. Upload de template DOCX
    console.log('2️⃣ Fazendo upload de template DOCX...');
    const templatePath = path.join(__dirname, '../../tests/fixtures/contrato-honorarios.docx');

    let template: any;
    if (fs.existsSync(templatePath)) {
      const templateBuffer = fs.readFileSync(templatePath);
      template = await client.templates.uploadAndExtract({ file: templateBuffer });
      console.log('✅ Template criado:', template.id);
      console.log('   Variáveis extraídas:', template.extractedVariables.length);

      if (template.extractedVariables.length > 0) {
        console.log('   Primeiras variáveis:', template.extractedVariables.slice(0, 5).join(', '));
      }
    } else {
      console.log('⚠️ Template não encontrado, pulando configuração de template');
      template = null;
    }

    // 3. Configurar template (somente na primeira vez)
    if (template) {
      console.log('\n3️⃣ Configurando mapeamento de variáveis...');
      await client.templates.configure(template.id, {
        variableSchema: {
          '[[CLIENTE_NOME]]': {
            source: 'signer',
            role: 'CONTRATANTE',
            field: 'name',
            required: true,
          },
          '[[CLIENTE_CPF]]': {
            source: 'signer',
            role: 'CONTRATANTE',
            field: 'documentNumber',
            required: true,
            transform: 'formatCPF',
          },
          '[[CLIENTE_EMAIL]]': {
            source: 'signer',
            role: 'CONTRATANTE',
            field: 'email',
            required: true,
          },
          '[[ADVOGADO_NOME]]': {
            source: 'signer',
            role: 'CONTRATADO',
            field: 'name',
            required: true,
          },
          '[[ADVOGADO_OAB]]': {
            source: 'signer',
            role: 'CONTRATADO',
            field: 'customFields.oab_numero',
            required: true,
          },
          '[[PROCESSO_NUMERO]]': {
            source: 'document',
            field: 'customFields.processo_numero',
            required: true,
          },
          '[[VALOR_HONORARIOS]]': {
            source: 'document',
            field: 'customFields.valor_honorarios',
            required: true,
            transform: 'formatCurrency',
          },
          '[[DATA_ASSINATURA]]': {
            source: 'system',
            field: 'currentDate',
            required: true,
            transform: 'formatDate:DD/MM/YYYY',
          },
        },
        requiredRoles: [
          {
            role: 'CONTRATANTE',
            displayName: 'Cliente',
            signingOrder: 1,
            signatureFieldPosition: { page: 1, x: 100, y: 650, width: 150, height: 50 },
          },
          {
            role: 'CONTRATADO',
            displayName: 'Advogado',
            signingOrder: 2,
            signatureFieldPosition: { page: 1, x: 350, y: 650, width: 150, height: 50 },
          },
        ],
      });
      console.log('✅ Template configurado com sucesso');
    }

    // 4. Gerar documento a partir do template
    let generated: any = null;
    if (template) {
      console.log('\n4️⃣ Gerando documento PDF personalizado...');
      generated = await client.templates.generateDocument(template.id, {
        envelopeId: envelope.id,
        signers: [
          {
            role: 'CONTRATANTE',
            name: 'João da Silva Santos',
            email: 'joao.silva@example.com',
            documentNumber: '12345678900',
            phone: '+5585999999999',
            address: {
              full: 'Rua das Flores, 123, Apto 501, Centro, Russas-CE, CEP 62900-000',
              street: 'Rua das Flores',
              number: '123',
              complement: 'Apto 501',
              neighborhood: 'Centro',
              city: 'Russas',
              state: 'CE',
              zipCode: '62900-000',
              country: 'Brasil',
            },
            customFields: {
              estado_civil: 'Casado',
              profissao: 'Engenheiro Civil',
              rg: '1234567',
            },
          },
          {
            role: 'CONTRATADO',
            name: 'Dr. Pedro Oliveira Costa',
            email: 'pedro.oliveira@adv.com',
            documentNumber: '98765432100',
            phone: '+5585988888888',
            customFields: {
              oab_numero: '12345/CE',
              endereco_profissional: 'Av. João Pessoa, 456, Sala 801, Fortaleza-CE',
              especialidade: 'Direito Civil e Família',
            },
          },
        ],
        documentCustomFields: {
          processo_numero: '0001234-56.2024.8.06.0001',
          processo_comarca: 'Russas',
          processo_vara: '1ª Vara Cível',
          valor_honorarios: '5000.00',
          forma_pagamento: 'PIX ou Transferência Bancária',
          banco_dados: 'Banco do Brasil - Ag: 1234-5 - CC: 12345-6',
        },
      });

      console.log('✅ Documento PDF gerado:', generated.document.id);
      console.log('   Template usado:', generated.document.templateId);
      console.log('   Variáveis processadas:', Object.keys(generated.variablesUsed).length);
      console.log('   Signatários auto-criados:', generated.signers.length);

      console.log('\n   Variáveis preenchidas (amostra):');
      const varsArray = Object.entries(generated.variablesUsed).slice(0, 5);
      varsArray.forEach(([key, value]) => {
        console.log(`   ${key} = ${value}`);
      });
    }

    const signer1 = generated ? generated.signers[0] : null;
    const signer2 = generated ? generated.signers[1] : null;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('            FASE 3: AUTENTICAÇÃO DOS SIGNATÁRIOS                ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (signer1) {
      // 5. Adicionar requisitos de autenticação para signer1 (Cliente)
      console.log('5️⃣ Configurando autenticações para', signer1.name, '...');

      const emailAuth = await client.authentication.create(signer1.id, {
        method: 'emailToken',
        description: 'Token de 6 caracteres enviado por email',
        isRequired: true,
      });
      console.log('   ✅ Email Token:', emailAuth.id);

      const docAuth = await client.authentication.create(signer1.id, {
        method: 'officialDocument',
        description: 'Upload de RG ou CNH',
        isRequired: true,
        configuration: {
          acceptedTypes: ['RG', 'CNH'],
          maxFileSize: 5242880,
        },
      });
      console.log('   ✅ Document Auth:', docAuth.id);

      const ipAuth = await client.authentication.create(signer1.id, {
        method: 'ipAddress',
        description: 'Registro do IP do signatário',
        isRequired: true,
      });
      console.log('   ✅ IP Auth:', ipAuth.id);

      const geoAuth = await client.authentication.create(signer1.id, {
        method: 'geolocation',
        description: 'Captura de coordenadas GPS',
        isRequired: false, // Opcional
      });
      console.log('   ✅ Geo Auth:', geoAuth.id, '(opcional)');

      // 6. Enviar token
      console.log('\n6️⃣ Enviando token de verificação...');
      const tokenResponse = await client.authentication.sendToken(emailAuth.id);
      console.log('✅ Token enviado para:', signer1.email);
      console.log('   Expira em:', tokenResponse.expiresAt);
      console.log('   💡 Signatário receberá código de 6 caracteres no email');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('         FASE 4: NOTIFICAÇÕES E ATIVAÇÃO DO ENVELOPE            ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 7. Criar template de notificação personalizado (opcional)
    console.log('7️⃣ Criando template de notificação personalizado...');
    const notifTemplate = await client.notifications.createTemplate({
      name: 'Contrato Premium - Notificação de Assinatura',
      channel: 'email',
      subject: '📄 Contrato Premium aguardando sua assinatura - [[ENVELOPE_NAME]]',
      bodyTemplate: `
Prezado(a) [[SIGNER_NAME]],

Você foi convidado(a) para assinar o seguinte contrato:

📋 **Envelope:** [[ENVELOPE_NAME]]
📄 **Documento:** [[DOCUMENT_NAME]]
⏰ **Prazo:** [[EXPIRES_AT]]

🔐 **Autenticação Requerida:**
- Token de verificação por email
- Upload de documento de identidade
- Registro de localização

👉 **Acesse o link abaixo para iniciar o processo:**
[[SIGNATURE_URL]]

⚠️ Este é um contrato com alto nível de segurança. Certifique-se de cumprir todas as etapas de autenticação.

Atenciosamente,
[[ORGANIZATION_NAME]]

---
Este é um email automático. Não responda a esta mensagem.
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
    console.log('✅ Template de notificação criado:', notifTemplate.id);

    // 8. Ativar envelope (envia notificações automaticamente)
    console.log('\n8️⃣ Ativando envelope...');
    const activated = await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado com sucesso!');
    console.log(`   📧 Notificações enviadas: ${activated.notificationsSent || 0}`);
    console.log('   Status:', activated.envelope.status);

    // Aguardar processamento
    console.log('\n⏳ Aguardando 2 segundos para processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 9. Consultar histórico de notificações
    console.log('\n9️⃣ Consultando histórico de notificações...');
    const notifHistory = await client.notifications.getHistoryByEnvelope(envelope.id, {
      page: 1,
      perPage: 10,
    });
    console.log(`✅ Histórico: ${notifHistory.data.length} notificações registradas`);

    if (notifHistory.data.length > 0) {
      notifHistory.data.forEach((n, idx) => {
        const icon = n.status === 'sent' ? '✅' : n.status === 'failed' ? '❌' : '⏳';
        console.log(`   ${icon} ${idx + 1}. ${n.recipientName} (${n.channel}) - ${n.status}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('              FASE 5: VERIFICAÇÃO PÚBLICA                       ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (generated?.document?.hash) {
      // 10. Verificação pública (SEM autenticação)
      console.log('🔟 Testando verificação pública do documento...');
      const verification = await client.publicVerification.verify(generated.document.hash);

      console.log('✅ Documento verificado publicamente (SEM autenticação)');
      console.log('   Documento ID:', verification.documentId);
      console.log('   Nome:', verification.documentName);
      console.log('   Hash:', verification.documentHash);
      console.log('   Versão:', verification.currentVersion);
      console.log('   Envelope:', verification.envelopeName);
      console.log('   Status do documento:', verification.status);
      console.log('   Assinaturas:', verification.signatures.length);
      console.log('   Download público permitido?', verification.allowPublicDownload ? 'SIM' : 'NÃO');

      console.log('\n   Signatários:');
      verification.signatures.forEach((s, idx) => {
        const signedIcon = s.signedAt ? '✅' : '⏳';
        console.log(`   ${signedIcon} ${idx + 1}. ${s.signerName} (${s.signerRole || 'N/A'})`);
        if (s.signedAt) {
          console.log(`      Assinado em: ${s.signedAt}`);
        }
      });

      if (verification.allowPublicDownload) {
        console.log('\n   🔗 Obtendo URL de download público...');
        const downloadInfo = await client.publicVerification.download(generated.document.hash);
        console.log('   ✅ URL temporária gerada (válida por 1 hora)');
        console.log('   Expira em:', downloadInfo.expiresIn);
        // console.log('   URL:', downloadInfo.url); // Não loggar URL completa por segurança
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                   RESUMO FINAL - WORKFLOW COMPLETO             ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('✅ **ENVELOPE**');
    console.log('   ID:', envelope.id);
    console.log('   Nome:', envelope.name);
    console.log('   Status:', activated.envelope.status);
    console.log('   Expira em:', envelope.deadline);

    if (template) {
      console.log('\n✅ **TEMPLATE DOCX**');
      console.log('   ID:', template.id);
      console.log('   Variáveis extraídas:', template.extractedVariables.length);
      console.log('   Configurado:', template.isConfigured);
    }

    if (generated) {
      console.log('\n✅ **DOCUMENTO GERADO**');
      console.log('   ID:', generated.document.id);
      console.log('   Nome:', generated.document.name);
      console.log('   Hash:', generated.document.hash);
      console.log('   S3 Key:', generated.document.s3Key);
      console.log('   Variáveis processadas:', Object.keys(generated.variablesUsed).length);
    }

    if (signer1 && signer2) {
      console.log('\n✅ **SIGNATÁRIOS**');
      console.log('   1.', signer1.name, `(${signer1.qualificationRole})`);
      console.log('      Email:', signer1.email);
      console.log('      Canal preferido:', signer1.preferredChannel || 'N/A');
      console.log('   2.', signer2.name, `(${signer2.qualificationRole})`);
      console.log('      Email:', signer2.email);
      console.log('      Canal preferido:', signer2.preferredChannel || 'N/A');
    }

    console.log('\n✅ **AUTENTICAÇÃO**');
    console.log('   Requisitos criados: 4');
    console.log('   - Email Token (obrigatório)');
    console.log('   - Documento Oficial (obrigatório)');
    console.log('   - IP Address (obrigatório)');
    console.log('   - Geolocalização (opcional)');

    console.log('\n✅ **NOTIFICAÇÕES**');
    console.log('   Template criado:', notifTemplate.id);
    console.log('   Notificações enviadas:', activated.notificationsSent || 0);
    console.log('   Histórico:', notifHistory.data.length, 'registros');

    console.log('\n✅ **VERIFICAÇÃO PÚBLICA**');
    if (generated?.document?.hash) {
      console.log('   Hash do documento:', generated.document.hash);
      console.log('   Verificação disponível: SIM');
      console.log('   Download público:', generated.document.allowPublicDownload ? 'SIM' : 'NÃO');
    } else {
      console.log('   Não configurado neste exemplo');
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✨ WORKFLOW COMPLETO! ✨                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('🎉 Todas as funcionalidades das Fases 1-8 foram demonstradas:');
    console.log('   ✅ Fase 1-5: Envelope, Document, Signer, SignatureField');
    console.log('   ✅ Fase 6: Notificações multi-canal com templates');
    console.log('   ✅ Fase 7: Templates DOCX com variáveis e PDF generation');
    console.log('   ✅ Fase 8: Autenticação avançada de signatários');
    console.log('   ✅ Fase 4: Verificação pública sem autenticação');

    console.log('\n💡 Próximos passos:');
    console.log('   1. Signatário recebe email com link');
    console.log('   2. Signatário valida token e faz upload de documentos');
    console.log('   3. Signatário assina o documento');
    console.log('   4. Sistema gera nova versão do PDF com assinatura');
    console.log('   5. Documento fica disponível para verificação pública');

  } catch (error: any) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                        ❌ ERRO FATAL ❌                        ║');
    console.error('╚════════════════════════════════════════════════════════════════╝\n');
    console.error('Mensagem:', error.message);

    if (error.response?.data) {
      console.error('\nDetalhes da API:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  completeWorkflow().catch((error) => {
    console.error('Erro fatal não capturado:', error);
    process.exit(1);
  });
}

export { completeWorkflow };
