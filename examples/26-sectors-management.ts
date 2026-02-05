/**
 * Exemplo 26: Gerenciamento de Setores e Destinatários Internos
 *
 * Demonstra:
 * 1. Criação de setores hierárquicos (Diretoria > Gerência > Equipe)
 * 2. Adicionar/remover membros em setores
 * 3. Navegar pela árvore de setores
 * 4. Adicionar signatário interno (vinculado a User) em envelope
 * 5. Buscar membros de um setor para adicionar como signatários
 *
 * **Cenário de uso real:**
 * Uma empresa com estrutura organizacional complexa precisa:
 * - Organizar funcionários em setores hierárquicos
 * - Rotear envelopes internamente baseado na estrutura
 * - Adicionar signatários internos automaticamente via userId
 * - Garantir rastreabilidade de aprovações internas
 */

import { SignatureClient } from '../src';

async function main() {
  console.log('========== EXEMPLO 26: SETORES & DESTINATÁRIOS INTERNOS ==========\n');

  // Cliente autenticado (usuário OWNER ou ADMIN)
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.ACCESS_TOKEN || 'jwt-token-here',
  });

  try {
    console.log('========== FASE 1: CRIAÇÃO DE ESTRUTURA HIERÁRQUICA ==========\n');

    // 1. Criar Diretoria Jurídica (nível 0 - raiz)
    console.log('1️⃣ Criando setor raiz: Diretoria Jurídica...');
    const diretoriaJuridica = await client.sectors.create({
      name: 'Diretoria Jurídica',
      code: 'DIR-JUR',
      description: 'Departamento Jurídico da Organização',
      managerId: 'user-123-manager-juridico', // ID do diretor jurídico
    });
    console.log('✅ Diretoria criada:', diretoriaJuridica.id);
    console.log('   Nome:', diretoriaJuridica.name);
    console.log('   Código:', diretoriaJuridica.code);
    console.log('   Nível:', diretoriaJuridica.level);
    console.log('   Manager ID:', diretoriaJuridica.managerId);

    // 2. Criar Gerência de Contratos (nível 1 - filho da Diretoria)
    console.log('\n2️⃣ Criando setor filho: Gerência de Contratos...');
    const gerenciaContratos = await client.sectors.create({
      name: 'Gerência de Contratos',
      code: 'GER-CONT',
      description: 'Responsável pela elaboração e gestão de contratos',
      parentId: diretoriaJuridica.id,
      managerId: 'user-456-gerente-contratos',
    });
    console.log('✅ Gerência criada:', gerenciaContratos.id);
    console.log('   Nome:', gerenciaContratos.name);
    console.log('   Código:', gerenciaContratos.code);
    console.log('   Nível:', gerenciaContratos.level);
    console.log('   Parent:', diretoriaJuridica.name);

    // 3. Criar Equipe Societário (nível 2 - neto)
    console.log('\n3️⃣ Criando equipe: Equipe Societário...');
    const equipeSocietario = await client.sectors.create({
      name: 'Equipe Societário',
      code: 'EQ-SOC',
      description: 'Contratos societários, fusões e aquisições',
      parentId: gerenciaContratos.id,
      managerId: 'user-789-coordenador-societario',
    });
    console.log('✅ Equipe criada:', equipeSocietario.id);
    console.log('   Nome:', equipeSocietario.name);
    console.log('   Código:', equipeSocietario.code);
    console.log('   Nível:', equipeSocietario.level);
    console.log('   Path:', equipeSocietario.path);

    // 4. Criar Equipe Trabalhista (nível 2 - irmão do Societário)
    console.log('\n4️⃣ Criando equipe paralela: Equipe Trabalhista...');
    const equipeTrabalhista = await client.sectors.create({
      name: 'Equipe Trabalhista',
      code: 'EQ-TRAB',
      description: 'Contratos de trabalho e questões sindicais',
      parentId: gerenciaContratos.id,
      managerId: 'user-101-coordenador-trabalhista',
    });
    console.log('✅ Equipe criada:', equipeTrabalhista.id);
    console.log('   Nome:', equipeTrabalhista.name);

    console.log('\n========== FASE 2: GERENCIAMENTO DE MEMBROS ==========\n');

    // 5. Adicionar usuários ao setor Societário
    console.log('5️⃣ Adicionando membros à Equipe Societário...\n');

    console.log('   a) Adicionando advogado sênior (membro primário)...');
    const membro1 = await client.sectors.addUser(equipeSocietario.id, {
      userId: 'user-201-advogado-senior',
      isPrimary: true, // Setor primário do usuário
      role: 'Advogado Sênior',
    });
    console.log('   ✅ Membro adicionado:', membro1.id);
    console.log('      User ID:', membro1.userId);
    console.log('      Setor primário:', membro1.isPrimary ? '✅' : '❌');
    console.log('      Role:', membro1.role);

    console.log('\n   b) Adicionando advogado júnior...');
    const membro2 = await client.sectors.addUser(equipeSocietario.id, {
      userId: 'user-202-advogado-junior',
      isPrimary: true,
      role: 'Advogado Júnior',
    });
    console.log('   ✅ Membro adicionado:', membro2.userId);

    console.log('\n   c) Adicionando estagiário...');
    const membro3 = await client.sectors.addUser(equipeSocietario.id, {
      userId: 'user-203-estagiario',
      isPrimary: true,
      role: 'Estagiário',
    });
    console.log('   ✅ Membro adicionado:', membro3.userId);

    // 6. Adicionar usuário à Equipe Trabalhista
    console.log('\n6️⃣ Adicionando membro à Equipe Trabalhista...');
    const membro4 = await client.sectors.addUser(equipeTrabalhista.id, {
      userId: 'user-204-especialista-trabalhista',
      isPrimary: true,
      role: 'Especialista Trabalhista',
    });
    console.log('   ✅ Membro adicionado:', membro4.userId);

    console.log('\n========== FASE 3: NAVEGAÇÃO PELA ÁRVORE ==========\n');

    // 7. Obter árvore completa da organização
    console.log('7️⃣ Obtendo árvore hierárquica completa...');
    const tree = await client.sectors.getTree();
    console.log('✅ Árvore obtida:', tree.length, 'setores raiz\n');
    
    console.log('📊 Estrutura hierárquica:');
    printTree(tree, 0);

    // 8. Listar filhos diretos da Gerência de Contratos
    console.log('\n8️⃣ Listando filhos diretos da Gerência de Contratos...');
    const children = await client.sectors.getChildren(gerenciaContratos.id);
    console.log('✅ Filhos encontrados:', children.length);
    children.forEach((child) => {
      console.log(`   - ${child.name} (${child.code}) - Nível ${child.level}`);
    });

    // 9. Listar membros da Equipe Societário
    console.log('\n9️⃣ Listando membros da Equipe Societário...');
    const membros = await client.sectors.getUsers(equipeSocietario.id);
    console.log('✅ Membros encontrados:', membros.length);
    membros.forEach((m) => {
      console.log(`   - ${m.user?.name || 'N/A'} (${m.user?.email || 'N/A'})`);
      console.log(`     Role: ${m.role || 'N/A'} | Primário: ${m.isPrimary ? '✅' : '❌'}`);
    });

    console.log('\n========== FASE 4: CRIAR ENVELOPE COM SIGNATÁRIOS INTERNOS ==========\n');

    // 10. Criar envelope e adicionar signatários internos
    console.log('🔟 Criando envelope com destinatários internos...\n');

    console.log('   a) Criando envelope...');
    const envelope = await client.envelopes.create({
      name: 'Contrato de Fusão - Acme Corp',
      description: 'Contrato interno para aprovação da fusão',
    });
    console.log('   ✅ Envelope criado:', envelope.id);

    console.log('\n   b) Adicionando coordenador como primeiro signatário (interno)...');
    const signer1 = await client.signers.create(envelope.id, {
      // 🆕 Usando userId para vincular signatário interno
      userId: 'user-789-coordenador-societario',
      signingOrder: 1,
      // name e email são preenchidos automaticamente do User
    });
    console.log('   ✅ Signatário interno adicionado:', signer1.id);
    console.log('      User ID:', signer1.userId);
    console.log('      É interno:', signer1.isInternal ? '✅' : '❌');
    console.log('      Nome:', signer1.name);
    console.log('      Email:', signer1.email);
    if (signer1.user) {
      console.log('      Dados do usuário:');
      console.log('        - ID:', signer1.user.id);
      console.log('        - Nome:', signer1.user.name);
      console.log('        - Email:', signer1.user.email);
      console.log('        - Role:', signer1.user.role);
    }

    console.log('\n   c) Adicionando advogado sênior como segundo signatário (interno)...');
    const signer2 = await client.signers.create(envelope.id, {
      userId: 'user-201-advogado-senior',
      signingOrder: 2,
    });
    console.log('   ✅ Signatário interno adicionado:', signer2.id);
    console.log('      É interno:', signer2.isInternal ? '✅' : '❌');

    console.log('\n   d) Adicionando signatário externo (tradicional)...');
    const signer3 = await client.signers.create(envelope.id, {
      name: 'Carlos Silva',
      email: 'carlos.silva@external-company.com',
      phoneNumber: '+5511987654321',
      signingOrder: 3,
      // Sem userId = destinatário externo
    });
    console.log('   ✅ Signatário externo adicionado:', signer3.id);
    console.log('      User ID:', signer3.userId || 'null (externo)');
    console.log('      É interno:', signer3.isInternal ? '✅' : '❌ (externo)');

    // 11. Listar todos signatários do envelope mostrando internos/externos
    console.log('\n1️⃣1️⃣ Listando todos signatários do envelope...');
    const signersResponse = await client.signers.findAll({ envelopeId: envelope.id });
    const signersList = signersResponse.data || [];
    console.log('✅ Signatários encontrados:', signersList.length);
    console.log('\n📋 Lista de assinatura:');
    signersList.forEach((s: any, idx: number) => {
      const type = s.isInternal ? '🏢 INTERNO' : '🌐 EXTERNO';
      console.log(`\n   ${idx + 1}. ${type}`);
      console.log(`      Nome: ${s.name}`);
      console.log(`      Email: ${s.email}`);
      console.log(`      User ID: ${s.userId || 'N/A'}`);
      console.log(`      Ordem: ${s.signingOrder}`);
      console.log(`      Status: ${s.status}`);
    });

    console.log('\n========== FASE 5: BUSCAR MEMBROS DE SETOR PARA ASSINATURA ==========\n');

    // 12. Buscar todos membros da Equipe Trabalhista para adicionar ao envelope
    console.log('1️⃣2️⃣ Buscando membros da Equipe Trabalhista para adicionar...');
    const membrosTrabalh = await client.sectors.getUsers(equipeTrabalhista.id);
    console.log('✅ Membros encontrados:', membrosTrabalh.length);

    if (membrosTrabalh.length > 0) {
      console.log('\n   💡 Adicionando todos membros do setor como signatários...');
      for (const membro of membrosTrabalh) {
        if (membro.userId) {
          const newSigner = await client.signers.create(envelope.id, {
            userId: membro.userId,
            signingOrder: 4, // Todos na mesma ordem (paralelo)
          });
          console.log(`   ✅ ${membro.user?.name || 'N/A'} adicionado como signatário`);
        }
      }
    }

    console.log('\n========== FASE 6: GERENCIAMENTO DE SETORES ==========\n');

    // 13. Listar todos setores ativos
    console.log('1️⃣3️⃣ Listando todos setores ativos...');
    const activeSectos = await client.sectors.findAll({ isActive: true });
    console.log('✅ Setores ativos:', activeSectos.length);

    // 14. Buscar setores por nome
    console.log('\n1️⃣4️⃣ Buscando setores com "Equipe" no nome...');
    const searchResults = await client.sectors.findAll({ search: 'Equipe' });
    console.log('✅ Setores encontrados:', searchResults.length);
    searchResults.forEach((s) => {
      console.log(`   - ${s.name} (${s.code})`);
    });

    // 15. Obter detalhes de um setor específico
    console.log('\n1️⃣5️⃣ Obtendo detalhes do setor Societário...');
    const sectorDetails = await client.sectors.findOne(equipeSocietario.id);
    console.log('✅ Setor obtido:', sectorDetails.name);
    console.log('   Código:', sectorDetails.code);
    console.log('   Nível:', sectorDetails.level);
    console.log('   Manager ID:', sectorDetails.managerId);
    console.log('   Número de membros:', sectorDetails.userCount);
    if (sectorDetails.parent) {
      console.log('   Parent:', sectorDetails.parent.name);
    }
    if (sectorDetails.manager) {
      console.log('   Manager:', sectorDetails.manager.name, `(${sectorDetails.manager.email})`);
    }

    // 16. Atualizar setor
    console.log('\n1️⃣6️⃣ Atualizando descrição da Equipe Societário...');
    const updatedSector = await client.sectors.update(equipeSocietario.id, {
      description: 'Contratos societários, fusões, aquisições e governança corporativa',
    });
    console.log('✅ Setor atualizado:', updatedSector.name);
    console.log('   Nova descrição:', updatedSector.description);

    // 17. Listar setores de um usuário específico
    console.log('\n1️⃣7️⃣ Listando setores do advogado sênior...');
    const userSectors = await client.sectors.getUserSectors('user-201-advogado-senior');
    console.log('✅ Setores encontrados:', userSectors.length);
    userSectors.forEach((s) => {
      console.log(`   - ${s.name} (${s.code})`);
    });

    // 18. Remover usuário de setor
    console.log('\n1️⃣8️⃣ Removendo estagiário da Equipe Societário...');
    await client.sectors.removeUser(equipeSocietario.id, 'user-203-estagiario');
    console.log('✅ Usuário removido do setor');

    // Verificar membros após remoção
    const membrosAposRemocao = await client.sectors.getUsers(equipeSocietario.id);
    console.log('   Membros restantes:', membrosAposRemocao.length);

    // 19. Desativar setor (soft delete)
    console.log('\n1️⃣9️⃣ Desativando setor Trabalhista...');
    await client.sectors.update(equipeTrabalhista.id, { isActive: false });
    console.log('✅ Setor desativado (soft delete)');

    console.log('\n========== RESUMO ==========\n');
    console.log('✅ Estrutura hierárquica criada com 4 setores');
    console.log('✅ 4 usuários vinculados aos setores');
    console.log('✅ Envelope criado com 2 signatários internos e 1 externo');
    console.log('✅ Navegação pela árvore e busca de membros');
    console.log('✅ Gerenciamento completo de setores e membros');
    console.log('\n💡 Benefícios da feature de Setores:');
    console.log('   - Organização hierárquica de funcionários');
    console.log('   - Roteamento automático de envelopes');
    console.log('   - Rastreabilidade de aprovações internas');
    console.log('   - Integração perfeita com signatários (userId)');
    console.log('   - Gestão de estrutura organizacional complexa');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', error.response.data);
    }
    process.exit(1);
  }
}

/**
 * Helper para imprimir árvore hierárquica
 */
function printTree(nodes: any[], level: number) {
  nodes.forEach((node) => {
    const indent = '  '.repeat(level);
    const icon = level === 0 ? '🏢' : level === 1 ? '📂' : '📁';
    console.log(`${indent}${icon} ${node.name} (${node.code || 'N/A'})`);
    console.log(`${indent}   └─ Nível ${node.level} | Membros: ${node.userCount || 0}`);
    if (node.children && node.children.length > 0) {
      printTree(node.children, level + 1);
    }
  });
}

// Executar exemplo
main();
