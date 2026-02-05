/**
 * Exemplo: Aprovação com Assinatura PAdES Qualificada
 *
 * Este exemplo demonstra como criar um envelope de aprovação onde
 * os aprovadores aplicam assinatura digital PAdES ao aprovar documentos.
 *
 * Caso de Uso: Aprovação de Proposta Comercial
 * - Gerente aprova (com PAdES)
 * - Diretor aprova (com PAdES)
 * - Se rejeitado, apenas stamp visual é aplicado
 *
 * 🆕 MELHORIAS (Dez 2025):
 * - Assinaturas PAdES agora são incrementais (preservam assinaturas anteriores)
 * - Correção de bug: currentS3Key é recarregado após cada versão do documento
 * - Suporte robusto para múltiplas assinaturas PAdES no mesmo PDF
 * - Estratégia PADES_EACH agora funciona corretamente com incremental updates
 *
 * @module ApprovalWithPadesExample
 * @since FASE 14
 */

import { SignatureClient } from '../src';

/**
 * Configuração do SDK
 */
const sdk = new SignatureClient({
  baseURL: process.env.API_URL || 'http://localhost:3000',
  accessToken: process.env.API_TOKEN || 'your-api-token',
});

/**
 * 🎯 Exemplo Principal: Aprovação de Proposta Comercial com PAdES
 *
 * Fluxo:
 * 1. Criar envelope de aprovação
 * 2. Upload do documento
 * 3. Adicionar aprovadores com requirePades=true
 * 4. Ativar envelope (envia tokens de aprovação)
 * 5. Aprovadores decidem via token
 * 6. PAdES é aplicado automaticamente se aprovado
 */
