/**
 * Example 14: OFFICIAL_DOCUMENT with Flexible Document Type (RG or CNH)
 *
 * 🆕 FASE 10: Demonstra o uso de OFFICIAL_DOCUMENT com metadados que permitem
 * ao assinante escolher entre RG ou CNH, oferecendo máxima flexibilidade.
 *
 * Fluxos suportados:
 * 1. RG: 3 uploads (RG Frente + RG Verso + Selfie)
 * 2. CNH: 2 uploads (CNH Frente + Selfie)
 * 3. Auto: Detecção automática (backward compatibility)
 *
 * Vantagens:
 * - Advogado não precisa se preocupar com qual documento o assinante tem
 * - Assinante tem liberdade de escolher o documento mais conveniente
 * - Validação biométrica e OCR funcionam para ambos
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // 1. Inicializar cliente
  const client = new SignatureClient({
    apiKey: process.env.API_KEY || 'your-api-key',
    baseURL: process.env.API_URL || 'http://localhost:3000',
  });

  console.log('🚀 Iniciando fluxo com OFFICIAL_DOCUMENT flexível...\n');

  // =====================================================================
  // PARTE 1: Advogado cria o envelope (não se preocupa com qual documento)
  // =====================================================================

  console.log('📋 Passo 1: Advogado cria envelope...');

  const envelope = await client.envelopes.create({
    name: 'Contrato de Prestação de Serviços',
    description: 'Contrato que aceita RG ou CNH do assinante',
  });

  console.log(`✅ Envelope criado: ${envelope.id}\n`);

  // Adicionar documento ao envelope
  const pdfPath = path.join(__dirname, '../test-files/pdfs/contrato.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);

  const document = await client.documents.create(envelope.id, {
    name: 'contrato.pdf',
    content: pdfBuffer.toString('base64'),
    contentType: 'application/pdf',
    fileSize: pdfBuffer.length,
  });

  // Adicionar signatário
  const signer = await client.signers.create(envelope.id, {
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    phoneNumber: '+5585999999999',
    documentNumber: '01234567890', // CPF
    signatureOrder: 1,
  });

  console.log(`✅ Signatário adicionado: ${signer.name}\n`);

  // =====================================================================
  // PARTE 2: Configurar OFFICIAL_DOCUMENT (flexível - aceita RG ou CNH)
  // =====================================================================

  console.log('📝 Passo 2: Configurar requisito OFFICIAL_DOCUMENT (flexível)...');

  const docReq = await client.authentication.create(signer.id, {
    method: 'officialDocument',  // 🆕 Flexível - aceita RG ou CNH
    description: 'Documento pessoal (RG ou CNH)',
    isRequired: true,
  });

  const selfieReq = await client.authentication.create(signer.id, {
    method: 'selfie',  // Recomendado (mais moderno que 'selfieWithDocument')
    description: 'Selfie para validação biométrica',
    isRequired: true,
  });

  console.log(`✅ Requisitos criados: OFFICIAL_DOCUMENT + SELFIE\n`);

  // =====================================================================
  // CENÁRIO A: Assinante escolhe usar CNH (mais rápido - 2 uploads)
  // =====================================================================

  console.log('📸 Cenário A: Assinante escolhe CNH...\n');

  // A.1 - Upload da CNH frente (1 único upload)
  console.log('  📤 Enviando CNH frente...');

  const cnhPath = path.join(__dirname, '../test-files/images/documentos/cnh.jpeg');
  const cnhBuffer = fs.readFileSync(cnhPath);

  const cnhUpload = await client.authentication.uploadDocument(docReq.id, {
    file: cnhBuffer,
    documentType: 'CNH',  // 🆕 FASE 10: Especifica que é CNH
    // documentPart não é necessário para CNH (só tem frente)
  });

  console.log(`  ✅ CNH enviada! S3 Key: ${cnhUpload.s3Key}`);
  console.log(`  ⏳ Status: ${cnhUpload.jobId}\n`);

  // A.2 - Upload da selfie
  console.log('  📤 Enviando selfie...');

  const selfiePath = path.join(__dirname, '../test-files/images/selfies/selfie.jpeg');
  const selfieBuffer = fs.readFileSync(selfiePath);

  const selfieUpload = await client.authentication.uploadDocument(selfieReq.id, {
    file: selfieBuffer,
    // Não precisa de metadados para selfie
  });

  console.log(`  ✅ Selfie enviada! S3 Key: ${selfieUpload.s3Key}`);
  console.log(`  🔄 Job ID: ${selfieUpload.jobId}\n`);

  // A.3 - Fazer polling do progresso
  console.log('  ⏳ Aguardando validação por IA...\n');

  const result = await client.authentication.pollValidationProgress(
    docReq.id,
    {
      intervalMs: 2000,
      timeoutMs: 60000,
    },
    (progress) => {
      console.log(`     [${progress.progress}%] ${progress.currentStep}`);
    }
  );

  if (result.status === 'VERIFIED') {
    console.log('\n  ✅ CNH validada com sucesso!');
    console.log(`     - Confiança: ${(result.result!.confidence_score * 100).toFixed(1)}%`);
    console.log(`     - Face match: ${(result.result!.details.face_match!.similarity * 100).toFixed(1)}%`);
    console.log(`     - Liveness: ${(result.result!.details.liveness!.score * 100).toFixed(1)}%\n`);
  } else {
    console.log(`\n  ❌ Validação rejeitada: ${result.rejectionMessage}`);
    console.log(`     Dica: ${result.rejectionHumanTip}\n`);
    return;
  }

  // =====================================================================
  // CENÁRIO B: Assinante escolhe usar RG (3 uploads)
  // =====================================================================

  console.log('📸 Cenário B: Assinante escolhe RG...\n');

  // B.1 - Upload do RG frente
  console.log('  📤 Enviando RG frente...');

  const rgFrentePath = path.join(__dirname, '../test-files/images/documentos/rg-frente.jpeg');
  const rgFrenteBuffer = fs.readFileSync(rgFrentePath);

  const rgFrontUpload = await client.authentication.uploadDocument(docReq.id, {
    file: rgFrenteBuffer,
    documentType: 'RG',       // 🆕 FASE 10: Especifica que é RG
    documentPart: 'FRONT',    // 🆕 FASE 10: Especifica que é a frente
  });

  console.log(`  ✅ RG frente enviado! S3 Key: ${rgFrontUpload.s3Key}`);
  console.log(`  ⏳ Status: ${rgFrontUpload.jobId} (aguardando verso)\n`);

  // B.2 - Upload do RG verso
  console.log('  📤 Enviando RG verso...');

  const rgVersoPath = path.join(__dirname, '../test-files/images/documentos/rg-verso.jpeg');
  const rgVersoBuffer = fs.readFileSync(rgVersoPath);

  const rgBackUpload = await client.authentication.uploadDocument(docReq.id, {
    file: rgVersoBuffer,
    documentType: 'RG',       // 🆕 FASE 10: Especifica que é RG
    documentPart: 'BACK',     // 🆕 FASE 10: Especifica que é o verso
  });

  console.log(`  ✅ RG verso enviado! S3 Key: ${rgBackUpload.s3Key}`);
  console.log(`  ⏳ Status: ${rgBackUpload.jobId} (aguardando selfie)\n`);

  // B.3 - Upload da selfie (já foi feito em A.2, mas vou simular aqui)
  console.log('  📤 Enviando selfie...');

  const selfieUpload2 = await client.authentication.uploadDocument(selfieReq.id, {
    file: selfieBuffer,
  });

  console.log(`  ✅ Selfie enviada! S3 Key: ${selfieUpload2.s3Key}`);
  console.log(`  🔄 Job ID: ${selfieUpload2.jobId}\n`);

  // B.4 - Fazer polling do progresso
  console.log('  ⏳ Aguardando validação por IA...\n');

  const result2 = await client.authentication.pollValidationProgress(
    docReq.id,
    {
      intervalMs: 2000,
      timeoutMs: 60000,
    },
    (progress) => {
      console.log(`     [${progress.progress}%] ${progress.currentStep}`);
    }
  );

  if (result2.status === 'VERIFIED') {
    console.log('\n  ✅ RG validado com sucesso!');
    console.log(`     - Confiança: ${(result2.result!.confidence_score * 100).toFixed(1)}%`);
    console.log(`     - Face match: ${(result2.result!.details.face_match!.similarity * 100).toFixed(1)}%`);
    console.log(`     - Liveness: ${(result2.result!.details.liveness!.score * 100).toFixed(1)}%\n`);
  } else {
    console.log(`\n  ❌ Validação rejeitada: ${result2.rejectionMessage}`);
    console.log(`     Dica: ${result2.rejectionHumanTip}\n`);
    return;
  }

  // =====================================================================
  // CENÁRIO C: Backward Compatibility - Detecção Automática
  // =====================================================================

  console.log('📸 Cenário C: Detecção automática (sem metadados)...\n');

  const docReq3 = await client.authentication.create(signer.id, {
    method: 'officialDocument',
    description: 'Documento pessoal (auto-detect)',
    isRequired: true,
  });

  const autoUpload = await client.authentication.uploadDocument(docReq3.id, {
    file: cnhBuffer,
    // Sem documentType nem documentPart - sistema detecta automaticamente
  });

  console.log(`  ✅ Documento enviado (auto-detect)! S3 Key: ${autoUpload.s3Key}`);
  console.log(`  🔄 Job ID: ${autoUpload.jobId}`);
  console.log(`  ⚠️  Aviso: Detecção automática pode ser menos precisa que especificar o tipo.\n`);

  // =====================================================================
  // COMPARAÇÃO DOS CENÁRIOS
  // =====================================================================

  console.log('📊 Comparação dos Cenários:\n');
  console.log('┌─────────────┬──────────┬────────────┬─────────────────────┐');
  console.log('│ Cenário     │ Uploads  │ Tempo      │ Recomendação        │');
  console.log('├─────────────┼──────────┼────────────┼─────────────────────┤');
  console.log('│ CNH         │ 2        │ ~8-12s     │ ⭐⭐⭐⭐⭐ Mais rápido │');
  console.log('│ RG          │ 3        │ ~10-14s    │ ⭐⭐⭐⭐ Completo     │');
  console.log('│ Auto-detect │ 1-2      │ ~8-14s     │ ⭐⭐⭐ Compatibilidade │');
  console.log('└─────────────┴──────────┴────────────┴─────────────────────┘\n');

  console.log('✅ Fluxo completo demonstrado com sucesso!\n');

  // =====================================================================
  // RECOMENDAÇÕES PARA IMPLEMENTAÇÃO
  // =====================================================================

  console.log('💡 Recomendações para Implementação:\n');
  console.log('1. UI de Escolha: Ofereça ao usuário a opção de escolher RG ou CNH');
  console.log('2. Preferência CNH: Recomende CNH quando possível (mais rápido)');
  console.log('3. Orientação Visual: Mostre exemplos de como tirar as fotos');
  console.log('4. Validação Cliente: Valide qualidade da imagem antes de enviar');
  console.log('5. Feedback Rico: Use o polling para mostrar progresso em tempo real');
  console.log('6. Retry Amigável: Permita retry com dicas específicas em caso de rejeição\n');

  console.log('🎯 Para mais informações, consulte:\n');
  console.log('   - docs/fluxo-autenticacao-documentos-pessoais.md');
  console.log('   - sdk/README.md (seção Authentication)');
}

main().catch(console.error);
