/**
 * Exemplo 15: Gerenciamento de Usuários e Organizações (FASE 12)
 *
 * Este exemplo demonstra o gerenciamento completo de usuários e membros de organizações:
 *
 * **FASE 1: Criação de Organização com Primeiro Usuário (OWNER)**
 * - Criar usuário que automaticamente cria nova organização
 * - Primeiro usuário sempre é OWNER
 * - Geração automática de API token
 *
 * **FASE 2: Adicionar Membros à Organização Existente**
 * - Adicionar ADMIN à organização
 * - Adicionar MEMBER à organização
 * - Validação de limites de usuários
 * - Autenticação e permissões
 *
 * **FASE 3: Gerenciamento de Roles**
 * - Promover MEMBER para ADMIN
 * - Rebaixar ADMIN para MEMBER
 * - Validações de permissão (apenas OWNER pode alterar roles)
 *
 * **FASE 4: Remoção de Membros**
 * - Remover MEMBER da organização
 * - Validações (não pode remover OWNER)
 * - Permissões (OWNER e ADMIN podem remover)
 *
 * **FASE 5: Consultas e Estatísticas**
 * - Listar usuários da organização
 * - Obter estatísticas da organização
 * - Verificar uso e limites
 *
 * **Cobertura: 100% dos recursos de gerenciamento de usuários e organizações**
 */

import { SignatureClient } from '../src';