async function approvalWithPadesExample() {
  console.log('🚀 Exemplo: Aprovação com PAdES\n');

  // ========================================
  // 1. CRIAR ENVELOPE NORMAL
  // ========================================
  console.log('📋 Passo 1: Criando envelope...');

  const envelope = await sdk.envelopes.create({
    name: 'Aprovação - Proposta Comercial Cliente XYZ',
    description: 'Proposta comercial que requer aprovação hierárquica com validade jurídica',
  });

  console.log(`✅ Envelope criado: ${envelope.id}\n`);

  // ========================================
  // 2. UPLOAD DO DOCUMENTO (S3)
  // ========================================
  console.log('📄 Passo 2: Fazendo upload do documento para S3...');

  // Em produção, descomente as linhas abaixo:
  // import * as fs from 'fs';
  // const fileBuffer = fs.readFileSync('./proposta-comercial.pdf');
  // const document = await sdk.documents.upload(
  //   envelope.id,
  //   fileBuffer,
  //   'Proposta Comercial - Cliente XYZ'
  // );
  // console.log(`✅ Documento uploaded para S3: ${document.id}\n`);

  // Para este exemplo, simulamos:
  console.log(`✅ Documento seria uploaded para S3 via multipart/form-data\n`);
  const documentId = 'doc-example-id'; // Placeholder para exemplo

  // ========================================
  // 3. ADICIONAR APROVADORES COM PADES
  // ========================================
  console.log('👥 Passo 3: Adicionando aprovadores com PAdES...\n');

  // 🔹 Gerente (primeiro aprovador)
  const gerente = await sdk.signers.create(envelope.id, {
    name: 'Ana Gestora',
    email: 'ana.gestora@empresa.com',
    role: 'APPROVER',
    qualificationType: 'gestor', // ✅ lowercase
    requirePades: true,        // 🆕 Aprovação qualificada com PAdES
    signingOrder: 1,          // ✅ Primeiro a aprovar (renamed from approvalOrder)
    useCertificateId: 'cert-id-gerente', // Certificado específico (opcional)
    notificationPreferences: {
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: false,
    },
  });

  console.log(`   ✅ Gerente adicionado: ${gerente.name}`);
  console.log(`      - Role: APPROVER`);
  console.log(`      - QualificationType: gestor`);
  console.log(`      - requirePades: true ✓`);
  console.log(`      - signingOrder: 1\n`);

  // 🔹 Diretor (segundo aprovador)
  const diretor = await sdk.signers.create(envelope.id, {
    name: 'Carlos Diretor',
    email: 'carlos.diretor@empresa.com',
    role: 'APPROVER',
    qualificationType: 'diretor', // ✅ lowercase
    requirePades: true,        // 🆕 Aprovação qualificada com PAdES
    signingOrder: 2,          // ✅ Segundo a aprovar (renamed from approvalOrder)
    // useCertificateId não especificado = usa certificado da organização
    notificationPreferences: {
      emailEnabled: true,
      smsEnabled: true,
      whatsappEnabled: false,
    },
  });

  console.log(`   ✅ Diretor adicionado: ${diretor.name}`);
  console.log(`      - Role: APPROVER`);
  console.log(`      - QualificationType: diretor`);
  console.log(`      - requirePades: true ✓`);
  console.log(`      - signingOrder: 2`);
  console.log(`      - Usará certificado da organização (default)\n`);

  // ========================================
  // 4. ATIVAR ENVELOPE
  // ========================================
  console.log('🔔 Passo 4: Ativando envelope...');

  await sdk.envelopes.activate(envelope.id);

  console.log(`✅ Envelope ativado!`);
  console.log(`   - Token enviado para: ${gerente.email}`);
  console.log(`   - Aguardando aprovação do gerente...\n`);

  // ========================================
  // 5. SIMULAÇÃO: GERENTE APROVA
  // ========================================
  console.log('✅ Passo 5: Gerente aprova (com PAdES)...');

  // Na prática, o gerente recebe o token por email e usa a UI para aprovar
  // Aqui simulamos o processo:
  /*
  await sdk.approvals.decide(envelope.id, {
    signerId: gerente.id,
    token: '123456',  // Token recebido por email
    decision: 'APPROVED',
    comment: 'Proposta aprovada. Valores dentro do orçamento.',
  });
  */

  console.log(`   ✓ Gerente aprovou`);
  console.log(`   ✓ Stamp visual aplicado`);
  console.log(`   ✓ PAdES digital aplicado automaticamente ← NOVO!`);
  console.log(`   ✓ Certificado usado: cert-id-gerente`);
  console.log(`   → Token enviado para: ${diretor.email}\n`);

  // ========================================
  // 6. SIMULAÇÃO: DIRETOR APROVA
  // ========================================
  console.log('✅ Passo 6: Diretor aprova (com PAdES)...');

  /*
  await sdk.approvals.decide(envelope.id, {
    signerId: diretor.id,
    token: '654321',
    decision: 'APPROVED',
    comment: 'Proposta aprovada. Prosseguir com fechamento.',
  });
  */

  console.log(`   ✓ Diretor aprovou`);
  console.log(`   ✓ Stamp visual aplicado`);
  console.log(`   ✓ PAdES digital aplicado automaticamente ← NOVO!`);
  console.log(`   ✓ Certificado usado: Certificado da organização (default)`);
  console.log(`   ✓ Envelope completado!\n`);

  // ========================================
  // 7. RESULTADO FINAL
  // ========================================
  console.log('📊 Resultado Final:');
  console.log(`   - 2 stamps visuais (gerente + diretor)`);
  console.log(`   - 2 assinaturas PAdES incrementais ✨ NOVO!`);
  console.log(`   - Cada assinatura preserva as anteriores (incremental updates)`);
  console.log(`   - Validade jurídica ICP-Brasil garantida`);
  console.log(`   - Histórico completo de aprovação rastreável`);
  console.log(`   - Compatível com Adobe Reader e validadores ICP-Brasil\n`);

  // ========================================
  // 8. DOWNLOAD DO DOCUMENTO FINAL
  // ========================================
  console.log('💾 Passo 7: Download do documento final...');

  const downloadUrl = await sdk.documents.getDownloadUrl(documentId);

  console.log(`✅ Documento baixado: ${downloadUrl}`);
  console.log(`   - Assinaturas PAdES: 2`);
  console.log(`   - Pronto para envio ao cliente!\n`);
}

/**
 * 🎯 Exemplo Alternativo: Aprovação Rejeitada
 *
 * Demonstra que PAdES NÃO é aplicado quando rejeitado
 */
