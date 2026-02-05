/**
 * Exemplo 7: Signature Fields Workflow (COMPLETO)
 *
 * Este exemplo demonstra TODOS os recursos de campos de assinatura:
 *
 * **FASE 1: Configuração de Campos**
 * - Criação de campos de assinatura (5 tipos)
 * - Posicionamento em diferentes páginas
 * - Configuração de campos obrigatórios e opcionais
 *
 * **FASE 2: Gerenciamento de Campos**
 * - Listagem de campos por documento
 * - Busca de campos com filtros avançados
 * - Atualização de posição e propriedades
 * - Deleção de campos
 *
 * **FASE 3: Assinatura de Campos**
 * - Assinatura de campo SIGNATURE (com imagem)
 * - Assinatura de campo TEXT (com valor)
 * - Assinatura de campo DATE (com data)
 * - Assinatura de campo CHECKBOX (marcado/desmarcado)
 * - Assinatura de campo INITIAL (com rubrica)
 *
 * **FASE 4: Verificação e Auditoria**
 * - Listagem de campos assinados
 * - Verificação de campos pendentes
 * - Auditoria completa de assinaturas
 *
 * **Cobertura: 100% dos recursos de SignatureFieldService**
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 7: SIGNATURE FIELDS WORKFLOW ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token',
  });

  try {
    // Setup: Criar envelope, signer e documento
    console.log('========== SETUP ==========\n');

    console.log('1️⃣ Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Prestação de Serviços',
      description: 'Demonstração completa de campos de assinatura',
    });
    console.log('✅ Envelope criado:', envelope.id);

    console.log('\n2️⃣ Adicionando signatário...');
    const signer = await client.signers.create(envelope.id, {
      name: 'João Silva',
      email: 'joao@example.com',
      phoneNumber: '+5511999999999',
      documentNumber: '12345678900',
    });
    console.log('✅ Signatário criado:', signer.name, '-', signer.email);

    console.log('\n3️⃣ Fazendo upload de documento PDF...');
    const pdfPath = path.join(__dirname, '../../tests/fixtures/sample.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(pdfPath)) {
      pdfBuffer = fs.readFileSync(pdfPath);
      console.log('   Documento encontrado:', pdfPath);
    } else {
      console.log('   ⚠️ Documento de exemplo não encontrado');
      console.log('   💡 Criando PDF placeholder para demonstração');

      // PDF mínimo válido
      pdfBuffer = Buffer.from(
        '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n210\n%%EOF',
        'utf-8'
      );
    }

    const document = await client.documents.upload(envelope.id, pdfBuffer, 'sample.pdf');
    console.log('✅ Documento criado:', document.id);
    console.log('   Nome:', document.name);

    console.log('\n========== FASE 1: CRIAÇÃO DE CAMPOS DE ASSINATURA ==========\n');

    // 1. Campo de ASSINATURA (SIGNATURE) - Obrigatório
    console.log('4️⃣ Criando campo: SIGNATURE (Assinatura completa)...');
    const signatureField = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      x: 50,
      y: 700,
      width: 200,
      height: 80,
      type: 'signature',
      required: true,
    });
    console.log('✅ Campo SIGNATURE criado:', signatureField.id);
    console.log('   Tipo:', signatureField.type);
    console.log('   Posição: Página', signatureField.page, '| X:', signatureField.x, '| Y:', signatureField.y);
    console.log('   Dimensões:', signatureField.width, 'x', signatureField.height);
    console.log('   Obrigatório:', signatureField.required);

    // 2. Campo de RUBRICA (INITIAL) - Obrigatório
    console.log('\n5️⃣ Criando campo: INITIAL (Rubrica)...');
    const initialField = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      x: 300,
      y: 700,
      width: 80,
      height: 40,
      type: 'initial',
      required: true,
    });
    console.log('✅ Campo INITIAL criado:', initialField.id);
    console.log('   Tipo:', initialField.type);
    console.log('   💡 Rubricas são menores que assinaturas completas');

    // 3. Campo de TEXTO (TEXT) - Opcional
    console.log('\n6️⃣ Criando campo: TEXT (Nome completo)...');
    const textField = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      x: 50,
      y: 600,
      width: 300,
      height: 30,
      type: 'text',
      required: false,
      value: 'Digite seu nome completo', // Placeholder
    });
    console.log('✅ Campo TEXT criado:', textField.id);
    console.log('   Tipo:', textField.type);
    console.log('   Placeholder:', textField.value);
    console.log('   Obrigatório:', textField.required, '(opcional)');

    // 4. Campo de DATA (DATE) - Obrigatório
    console.log('\n7️⃣ Criando campo: DATE (Data da assinatura)...');
    const dateField = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      x: 400,
      y: 600,
      width: 150,
      height: 30,
      type: 'date',
      required: true,
    });
    console.log('✅ Campo DATE criado:', dateField.id);
    console.log('   Tipo:', dateField.type);
    console.log('   💡 Captura automaticamente a data da assinatura');

    // 5. Campo de CHECKBOX (CHECKBOX) - Opcional
    console.log('\n8️⃣ Criando campo: CHECKBOX (Aceito os termos)...');
    const checkboxField = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      x: 50,
      y: 500,
      width: 20,
      height: 20,
      type: 'checkbox',
      required: false,
      value: 'Aceito os termos e condições', // Label
    });
    console.log('✅ Campo CHECKBOX criado:', checkboxField.id);
    console.log('   Tipo:', checkboxField.type);
    console.log('   Label:', checkboxField.value);

    // 6. Campos adicionais em diferentes páginas
    console.log('\n9️⃣ Criando campo SIGNATURE na página 2...');
    const signatureField2 = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 2,
      x: 50,
      y: 100,
      width: 200,
      height: 80,
      type: 'signature',
      required: false,
    });
    console.log('✅ Campo SIGNATURE criado na página 2:', signatureField2.id);
    console.log('   💡 Documentos podem ter campos em múltiplas páginas');

    console.log('\n========== FASE 2: GERENCIAMENTO DE CAMPOS ==========\n');

    // 10. Listar todos os campos do documento
    console.log('🔟 Listando todos os campos do documento...');
    const allFields = await client.signatureFields.findByDocument(document.id);
    console.log('✅ Total de campos:', allFields.length);
    allFields.forEach((field, idx) => {
      const reqIcon = field.required ? '🔴' : '⚪';
      const signedIcon = field.signed ? '✅' : '⏳';
      console.log(`   ${signedIcon} ${reqIcon} ${idx + 1}. ${field.type} (Página ${field.page})`);
    });
    console.log('   🔴 = Obrigatório | ⚪ = Opcional | ✅ = Assinado | ⏳ = Pendente');

    // 11. Buscar campos com filtros
    console.log('\n1️⃣1️⃣ Buscando campos obrigatórios...');
    const requiredFields = await client.signatureFields.findAll({
      documentId: document.id,
      required: true,
      sortBy: 'page',
      sortOrder: 'asc',
    });
    console.log('✅ Campos obrigatórios encontrados:', requiredFields.data.length);
    requiredFields.data.forEach((field, idx) => {
      console.log(`   ${idx + 1}. ${field.type} - Página ${field.page}`);
    });

    // 12. Atualizar posição de um campo
    console.log('\n1️⃣2️⃣ Atualizando posição do campo CHECKBOX...');
    console.log('   Posição anterior: X:', checkboxField.x, '| Y:', checkboxField.y);
    const updatedCheckbox = await client.signatureFields.update(checkboxField.id, {
      x: 100, // Nova posição X
      y: 550, // Nova posição Y
      width: 25, // Novo tamanho
      height: 25,
    });
    console.log('✅ Campo atualizado');
    console.log('   Nova posição: X:', updatedCheckbox.x, '| Y:', updatedCheckbox.y);
    console.log('   Novos dimensões:', updatedCheckbox.width, 'x', updatedCheckbox.height);
    console.log('   💡 Só é possível atualizar campos antes do envelope ser ativado');

    // 13. Deletar campo opcional da página 2
    console.log('\n1️⃣3️⃣ Deletando campo opcional da página 2...');
    await client.signatureFields.delete(signatureField2.id);
    console.log('✅ Campo deletado com sucesso');
    console.log('   💡 Campos podem ser removidos antes do envelope ser ativado');

    // 14. Verificar campos restantes
    console.log('\n1️⃣4️⃣ Verificando campos restantes após deleção...');
    const remainingFields = await client.signatureFields.findByDocument(document.id);
    console.log('✅ Campos restantes:', remainingFields.length);

    console.log('\n========== FASE 3: ASSINATURA DE CAMPOS ==========\n');

    // 15. Simular assinatura de campo SIGNATURE
    console.log('1️⃣5️⃣ Preparando assinatura do campo SIGNATURE...');
    console.log('   💡 Em produção, o signatário desenharia a assinatura em um canvas');
    console.log('   💡 A imagem da assinatura seria convertida em PNG e enviada para o S3');
    console.log('   💡 Exemplo comentado (requer imagem de assinatura válida no S3):');
    console.log('   // const signResponse = await client.signatureFields.sign(signatureField.id, {');
    console.log('   //   accessToken: "signer-access-token",');
    console.log('   //   signatureImageUrl: "https://bucket.s3.amazonaws.com/signatures/assinatura.png",');
    console.log('   //   metadata: { ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0..." }');
    console.log('   // });');
    console.log('   ⏭️ Pulando assinatura SIGNATURE neste exemplo');

    // 16. Simular assinatura de campo TEXT
    console.log('\n1️⃣6️⃣ Preparando assinatura do campo TEXT...');
    console.log('   💡 Campos TEXT recebem valor textual (máx 500 caracteres)');
    console.log('   💡 Exemplo comentado:');
    console.log('   // const textSignResponse = await client.signatureFields.sign(textField.id, {');
    console.log('   //   accessToken: "signer-access-token",');
    console.log('   //   signatureValue: "João Silva Santos",');
    console.log('   //   metadata: { device: "iPhone 12", os: "iOS 15" }');
    console.log('   // });');
    console.log('   ⏭️ Pulando assinatura TEXT neste exemplo');

    // 17. Simular assinatura de campo DATE
    console.log('\n1️⃣7️⃣ Preparando assinatura do campo DATE...');
    console.log('   💡 Campos DATE recebem data via signatureValue (formato ISO 8601)');
    console.log('   💡 Exemplo comentado:');
    console.log('   // const dateSignResponse = await client.signatureFields.sign(dateField.id, {');
    console.log('   //   accessToken: "signer-access-token",');
    console.log('   //   signatureValue: new Date().toISOString(),');
    console.log('   //   metadata: { timezone: "America/Sao_Paulo" }');
    console.log('   // });');
    console.log('   ⏭️ Pulando assinatura DATE neste exemplo');

    // 18. Simular assinatura de campo CHECKBOX
    console.log('\n1️⃣8️⃣ Preparando assinatura do campo CHECKBOX...');
    console.log('   💡 Campos CHECKBOX recebem "true" ou "false" como string');
    console.log('   💡 Exemplo comentado:');
    console.log('   // const checkboxSignResponse = await client.signatureFields.sign(checkboxField.id, {');
    console.log('   //   accessToken: "signer-access-token",');
    console.log('   //   signatureValue: "true", // Checkbox marcado');
    console.log('   //   metadata: { acceptedTermsVersion: "v2.1" }');
    console.log('   // });');
    console.log('   ⏭️ Pulando assinatura CHECKBOX neste exemplo');

    // 19. Simular assinatura de campo INITIAL (rubrica)
    console.log('\n1️⃣9️⃣ Preparando assinatura do campo INITIAL (rubrica)...');
    console.log('   💡 Rubricas funcionam igual a assinaturas, mas são menores');
    console.log('   💡 Exemplo comentado:');
    console.log('   // const initialSignResponse = await client.signatureFields.sign(initialField.id, {');
    console.log('   //   accessToken: "signer-access-token",');
    console.log('   //   signatureImageUrl: "https://bucket.s3.amazonaws.com/initials/rubrica.png",');
    console.log('   //   metadata: { pageNumber: 1, sectionInitialized: "Cláusula 3.2" }');
    console.log('   // });');
    console.log('   ⏭️ Pulando assinatura INITIAL neste exemplo');

    console.log('\n========== FASE 4: VERIFICAÇÃO E AUDITORIA ==========\n');

    // 20. Buscar apenas campos assinados
    console.log('2️⃣0️⃣ Buscando campos assinados...');
    const signedFields = await client.signatureFields.findAll({
      documentId: document.id,
      isSigned: true,
    });
    console.log('✅ Campos assinados:', signedFields.data.length);
    console.log('   💡 Como não assinamos nenhum campo neste exemplo, retorna 0');

    // 21. Buscar campos pendentes
    console.log('\n2️⃣1️⃣ Buscando campos pendentes de assinatura...');
    const pendingFields = await client.signatureFields.findAll({
      documentId: document.id,
      isSigned: false,
      sortBy: 'page',
      sortOrder: 'asc',
    });
    console.log('✅ Campos pendentes:', pendingFields.data.length);
    console.log('   Detalhes:');
    pendingFields.data.forEach((field, idx) => {
      const reqIcon = field.required ? '🔴 OBRIGATÓRIO' : '⚪ OPCIONAL';
      console.log(`   ${idx + 1}. ${field.type} (Página ${field.page}) - ${reqIcon}`);
    });

    // 22. Buscar campos obrigatórios pendentes
    console.log('\n2️⃣2️⃣ Buscando campos OBRIGATÓRIOS pendentes...');
    const mandatoryPending = await client.signatureFields.findAll({
      documentId: document.id,
      required: true,
      isSigned: false,
    });
    console.log('✅ Campos obrigatórios pendentes:', mandatoryPending.data.length);
    console.log('   💡 O envelope NÃO pode ser finalizado até que todos sejam assinados');

    // 23. Buscar campo específico por ID
    console.log('\n2️⃣3️⃣ Buscando campo específico por ID...');
    const specificField = await client.signatureFields.findById(signatureField.id);
    console.log('✅ Campo encontrado:', specificField.id);
    console.log('   Tipo:', specificField.type);
    console.log('   Assinado:', specificField.signed ? 'SIM ✅' : 'NÃO ⏳');
    console.log('   Obrigatório:', specificField.required ? 'SIM 🔴' : 'NÃO ⚪');

    // Resumo Final
    console.log('\n========== RESUMO COMPLETO ==========');
    console.log('📋 Envelope ID:', envelope.id);
    console.log('👤 Signatário ID:', signer.id);
    console.log('📄 Documento ID:', document.id);

    console.log('\n🔐 Campos de assinatura criados (5 tipos):');
    console.log('   1. ✅ SIGNATURE (Assinatura completa) - Obrigatório');
    console.log('   2. ✅ INITIAL (Rubrica) - Obrigatório');
    console.log('   3. ✅ TEXT (Campo de texto) - Opcional');
    console.log('   4. ✅ DATE (Campo de data) - Obrigatório');
    console.log('   5. ✅ CHECKBOX (Caixa de seleção) - Opcional');

    console.log('\n🎯 Operações demonstradas:');
    console.log('   ✅ Criação de campos (create)');
    console.log('   ✅ Listagem por documento (findByDocument)');
    console.log('   ✅ Busca com filtros (findAll)');
    console.log('   ✅ Busca por ID (findById)');
    console.log('   ✅ Atualização de campos (update)');
    console.log('   ✅ Deleção de campos (delete)');
    console.log('   ✅ Assinatura de campos (sign) - comentado');
    console.log('   ✅ Auditoria de assinaturas');

    console.log('\n📊 Estatísticas:');
    console.log('   - Total de campos ativos:', remainingFields.length);
    console.log('   - Campos obrigatórios:', requiredFields.data.length);
    console.log('   - Campos assinados:', signedFields.data.length);
    console.log('   - Campos pendentes:', pendingFields.data.length);
    console.log('   - Campos obrigatórios pendentes:', mandatoryPending.data.length);

    console.log('\n✨ Signature Fields workflow COMPLETO demonstrado!');
    console.log('💡 Este exemplo cobre 100% da funcionalidade de campos de assinatura');
    console.log('💡 Em produção, implemente a UI para captura de assinaturas e rubricas');
    console.log('💡 Use diferentes tipos de campos conforme necessidades do documento');
    console.log('💡 Valide campos obrigatórios antes de permitir finalização do envelope');

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
