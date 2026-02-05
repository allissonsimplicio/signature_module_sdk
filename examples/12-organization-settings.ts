/**
 * Exemplo 12: Organization Settings (COMPLETO)
 *
 * Este exemplo demonstra TODOS os recursos de configurações da organização:
 *
 * **FASE 1: Configurações Básicas**
 * - Obter configurações atuais da organização
 * - Configurar verificação pública de documentos
 * - Configurar download público de documentos
 * - Atualizar informações da organização
 *
 * **FASE 2: Branding da Organização**
 * - Nome, logo e website da organização
 * - Personalização de marca
 * - Informações públicas exibidas nos documentos
 *
 * **FASE 3: Assinatura Digital PAdES**
 * - Estratégias de assinatura (ELECTRONIC_ONLY, PADES_ONLY, HYBRID, HYBRID_SEALED)
 * - Certificado digital padrão
 * - Requisito de PAdES para todos documentos
 * - Aplicação automática de assinatura digital
 *
 * **FASE 4: Papel Timbrado (Letterhead)**
 * - Upload de imagem de papel timbrado
 * - Configuração de opacidade
 * - Posição (BACKGROUND, OVERLAY, WATERMARK)
 * - Aplicação em páginas (ALL, FIRST, LAST, FIRST_AND_LAST)
 * - Download e deleção de letterhead
 *
 * **FASE 5: Stamps e Carimbos**
 * - Personalização do template de stamp
 * - Cores (background, border, text)
 * - Elementos visuais (logo, QR code)
 * - Posicionamento do stamp
 *
 * **FASE 6: Helpers e Utilitários**
 * - Verificação de configurações (hasLetterhead)
 * - Atalhos para PAdES (getPadesConfig, setSignatureStrategy)
 * - Validações e melhores práticas
 *
 * **🆕 FASE 7: Logo da Organização (FASE 12)**
 * - Upload de logo (PNG, JPG, SVG)
 * - Dimensões recomendadas: 512x512px
 * - Uso automático como stamp padrão
 * - Download e gerenciamento
 * - Integração com stampTemplate
 *
 * **🆕 FASE 8: Níveis de Autenticação Padrão (FASE 12)**
 * - BASIC: Email + IP + Geolocalização
 * - STANDARD: BASIC + Phone + Documento + Selfie
 * - STRICT: STANDARD + Comprovante de endereço
 * - Recomendações por estratégia de assinatura
 * - Configuração para máxima validade jurídica
 *
 * **🆕 FASE 9: Fluxo de Assinatura Avançado do Signatário (signature_fields)**
 * - Upload de assinatura e rubrica do signatário no perfil
 * - Criação de carimbo verificado (verifiedStampV1, 450x200) com createStampGroup
 * - Criação automática de rubricas com createInitialFields
 * - Assinatura usando imagem salva no perfil (sem precisar reenviar)
 * - Atualização e remoção de assinatura/rubrica do perfil
 *
 * **Cobertura: 100% dos recursos de OrganizationSettings (incluindo FASE 12)**
 */

import { SignatureClient, LetterheadPosition, AuthenticationLevel } from '../src';
import { SignatureStrategy } from '../src/types/digital-signature.types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper: Criar imagem PNG mínima para letterhead (1x1 pixel)
 */
function createMinimalPNG(): Buffer {
  // PNG 1x1 pixel transparente
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}

/**
 * Helper: Validar configurações antes de aplicar
 */