async function approvalRejectedExample() {
  console.log('🚀 Exemplo: Aprovação Rejeitada (sem PAdES)\n');

  const envelope = await sdk.envelopes.create({
    name: 'Aprovação - Orçamento 2025',
  });

  // Upload para S3 (descomente para usar):
  // const fileBuffer = fs.readFileSync('./orcamento.pdf');
  // const document = await sdk.documents.upload(envelope.id, fileBuffer, 'Orçamento 2025');

  const aprovador = await sdk.signers.create(envelope.id, {
    name: 'João Gestor',
    email: 'joao@empresa.com',
    role: 'APPROVER',
    qualificationType: 'gestor',
    requirePades: true,  // Configurado para PAdES
  });

  await sdk.envelopes.activate(envelope.id);

  console.log('❌ Aprovador REJEITA o documento...');

  /*
  await sdk.approvals.decide(envelope.id, {
    signerId: aprovador.id,
    token: '123456',
    decision: 'REJECTED',
    comment: 'Valores acima do orçamento aprovado.',
  });
  */

  console.log(`   ✓ Stamp visual de REJEIÇÃO aplicado`);
  console.log(`   ✗ PAdES NÃO aplicado (decisão = REJECTED) ← IMPORTANTE!`);
  console.log(`   ✗ Envelope cancelado (blockOnRejection = true)\n`);

  console.log('📊 Resultado:');
  console.log(`   - 1 stamp visual (rejeição)`);
  console.log(`   - 0 assinaturas PAdES`);
  console.log(`   - Envelope status: CANCELED\n`);
}

/**
 * 🎯 Exemplo: Aprovação sem Certificado (usa default da organização)
 */
async function approvalWithOrganizationCertificateExample() {
  console.log('🚀 Exemplo: Aprovação com Certificado da Organização\n');

  const envelope = await sdk.envelopes.create({
    name: 'Aprovação - NDA Cliente ABC',
  });

  // Upload para S3 (descomente para usar):
  // const fileBuffer = fs.readFileSync('./nda.pdf');
  // const document = await sdk.documents.upload(envelope.id, fileBuffer, 'NDA');

  // Aprovador SEM certificado próprio
  const aprovador = await sdk.signers.create(envelope.id, {
    name: 'Maria Gestora',
    email: 'maria@empresa.com',
    role: 'APPROVER',
    qualificationType: 'gestor',
    requirePades: true,
    // useCertificateId: NÃO especificado ← Usará certificado da org
  });

  await sdk.envelopes.activate(envelope.id);

  console.log('✅ Aprovador aprova...');

  /*
  await sdk.approvals.decide(envelope.id, {
    signerId: aprovador.id,
    token: '123456',
    decision: 'APPROVED',
  });
  */

  console.log(`   ✓ Stamp visual aplicado`);
  console.log(`   ✓ PAdES aplicado com certificado da organização ← FALLBACK!`);
  console.log(`   ✓ Certificado usado: defaultCertificateId da OrganizationSettings\n`);

  console.log('💡 Observação:');
  console.log(`   Se a organização não tiver certificado default configurado,`);
  console.log(`   a aprovação falhará com erro descritivo.\n`);
}

/**
 * 📚 Comparação: Aprovação COM e SEM PAdES
 */
function comparisonTable() {
  console.log('📊 Comparação: Aprovação COM vs SEM PAdES\n');

  console.log('┌─────────────────────────────┬───────────────────┬──────────────────────┐');
  console.log('│ Característica              │ requirePades=true │ requirePades=false   │');
  console.log('├─────────────────────────────┼───────────────────┼──────────────────────┤');
  console.log('│ Stamp visual                │ ✅ SIM            │ ✅ SIM               │');
  console.log('│ Assinatura PAdES            │ ✅ SIM (se APPR.) │ ❌ NÃO               │');
  console.log('│ PAdES se rejeitado          │ ❌ NÃO            │ N/A                  │');
  console.log('│ Validade jurídica ICP-BR    │ ✅ SIM            │ ❌ NÃO               │');
  console.log('│ Certificado necessário      │ ✅ SIM            │ ❌ NÃO               │');
  console.log('│ Autenticação adicional      │ ❌ NÃO (só token) │ ❌ NÃO (só token)    │');
  console.log('│ Uso recomendado             │ Contratos, legal  │ Aprovações internas  │');
  console.log('└─────────────────────────────┴───────────────────┴──────────────────────┘\n');
}

/**
 * 🚀 Executar exemplos
 */
async function main() {
  try {
    // Exemplo principal
    await approvalWithPadesExample();

    console.log('\n' + '='.repeat(60) + '\n');

    // Exemplo de rejeição
    await approvalRejectedExample();

    console.log('\n' + '='.repeat(60) + '\n');

    // Exemplo com certificado da organização
    await approvalWithOrganizationCertificateExample();

    console.log('\n' + '='.repeat(60) + '\n');

    // Tabela comparativa
    comparisonTable();

    console.log('✅ Todos os exemplos executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

export {
  approvalWithPadesExample,
  approvalRejectedExample,
  approvalWithOrganizationCertificateExample,
  comparisonTable,
};