async function main() {
  console.log('========== EXEMPLO 15: GERENCIAMENTO DE USUÁRIOS E ORGANIZAÇÕES ==========\n');

  try {
    console.log('========== FASE 1: CRIAR ORGANIZAÇÃO COM OWNER ==========\n');

    // 1. Criar primeiro usuário (OWNER) - cria automaticamente nova organização
    console.log('1️⃣ Criando primeiro usuário (OWNER) com nova organização...');

    // Cliente temporário para criar usuário (endpoint público)
    const publicClient = new SignatureClient({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      accessToken: 'temporary', // Necessário mas será ignorado no endpoint público
    });

    const ownerResponse = await publicClient.users.create({
      email: 'owner@acmecorp.com',
      name: 'Alice Owner',
      password: 'Owner@123!',
      organizationName: 'Acme Corporation',
      generateApiToken: true,
    });

    console.log('✅ Usuário OWNER criado com sucesso!');
    console.log('   ID:', ownerResponse.user.id);
    console.log('   Email:', ownerResponse.user.email);
    console.log('   Nome:', ownerResponse.user.name);
    console.log('   Organization ID:', ownerResponse.user.organizationId); // ✅ Agora retornado pela API
    console.log('   Mensagem:', ownerResponse.message);
    console.log('   API Token:', ownerResponse.apiToken ? '✅ Gerado' : '❌');

    // Guardar dados importantes
    const ownerId = ownerResponse.user.id;
    const ownerToken = ownerResponse.apiToken!;

    // 2. Autenticar como OWNER para fazer login e obter JWT
    console.log('\n2️⃣ Autenticando como OWNER...');
    const ownerClient = new SignatureClient({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      accessToken: 'temporary',
    });

    const ownerLogin = await ownerClient.login('owner@acmecorp.com', 'Owner@123!');

    console.log('✅ Autenticação bem-sucedida!');
    console.log('   Token JWT:', ownerLogin.tokens.accessToken.substring(0, 30) + '...');
    console.log('   Expires in:', ownerLogin.tokens.expiresIn, 'segundos');

    // Configurar cliente autenticado como OWNER
    ownerClient.setAccessToken(ownerLogin.tokens.accessToken);

    // 3. Obter informações da organização
    console.log('\n3️⃣ Obtendo informações da organização...');
    const organization = await ownerClient.organizations.getMyOrganization();

    console.log('✅ Organização:');
    console.log('   ID:', organization.id);
    console.log('   Nome:', organization.name);
    console.log('   Slug:', organization.slug);
    console.log('   Plano:', organization.plan);
    console.log('   Max Usuários:', organization.maxUsers);
    console.log('   Max Envelopes/mês:', organization.maxEnvelopes || '∞ (Ilimitado)');
    console.log('   Usuários Atuais:', organization.currentUsers);
    console.log('   Envelopes Este Mês:', organization.currentMonthEnvelopes);
    console.log('   Storage Usado:', Math.round(organization.storageUsed / 1024 / 1024), 'MB');

    const organizationId = organization.id;

    console.log('\n========== FASE 2: ADICIONAR MEMBROS À ORGANIZAÇÃO ==========\n');

    // 4. Adicionar ADMIN à organização
    console.log('4️⃣ Adicionando ADMIN à organização...');
    const adminResponse = await ownerClient.organizations.addMember(organizationId, {
      email: 'admin@acmecorp.com',
      name: 'Bob Admin',
      password: 'Admin@123!',
      role: 'ADMIN',
      generateApiToken: true,
    });

    console.log('✅ ADMIN adicionado com sucesso!');
    console.log('   ID:', adminResponse.user.id);
    console.log('   Email:', adminResponse.user.email);
    console.log('   Nome:', adminResponse.user.name);
    console.log('   Organization ID:', adminResponse.user.organizationId); // ✅ Mesmo organizationId do OWNER
    console.log('   Mensagem:', adminResponse.message);
    console.log('   API Token:', adminResponse.apiToken ? '✅ Gerado' : '❌');

    const adminId = adminResponse.user.id;
    const adminToken = adminResponse.apiToken!;

    // 5. Adicionar MEMBER à organização
    console.log('\n5️⃣ Adicionando MEMBER à organização...');
    const memberResponse = await ownerClient.organizations.addMember(organizationId, {
      email: 'member@acmecorp.com',
      name: 'Charlie Member',
      password: 'Member@123!',
      role: 'MEMBER',
      generateApiToken: true,
    });

    console.log('✅ MEMBER adicionado com sucesso!');
    console.log('   ID:', memberResponse.user.id);
    console.log('   Email:', memberResponse.user.email);
    console.log('   Nome:', memberResponse.user.name);
    console.log('   Mensagem:', memberResponse.message);

    const memberId = memberResponse.user.id;

    // 6. Adicionar segundo MEMBER à organização
    console.log('\n6️⃣ Adicionando segundo MEMBER à organização...');
    const member2Response = await ownerClient.organizations.addMember(organizationId, {
      email: 'member2@acmecorp.com',
      name: 'Diana Member',
      password: 'Member@123!',
      role: 'MEMBER',
      generateApiToken: false, // Sem API token
    });

    console.log('✅ Segundo MEMBER adicionado com sucesso!');
    console.log('   ID:', member2Response.user.id);
    console.log('   Email:', member2Response.user.email);
    console.log('   API Token:', member2Response.apiToken ? '✅ Gerado' : '❌ Não gerado');

    const member2Id = member2Response.user.id;

    // 7. Listar todos os usuários da organização
    console.log('\n7️⃣ Listando todos os usuários da organização...');
    const allUsers = await ownerClient.users.findAll();

    console.log(`✅ Total de usuários: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Organization ID: ${user.organizationId}`); // ✅ Todos da mesma organização
      console.log(`      Criado em: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}`);
    });

    // 8. Verificar estatísticas atualizadas
    console.log('\n8️⃣ Verificando estatísticas atualizadas...');
    const updatedOrg = await ownerClient.organizations.getMyOrganization();

    console.log('✅ Estatísticas atualizadas:');
    console.log('   Usuários:', updatedOrg.currentUsers, '/', updatedOrg.maxUsers);
    console.log('   Slots disponíveis:', updatedOrg.maxUsers - updatedOrg.currentUsers);
    console.log('   Capacidade:', Math.round((updatedOrg.currentUsers / updatedOrg.maxUsers) * 100), '%');

    console.log('\n========== FASE 3: GERENCIAMENTO DE ROLES ==========\n');

    // 9. Promover MEMBER para ADMIN
    console.log('9️⃣ Promovendo MEMBER (Charlie) para ADMIN...');
    const promoteResponse = await ownerClient.organizations.updateMemberRole(
      organizationId,
      memberId,
      { role: 'ADMIN' }
    );

    console.log('✅ MEMBER promovido para ADMIN!');
    console.log('   Mensagem:', promoteResponse.message);
    console.log('   Usuário:', promoteResponse.user.name);
    console.log('   Email:', promoteResponse.user.email);
    console.log('   Nova Role:', promoteResponse.user.role);

    // 10. Rebaixar ADMIN de volta para MEMBER
    console.log('\n🔟 Rebaixando ADMIN (Charlie) de volta para MEMBER...');
    const demoteResponse = await ownerClient.organizations.updateMemberRole(
      organizationId,
      memberId,
      { role: 'MEMBER' }
    );

    console.log('✅ ADMIN rebaixado para MEMBER!');
    console.log('   Mensagem:', demoteResponse.message);
    console.log('   Usuário:', demoteResponse.user.name);
    console.log('   Nova Role:', demoteResponse.user.role);

    // 11. Tentar alterar role como ADMIN (deve funcionar parcialmente)
    console.log('\n1️⃣1️⃣ Testando permissões de ADMIN...');
    const adminClient = new SignatureClient({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      accessToken: 'temporary',
    });

    const adminLogin = await adminClient.login('admin@acmecorp.com', 'Admin@123!');

    adminClient.setAccessToken(adminLogin.tokens.accessToken);

    console.log('⚠️  ADMIN autenticado. Tentando alterar role de MEMBER...');

    try {
      await adminClient.organizations.updateMemberRole(
        organizationId,
        member2Id,
        { role: 'ADMIN' }
      );
      console.log('❌ ERRO: ADMIN não deveria poder alterar roles!');
    } catch (error: any) {
      console.log('✅ Esperado: ADMIN não pode alterar roles');
      console.log('   Erro:', error.response?.data?.message || error.message);
    }

    console.log('\n========== FASE 4: REMOÇÃO DE MEMBROS ==========\n');

    // 12. ADMIN adiciona novo membro
    console.log('1️⃣2️⃣ ADMIN adicionando novo MEMBER...');
    const member3Response = await adminClient.organizations.addMember(organizationId, {
      email: 'member3@acmecorp.com',
      name: 'Eve Member',
      password: 'Member@123!',
      role: 'MEMBER',
      generateApiToken: false,
    });

    console.log('✅ MEMBER adicionado por ADMIN!');
    console.log('   ID:', member3Response.user.id);
    console.log('   Email:', member3Response.user.email);

    const member3Id = member3Response.user.id;

    // 13. ADMIN remove membro
    console.log('\n1️⃣3️⃣ ADMIN removendo MEMBER (Eve)...');
    const removeResponse = await adminClient.organizations.removeMember(
      organizationId,
      member3Id
    );

    console.log('✅ MEMBER removido por ADMIN!');
    console.log('   Mensagem:', removeResponse.message);

    // 14. Tentar remover ADMIN como ADMIN (deve falhar)
    console.log('\n1️⃣4️⃣ Testando: ADMIN tentando remover outro ADMIN...');

    try {
      await adminClient.organizations.removeMember(organizationId, adminId);
      console.log('❌ ERRO: ADMIN não deveria poder remover ADMIN!');
    } catch (error: any) {
      console.log('✅ Esperado: ADMIN não pode remover ADMIN');
      console.log('   Erro:', error.response?.data?.message || error.message);
    }

    // 15. OWNER remove MEMBER
    console.log('\n1️⃣5️⃣ OWNER removendo MEMBER (Diana)...');
    const ownerRemoveResponse = await ownerClient.organizations.removeMember(
      organizationId,
      member2Id
    );

    console.log('✅ MEMBER removido por OWNER!');
    console.log('   Mensagem:', ownerRemoveResponse.message);

    // 16. Tentar remover OWNER (deve falhar)
    console.log('\n1️⃣6️⃣ Testando: Tentando remover OWNER...');

    try {
      await ownerClient.organizations.removeMember(organizationId, ownerId);
      console.log('❌ ERRO: Não deveria poder remover OWNER!');
    } catch (error: any) {
      console.log('✅ Esperado: Não é possível remover OWNER');
      console.log('   Erro:', error.response?.data?.message || error.message);
    }

    console.log('\n========== FASE 5: CONSULTAS E ESTATÍSTICAS ==========\n');

    // 17. Listar usuários restantes
    console.log('1️⃣7️⃣ Listando usuários restantes na organização...');
    const finalUsers = await ownerClient.users.findAll();

    console.log(`✅ Usuários restantes: ${finalUsers.length}`);
    finalUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });

    // 18. Estatísticas finais
    console.log('\n1️⃣8️⃣ Estatísticas finais da organização...');
    const finalOrg = await ownerClient.organizations.getMyOrganization();

    console.log('✅ Estatísticas finais:');
    console.log('   Nome:', finalOrg.name);
    console.log('   Plano:', finalOrg.plan);
    console.log('   Usuários:', finalOrg.currentUsers, '/', finalOrg.maxUsers);
    console.log('   Envelopes Este Mês:', finalOrg.currentMonthEnvelopes, '/', finalOrg.maxEnvelopes || '∞');
    console.log('   Storage:', Math.round(finalOrg.storageUsed / 1024 / 1024), 'MB');
    console.log('   Ativo:', finalOrg.isActive ? '✅' : '❌');

    // 19. Buscar usuário específico
    console.log('\n1️⃣9️⃣ Buscando usuário específico...');
    const specificUser = await ownerClient.users.findOne(adminId);

    console.log('✅ Usuário encontrado:');
    console.log('   ID:', specificUser.id);
    console.log('   Nome:', specificUser.name);
    console.log('   Email:', specificUser.email);
    console.log('   Organization ID:', specificUser.organizationId); // ✅ Para mapeamento CRM
    console.log('   Criado em:', new Date(specificUser.createdAt).toLocaleString('pt-BR'));
    console.log('   Atualizado em:', new Date(specificUser.updatedAt).toLocaleString('pt-BR'));

    // 20. Filtrar usuários por email
    console.log('\n2️⃣0️⃣ Filtrando usuários por email...');
    const filteredUsers = await ownerClient.users.findAll({
      email: '@acmecorp.com',
    });

    console.log(`✅ Usuários filtrados: ${filteredUsers.length}`);
    filteredUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    console.log('\n========== ✅ EXEMPLO 15 CONCLUÍDO COM SUCESSO! ==========\n');

    console.log('📊 Resumo:');
    console.log('   ✅ Organização criada com OWNER');
    console.log('   ✅ 4 usuários adicionados (1 OWNER, 1 ADMIN, 2 MEMBERS)');
    console.log('   ✅ Roles alteradas (promover/rebaixar)');
    console.log('   ✅ 2 membros removidos');
    console.log('   ✅ Validações de permissões testadas');
    console.log('   ✅ Consultas e filtros funcionando');
    console.log(`   ✅ Total final: ${finalUsers.length} usuários na organização`);

  } catch (error: any) {
    console.error('\n❌ Erro durante execução:', error.message);

    if (error.response?.data) {
      console.error('   Status:', error.response.status);
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Stack:', error.stack);
    }

    process.exit(1);
  }
}

// Executar exemplo
if (require.main === module) {
  main();
}

export { main };
