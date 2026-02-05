/**
 * Exemplo 2: Template DOCX Workflow
 *
 * Este exemplo demonstra:
 * - Upload de template DOCX
 * - Extração automática de variáveis
 * - Configuração de mapeamento de variáveis
 * - Geração de documento PDF personalizado
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 2: TEMPLATE WORKFLOW ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    console.log('========== FASE 1: CONFIGURAÇÃO DO TEMPLATE (Admin - Uma vez) ==========\n');

    // 1. Upload DOCX
    console.log('1️⃣ Fazendo upload de template DOCX...');

    const templatePath = path.join(__dirname, '../../tests/fixtures/contrato-honorarios.docx');
    let docxBuffer: Buffer;

    if (fs.existsSync(templatePath)) {
      docxBuffer = fs.readFileSync(templatePath);
      console.log('   Template encontrado:', templatePath);
    } else {
      console.error('   ❌ Template DOCX não encontrado em:', templatePath);
      console.log('   💡 Crie um arquivo DOCX com variáveis como [[CLIENTE_NOME]], [[ADVOGADO_OAB]]');
      return;
    }

    const template = await client.templates.uploadAndExtract({
      file: docxBuffer,
    });

    console.log('✅ Template criado:', template.id);
    console.log('   Nome:', template.name);
    console.log('   Variáveis extraídas:', template.extractedVariables.length);
    console.log('   Variáveis:', template.extractedVariables);

    // 2. Configurar mapeamento de variáveis
    console.log('\n2️⃣ Configurando mapeamento de variáveis...');

    const configured = await client.templates.configure(template.id, {
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
        '[[CLIENTE_ENDERECO]]': {
          source: 'signer',
          role: 'CONTRATANTE',
          field: 'address.full',
          required: false,
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
        '[[PROCESSO_COMARCA]]': {
          source: 'document',
          field: 'customFields.processo_comarca',
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
          signatureFieldPosition: {
            page: 1,
            x: 100,
            y: 650,
            width: 150,
            height: 50
          },
        },
        {
          role: 'CONTRATADO',
          displayName: 'Advogado',
          signingOrder: 2,
          signatureFieldPosition: {
            page: 1,
            x: 350,
            y: 650,
            width: 150,
            height: 50
          },
        },
      ],
    });

    console.log('✅ Template configurado:', configured.isConfigured);
    console.log('   Roles necessários:', configured.requiredRoles?.length || 0);

    console.log('\n========== FASE 2: USO DO TEMPLATE (Advogado - N vezes) ==========\n');

    // 3. Criar envelope
    console.log('3️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Honorários - Cliente João',
      description: 'Gerado a partir de template',
    });
    console.log('✅ Envelope criado:', envelope.id);

    // 4. Gerar documento a partir do template
    console.log('\n4️⃣ Gerando documento personalizado...');

    const generated = await client.templates.generateDocument(template.id, {
      envelopeId: envelope.id,
      signers: [
        {
          role: 'CONTRATANTE',
          name: 'João da Silva Santos',
          email: 'joao@example.com',
          documentNumber: '12345678900',
          phone: '+5585999999999',
          address: {
            full: 'Rua das Flores, 123, Centro, Russas-CE, CEP 62900-000',
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'Russas',
            state: 'CE',
            zipCode: '62900-000',
            country: 'Brasil',
          },
          customFields: {
            estado_civil: 'Casado',
            profissao: 'Engenheiro',
          },
        },
        {
          role: 'CONTRATADO',
          name: 'Dr. Pedro Oliveira',
          email: 'pedro@adv.com',
          documentNumber: '98765432100',
          customFields: {
            oab_numero: '12345/CE',
            endereco_profissional: 'Av. João Pessoa, 456, Fortaleza-CE',
          },
        },
      ],
      documentCustomFields: {
        processo_numero: '0001234-56.2024.8.06.0001',
        processo_comarca: 'Russas',
        valor_honorarios: '5000.00',
        forma_pagamento: 'PIX ou Transferência',
      },
    });

    console.log('✅ Documento PDF gerado:', generated.document.id);
    console.log('   Nome:', generated.document.name);
    console.log('   Template ID:', generated.document.templateId);
    console.log('   S3 Key:', generated.document.s3Key);

    console.log('\n✅ Variáveis preenchidas:');
    Object.entries(generated.variablesUsed).forEach(([key, value]) => {
      console.log(`   ${key} = ${value}`);
    });

    console.log('\n✅ Signatários criados automaticamente:');
    generated.signers.forEach((signer, idx) => {
      console.log(`   ${idx + 1}. ${signer.name} (${signer.qualificationRole}) - ${signer.email}`);
    });

    // 5. Ativar envelope
    console.log('\n5️⃣ Ativando envelope...');
    const activated = await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado!');
    console.log(`   📧 Notificações enviadas: ${activated.notificationsSent || 0}`);

    // Resumo
    console.log('\n========== RESUMO ==========');
    console.log('✅ Template ID:', template.id);
    console.log('✅ Envelope ID:', envelope.id);
    console.log('✅ Documento PDF ID:', generated.document.id);
    console.log('✅ Variáveis processadas:', Object.keys(generated.variablesUsed).length);
    console.log('✅ Signatários:', generated.signers.length);
    console.log('✅ Status:', activated.envelope.status);

    console.log('\n✨ Template workflow completo!');
    console.log('💡 O template pode ser reutilizado para novos contratos');

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
