/**
 * Exemplo 13: Validation Layer Workflow (AI-Powered Document Validation)
 *
 * Este exemplo demonstra o uso completo da Validation Layer integrada com IA:
 *
 * **RECURSOS DEMONSTRADOS:**
 * - Novos métodos de autenticação: RG_FRONT, RG_BACK, CNH_FRONT
 * - Upload de documentos com validação automática
 * - Processamento assíncrono com BullMQ
 * - Polling de progresso em tempo real
 * - OCR: Extração de CPF e nome
 * - Biometria: Comparação facial 1:1
 * - Liveness: Detecção de anti-spoofing
 * - Tratamento de erros com códigos detalhados
 * - Gatekeeper: Validação contextual de IP e geolocalização
 *
 * **FLUXOS COBERTOS:**
 * 1. RG Frente + Verso + Selfie (fluxo completo)
 * 2. CNH + Selfie (fluxo simplificado)
 * 3. Tratamento de erros de validação
 * 4. Polling manual e automático
 * 5. Validação contextual (IP/GPS)
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 13: VALIDATION LAYER WORKFLOW ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    // ===========================
    // SETUP: Criar envelope e signatário
    // ===========================
    console.log('========== SETUP ==========\n');

    console.log('1️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato com Validação por IA',
      description: 'Requer documentos validados automaticamente',
    });
    console.log('✅ Envelope criado:', envelope.id);

    console.log('\n2️⃣ Adicionando signatário...');
    const signer = await client.signers.create(envelope.id, {
      name: 'João da Silva',
      email: 'joao@example.com',
      phoneNumber: '+5585987654321',
      documentNumber: '12345678900',
    });
    console.log('✅ Signatário criado:', signer.name, '-', signer.email);

    // ===========================
    // FLUXO 1: RG Frente + Verso + Selfie
    // ===========================
    console.log('\n========== FLUXO 1: VALIDAÇÃO COMPLETA COM RG ==========\n');

    // 1.1 Criar requisitos de autenticação
    console.log('3️⃣ Criando requisitos de autenticação...');

    const rgFrontReq = await client.authentication.create(signer.id, {
      method: 'rgFront',
      description: 'RG Frente (foto do rosto)',
      isRequired: true,
    });
    console.log('✅ RG Frente criado:', rgFrontReq.id);

    const rgBackReq = await client.authentication.create(signer.id, {
      method: 'rgBack',
      description: 'RG Verso (CPF e nome)',
      isRequired: true,
    });
    console.log('✅ RG Verso criado:', rgBackReq.id);

    const selfieReq = await client.authentication.create(signer.id, {
      method: 'selfieWithDocument',
      description: 'Selfie para comparação biométrica e validação por IA',
      isRequired: true,
    });
    console.log('✅ Selfie com Documento criado:', selfieReq.id);

    // 1.2 Upload de documentos (simulado)
    console.log('\n4️⃣ Fazendo upload dos documentos...');

    console.log('   💡 Em produção, você faria:');
    console.log('   const rgFrontFile = fs.readFileSync(\'rg-frente.jpg\');');
    console.log('   const frontUpload = await client.authentication.uploadDocument(rgFrontReq.id, {');
    console.log('     file: rgFrontFile');
    console.log('   });');
    console.log('');
    console.log('   📊 Resposta esperada:');
    console.log('   {');
    console.log('     uploaded: true,');
    console.log('     s3_key: "auth-docs/abc123/rg-front.jpg",');
    console.log('     expires_at: "2025-12-31T23:59:59Z",');
    console.log('     job_id: "AWAITING_OTHER_DOCUMENTS" // Aguardando RG verso');
    console.log('   }');

    console.log('\n   ⚠️ Quando job_id = "AWAITING_OTHER_DOCUMENTS":');
    console.log('   - O sistema aguarda o envio de todas as partes do documento (RG frente + verso)');
    console.log('   - O processamento por IA só inicia após receber TODOS os documentos necessários');

    console.log('\n   💡 Upload do RG verso (dispara processamento):');
    console.log('   const rgBackFile = fs.readFileSync(\'rg-verso.jpg\');');
    console.log('   const backUpload = await client.authentication.uploadDocument(rgBackReq.id, {');
    console.log('     file: rgBackFile');
    console.log('   });');
    console.log('');
    console.log('   📊 Resposta quando todos documentos estão prontos:');
    console.log('   {');
    console.log('     uploaded: true,');
    console.log('     s3_key: "auth-docs/abc123/rg-back.jpg",');
    console.log('     expires_at: "2025-12-31T23:59:59Z",');
    console.log('     job_id: "12345" // BullMQ Job ID - processamento iniciado!');
    console.log('   }');

    // 1.3 Polling de progresso (simulado)
    console.log('\n5️⃣ Consultando progresso de validação...');
    console.log('   💡 Método 1 - Polling manual:');
    console.log('   const progress = await client.authentication.getValidationProgress(rgFrontReq.id);');
    console.log('   console.log(`Status: ${progress.status}`);');
    console.log('   console.log(`Progresso: ${progress.progress}%`);');
    console.log('   console.log(`Etapa atual: ${progress.currentStep}`);');
    console.log('');
    console.log('   📊 Exemplo de resposta (IN_ANALYSIS):');
    console.log('   {');
    console.log('     status: "IN_ANALYSIS",');
    console.log('     progress: 65,');
    console.log('     currentStep: "Comparando biometria facial...",');
    console.log('     estimatedTimeSeconds: 3,');
    console.log('     jobId: "12345",');
    console.log('     canRetry: false');
    console.log('   }');

    console.log('\n   💡 Método 2 - Polling automático:');
    console.log('   const result = await client.authentication.pollValidationProgress(');
    console.log('     rgFrontReq.id,');
    console.log('     { intervalMs: 2000, timeoutMs: 60000 },');
    console.log('     (progress) => {');
    console.log('       console.log(`[${progress.progress}%] ${progress.currentStep}`);');
    console.log('     }');
    console.log('   );');

    // 1.4 Resultados possíveis
    console.log('\n6️⃣ Resultados possíveis após validação:');
    console.log('');
    console.log('   ✅ APROVADO:');
    console.log('   {');
    console.log('     status: "VERIFIED",');
    console.log('     progress: 100,');
    console.log('     currentStep: "Validação concluída com sucesso",');
    console.log('     result: {');
    console.log('       overall_status: "APPROVED",');
    console.log('       confidence_score: 0.98,');
    console.log('       details: {');
    console.log('         face_match: { match: true, similarity: 0.89, threshold: 0.7 },');
    console.log('         liveness: { passed: true, score: 0.95, confidence: 0.92 },');
    console.log('         ocr: {');
    console.log('           passed: true,');
    console.log('           extracted_name: "JOAO DA SILVA",');
    console.log('           extracted_cpf: "123.456.789-00",');
    console.log('           name_match_score: 0.95,');
    console.log('           cpf_match_score: 1.0');
    console.log('         }');
    console.log('       }');
    console.log('     },');
    console.log('     canRetry: false');
    console.log('   }');

    console.log('\n   ❌ REJEITADO (Face Mismatch):');
    console.log('   {');
    console.log('     status: "REJECTED",');
    console.log('     progress: 100,');
    console.log('     currentStep: "Validação rejeitada",');
    console.log('     rejectionCode: "FACE_MISMATCH",');
    console.log('     rejectionMessage: "O rosto na selfie não corresponde à foto do documento",');
    console.log('     rejectionHumanTip: "Certifique-se de que ambas as fotos são da mesma pessoa sob boa iluminação",');
    console.log('     canRetry: true,');
    console.log('     result: {');
    console.log('       overall_status: "REJECTED",');
    console.log('       confidence_score: 0.42,');
    console.log('       details: {');
    console.log('         face_match: { match: false, similarity: 0.42, threshold: 0.7 }');
    console.log('       },');
    console.log('       rejection_reason: "FACE_MISMATCH"');
    console.log('     }');
    console.log('   }');

    // ===========================
    // FLUXO 2: CNH + Selfie (Simplificado)
    // ===========================
    console.log('\n========== FLUXO 2: VALIDAÇÃO SIMPLIFICADA COM CNH ==========\n');

    console.log('7️⃣ Criando requisitos para CNH...');
    console.log('   💡 CNH contém foto, CPF e nome na mesma face (frente)');
    console.log('   💡 Portanto, precisa apenas de CNH_FRONT + SELFIE_WITH_DOCUMENT (2 documentos ao invés de 3)');

    console.log('\n   const cnhReq = await client.authentication.create(signer.id, {');
    console.log('     method: \'cnhFront\',');
    console.log('     description: \'CNH Frente\',');
    console.log('     isRequired: true,');
    console.log('   });');
    console.log('');
    console.log('   const cnhSelfieReq = await client.authentication.create(signer.id, {');
    console.log('     method: \'selfieWithDocument\',');
    console.log('     description: \'Selfie\',');
    console.log('     isRequired: true,');
    console.log('   });');

    console.log('\n8️⃣ Upload da CNH:');
    console.log('   const cnhFile = fs.readFileSync(\'cnh-frente.jpg\');');
    console.log('   await client.authentication.uploadDocument(cnhReq.id, { file: cnhFile });');

    console.log('\n9️⃣ Upload da Selfie (dispara validação):');
    console.log('   const selfieFile = fs.readFileSync(\'selfie.jpg\');');
    console.log('   const upload = await client.authentication.uploadDocument(cnhSelfieReq.id, {');
    console.log('     file: selfieFile');
    console.log('   });');
    console.log('   // Retorna job_id para polling');

    // ===========================
    // FLUXO 3: Tratamento de Erros
    // ===========================
    console.log('\n========== FLUXO 3: TRATAMENTO DE ERROS DE VALIDAÇÃO ==========\n');

    console.log('🔟 Erros de pré-validação (antes do upload):');
    console.log('   try {');
    console.log('     const file = fs.readFileSync(\'imagem-borrada.jpg\');');
    console.log('     await client.authentication.uploadDocument(authReqId, { file });');
    console.log('   } catch (error) {');
    console.log('     if (error.status === 400) {');
    console.log('       console.error(\'Código:\', error.code); // "IMAGE_TOO_BLURRY"');
    console.log('       console.error(\'Mensagem:\', error.message); // "A imagem está desfocada"');
    console.log('       console.error(\'Dica:\', error.errors[0]); // "Segure o celular com firmeza..."');
    console.log('     }');
    console.log('   }');

    console.log('\n   📋 Códigos de erro comuns:');
    console.log('   - IMAGE_TOO_SMALL: Resolução insuficiente');
    console.log('   - IMAGE_TOO_BLURRY: Imagem desfocada');
    console.log('   - IMAGE_POOR_FRAMING: Documento cortado ou mal enquadrado');
    console.log('   - IMAGE_TOO_DARK: Iluminação insuficiente');
    console.log('   - IMAGE_TOO_BRIGHT: Imagem estourada/superexposta');
    console.log('   - NO_FACE_DETECTED: Nenhum rosto encontrado');
    console.log('   - MULTIPLE_FACES_DETECTED: Várias pessoas na foto');
    console.log('   - FACE_TOO_SMALL: Rosto muito pequeno');
    console.log('   - FACE_MISMATCH: Rosto não corresponde ao documento');
    console.log('   - DOC_DATA_MISMATCH: Dados do documento não conferem');
    console.log('   - DOC_NAME_MISMATCH: Nome não corresponde');
    console.log('   - DOC_CPF_MISMATCH: CPF não corresponde');
    console.log('   - POSSIBLE_SPOOF: Possível tentativa de fraude (foto de foto)');
    console.log('   - AI_SERVICE_ERROR: Erro interno no serviço de IA');
    console.log('   - AI_SERVICE_TIMEOUT: Processamento excedeu tempo limite');

    console.log('\n   📚 Consulte docs/validation_layer/ERROR_CODES.md para detalhes completos');

    // ===========================
    // FLUXO 4: Validação Contextual (Gatekeeper)
    // ===========================
    console.log('\n========== FLUXO 4: VALIDAÇÃO CONTEXTUAL (GATEKEEPER) ==========\n');

    console.log('1️⃣1️⃣ Registro de IP e geolocalização:');
    console.log('   const ipLocation = await client.authentication.recordIpLocation(ipAuthReqId, {');
    console.log('     ipAddress: \'189.123.45.67\',');
    console.log('     latitude: -3.7172,  // Fortaleza-CE');
    console.log('     longitude: -38.5433,');
    console.log('     accuracy: 15.5');
    console.log('   });');
    console.log('');
    console.log('   📊 Resposta:');
    console.log('   {');
    console.log('     recorded: true,');
    console.log('     riskFlag: "RISK_SPOOFING", // Se GPS e IP discrepantes > 500km');
    console.log('     message: "Localização GPS está muito distante do IP detectado"');
    console.log('   }');

    console.log('\n   🛡️ Proteções do Gatekeeper:');
    console.log('   - IP Blacklist: Bloqueia IPs conhecidos como maliciosos');
    console.log('   - IP Whitelist: Permite apenas IPs autorizados (modo restritivo)');
    console.log('   - Geofencing: Bloqueia requisições fora de áreas geográficas permitidas');
    console.log('   - Spoofing Detection: Compara GPS do dispositivo com geolocalização do IP');
    console.log('   - Rate Limiting: Previne tentativas de força bruta');

    // ===========================
    // VERIFICAÇÃO DE STATUS
    // ===========================
    console.log('\n========== VERIFICAÇÃO DE STATUS ==========\n');

    console.log('1️⃣2️⃣ Verificando status completo de autenticação:');
    const status = await client.authentication.getStatus(signer.id);

    console.log('✅ Status recuperado:');
    console.log('   Signatário ID:', status.signerId);
    console.log('   Todas satisfeitas?', status.allSatisfied ? '✅ SIM' : '❌ NÃO');
    console.log('   Total de requisitos:', status.requirements.length);

    console.log('\n   Detalhes dos requisitos:');
    status.requirements.forEach((req, idx) => {
      const icon = req.isSatisfied ? '✅' : '⏳';
      const required = req.isRequired ? '[OBRIGATÓRIO]' : '[OPCIONAL]';
      console.log(`   ${icon} ${idx + 1}. ${req.method} ${required}`);
      console.log(`      Status: ${req.isSatisfied ? 'Satisfeito' : 'Pendente'}`);

      // Mostrar status de validação se disponível
      if (req.validationStatus) {
        console.log(`      Validação: ${req.validationStatus}`);
        if (req.validationResult) {
          console.log(`      Confiança: ${req.validationResult.confidence_score}`);
        }
        if (req.rejectionReason) {
          console.log(`      Motivo da rejeição: ${req.rejectionReason}`);
        }
      }
    });

    // ===========================
    // RESUMO FINAL
    // ===========================
    console.log('\n========== RESUMO COMPLETO ==========');
    console.log('');
    console.log('📋 Recursos da Validation Layer demonstrados:');
    console.log('   ✅ Novos métodos: RG_FRONT, RG_BACK, CNH_FRONT');
    console.log('   ✅ Upload de documentos com validação');
    console.log('   ✅ Processamento assíncrono (BullMQ)');
    console.log('   ✅ Polling de progresso (manual e automático)');
    console.log('   ✅ OCR: Extração de CPF e nome');
    console.log('   ✅ Biometria: Comparação facial 1:1');
    console.log('   ✅ Liveness: Detecção de anti-spoofing');
    console.log('   ✅ Quality Check: Análise de nitidez e iluminação');
    console.log('   ✅ 15+ códigos de erro detalhados');
    console.log('   ✅ Gatekeeper: IP/GPS validation');

    console.log('\n🎯 Comparação de Fluxos:');
    console.log('   RG:  3 documentos (RG_FRONT + RG_BACK + SELFIE)');
    console.log('   CNH: 2 documentos (CNH_FRONT + SELFIE)');

    console.log('\n⏱️ Tempo de processamento típico:');
    console.log('   - Pré-validação (qualidade): < 1 segundo');
    console.log('   - OCR (extração de texto): 2-3 segundos');
    console.log('   - Face Detection: 1-2 segundos');
    console.log('   - Biometria (comparação): 2-4 segundos');
    console.log('   - Liveness (anti-spoofing): 2-3 segundos');
    console.log('   - TOTAL: ~8-12 segundos');

    console.log('\n📊 Estados de validação:');
    console.log('   PENDING → IN_ANALYSIS → VERIFIED / REJECTED');
    console.log('   ├─ PENDING: Aguardando upload ou processamento');
    console.log('   ├─ IN_ANALYSIS: IA processando (polling ativo)');
    console.log('   ├─ VERIFIED: Aprovado ✅');
    console.log('   └─ REJECTED: Rejeitado ❌ (com código de erro detalhado)');

    console.log('\n🔗 Links úteis:');
    console.log('   - Códigos de erro: docs/validation_layer/ERROR_CODES.md');
    console.log('   - Implementação: docs/validation_layer/IMPLEMENTATION_STATUS.md');
    console.log('   - Plano de integração: docs/validation_layer/SDK_INTEGRATION_PLAN.md');

    console.log('\n✨ Validation Layer workflow COMPLETO demonstrado!');
    console.log('💡 Em produção:');
    console.log('   1. Implemente UI para captura de documentos (câmera)');
    console.log('   2. Mostre preview antes de enviar');
    console.log('   3. Exiba progresso em tempo real (barra de progresso)');
    console.log('   4. Trate erros com mensagens amigáveis (use humanTip)');
    console.log('   5. Permita retry em caso de rejeição');
    console.log('   6. Limite tentativas para prevenir abuso (3-5 tentativas)');

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
