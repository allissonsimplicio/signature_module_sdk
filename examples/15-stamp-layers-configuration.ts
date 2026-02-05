/**
 * Exemplo 15: Configuração de Stamp Layers
 *
 * Demonstra como configurar camadas (layers) de stamps para controlar
 * a ordem de aplicação de carimbos em documentos PDF.
 *
 * Nota: este recurso é avançado e depende de OrganizationSettings.stampConfiguration.
 *
 * Casos de uso:
 * - Papel timbrado com transparência no fundo
 * - Logo organizacional no header
 * - Assinaturas nos campos específicos
 * - Carimbos de data/recebimento no rodapé
 * - PAdES nos metadados
 *
 * @example
 * ```bash
 * npx ts-node examples/15-stamp-layers-configuration.ts
 * ```
 */

import { SignatureClient } from '../src';

// Configurações (substitua pelos seus valores reais)
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'your-api-token-here';

async function main() {
  console.log('📚 Exemplo 15: Configuração de Stamp Layers\n');

  // Inicializar cliente
  const client = new SignatureClient({
    baseURL: BASE_URL,
    accessToken: ACCESS_TOKEN,
  });

  try {
    // ========================================
    // 1. CONFIGURAÇÃO PADRÃO (ASSINATURA)
    // ========================================
    console.log('1️⃣ Configurando layers padrão para envelope de assinatura...');

    const signatureStampConfig = {
      layers: [
        // Layer 1: Papel timbrado no fundo (primeira página apenas)
        {
          order: 1,
          type: 'LETTERHEAD',
          position: 'BACKGROUND',
          opacity: 0.2,
          firstPageOnly: true,
        },
        // Layer 2: Logo no canto superior direito (todas as páginas)
        {
          order: 2,
          type: 'LOGO',
          position: 'TOP_RIGHT',
          opacity: 0.4,
        },
        // Layer 3: Assinatura visual no campo
        {
          order: 3,
          type: 'SIGNATURE',
          position: 'FIELD',
          opacity: 1.0,
        },
        // Layer 4: Timestamp no rodapé (última página)
        {
          order: 4,
          type: 'TIMESTAMP',
          position: 'FOOTER',
          opacity: 0.8,
          lastPageOnly: true,
        },
        // Layer 5: PAdES nos metadados (não visível)
        {
          order: 5,
          type: 'PADES_SEAL',
          position: 'METADATA',
        },
      ],
      validateOverlap: true,
      conflictResolution: 'adjust',
    };

    // Atualizar configuração da organização
    await client.organizationSettings.update({
      stampConfiguration: signatureStampConfig as any, // Usando 'as any' para simplificar o exemplo
    });

    console.log('✅ Configuração de layers padrão salva com sucesso!\n');

    // ========================================
    // 2. CONFIGURAÇÃO PARA ENVELOPE RECEIPT
    // ========================================
    console.log('2️⃣ Configurando layers para envelope de recebimento...');

    const receiptStampConfig = {
      layers: [
        // Layer 1: Logo no header
        {
          order: 1,
          type: 'LOGO',
          position: 'HEADER',
          opacity: 0.5,
        },
        // Layer 2: Carimbo de recebimento no rodapé (última página)
        {
          order: 2,
          type: 'RECEIPT_STAMP',
          position: 'FOOTER',
          opacity: 1.0,
          lastPageOnly: true,
        },
      ],
      validateOverlap: false,
    };

    console.log('📦 Configuração para RECEIPT:', JSON.stringify(receiptStampConfig, null, 2));
    console.log('');

    // ========================================
    // 3. CONFIGURAÇÃO PARA DOCUMENTO CONFIDENCIAL
    // ========================================
    console.log('3️⃣ Configurando layers para documento confidencial...');

    const confidentialStampConfig = {
      layers: [
        // Layer 1: Marca d'água "CONFIDENCIAL" no centro
        {
          order: 1,
          type: 'LOGO',
          position: 'CENTER',
          opacity: 0.1,
          config: {
            text: 'CONFIDENCIAL',
            rotation: -45,
          },
        },
        // Layer 2: Logo no topo
        {
          order: 2,
          type: 'LOGO',
          position: 'TOP_RIGHT',
          opacity: 0.6,
        },
        // Layer 3: Assinatura
        {
          order: 3,
          type: 'SIGNATURE',
          position: 'FIELD',
        },
        // Layer 4: Timestamp em todas as páginas
        {
          order: 4,
          type: 'TIMESTAMP',
          position: 'BOTTOM_RIGHT',
          opacity: 0.6,
        },
      ],
      validateOverlap: true,
      conflictResolution: 'adjust',
    };

    console.log('🔒 Configuração para documento confidencial:', JSON.stringify(confidentialStampConfig, null, 2));
    console.log('');

    // ========================================
    // 4. CONFIGURAÇÃO COM COORDENADAS CUSTOMIZADAS
    // ========================================
    console.log('4️⃣ Configurando layers com coordenadas customizadas...');

    const customPositionConfig = {
      layers: [
        // Layer 1: Logo em posição customizada
        {
          order: 1,
          type: 'LOGO',
          position: 'CUSTOM',
          opacity: 0.5,
          coordinates: {
            x: 50,
            y: 750,
            width: 100,
            height: 50,
            page: 1, // Apenas primeira página
          },
        },
        // Layer 2: Assinatura em posição customizada
        {
          order: 2,
          type: 'SIGNATURE',
          position: 'CUSTOM',
          coordinates: {
            x: 100,
            y: 200,
            width: 200,
            height: 80,
            page: null, // Todas as páginas (se houver múltiplos campos)
          },
        },
      ],
    };

    console.log('🎯 Configuração com coordenadas customizadas:', JSON.stringify(customPositionConfig, null, 2));
    console.log('');

    // ========================================
    // 5. CONFIGURAÇÃO COM PÁGINAS ESPECÍFICAS
    // ========================================
    console.log('5️⃣ Configurando layers para páginas específicas...');

    const specificPagesConfig = {
      layers: [
        // Layer 1: Papel timbrado apenas nas páginas 1 e 5
        {
          order: 1,
          type: 'LETTERHEAD',
          position: 'BACKGROUND',
          opacity: 0.2,
          specificPages: [1, 5],
        },
        // Layer 2: Logo em todas as páginas
        {
          order: 2,
          type: 'LOGO',
          position: 'TOP_RIGHT',
          opacity: 0.4,
        },
        // Layer 3: Timestamp apenas em páginas ímpares
        {
          order: 3,
          type: 'TIMESTAMP',
          position: 'FOOTER',
          opacity: 0.7,
          specificPages: [1, 3, 5, 7, 9],
        },
      ],
    };

    console.log('📄 Configuração para páginas específicas:', JSON.stringify(specificPagesConfig, null, 2));
    console.log('');

    // ========================================
    // 6. CONFIGURAÇÃO COM LAYERS DESABILITADAS
    // ========================================
    console.log('6️⃣ Configurando com layers desabilitadas...');

    const disabledLayersConfig = {
      layers: [
        // Layer 1: Logo ativo
        {
          order: 1,
          type: 'LOGO',
          position: 'TOP_RIGHT',
          opacity: 0.5,
          disabled: false,
        },
        // Layer 2: Papel timbrado DESABILITADO temporariamente
        {
          order: 2,
          type: 'LETTERHEAD',
          position: 'BACKGROUND',
          opacity: 0.2,
          disabled: true, // ❌ Não será aplicado
        },
        // Layer 3: Assinatura ativa
        {
          order: 3,
          type: 'SIGNATURE',
          position: 'FIELD',
          disabled: false,
        },
      ],
    };

    console.log('🚫 Configuração com layers desabilitadas:', JSON.stringify(disabledLayersConfig, null, 2));
    console.log('');

    // ========================================
    // 7. CRIANDO ENVELOPE COM CONFIGURAÇÃO CUSTOMIZADA
    // ========================================
    console.log('7️⃣ Criando envelope com configuração de layers...');

    // Criar envelope (stamps vêm da configuração da organização)
    const envelope = await client.envelopes.create({
      name: 'Contrato com Stamp Layers Customizados',
      description: 'Os stamps serão aplicados conforme configuração de layers da organização',
    });

    console.log(`✅ Envelope criado: ${envelope.id}`);

    // Adicionar signatários
    console.log('\n8️⃣ Adicionando signatários...');

    const signer1 = await client.signers.create(envelope.id, {
      name: 'João Silva',
      email: 'joao@example.com',
      signingOrder: 1, // ✅ Novo campo unificado (FASE 14)
      qualificationType: 'parte', // Novo valor corporativo/acadêmico
    });

    const signer2 = await client.signers.create(envelope.id, {
      name: 'Maria Santos',
      email: 'maria@example.com',
      signingOrder: 2, // ✅ Novo campo unificado (FASE 14)
      qualificationType: 'testemunha',
    });

    console.log(`✅ Signatários adicionados: ${signer1.name}, ${signer2.name}`);
    console.log('   Os stamps serão aplicados conforme a configuração da organização.\n');

    // ========================================
    // 9. VALIDAÇÃO DE CONFIGURAÇÃO
    // ========================================
    console.log('\n9️⃣ Validando configuração de layers...');

    const invalidConfig = {
      layers: [
        // ❌ CONFLITO: Ambos no FOOTER da última página
        {
          order: 1,
          type: 'RECEIPT_STAMP',
          position: 'FOOTER',
          lastPageOnly: true,
        },
        {
          order: 2,
          type: 'TIMESTAMP',
          position: 'FOOTER',
          lastPageOnly: true,
        },
      ],
      validateOverlap: true, // Com validação ativada, conflito será detectado
      conflictResolution: 'skip', // Primeira layer será mantida, segunda pulada
    };

    console.log('⚠️ Configuração com conflito (será resolvido automaticamente):');
    console.log(JSON.stringify(invalidConfig, null, 2));
    console.log('');

    // ========================================
    // 10. CONFIGURAÇÃO POR CONTEXTO
    // ========================================
    console.log('\n🔟 Diferentes configurações por contexto de uso...');

    // Contexto Legal (Processos judiciais)
    const legalContext = {
      layers: [
        {
          order: 1,
          type: 'LETTERHEAD',
          position: 'BACKGROUND',
          opacity: 0.15,
          firstPageOnly: true,
        },
        {
          order: 2,
          type: 'LOGO',
          position: 'TOP_RIGHT',
          opacity: 0.5,
        },
        {
          order: 3,
          type: 'SIGNATURE',
          position: 'FIELD',
        },
        {
          order: 4,
          type: 'PADES_SEAL',
          position: 'METADATA',
        },
      ],
    };

    // Contexto Corporativo (Contratos empresariais)
    const corporateContext = {
      layers: [
        {
          order: 1,
          type: 'LOGO',
          position: 'HEADER',
          opacity: 0.6,
        },
        {
          order: 2,
          type: 'SIGNATURE',
          position: 'FIELD',
        },
        {
          order: 3,
          type: 'TIMESTAMP',
          position: 'FOOTER',
          opacity: 0.8,
        },
      ],
    };

    // Contexto Acadêmico (Documentos universitários)
    const academicContext = {
      layers: [
        {
          order: 1,
          type: 'LETTERHEAD',
          position: 'BACKGROUND',
          opacity: 0.2,
        },
        {
          order: 2,
          type: 'SIGNATURE',
          position: 'FIELD',
        },
        {
          order: 3,
          type: 'DATE_FIELD',
          position: 'FOOTER',
          lastPageOnly: true,
        },
      ],
    };

    console.log('⚖️ Configuração para contexto legal:', JSON.stringify(legalContext, null, 2));
    console.log('');
    console.log('🏢 Configuração para contexto corporativo:', JSON.stringify(corporateContext, null, 2));
    console.log('');
    console.log('🎓 Configuração para contexto acadêmico:', JSON.stringify(academicContext, null, 2));
    console.log('');

    // ========================================
    // 10. BOAS PRÁTICAS
    // ========================================
    console.log('🎯 BOAS PRÁTICAS DE CONFIGURAÇÃO:\n');
    console.log('✅ Ordem de Layers Recomendada:');
    console.log('   1. LETTERHEAD (fundo, opacity 0.1-0.3)');
    console.log('   2. LOGO (header/top_right, opacity 0.3-0.5)');
    console.log('   3. SIGNATURE/TEXT/DATE (campos, opacity 1.0)');
    console.log('   4. TIMESTAMP (rodapé, opacity 0.6-0.8)');
    console.log('   5. PADES_SEAL (metadados)\n');

    console.log('✅ Opacidade Recomendada:');
    console.log('   - LETTERHEAD: 0.1 - 0.3 (muito transparente)');
    console.log('   - LOGO: 0.3 - 0.5 (transparente)');
    console.log('   - SIGNATURE: 1.0 (sempre opaco)');
    console.log('   - TIMESTAMP: 0.6 - 0.8 (semi-transparente)\n');

    console.log('✅ Posicionamento:');
    console.log('   - Use posições diferentes para evitar conflitos');
    console.log('   - Ative validateOverlap: true para detectar sobreposições');
    console.log('   - Use conflictResolution: "adjust" para ajuste automático\n');

    console.log('✅ Aplicação por Página:');
    console.log('   - firstPageOnly: true para papel timbrado (economia)');
    console.log('   - lastPageOnly: true para carimbos de recebimento/aprovação');
    console.log('   - specificPages: [1, 3, 5] para páginas selecionadas\n');

    // Conclusão
    console.log('✅ Exemplo concluído com sucesso!');
    console.log('\n📚 Consulte a documentação completa em:');
    console.log('   docs/STAMP_LAYERS_DOCUMENTATION.md');
    console.log('\n💡 Próximos passos:');
    console.log('   - Configure stamps para sua organização');
    console.log('   - Teste diferentes combinações de layers');
    console.log('   - Ajuste opacidades conforme necessidade');
    console.log('   - Use validação de conflitos em produção');
  } catch (error) {
    console.error('❌ Erro:', error);
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message);
    }
    process.exit(1);
  }
}

// Executar exemplo
main().catch(console.error);