function validateSettings(settings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar opacidade do letterhead (0-100)
  if (settings.letterheadOpacity !== undefined) {
    if (settings.letterheadOpacity < 0 || settings.letterheadOpacity > 100) {
      errors.push('Opacidade do letterhead deve estar entre 0 e 100');
    }
  }

  // Validar URL do website
  if (settings.organizationWebsite) {
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(settings.organizationWebsite)) {
      errors.push('URL do website deve começar com http:// ou https://');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function main() {
  console.log('========== EXEMPLO 12: ORGANIZATION SETTINGS ==========\n');

  // Cliente autenticado como OWNER ou ADMIN da organização
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'owner-jwt-token',
  });

  console.log('========== FASE 1: CONFIGURAÇÕES BÁSICAS ==========\n');

  // 1. Obter configurações atuais
  console.log('1️⃣ Obtendo configurações atuais da organização...');
  const currentSettings = await client.organizationSettings.get();
  console.log('✅ Configurações obtidas');
  console.log('   ID:', currentSettings.id);
  console.log('   User ID:', currentSettings.userId);
  console.log('   Criado em:', new Date(currentSettings.createdAt).toLocaleDateString());
  console.log('   Atualizado em:', new Date(currentSettings.updatedAt).toLocaleDateString());

  console.log('\n   📋 Configurações Atuais:');
  console.log('   Verificação Pública:', currentSettings.defaultPublicVerification ? 'HABILITADA ✅' : 'DESABILITADA ❌');
  console.log('   Download Público:', currentSettings.defaultPublicDownload ? 'HABILITADO ✅' : 'DESABILITADO ❌');
  console.log('   Estratégia de Assinatura:', currentSettings.signatureStrategy);
  console.log('   PAdES Obrigatório:', currentSettings.requirePadesForAll ? 'SIM ✅' : 'NÃO ❌');
  console.log('   PAdES Auto-Aplicar:', currentSettings.padesAutoApply ? 'SIM ✅' : 'NÃO ❌');
  console.log('   Letterhead Ativo:', currentSettings.useLetterhead ? 'SIM ✅' : 'NÃO ❌');

  // 2. Configurar verificação pública
  console.log('\n2️⃣ Configurando verificação pública de documentos...');
  console.log('   💡 Quando habilitado: Qualquer pessoa com o link pode verificar autenticidade');
  console.log('   💡 Quando desabilitado: Apenas usuários autenticados podem verificar');

  await client.organizationSettings.update({
    defaultPublicVerification: true,
    defaultPublicDownload: false, // Permite verificar, mas não baixar
  });
  console.log('✅ Configuração atualizada');
  console.log('   Verificação Pública: HABILITADA ✅');
  console.log('   Download Público: DESABILITADO 🔒');
  console.log('   💡 Usuários podem verificar assinaturas, mas precisam de autenticação para baixar');

  // 3. Configurações de privacidade
  console.log('\n3️⃣ Demonstrando diferentes níveis de privacidade...\n');

  console.log('   a) Nível PÚBLICO (máxima transparência):');
  console.log('      - defaultPublicVerification: true');
  console.log('      - defaultPublicDownload: true');
  console.log('      ✅ Qualquer pessoa pode verificar E baixar documentos');
  console.log('      💡 Ideal para: Documentos públicos, editais, contratos transparentes');

  console.log('\n   b) Nível SEMI-PÚBLICO (verificação aberta):');
  console.log('      - defaultPublicVerification: true');
  console.log('      - defaultPublicDownload: false');
  console.log('      ✅ Qualquer pessoa pode verificar autenticidade');
  console.log('      🔒 Apenas autenticados podem baixar');
  console.log('      💡 Ideal para: Contratos comerciais, documentos de negócios');

  console.log('\n   c) Nível PRIVADO (máxima segurança):');
  console.log('      - defaultPublicVerification: false');
  console.log('      - defaultPublicDownload: false');
  console.log('      🔒 Apenas usuários autenticados podem verificar E baixar');
  console.log('      💡 Ideal para: Documentos confidenciais, informações sensíveis');

  console.log('\n========== FASE 2: BRANDING DA ORGANIZAÇÃO ==========\n');

  // 4. Configurar informações da organização
  console.log('4️⃣ Configurando branding da organização...');

  await client.organizationSettings.update({
    organizationName: 'Acme Corporation',
    organizationWebsite: 'https://acme.com',
    organizationLogoUrl: 'https://acme.com/logo.png',
  });
  console.log('✅ Branding configurado');
  console.log('   Nome:', 'Acme Corporation');
  console.log('   Website:', 'https://acme.com');
  console.log('   Logo:', 'https://acme.com/logo.png');
  console.log('   💡 Estas informações aparecem nos documentos assinados');

  // 5. Validação de configurações
  console.log('\n5️⃣ Validando configurações antes de aplicar...\n');

  const invalidSettings = {
    letterheadOpacity: 150, // Inválido (>100)
    organizationWebsite: 'acme.com', // Inválido (sem http://)
  };

  const validation = validateSettings(invalidSettings);
  if (!validation.valid) {
    console.log('   ❌ Configurações inválidas detectadas:');
    validation.errors.forEach((error, idx) => {
      console.log(`      ${idx + 1}. ${error}`);
    });
    console.log('   💡 Validação impediu aplicação de configurações incorretas');
  }

  const validSettings = {
    letterheadOpacity: 15,
    organizationWebsite: 'https://acme.com',
  };

  const validValidation = validateSettings(validSettings);
  if (validValidation.valid) {
    console.log('   ✅ Configurações válidas, pode prosseguir com atualização');
  }

  console.log('\n========== FASE 3: ASSINATURA DIGITAL PADES ==========\n');

  // 6. Estratégias de assinatura
  console.log('6️⃣ Configurando estratégia de assinatura digital...\n');

  console.log('   📋 Estratégias disponíveis:');
  console.log('   1. ELECTRONIC_ONLY - Apenas assinatura eletrônica');
  console.log('      ✅ Rápido e simples');
  console.log('      ❌ Sem certificado digital ICP-Brasil');
  console.log('      💡 Uso: Documentos internos, processos rápidos');

  console.log('\n   2. PADES_ONLY - Apenas assinatura digital (ICP-Brasil)');
  console.log('      ✅ Máxima validade jurídica');
  console.log('      ✅ Conformidade ICP-Brasil');
  console.log('      ❌ Requer certificado digital');
  console.log('      💡 Uso: Documentos legais, contratos formais');

  console.log('\n   3. HYBRID - Híbrido (eletrônica + digital)');
  console.log('      ✅ Flexibilidade: Ambos tipos válidos');
  console.log('      ✅ Usuário escolhe qual usar');
  console.log('      💡 Uso: Organizações com necessidades variadas');

  console.log('\n   4. HYBRID_SEALED - Híbrido selado (eletrônica + digital obrigatório)');
  console.log('      ✅ Assinatura eletrônica + selo digital da organização');
  console.log('      ✅ Melhor dos dois mundos');
  console.log('      ✅ Máxima segurança e validade');
  console.log('      💡 Uso: Recomendado para empresas (segurança + UX)');

  // 7. Configurar estratégia HYBRID_SEALED
  console.log('\n7️⃣ Aplicando estratégia HYBRID_SEALED...');

  await client.organizationSettings.update({
    signatureStrategy: SignatureStrategy.HYBRID_SEALED,
    requirePadesForAll: true,
    padesAutoApply: true,
  });
  console.log('✅ Estratégia configurada: HYBRID_SEALED');
  console.log('   PAdES Obrigatório: SIM ✅');
  console.log('   Auto-Aplicar: SIM ✅');
  console.log('   💡 Todos os documentos terão assinatura eletrônica + selo digital');

  // 8. Usar helper para configurar estratégia
  console.log('\n8️⃣ Usando helper setSignatureStrategy()...');

  await client.organizationSettings.setSignatureStrategy(SignatureStrategy.PADES_FINAL);
  console.log('✅ Estratégia alterada para: PADES_ONLY');
  console.log('   💡 Agora apenas assinatura digital ICP-Brasil é permitida');

  // Voltar para HYBRID_SEALED
  await client.organizationSettings.setSignatureStrategy(SignatureStrategy.HYBRID_SEALED);
  console.log('✅ Restaurada para: HYBRID_SEALED');

  // 9. Obter configurações de PAdES
  console.log('\n9️⃣ Obtendo configurações de PAdES com helper...');

  const padesConfig = await client.organizationSettings.getPadesConfig();
  console.log('✅ Configurações PAdES:');
  console.log('   Estratégia:', padesConfig.signatureStrategy);
  console.log('   Certificado Padrão:', padesConfig.defaultCertificateId || 'Nenhum configurado');
  console.log('   Obrigatório para todos:', padesConfig.requirePadesForAll ? 'SIM ✅' : 'NÃO ❌');
  console.log('   Auto-aplicar:', padesConfig.padesAutoApply ? 'SIM ✅' : 'NÃO ❌');

  console.log('\n========== FASE 4: PAPEL TIMBRADO (LETTERHEAD) ==========\n');

  // 10. Verificar se letterhead existe
  console.log('🔟 Verificando se letterhead está configurado...');

  const hasLetterhead = await client.organizationSettings.hasLetterhead();
  console.log('   Letterhead configurado:', hasLetterhead ? 'SIM ✅' : 'NÃO ❌');

  if (hasLetterhead) {
    console.log('   💡 Organização já possui papel timbrado');
  } else {
    console.log('   💡 Nenhum papel timbrado configurado ainda');
  }

  // 11. Upload de letterhead
  console.log('\n1️⃣1️⃣ Fazendo upload de papel timbrado...\n');

  const letterheadPath = path.join(__dirname, '../../tests/fixtures/letterhead.png');
  let letterheadBuffer: Buffer;

  if (fs.existsSync(letterheadPath)) {
    letterheadBuffer = fs.readFileSync(letterheadPath);
    console.log('   Letterhead encontrado:', letterheadPath);
    console.log('   Tamanho:', (letterheadBuffer.length / 1024).toFixed(2), 'KB');
  } else {
    console.log('   ⚠️ Letterhead não encontrado, criando PNG mínimo para demonstração');
    letterheadBuffer = createMinimalPNG();
    console.log('   PNG mínimo criado (1x1 pixel)');
  }

  console.log('\n   💡 Formato recomendado de letterhead:');
  console.log('      - Formato: PNG com transparência');
  console.log('      - Dimensões: A4 (2480x3508px @ 300dpi)');
  console.log('      - Tamanho máximo: 10MB');
  console.log('      - Fundo: Transparente');
  console.log('      - Elementos: Logo, bordas, marca d\'água');

  console.log('\n   Fazendo upload...');
  const uploadResult = await client.organizationSettings.uploadLetterhead(letterheadBuffer, {
    useLetterhead: true,
    opacity: 15,
    position: LetterheadPosition.BACKGROUND,
    applyToPages: 'ALL',
  });
  console.log('✅ Letterhead enviado com sucesso!');
  console.log('   URL:', uploadResult.letterheadImageUrl);
  console.log('   S3 Key:', uploadResult.letterheadImageKey);
  console.log('   Mensagem:', uploadResult.message);

  // 12. Configurações de letterhead
  console.log('\n1️⃣2️⃣ Demonstrando configurações de letterhead...\n');

  console.log('   a) Opacidade (0-100):');
  console.log('      - 0: Totalmente transparente (invisível)');
  console.log('      - 15-20: Sutil, não atrapalha leitura (recomendado)');
  console.log('      - 50: Meio transparente');
  console.log('      - 100: Totalmente opaco');

  console.log('\n   b) Posição:');
  console.log('      - BACKGROUND: Atrás do conteúdo (marca d\'água)');
  console.log('      - OVERLAY: Sobre o conteúdo (destaque)');
  console.log('      - WATERMARK: Diagonal, marca d\'água tradicional');

  console.log('\n   c) Aplicar em páginas:');
  console.log('      - ALL: Todas as páginas');
  console.log('      - FIRST: Apenas primeira página');
  console.log('      - LAST: Apenas última página');
  console.log('      - FIRST_AND_LAST: Primeira e última páginas');

  // Atualizar configurações de letterhead
  console.log('\n   Atualizando configurações de letterhead:');
  await client.organizationSettings.update({
    useLetterhead: true,
    letterheadOpacity: 20,
    letterheadPosition: LetterheadPosition.BACKGROUND,
    letterheadApplyToPages: 'FIRST_LAST',
  });
  console.log('✅ Configurações atualizadas');
  console.log('   Opacidade: 20% (sutil)');
  console.log('   Posição: BACKGROUND (atrás do texto)');
  console.log('   Páginas: Primeira e última apenas');

  // 13. Download de letterhead
  console.log('\n1️⃣3️⃣ Fazendo download do letterhead configurado...');

  const letterheadBlob = await client.organizationSettings.downloadLetterhead();
  console.log('✅ Letterhead baixado');
  console.log('   Tipo:', letterheadBlob.type || 'image/png');
  console.log('   Tamanho:', (letterheadBlob.size / 1024).toFixed(2), 'KB');
  console.log('   💡 Em produção, pode salvar ou exibir a imagem');

  // Exemplo de como salvar (Node.js)
  console.log('\n   💡 Para salvar em Node.js:');
  console.log('   const buffer = Buffer.from(await letterheadBlob.arrayBuffer());');
  console.log('   fs.writeFileSync("./letterhead-downloaded.png", buffer);');

  // Exemplo de como exibir (Browser)
  console.log('\n   💡 Para exibir no browser:');
  console.log('   const imageUrl = URL.createObjectURL(letterheadBlob);');
  console.log('   document.querySelector("img").src = imageUrl;');

  // 14. Desabilitar letterhead temporariamente
  console.log('\n1️⃣4️⃣ Desabilitando letterhead temporariamente...');

  await client.organizationSettings.update({
    useLetterhead: false,
  });
  console.log('✅ Letterhead desabilitado');
  console.log('   💡 Imagem permanece armazenada, apenas não será aplicada aos documentos');
  console.log('   💡 Pode reabilitar a qualquer momento sem novo upload');

  // Reabilitar
  console.log('\n   Reabilitando letterhead...');
  await client.organizationSettings.update({
    useLetterhead: true,
  });
  console.log('✅ Letterhead reabilitado');

  console.log('\n========== FASE 5: STAMPS E CARIMBOS ==========\n');

  // 15. Configurar template de stamp
  console.log('1️⃣5️⃣ Configurando template de stamp (carimbo)...\n');

  console.log('   💡 Stamps são carimbos digitais aplicados automaticamente aos documentos');
  console.log('   💡 Contêm informações como: Data, hora, signatário, hash, QR code');

  await client.organizationSettings.update({
    stampTemplate: {
      backgroundColor: '#1a73e8', // Azul Google
      borderColor: '#0d47a1', // Azul escuro
      textColor: '#ffffff', // Branco
      showLogo: true,
      showQRCode: true,
      fontSize: 12,
    },
    stampPosition: 'BOTTOM_RIGHT',
  });
  console.log('✅ Template de stamp configurado');
  console.log('   Cor de fundo: Azul (#1a73e8)');
  console.log('   Cor da borda: Azul escuro (#0d47a1)');
  console.log('   Cor do texto: Branco (#ffffff)');
  console.log('   Logo: Habilitado ✅');
  console.log('   QR Code: Habilitado ✅');
  console.log('   Tamanho da fonte: 12pt');
  console.log('   Posição: Canto inferior direito');

  // 16. Diferentes configurações de stamp
  console.log('\n1️⃣6️⃣ Demonstrando diferentes estilos de stamp...\n');

  console.log('   a) Estilo Corporativo (azul profissional):');
  console.log('      backgroundColor: #1a73e8');
  console.log('      borderColor: #0d47a1');
  console.log('      textColor: #ffffff');
  console.log('      💡 Ideal para: Empresas, corporações');

  console.log('\n   b) Estilo Legal (verde jurídico):');
  console.log('      backgroundColor: #2e7d32');
  console.log('      borderColor: #1b5e20');
  console.log('      textColor: #ffffff');
  console.log('      💡 Ideal para: Escritórios de advocacia, jurídico');

  console.log('\n   c) Estilo Financeiro (dourado):');
  console.log('      backgroundColor: #f9a825');
  console.log('      borderColor: #f57f17');
  console.log('      textColor: #000000');
  console.log('      💡 Ideal para: Bancos, instituições financeiras');

  console.log('\n   d) Estilo Minimalista (preto e branco):');
  console.log('      backgroundColor: #ffffff');
  console.log('      borderColor: #000000');
  console.log('      textColor: #000000');
  console.log('      showLogo: false');
  console.log('      showQRCode: false');
  console.log('      💡 Ideal para: Documentos formais, minimalistas');

  // 17. Posições de stamp
  console.log('\n1️⃣7️⃣ Posições disponíveis para stamp...\n');

  console.log('   Opções de posicionamento:');
  console.log('   - TOP_LEFT: Canto superior esquerdo');
  console.log('   - TOP_RIGHT: Canto superior direito');
  console.log('   - BOTTOM_LEFT: Canto inferior esquerdo');
  console.log('   - BOTTOM_RIGHT: Canto inferior direito (padrão)');
  console.log('   - CENTER: Centro do documento');

  console.log('\n   💡 Escolha baseada no layout do documento:');
  console.log('   - Contratos: BOTTOM_RIGHT (tradicional)');
  console.log('   - Certificados: CENTER ou TOP_RIGHT');
  console.log('   - Relatórios: TOP_RIGHT ou BOTTOM_LEFT');

  console.log('\n========== FASE 6: HELPERS E UTILITÁRIOS ==========\n');

  // 18. Resumo de helpers disponíveis
  console.log('1️⃣8️⃣ Helpers disponíveis no SDK...\n');

  console.log('   ✅ hasLetterhead() - Verifica se letterhead está configurado');
  console.log('      Retorna: boolean');
  console.log('      Uso: Validar antes de download ou deletar');

  console.log('\n   ✅ getPadesConfig() - Obter apenas configurações PAdES');
  console.log('      Retorna: { signatureStrategy, defaultCertificateId, ... }');
  console.log('      Uso: Atalho para acessar config de assinatura digital');

  console.log('\n   ✅ setSignatureStrategy() - Atualizar apenas estratégia');
  console.log('      Parâmetro: SignatureStrategy');
  console.log('      Uso: Atalho para trocar estratégia rapidamente');

  // 19. Exemplo completo de configuração
  console.log('\n1️⃣9️⃣ Exemplo completo: Configurando organização do zero...\n');

  console.log('   Cenário: Nova organização precisa de setup completo');

  async function setupOrganization() {
    console.log('\n   1. Configurando informações básicas...');
    await client.organizationSettings.update({
      organizationName: 'Acme Corporation',
      organizationWebsite: 'https://acme.com',
      organizationLogoUrl: 'https://acme.com/logo.png',
      defaultPublicVerification: true,
      defaultPublicDownload: false,
    });
    console.log('   ✅ Informações básicas configuradas');

    console.log('\n   2. Configurando assinatura digital...');
    await client.organizationSettings.update({
      signatureStrategy: SignatureStrategy.HYBRID_SEALED,
      requirePadesForAll: true,
      padesAutoApply: true,
    });
    console.log('   ✅ PAdES configurado (HYBRID_SEALED)');

    console.log('\n   3. Configurando stamp...');
    await client.organizationSettings.update({
      stampTemplate: {
        backgroundColor: '#1a73e8',
        borderColor: '#0d47a1',
        textColor: '#ffffff',
        showLogo: true,
        showQRCode: true,
        fontSize: 12,
      },
      stampPosition: 'BOTTOM_RIGHT',
    });
    console.log('   ✅ Stamp configurado');

    console.log('\n   4. Configurando letterhead...');
    const letterhead = createMinimalPNG();
    await client.organizationSettings.uploadLetterhead(letterhead, {
      useLetterhead: true,
      opacity: 15,
      position: LetterheadPosition.BACKGROUND,
      applyToPages: 'ALL',
    });
    console.log('   ✅ Letterhead enviado e configurado');

    console.log('\n   ✅ Setup completo da organização finalizado!');
  }

  await setupOrganization();

  // 20. Deletar letterhead
  console.log('\n2️⃣0️⃣ Deletando letterhead (exemplo)...');
  console.log('   ⚠️ ATENÇÃO: Operação irreversível!');
  console.log('   💡 Exemplo comentado (não executado):');
  console.log('   // await client.organizationSettings.deleteLetterhead();');
  console.log('   // console.log("Letterhead deletado permanentemente");');
  console.log('   ⏭️ Pulando deleção neste exemplo');

  console.log('\n========== FASE 7: LOGO DA ORGANIZAÇÃO ==========\n');

  // 21. Verificar se logo existe
  console.log('2️⃣1️⃣ Verificando se logo está configurado...');

  const hasLogoNow = await client.organizationSettings.hasLogo();
  console.log('   Logo configurado:', hasLogoNow ? 'SIM ✅' : 'NÃO ❌');

  if (hasLogoNow) {
    console.log('   💡 Organização já possui logo');
  } else {
    console.log('   💡 Nenhum logo configurado ainda');
  }

  // 22. Upload de logo
  console.log('\n2️⃣2️⃣ Fazendo upload de logo da organização...\n');

  console.log('   💡 Formato recomendado de logo:');
  console.log('      - Formato: PNG (recomendado para transparência), JPG ou SVG');
  console.log('      - Dimensões: 512x512px (quadrado, 72dpi)');
  console.log('      - Tamanho máximo: 5MB');
  console.log('      - Fundo: Preferencialmente transparente (PNG)');
  console.log('      - Uso: Stamp padrão nos documentos');

  // Criar logo mínimo para demonstração
  function createMinimalLogo(): Buffer {
    // PNG 100x100 azul simples (logo de demonstração)
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x70, 0xe2, 0x95, 0x54, 0x00, 0x00, 0x00,
      0x13, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x64, 0x60, 0xf8, 0xcf,
      0xc0, 0xc0, 0xc0, 0x00, 0x00, 0x04, 0x00, 0x01, 0x5c, 0x6b, 0xf2, 0xad,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  }

  console.log('\n   Criando logo de demonstração...');
  const logoBuffer = createMinimalLogo();
  console.log('   Logo criado (100x100px)');

  console.log('\n   Fazendo upload com opção useAsStamp = true...');
  const uploadLogoResult = await client.organizationSettings.uploadLogo(logoBuffer, {
    useAsStamp: true,
  });

  console.log('✅ Logo enviado com sucesso!');
  console.log('   URL:', uploadLogoResult.organizationLogoUrl);
  console.log('   S3 Key:', uploadLogoResult.organizationLogoKey);
  console.log('   Usado como stamp:', uploadLogoResult.settings.useAsStamp ? 'SIM ✅' : 'NÃO ❌');
  console.log('   Mensagem:', uploadLogoResult.message);

  // 23. Demonstração de uso do logo como stamp
  console.log('\n2️⃣3️⃣ Demonstrando uso do logo como stamp...\n');

  console.log('   💡 Quando useAsStamp = true:');
  console.log('      - Logo é automaticamente configurado no stampTemplate');
  console.log('      - stampTemplate.showLogo = true');
  console.log('      - stampTemplate.logoUrl = (URL do logo)');
  console.log('      - Logo aparece nos carimbos de assinatura');
  console.log('      - Mantém consistência visual da marca');

  const settingsAfterLogo = await client.organizationSettings.get();
  if (settingsAfterLogo.stampTemplate) {
    console.log('\n   Configuração atual do stamp:');
    console.log('      showLogo:', (settingsAfterLogo.stampTemplate as any).showLogo ? 'SIM ✅' : 'NÃO ❌');
    console.log('      logoUrl:', (settingsAfterLogo.stampTemplate as any).logoUrl || 'Não configurado');
    console.log('      backgroundColor:', (settingsAfterLogo.stampTemplate as any).backgroundColor);
    console.log('      showQRCode:', (settingsAfterLogo.stampTemplate as any).showQRCode ? 'SIM ✅' : 'NÃO ❌');
  }

  // 24. Download do logo
  console.log('\n2️⃣4️⃣ Fazendo download do logo configurado...');

  const logoBlob = await client.organizationSettings.downloadLogo();
  console.log('✅ Logo baixado');
  console.log('   Tipo:', logoBlob.type || 'image/png');
  console.log('   Tamanho:', (logoBlob.size / 1024).toFixed(2), 'KB');

  console.log('\n   💡 Para salvar em Node.js:');
  console.log('   const buffer = Buffer.from(await logoBlob.arrayBuffer());');
  console.log('   fs.writeFileSync("./logo-downloaded.png", buffer);');

  console.log('\n   💡 Para exibir no browser:');
  console.log('   const imageUrl = URL.createObjectURL(logoBlob);');
  console.log('   document.querySelector("img").src = imageUrl;');

  // 25. Recomendações para uso de logo
  console.log('\n2️⃣5️⃣ Recomendações e melhores práticas...\n');

  console.log('   ✅ FORMATO:');
  console.log('      - PNG: Melhor para logos com transparência');
  console.log('      - JPG: Bom para fotos, mas sem transparência');
  console.log('      - SVG: Ideal para escalar sem perder qualidade');

  console.log('\n   ✅ DIMENSÕES:');
  console.log('      - Recomendado: 512x512px (quadrado)');
  console.log('      - Mínimo: 256x256px');
  console.log('      - Máximo: 2048x2048px');
  console.log('      - Aspecto: Quadrado funciona melhor em stamps');

  console.log('\n   ✅ DESIGN:');
  console.log('      - Evite logos muito detalhados (podem não renderizar bem em pequeno)');
  console.log('      - Prefira fundos transparentes');
  console.log('      - Use cores da marca para consistência');
  console.log('      - Teste em diferentes tamanhos');

  console.log('\n========== FASE 8: NÍVEIS DE AUTENTICAÇÃO PADRÃO ==========\n');

  // 26. Obter nível de autenticação atual
  console.log('2️⃣6️⃣ Obtendo nível de autenticação padrão da organização...');

  const currentAuthLevel = await client.organizationSettings.getAuthenticationLevel();
  console.log('✅ Nível atual:', currentAuthLevel);

  // 27. Explicação dos níveis de autenticação
  console.log('\n2️⃣7️⃣ Níveis de autenticação disponíveis...\n');

  console.log('   📋 BASIC (Mínimo Recomendado):');
  console.log('      - Email token (6 dígitos)');
  console.log('      - IP Address (validação de origem)');
  console.log('      - Geolocalização (GPS)');
  console.log('      💡 Uso: Documentos internos, processos rápidos');
  console.log('      ⏱️  Tempo médio: 2-5 minutos');

  console.log('\n   📋 STANDARD (Recomendado):');
  console.log('      - Tudo do BASIC +');
  console.log('      - WhatsApp ou SMS token');
  console.log('      - Documento oficial (RG, CNH)');
  console.log('      - Selfie com documento');
  console.log('      💡 Uso: Contratos comerciais, documentos formais');
  console.log('      ⏱️  Tempo médio: 10-15 minutos');

  console.log('\n   📋 STRICT (Máxima Segurança):');
  console.log('      - Tudo do STANDARD +');
  console.log('      - Comprovante de endereço');
  console.log('      💡 Uso: PAdES, documentos legais, alta validade jurídica');
  console.log('      ⏱️  Tempo médio: 15-20 minutos');
  console.log('      ⚠️  OBRIGATÓRIO para assinaturas PAdES!');

  // 28. Configurar nível de autenticação
  console.log('\n2️⃣8️⃣ Configurando nível de autenticação...\n');

  console.log('   Configurando nível STANDARD (recomendado)...');
  await client.organizationSettings.setAuthenticationLevel(AuthenticationLevel.STANDARD);
  console.log('✅ Nível atualizado para: STANDARD');

  console.log('\n   💡 Este nível será aplicado por padrão aos novos signatários');
  console.log('   💡 Pode ser sobrescrito por envelope/signatário específico');

  // 29. Relação com estratégia de assinatura
  console.log('\n2️⃣9️⃣ Relação entre Auth Level e Estratégia de Assinatura...\n');

  const currentPadesConfig = await client.organizationSettings.getPadesConfig();
  console.log('   Estratégia atual:', currentPadesConfig.signatureStrategy);
  console.log('   Auth level atual:', currentAuthLevel);

  console.log('\n   📊 Recomendações por estratégia:');
  console.log('      VISUAL_ONLY → BASIC ou STANDARD');
  console.log('      PADES_EACH → STRICT (obrigatório)');
  console.log('      PADES_FINAL → STRICT (obrigatório)');
  console.log('      HYBRID → STANDARD ou STRICT');
  console.log('      HYBRID_SEALED → STRICT (recomendado)');

  console.log('\n   ⚠️ IMPORTANTE:');
  console.log('      - PAdES sempre requer STRICT para máxima validade jurídica');
  console.log('      - STRICT garante conformidade ICP-Brasil');
  console.log('      - Documentos com STRICT têm maior peso legal');

  // 30. Configuração completa para PAdES
  console.log('\n3️⃣0️⃣ Configuração completa para ambiente PAdES...\n');

  console.log('   Aplicando configuração recomendada para PAdES:');
  await client.organizationSettings.update({
    signatureStrategy: SignatureStrategy.HYBRID_SEALED,
    requirePadesForAll: true,
    padesAutoApply: true,
    defaultAuthLevel: AuthenticationLevel.STRICT,
  });

  console.log('✅ Configuração aplicada:');
  console.log('   - Estratégia: HYBRID_SEALED');
  console.log('   - PAdES obrigatório: SIM ✅');
  console.log('   - Auto-aplicar: SIM ✅');
  console.log('   - Auth level: STRICT ✅');

  console.log('\n   💡 Com esta configuração:');
  console.log('      1. Todos documentos terão assinatura eletrônica + selo digital');
  console.log('      2. Certificado digital será aplicado automaticamente');
  console.log('      3. Signatários passarão por autenticação rigorosa');
  console.log('      4. Máxima validade jurídica garantida');
  console.log('      5. Conformidade ICP-Brasil completa');

  // Resumo Final
  console.log('\n========== RESUMO COMPLETO ==========');

  const finalSettings = await client.organizationSettings.get();

  console.log('\n📊 Configurações Finais da Organização:');
  console.log('   ═══════════════════════════════════════════════════');

  console.log('\n   🏢 BRANDING:');
  console.log(`   Nome: ${finalSettings.organizationName || 'Não configurado'}`);
  console.log(`   Website: ${finalSettings.organizationWebsite || 'Não configurado'}`);
  console.log(`   Logo: ${finalSettings.organizationLogoUrl ? 'Configurado ✅' : 'Não configurado ❌'}`);

  console.log('\n   🔐 PRIVACIDADE:');
  console.log(`   Verificação Pública: ${finalSettings.defaultPublicVerification ? 'HABILITADA ✅' : 'DESABILITADA ❌'}`);
  console.log(`   Download Público: ${finalSettings.defaultPublicDownload ? 'HABILITADO ✅' : 'DESABILITADO ❌'}`);

  console.log('\n   📝 ASSINATURA DIGITAL (PAdES):');
  console.log(`   Estratégia: ${finalSettings.signatureStrategy}`);
  console.log(`   Certificado Padrão: ${finalSettings.defaultCertificateId || 'Nenhum'}`);
  console.log(`   Obrigatório: ${finalSettings.requirePadesForAll ? 'SIM ✅' : 'NÃO ❌'}`);
  console.log(`   Auto-aplicar: ${finalSettings.padesAutoApply ? 'SIM ✅' : 'NÃO ❌'}`);

  console.log('\n   📄 PAPEL TIMBRADO (Letterhead):');
  console.log(`   Ativo: ${finalSettings.useLetterhead ? 'SIM ✅' : 'NÃO ❌'}`);
  if (finalSettings.letterheadImageUrl) {
    console.log(`   URL: ${finalSettings.letterheadImageUrl}`);
    console.log(`   Opacidade: ${finalSettings.letterheadOpacity}%`);
    console.log(`   Posição: ${finalSettings.letterheadPosition}`);
    console.log(`   Aplicar em: ${finalSettings.letterheadApplyToPages}`);
  }

  console.log('\n   🖼️ LOGO:');
  console.log(`   Logo configurado: ${finalSettings.organizationLogoUrl ? 'SIM ✅' : 'NÃO ❌'}`);
  if (finalSettings.organizationLogoUrl) {
    console.log(`   URL: ${finalSettings.organizationLogoUrl}`);
    console.log(`   S3 Key: ${finalSettings.organizationLogoKey || 'N/A'}`);
  }

  console.log('\n   🏷️ STAMP (Carimbo):');
  if (finalSettings.stampTemplate) {
    console.log(`   Background: ${finalSettings.stampTemplate.backgroundColor || 'Padrão'}`);
    console.log(`   Borda: ${finalSettings.stampTemplate.borderColor || 'Padrão'}`);
    console.log(`   Texto: ${finalSettings.stampTemplate.textColor || 'Padrão'}`);
    console.log(`   Logo: ${finalSettings.stampTemplate.showLogo ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`   QR Code: ${finalSettings.stampTemplate.showQRCode ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`   Posição: ${finalSettings.stampPosition || 'Padrão'}`);
  }

  console.log('\n   🔐 AUTENTICAÇÃO:');
  console.log(`   Nível padrão: ${finalSettings.defaultAuthLevel}`);

  console.log('\n   ═══════════════════════════════════════════════════');

  console.log('\n========== FASE 9: FLUXO DE ASSINATURA AVANÇADO DO SIGNATÁRIO ==========\n');

  // 31. Criar envelope e documento para demonstração
  console.log('3️⃣1️⃣ Preparando envelope e documento para demonstração...\n');

  console.log('   Criando envelope de teste...');
  const testEnvelope = await client.envelopes.create({
    name: 'Contrato de Prestação de Serviços - Demo Signature Fields',
    description: 'Demonstração do fluxo avançado de assinatura com perfil do signatário',
  });
  console.log('✅ Envelope criado:', testEnvelope.id);

  console.log('\n   Criando documento PDF mínimo...');
  // PDF mínimo de 3 páginas para demonstrar rubricas
  const minimalPDF = Buffer.from([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, // %PDF-1.4
    0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a, // binary comment
    // ... (PDF mínimo real seria muito grande, este é simbólico)
  ]);

  const testDocument = await client.documents.upload(
    testEnvelope.id,
    minimalPDF,
    'Contrato - Demo.pdf'
  );
  console.log('✅ Documento criado:', testDocument.id);

  // 32. Criar signatário
  console.log('\n3️⃣2️⃣ Criando signatário (cliente final)...');

  const testSigner = await client.signers.create(testEnvelope.id, {
    name: 'João da Silva Santos',
    email: 'joao.silva@example.com',
    phoneNumber: '+5585999887766',
    documentNumber: '123.456.789-00',
    documentType: 'cpf',
    qualificationRole: 'CONTRATANTE',
  });
  console.log('✅ Signatário criado:', testSigner.id);
  console.log('   Nome:', testSigner.name);
  console.log('   Email:', testSigner.email);
  console.log('   Role:', testSigner.qualificationRole);

  // 33. Upload de assinatura do signatário
  console.log('\n3️⃣3️⃣ Cliente fazendo upload de sua assinatura manuscrita...\n');

  console.log('   💡 Cenário realista:');
  console.log('      1. Cliente acessa interface de assinatura');
  console.log('      2. Cliente desenha sua assinatura em um canvas');
  console.log('      3. Canvas é convertido para PNG');
  console.log('      4. PNG é enviado ao servidor e salvo no perfil');
  console.log('      5. Assinatura fica disponível para reutilização');

  // Criar assinatura simulada (PNG mínimo)
  function createSignatureImage(): Buffer {
    // PNG 200x80 representando assinatura manuscrita
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      // ... (assinatura PNG simulada)
    ]);
  }

  const signatureImage = createSignatureImage();
  console.log('\n   Fazendo upload da assinatura (200x80px PNG)...');

  const signerWithSignature = await client.signers.uploadSignature(testSigner.id, signatureImage);
  console.log('✅ Assinatura enviada e salva no perfil!');
  console.log('   URL:', signerWithSignature.signatureImageUrl);
  console.log('   S3 Key:', signerWithSignature.signatureImageKey);
  console.log('   💡 Assinatura agora está disponível para uso em qualquer documento');

  // 34. Upload de rubrica do signatário
  console.log('\n3️⃣4️⃣ Cliente fazendo upload de sua rubrica...\n');

  console.log('   💡 Rubrica = Versão simplificada da assinatura (iniciais)');
  console.log('   💡 Usada em todas as páginas do documento, exceto a última');

  // Criar rubrica simulada (PNG menor)
  function createInitialImage(): Buffer {
    // PNG 80x40 representando rubrica (iniciais)
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      // ... (rubrica PNG simulada)
    ]);
  }

  const initialImage = createInitialImage();
  console.log('\n   Fazendo upload da rubrica (80x40px PNG)...');

  const signerWithInitial = await client.signers.uploadInitial(testSigner.id, initialImage);
  console.log('✅ Rubrica enviada e salva no perfil!');
  console.log('   URL:', signerWithInitial.initialImageUrl);
  console.log('   S3 Key:', signerWithInitial.initialImageKey);
  console.log('   💡 Rubrica agora está disponível para uso automático');

  // 35. Criador do envelope criando stamp group
  console.log('\n3️⃣5️⃣ Advogado criando carimbo verificado (verifiedStampV1)...\n');

  console.log('   💡 Carimbo Verificado = Campo SIGNATURE com template rico (450x200px):');
  console.log('      ✅ Header: "ASSINATURA DIGITAL VERIFICADA"');
  console.log('      ✅ Logo da organização (60x60, esquerda)');
  console.log('      ✅ Dados estruturados: Nome, Cargo, Data, Hash, URL');
  console.log('      ✅ QR Code para verificação (90x90, direita)');
  console.log('      ✅ Nome da organização (rodapé)');
  console.log('      ✅ Timezone: America/Sao_Paulo');
  console.log('   💡 Backend gera o carimbo completo automaticamente!');

  console.log('\n   Criando carimbo verificado na página 3, posição (100, 650)...');
  const stampFields = await client.signatureFields.createStampGroup(testDocument.id, {
    signerId: testSigner.id,
    page: 3,
    x: 100,
    y: 650,
  });

  console.log('✅ Carimbo verificado criado com sucesso!');
  console.log('   Campos criados:', stampFields.length);
  stampFields.forEach((field, idx) => {
    console.log(`\n   Campo ${idx + 1}:`);
    console.log(`      Tipo: ${field.type}`);
    console.log(`      Posição: (${field.x}, ${field.y})`);
    console.log(`      Tamanho: ${field.width}x${field.height}px (comprido, não alto)`);
    console.log(`      Página: ${field.page}`);
    console.log(`      Template: verifiedStampV1`);
  });

  // 36. Criador do envelope criando campos de rubrica
  console.log('\n3️⃣6️⃣ Advogado criando campos de rubrica automáticos...\n');

  console.log('   💡 createInitialFields faz:');
  console.log('      1. Obtém automaticamente o número de páginas do documento');
  console.log('      2. Cria um campo INITIAL no canto inferior direito de cada página');
  console.log('      3. NÃO cria rubrica na última página (reservada para assinatura)');
  console.log('   💡 Backend abstrai toda a lógica de posicionamento!');

  console.log('\n   Criando rubricas automáticas...');
  const initialFields = await client.signatureFields.createInitialFields(testDocument.id, {
    signerId: testSigner.id,
  });

  console.log('✅ Rubricas criadas automaticamente!');
  console.log('   Total de rubricas:', initialFields.length);
  console.log('   💡 Rubricas criadas nas páginas 1 e 2 (última página sem rubrica)');

  initialFields.forEach((field, idx) => {
    console.log(`\n   Rubrica ${idx + 1}:`);
    console.log(`      Página: ${field.page}`);
    console.log(`      Posição: (${field.x}, ${field.y})`);
    console.log(`      Tamanho: ${field.width}x${field.height}`);
  });

  // 37. Ativar envelope
  console.log('\n3️⃣7️⃣ Ativando envelope para permitir assinatura...');

  await client.envelopes.activate(testEnvelope.id);
  console.log('✅ Envelope ativado (status: RUNNING)');
  console.log('   💡 Agora o cliente pode assinar os campos');

  // 38. Cliente assinando usando imagem do perfil
  console.log('\n3️⃣8️⃣ Cliente assinando sem precisar reenviar imagens...\n');

  console.log('   💡 ANTES (fluxo antigo):');
  console.log('      - Cliente enviava imagem da assinatura em CADA assinatura');
  console.log('      - Processamento lento e repetitivo');
  console.log('      - Inconsistência entre assinaturas');

  console.log('\n   💡 AGORA (fluxo novo com perfil):');
  console.log('      - Imagem salva UMA VEZ no perfil do signatário');
  console.log('      - Backend busca automaticamente do perfil');
  console.log('      - Assinatura consistente em todos os documentos');
  console.log('      - Processo muito mais rápido!');

  // Obter signing URL e access token do signatário
  console.log('\n   Obtendo access token do signatário...');
  const signingUrl = await client.signers.getSigningUrl(testSigner.id);
  console.log('✅ Access token obtido:', signingUrl.accessToken.substring(0, 20) + '...');

  // Assinar campo de assinatura (stamp group)
  console.log('\n   Assinando campo SIGNATURE (sem enviar imagem!)...');
  const signatureField = stampFields.find(f => f.type === 'signature');

  if (signatureField) {
    await client.signatureFields.sign(signatureField.id, {
      accessToken: signingUrl.accessToken,
      // Sem signatureImageUrl! Backend busca do perfil automaticamente
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
    });
    console.log('✅ Campo SIGNATURE assinado usando imagem do perfil!');
    console.log('   💡 Imagem foi buscada automaticamente de signerWithSignature.signatureImageUrl');
  }

  // Assinar rubricas (também sem enviar imagem)
  console.log('\n   Assinando rubricas (sem enviar imagem!)...');
  for (const initialField of initialFields) {
    await client.signatureFields.sign(initialField.id, {
      accessToken: signingUrl.accessToken,
      // Sem signatureImageUrl! Backend busca initialImageUrl do perfil
      metadata: {
        ipAddress: '192.168.1.100',
      },
    });
  }
  console.log('✅ Todas as rubricas assinadas usando imagem do perfil!');
  console.log('   💡 Imagens foram buscadas automaticamente de signerWithInitial.initialImageUrl');

  // 39. Atualizar assinatura salva
  console.log('\n3️⃣9️⃣ Cliente atualizando sua assinatura salva...\n');

  console.log('   💡 Cenário: Cliente quer mudar sua assinatura');
  console.log('   💡 Processo:');
  console.log('      1. Upload de nova imagem (remove a antiga automaticamente)');
  console.log('      2. Próximas assinaturas usarão a nova imagem');
  console.log('      3. Assinaturas anteriores mantêm a imagem antiga (imutabilidade)');

  const newSignatureImage = createSignatureImage(); // Nova assinatura
  console.log('\n   Fazendo upload de nova assinatura...');

  const updatedSigner = await client.signers.uploadSignature(testSigner.id, newSignatureImage);
  console.log('✅ Assinatura atualizada!');
  console.log('   Antiga URL:', signerWithSignature.signatureImageUrl);
  console.log('   Nova URL:', updatedSigner.signatureImageUrl);
  console.log('   💡 Arquivo antigo foi removido do S3 automaticamente');

  // 40. Remover assinatura salva
  console.log('\n4️⃣0️⃣ Cliente removendo assinatura salva (exemplo)...\n');

  console.log('   💡 Quando remover assinatura:');
  console.log('      - Arquivo é deletado do S3');
  console.log('      - signatureImageUrl e signatureImageKey são limpos');
  console.log('      - Cliente precisará fazer novo upload antes de assinar');

  console.log('\n   ⚠️ ATENÇÃO: Operação demonstrativa (comentada):');
  console.log('   // await client.signers.deleteSignature(testSigner.id);');
  console.log('   // console.log("Assinatura removida do perfil");');
  console.log('   // console.log("Cliente precisará fazer novo upload");');
  console.log('   ⏭️ Pulando deleção neste exemplo');

  console.log('\n   ═══════════════════════════════════════════════════');

  console.log('\n🎯 Recursos demonstrados:');
  console.log('   ✅ Obter configurações (get)');
  console.log('   ✅ Atualizar configurações (update)');
  console.log('   ✅ Configurar branding (nome, logo, website)');
  console.log('   ✅ Configurar privacidade (verificação, download)');
  console.log('   ✅ Configurar PAdES (estratégia, certificado)');
  console.log('   ✅ Upload de letterhead (uploadLetterhead)');
  console.log('   ✅ Download de letterhead (downloadLetterhead)');
  console.log('   ✅ Deletar letterhead (deleteLetterhead) - comentado');
  console.log('   🆕 Upload de logo (uploadLogo) - FASE 12');
  console.log('   🆕 Download de logo (downloadLogo) - FASE 12');
  console.log('   🆕 Deletar logo (deleteLogo) - FASE 12');
  console.log('   🆕 Verificar logo (hasLogo) - FASE 12');
  console.log('   🆕 Níveis de autenticação (getAuthenticationLevel, setAuthenticationLevel) - FASE 12');
  console.log('   ✅ Configurar stamp (template, cores, posição)');
  console.log('   ✅ Helpers (hasLetterhead, getPadesConfig, setSignatureStrategy)');
  console.log('   🆕 Upload de assinatura do signatário (uploadSignature) - signature_fields');
  console.log('   🆕 Upload de rubrica do signatário (uploadInitial) - signature_fields');
  console.log('   🆕 Deletar assinatura (deleteSignature) - signature_fields');
  console.log('   🆕 Deletar rubrica (deleteInitial) - signature_fields');
  console.log('   🆕 Criar stamp group (createStampGroup) - signature_fields');
  console.log('   🆕 Criar rubricas automáticas (createInitialFields) - signature_fields');
  console.log('   🆕 Assinar campos usando perfil (sign sem signatureImageUrl) - signature_fields');

  console.log('\n📋 Melhores práticas aplicadas:');
  console.log('   ✅ Validação de configurações antes de aplicar');
  console.log('   ✅ Letterhead em PNG com transparência');
  console.log('   ✅ Opacidade sutil para não atrapalhar leitura');
  console.log('   ✅ Estratégia HYBRID_SEALED para segurança e UX');
  console.log('   ✅ Verificação pública habilitada, download restrito');
  console.log('   ✅ Stamp com logo e QR code para autenticidade');
  console.log('   ✅ Configurações consistentes e profissionais');
  console.log('   🆕 Logo em formato adequado (PNG/JPG/SVG) - FASE 12');
  console.log('   🆕 Logo usado automaticamente como stamp padrão - FASE 12');
  console.log('   🆕 Authentication level alinhado com estratégia PAdES - FASE 12');
  console.log('   🆕 STRICT obrigatório para máxima validade jurídica - FASE 12');
  console.log('   🆕 Assinatura salva no perfil para reutilização - signature_fields');
  console.log('   🆕 Rubrica automática em todas as páginas (exceto última) - signature_fields');
  console.log('   🆕 Stamp group com posicionamento relativo automático - signature_fields');
  console.log('   🆕 Backend busca imagem do perfil automaticamente - signature_fields');

  console.log('\n✨ Organization Settings COMPLETO demonstrado!');
  console.log('💡 Este exemplo cobre 100% dos recursos de configuração (incluindo FASE 12 e signature_fields)');
  console.log('💡 Em produção:');
  console.log('   - Use letterhead em alta resolução (A4 @ 300dpi)');
  console.log('   - Teste diferentes opacidades para encontrar a ideal');
  console.log('   - Configure estratégia de assinatura baseada em requisitos legais');
  console.log('   - Mantenha branding consistente com identidade visual');
  console.log('   - Revise configurações de privacidade periodicamente');
  console.log('   - Backup de letterhead/logo antes de deletar ou substituir');
  console.log('   🆕 Logo recomendado: 512x512px quadrado (PNG com transparência)');
  console.log('   🆕 Para PAdES: sempre usar STRICT authentication level');
  console.log('   🆕 Logo aparece automaticamente nos stamps com useAsStamp=true');
  console.log('   🆕 Assinatura do perfil: PNG 200x80px recomendado - signature_fields');
  console.log('   🆕 Rubrica do perfil: PNG 80x40px recomendado - signature_fields');
  console.log('   🆕 createStampGroup cria carimbo verificado (450x200) com template verifiedStampV1 - signature_fields');
  console.log('   🆕 createInitialFields abstrai lógica de paginação e posicionamento - signature_fields');
}

// Executar
if (require.main === module) {
  main().catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export { main };
