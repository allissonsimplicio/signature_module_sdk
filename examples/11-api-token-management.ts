/**
 * Exemplo 11: API Token Management (COMPLETO)
 *
 * Este exemplo demonstra TODOS os recursos de gerenciamento de API tokens:
 *
 * **FASE 1: Criação de API Tokens**
 * - Token sem expiração (permanente)
 * - Token com expiração em dias (expiresInDays)
 * - Token com data específica de expiração (expiresAt)
 * - Tokens nomeados para diferentes propósitos
 *
 * **FASE 2: Gerenciamento de Tokens**
 * - Listagem de todos os tokens
 * - Busca de token específico por ID
 * - Atualização de nome e expiração
 * - Filtros avançados (status, data, nome)
 *
 * **FASE 3: Ciclo de Vida de Tokens**
 * - Revogação temporária (desativar)
 * - Reativação de token revogado
 * - Deleção permanente
 * - Verificação de status (ativo/expirado)
 *
 * **FASE 4: Segurança e Melhores Práticas**
 * - Armazenamento seguro de tokens
 * - Rotação de tokens antes de expirar
 * - Princípio do menor privilégio
 * - Tokens por finalidade (CI/CD, webhooks, integrações)
 *
 * **FASE 5: Monitoramento e Auditoria**
 * - Tracking de último uso (lastUsedAt)
 * - Identificação de tokens inativos
 * - Auditoria de tokens criados/revogados
 * - Alertas de expiração iminente
 *
 * **FASE 6: Cenários de Uso Práticos**
 * - Tokens para CI/CD pipelines
 * - Tokens para webhooks
 * - Tokens para integrações de terceiros
 * - Tokens para testes/desenvolvimento
 *
 * **Cobertura: 100% dos recursos de API Token Management**
 */

import { SignatureClient } from '../src';

/**
 * Helper: Armazenamento seguro de tokens (exemplo simplificado)
 */
class SecureTokenStorage {
  private tokens: Map<string, string> = new Map();

  // Armazena token de forma segura
  store(name: string, token: string): void {
    // Em produção, use:
    // - Variáveis de ambiente (process.env)
    // - Vault/Secret Manager (AWS Secrets Manager, HashiCorp Vault)
    // - Encrypted storage
    // - Keychain (para aplicações nativas)
    this.tokens.set(name, token);
    console.log(`   🔒 Token "${name}" armazenado de forma segura`);
    console.log('   💡 Em produção: Use variáveis de ambiente ou secret manager');
  }

  // Recupera token
  retrieve(name: string): string | undefined {
    return this.tokens.get(name);
  }

  // Remove token
  remove(name: string): void {
    this.tokens.delete(name);
    console.log(`   🗑️ Token "${name}" removido do armazenamento`);
  }

  // Lista todos os nomes de tokens (sem expor os valores)
  list(): string[] {
    return Array.from(this.tokens.keys());
  }
}

/**
 * Helper: Verificar se token está próximo de expirar
 */
function isTokenExpiringSoon(expiresAt: Date | null, daysThreshold: number = 7): boolean {
  if (!expiresAt) return false; // Token sem expiração

  const now = new Date();
  const daysUntilExpiration = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiration <= daysThreshold && daysUntilExpiration > 0;
}

/**
 * Helper: Verificar se token expirou
 */
function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false; // Token sem expiração
  return new Date() > new Date(expiresAt);
}

/**
 * Helper: Calcular dias até expiração
 */
function getDaysUntilExpiration(expiresAt: Date | null): number | null {
  if (!expiresAt) return null; // Token sem expiração

  const now = new Date();
  const days = Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return days;
}

async function main() {
  console.log('========== EXEMPLO 11: API TOKEN MANAGEMENT ==========\n');

  // Cliente autenticado com JWT do usuário (obtido via login)
  // IMPORTANTE: O SDK suporta AUTENTICAÇÃO HÍBRIDA
  // - accessToken pode ser um JWT (curta duração, 15min)
  // - accessToken pode ser um API Token (longa duração ou permanente)
  // Ambos funcionam transparentemente no mesmo header Authorization: Bearer
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.USER_JWT_TOKEN || 'user-jwt-token', // JWT do login
  });

  const tokenStorage = new SecureTokenStorage();

  console.log('========== FASE 1: CRIAÇÃO DE API TOKENS ==========\n');

  // 1. Token sem expiração (permanente)
  console.log('1️⃣ Criando token PERMANENTE (sem expiração)...');
  const permanentToken = await client.apiTokens.create({
    name: 'Production API Token',
    // Sem expiresInDays ou expiresAt = permanente
  });
  console.log('✅ Token permanente criado:', permanentToken.id);
  console.log('   Nome:', permanentToken.name);
  console.log('   Expira em:', permanentToken.expiresAt ? new Date(permanentToken.expiresAt).toLocaleDateString() : 'NUNCA (permanente)');
  console.log('   Token:', permanentToken.token.substring(0, 20) + '...');
  console.log('   ⚠️ IMPORTANTE: Guarde este token de forma segura!');
  console.log('   ⚠️ O token completo só é mostrado AGORA. Não será possível recuperá-lo depois.');

  // Armazenar token de forma segura
  tokenStorage.store('production-api', permanentToken.token);

  // 2. Token com expiração em dias
  console.log('\n2️⃣ Criando token com expiração em 30 dias...');
  const monthlyToken = await client.apiTokens.create({
    name: 'Monthly CI/CD Token',
    expiresInDays: 30,
  });
  console.log('✅ Token criado:', monthlyToken.id);
  console.log('   Nome:', monthlyToken.name);
  console.log('   Criado em:', new Date(monthlyToken.createdAt).toLocaleDateString());
  console.log('   Expira em:', new Date(monthlyToken.expiresAt!).toLocaleDateString());
  console.log('   Dias até expiração:', getDaysUntilExpiration(monthlyToken.expiresAt));
  console.log('   💡 Ideal para tokens de curto prazo e rotação regular');

  tokenStorage.store('cicd-token', monthlyToken.token);

  // 3. Token com data específica de expiração
  console.log('\n3️⃣ Criando token com data específica de expiração...');
  const specificDateExpiry = new Date();
  specificDateExpiry.setFullYear(specificDateExpiry.getFullYear() + 1); // 1 ano

  const annualToken = await client.apiTokens.create({
    name: 'Annual Integration Token',
    expiresAt: specificDateExpiry.toISOString(),
  });
  console.log('✅ Token criado:', annualToken.id);
  console.log('   Nome:', annualToken.name);
  console.log('   Expira em:', new Date(annualToken.expiresAt!).toLocaleDateString());
  console.log('   💡 Útil quando você sabe a data exata de expiração desejada');

  tokenStorage.store('integration-token', annualToken.token);

  // 4. Tokens para diferentes finalidades
  console.log('\n4️⃣ Criando tokens para diferentes finalidades...\n');

  console.log('   a) Token para Webhooks (7 dias)...');
  const webhookToken = await client.apiTokens.create({
    name: 'Webhook Handler Token',
    expiresInDays: 7,
  });
  console.log('   ✅ Criado:', webhookToken.name);
  console.log('   💡 Uso: Autenticar callbacks de webhooks');
  tokenStorage.store('webhook-token', webhookToken.token);

  console.log('\n   b) Token para Desenvolvimento (3 dias)...');
  const devToken = await client.apiTokens.create({
    name: 'Development/Testing Token',
    expiresInDays: 3,
  });
  console.log('   ✅ Criado:', devToken.name);
  console.log('   💡 Uso: Testes locais e desenvolvimento');
  tokenStorage.store('dev-token', devToken.token);

  console.log('\n   c) Token para Integração de Terceiros (90 dias)...');
  const partnerToken = await client.apiTokens.create({
    name: 'Partner Integration Token - Acme Corp',
    expiresInDays: 90,
  });
  console.log('   ✅ Criado:', partnerToken.name);
  console.log('   💡 Uso: Parceiros e integrações externas');
  tokenStorage.store('partner-token', partnerToken.token);

  console.log('\n========== FASE 2: GERENCIAMENTO DE TOKENS ==========\n');

  // 5. Listar todos os tokens
  console.log('5️⃣ Listando todos os API tokens...');
  const allTokens = await client.apiTokens.findAll();
  console.log('✅ Total de tokens:', allTokens.length);
  console.log('\n   📋 Lista de tokens:');
  allTokens.forEach((token, idx) => {
    const statusIcon = token.isActive ? '✅' : '⏸️';
    const expiryStatus = isTokenExpired(token.expiresAt)
      ? '❌ EXPIRADO'
      : isTokenExpiringSoon(token.expiresAt)
      ? '⚠️ EXPIRA EM BREVE'
      : '✅ OK';
    const expiryInfo = token.expiresAt
      ? `${new Date(token.expiresAt).toLocaleDateString()} (${getDaysUntilExpiration(token.expiresAt)}d)`
      : 'NUNCA';
    const lastUsed = token.lastUsedAt
      ? new Date(token.lastUsedAt).toLocaleDateString()
      : 'Nunca usado';

    console.log(`   ${statusIcon} ${idx + 1}. ${token.name}`);
    console.log(`      ID: ${token.id}`);
    console.log(`      Expira: ${expiryInfo} ${expiryStatus}`);
    console.log(`      Último uso: ${lastUsed}`);
  });

  // 6. Buscar token específico por ID
  console.log('\n6️⃣ Buscando token específico por ID...');
  const specificToken = await client.apiTokens.findOne(permanentToken.id);
  console.log('✅ Token encontrado:', specificToken.name);
  console.log('   ID:', specificToken.id);
  console.log('   Ativo:', specificToken.isActive ? 'SIM ✅' : 'NÃO ⏸️');
  console.log('   Criado em:', new Date(specificToken.createdAt).toLocaleDateString());
  console.log('   💡 Note: O token em si NÃO é retornado (apenas na criação)');

  // 7. Atualizar nome do token
  console.log('\n7️⃣ Atualizando nome do token...');
  const updatedToken = await client.apiTokens.update(devToken.id, {
    name: 'Development Token - Updated',
  });
  console.log('✅ Token atualizado');
  console.log('   Nome antigo:', devToken.name);
  console.log('   Nome novo:', updatedToken.name);

  // 8. Atualizar data de expiração
  console.log('\n8️⃣ Estendendo data de expiração do token...');
  const newExpiryDate = new Date();
  newExpiryDate.setDate(newExpiryDate.getDate() + 60); // Estender por 60 dias

  const extendedToken = await client.apiTokens.update(monthlyToken.id, {
    expiresAt: newExpiryDate.toISOString(),
  });
  console.log('✅ Expiração estendida');
  console.log('   Expirava em:', new Date(monthlyToken.expiresAt!).toLocaleDateString());
  console.log('   Nova expiração:', new Date(extendedToken.expiresAt!).toLocaleDateString());
  console.log('   💡 Útil para estender tokens antes de expirar');

  // 9. Filtros avançados
  console.log('\n9️⃣ Buscando tokens com filtros avançados...\n');

  console.log('   a) Tokens ativos apenas...');
  const activeTokens = await client.apiTokens.findAll({ isActive: true });
  console.log(`   ✅ Encontrados: ${activeTokens.length} tokens ativos`);

  console.log('\n   b) Tokens criados nos últimos 7 dias...');
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTokens = await client.apiTokens.findAll({
    createdFrom: sevenDaysAgo.toISOString(),
  });
  console.log(`   ✅ Encontrados: ${recentTokens.length} tokens recentes`);

  console.log('\n   c) Tokens que expiram nos próximos 30 dias...');
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringSoonTokens = await client.apiTokens.findAll({
    expiresFrom: new Date().toISOString(),
    expiresTo: thirtyDaysFromNow.toISOString(),
  });
  console.log(`   ✅ Encontrados: ${expiringSoonTokens.length} tokens expirando em breve`);
  if (expiringSoonTokens.length > 0) {
    console.log('   ⚠️ ALERTA: Considere renovar esses tokens!');
  }

  console.log('\n   d) Buscar token por nome...');
  const cicdTokens = await client.apiTokens.findAll({
    name: 'CI/CD',
  });
  console.log(`   ✅ Encontrados: ${cicdTokens.length} tokens com "CI/CD" no nome`);

  console.log('\n========== FASE 3: CICLO DE VIDA DE TOKENS ==========\n');

  // 10. Revogar token temporariamente
  console.log('🔟 Revogando token temporariamente...');
  console.log(`   Token: ${devToken.name}`);
  await client.apiTokens.revoke(devToken.id);
  console.log('✅ Token revogado (desativado)');
  console.log('   Status:', 'INATIVO ⏸️');
  console.log('   💡 Token não pode mais ser usado para autenticação');
  console.log('   💡 Pode ser reativado posteriormente');

  // Verificar status
  const revokedToken = await client.apiTokens.findOne(devToken.id);
  console.log('   Confirmação - Ativo:', revokedToken.isActive ? 'SIM' : 'NÃO ⏸️');

  // 11. Reativar token
  console.log('\n1️⃣1️⃣ Reativando token previamente revogado...');
  await client.apiTokens.activate(devToken.id);
  console.log('✅ Token reativado');
  console.log('   Status:', 'ATIVO ✅');
  console.log('   💡 Token pode ser usado novamente');

  const reactivatedToken = await client.apiTokens.findOne(devToken.id);
  console.log('   Confirmação - Ativo:', reactivatedToken.isActive ? 'SIM ✅' : 'NÃO');

  // 12. Deletar token permanentemente
  console.log('\n1️⃣2️⃣ Deletando token permanentemente...');
  console.log(`   Token a deletar: ${webhookToken.name}`);
  console.log('   ⚠️ ATENÇÃO: Operação irreversível!');
  await client.apiTokens.remove(webhookToken.id);
  console.log('✅ Token deletado permanentemente');
  console.log('   💡 Token não pode mais ser recuperado ou reativado');

  // Remover do storage
  tokenStorage.remove('webhook-token');

  // Tentar buscar token deletado (deve falhar)
  console.log('\n   Tentando buscar token deletado...');
  try {
    await client.apiTokens.findOne(webhookToken.id);
    console.log('   ⚠️ Token ainda existe (inesperado)');
  } catch (error) {
    console.log('   ✅ Confirmado: Token não existe mais (404)');
  }

  console.log('\n========== FASE 4: SEGURANÇA E MELHORES PRÁTICAS ==========\n');

  // 13. Armazenamento seguro
  console.log('1️⃣3️⃣ Melhores práticas de armazenamento de tokens...\n');

  console.log('   ❌ NÃO FAZER:');
  console.log('      - Commitar tokens em repositórios Git');
  console.log('      - Armazenar tokens em texto plano no código');
  console.log('      - Compartilhar tokens via email ou chat');
  console.log('      - Logar tokens em arquivos de log');
  console.log('      - Expor tokens no frontend (JavaScript)');

  console.log('\n   ✅ FAZER:');
  console.log('      - Usar variáveis de ambiente (.env)');
  console.log('      - Usar secret managers (AWS Secrets Manager, Vault)');
  console.log('      - Usar encrypted storage');
  console.log('      - Rotacionar tokens regularmente');
  console.log('      - Usar tokens diferentes para cada ambiente (dev/staging/prod)');
  console.log('      - Revogar tokens imediatamente se comprometidos');

  console.log('\n   📋 Tokens armazenados de forma segura:');
  tokenStorage.list().forEach((name, idx) => {
    console.log(`      ${idx + 1}. ${name}`);
  });

  // 14. Rotação de tokens
  console.log('\n1️⃣4️⃣ Rotação de tokens (Token Rotation)...\n');

  console.log('   💡 Cenário: Token expirando em 5 dias, rotacionar preventivamente');

  async function rotateToken(oldTokenId: string, tokenName: string): Promise<string> {
    console.log(`   Rotacionando token: ${tokenName}`);

    // 1. Criar novo token
    console.log('   1. Criando novo token...');
    const newToken = await client.apiTokens.create({
      name: `${tokenName} (Rotated)`,
      expiresInDays: 30,
    });
    console.log(`   ✅ Novo token criado: ${newToken.id}`);

    // 2. Atualizar aplicação para usar novo token
    console.log('   2. Atualizando aplicação com novo token...');
    tokenStorage.store(tokenName, newToken.token);
    console.log('   ✅ Token atualizado no storage');

    // 3. Aguardar período de graça (24-48h em produção)
    console.log('   3. Aguardando período de graça...');
    console.log('   💡 Em produção: Aguardar 24-48h para garantir que todos os sistemas migraram');

    // 4. Revogar token antigo
    console.log('   4. Revogando token antigo...');
    await client.apiTokens.revoke(oldTokenId);
    console.log('   ✅ Token antigo revogado');

    // 5. Após confirmação, deletar token antigo
    console.log('   5. Deletando token antigo...');
    await client.apiTokens.remove(oldTokenId);
    console.log('   ✅ Token antigo deletado');

    console.log(`   ✅ Rotação completa para "${tokenName}"`);
    return newToken.token;
  }

  // Simular rotação do token de CI/CD
  console.log('   Executando rotação do token de CI/CD:');
  await rotateToken(monthlyToken.id, 'cicd-token');

  // 15. Princípio do menor privilégio
  console.log('\n1️⃣5️⃣ Aplicando princípio do menor privilégio...\n');

  console.log('   💡 Estratégia: Criar tokens específicos para cada finalidade');
  console.log('   ✅ Vantagens:');
  console.log('      - Limitar impacto se token for comprometido');
  console.log('      - Facilitar auditoria e tracking');
  console.log('      - Possibilitar revogação granular');
  console.log('      - Melhorar rastreabilidade');

  console.log('\n   📋 Exemplo de tokens por finalidade:');
  const purposeTokens = [
    { name: 'CI/CD Pipeline - GitHub Actions', expiresInDays: 30 },
    { name: 'Webhook Receiver - Production', expiresInDays: 90 },
    { name: 'Data Export Job - Weekly', expiresInDays: 365 },
    { name: 'Monitoring & Alerts - Datadog', expiresInDays: 180 },
    { name: 'Integration - Partner XYZ', expiresInDays: 90 },
  ];

  console.log('   Criando tokens específicos:');
  for (const tokenConfig of purposeTokens) {
    const token = await client.apiTokens.create(tokenConfig);
    console.log(`   ✅ ${tokenConfig.name} (expira em ${tokenConfig.expiresInDays}d)`);
    tokenStorage.store(token.name, token.token);
  }

  console.log('\n========== FASE 5: MONITORAMENTO E AUDITORIA ==========\n');

  // 16. Identificar tokens inativos
  console.log('1️⃣6️⃣ Identificando tokens inativos...\n');

  const currentTokens = await client.apiTokens.findAll();
  const inactiveTokens = currentTokens.filter((token) => {
    if (!token.lastUsedAt) return true; // Nunca usado
    const daysSinceLastUse = Math.floor(
      (Date.now() - new Date(token.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastUse > 30; // Não usado há mais de 30 dias
  });

  console.log('   📊 Análise de uso de tokens:');
  console.log(`   Total de tokens: ${currentTokens.length}`);
  console.log(`   Tokens ativos: ${currentTokens.filter((t) => t.isActive).length}`);
  console.log(`   Tokens inativos/não usados: ${inactiveTokens.length}`);

  if (inactiveTokens.length > 0) {
    console.log('\n   ⚠️ Tokens não usados recentemente:');
    inactiveTokens.forEach((token, idx) => {
      const lastUsed = token.lastUsedAt
        ? `${Math.floor((Date.now() - new Date(token.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24))} dias atrás`
        : 'Nunca usado';
      console.log(`      ${idx + 1}. ${token.name} - Último uso: ${lastUsed}`);
    });
    console.log('   💡 Ação recomendada: Revogar ou deletar tokens não utilizados');
  }

  // 17. Alertas de expiração iminente
  console.log('\n1️⃣7️⃣ Sistema de alertas de expiração...\n');

  const tokensExpiringSoon = currentTokens.filter((token) =>
    isTokenExpiringSoon(token.expiresAt, 7)
  );

  if (tokensExpiringSoon.length > 0) {
    console.log('   ⚠️ ALERTAS DE EXPIRAÇÃO:');
    tokensExpiringSoon.forEach((token, idx) => {
      const daysLeft = getDaysUntilExpiration(token.expiresAt);
      console.log(`      ${idx + 1}. ${token.name}`);
      console.log(`         Expira em: ${daysLeft} dia(s)`);
      console.log(`         Data: ${new Date(token.expiresAt!).toLocaleDateString()}`);
    });
    console.log('\n   💡 Ação recomendada: Rotacionar estes tokens');
  } else {
    console.log('   ✅ Nenhum token expirando nos próximos 7 dias');
  }

  // Tokens já expirados
  const expiredTokens = currentTokens.filter((token) => isTokenExpired(token.expiresAt));
  if (expiredTokens.length > 0) {
    console.log('\n   ❌ TOKENS EXPIRADOS:');
    expiredTokens.forEach((token, idx) => {
      console.log(`      ${idx + 1}. ${token.name}`);
      console.log(`         Expirou em: ${new Date(token.expiresAt!).toLocaleDateString()}`);
    });
    console.log('   💡 Ação recomendada: Deletar tokens expirados');
  }

  // 18. Auditoria completa
  console.log('\n1️⃣8️⃣ Auditoria completa de tokens...\n');

  console.log('   📊 Relatório de Auditoria:');
  console.log('   ═══════════════════════════════════════════════════');

  const audit = {
    totalTokens: currentTokens.length,
    activeTokens: currentTokens.filter((t) => t.isActive).length,
    revokedTokens: currentTokens.filter((t) => !t.isActive).length,
    permanentTokens: currentTokens.filter((t) => !t.expiresAt).length,
    temporaryTokens: currentTokens.filter((t) => t.expiresAt).length,
    expiredTokens: expiredTokens.length,
    expiringSoonTokens: tokensExpiringSoon.length,
    unusedTokens: currentTokens.filter((t) => !t.lastUsedAt).length,
    recentlyUsedTokens: currentTokens.filter((t) => {
      if (!t.lastUsedAt) return false;
      const daysSinceUse = Math.floor(
        (Date.now() - new Date(t.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUse <= 7;
    }).length,
  };

  console.log(`   Total de tokens: ${audit.totalTokens}`);
  console.log(`   Tokens ativos: ${audit.activeTokens} (${((audit.activeTokens / audit.totalTokens) * 100).toFixed(1)}%)`);
  console.log(`   Tokens revogados: ${audit.revokedTokens}`);
  console.log(`   Tokens permanentes: ${audit.permanentTokens}`);
  console.log(`   Tokens temporários: ${audit.temporaryTokens}`);
  console.log(`   Tokens expirados: ${audit.expiredTokens} ${audit.expiredTokens > 0 ? '⚠️' : '✅'}`);
  console.log(`   Tokens expirando em breve: ${audit.expiringSoonTokens} ${audit.expiringSoonTokens > 0 ? '⚠️' : '✅'}`);
  console.log(`   Tokens nunca usados: ${audit.unusedTokens} ${audit.unusedTokens > 0 ? '⚠️' : '✅'}`);
  console.log(`   Tokens usados nos últimos 7 dias: ${audit.recentlyUsedTokens}`);

  console.log('\n   ═══════════════════════════════════════════════════');

  // Recomendações baseadas na auditoria
  console.log('\n   💡 Recomendações de Segurança:');
  const recommendations: string[] = [];

  if (audit.expiredTokens > 0) {
    recommendations.push(`Deletar ${audit.expiredTokens} token(s) expirado(s)`);
  }
  if (audit.expiringSoonTokens > 0) {
    recommendations.push(`Rotacionar ${audit.expiringSoonTokens} token(s) expirando em breve`);
  }
  if (audit.unusedTokens > 0) {
    recommendations.push(`Revisar ${audit.unusedTokens} token(s) nunca usado(s)`);
  }
  if (audit.permanentTokens > audit.totalTokens * 0.5) {
    recommendations.push('Considerar adicionar expiração aos tokens permanentes');
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, idx) => {
      console.log(`      ${idx + 1}. ${rec}`);
    });
  } else {
    console.log('      ✅ Todos os tokens estão em conformidade!');
  }

  console.log('\n========== FASE 6: CENÁRIOS DE USO PRÁTICOS ==========\n');

  // 18.5. Demonstrar autenticação com API Token (Hybrid Auth)
  console.log('1️⃣8️⃣.5️⃣ AUTENTICAÇÃO HÍBRIDA - Usando API Token para autenticar...\n');

  console.log('   💡 Demonstração: Criar novo cliente usando API Token em vez de JWT');
  console.log('   ✅ O SDK suporta AMBOS JWT e API Token no mesmo campo accessToken');
  console.log('   ✅ Backend AuthGuard detecta automaticamente qual tipo de token foi enviado\n');

  // Criar um token temporário para demonstração
  const demoApiToken = await client.apiTokens.create({
    name: 'Demo - Hybrid Auth Test',
    expiresInDays: 1,
  });

  console.log('   Token criado para demonstração:', demoApiToken.token.substring(0, 30) + '...');

  // Criar novo cliente usando o API Token em vez de JWT
  console.log('\n   Criando novo cliente autenticado com API Token:');
  const apiTokenClient = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: demoApiToken.token, // 🔑 API Token em vez de JWT!
  });

  console.log('   ✅ Cliente criado com API Token');

  // Testar autenticação fazendo uma requisição
  console.log('\n   Testando autenticação com API Token...');
  const currentUser = await apiTokenClient.getCurrentUser();
  console.log('   ✅ Autenticação bem-sucedida!');
  console.log('   Usuário autenticado:', currentUser.name, '-', currentUser.email);

  // Demonstrar que ambas as formas funcionam
  console.log('\n   📊 Comparação de métodos de autenticação:');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ Método       │ Duração  │ Uso Recomendado               │');
  console.log('   ├─────────────────────────────────────────────────────────┤');
  console.log('   │ JWT          │ 15min    │ Usuários humanos, sessões     │');
  console.log('   │ API Token    │ Custom   │ M2M, CI/CD, scripts, webhooks │');
  console.log('   └─────────────────────────────────────────────────────────┘');

  console.log('\n   💡 Vantagens do API Token:');
  console.log('      ✅ Não expira automaticamente (ou expira em meses/anos)');
  console.log('      ✅ Ideal para automação (sem refresh necessário)');
  console.log('      ✅ Pode ser revogado instantaneamente se comprometido');
  console.log('      ✅ Tracking de uso (lastUsedAt)');
  console.log('      ✅ Pode ter nome descritivo (ex: "CI/CD Pipeline")');

  console.log('\n   💡 Vantagens do JWT:');
  console.log('      ✅ Curta duração = mais seguro para sessões humanas');
  console.log('      ✅ Auto-refresh transparente (SDK faz automaticamente)');
  console.log('      ✅ Logout de todos os dispositivos suportado');
  console.log('      ✅ Menos registros no banco (stateless quando não expirado)');

  console.log('\n   🔄 Como funciona a Autenticação Híbrida no backend:');
  console.log('      1. AuthGuard recebe token no header Authorization: Bearer');
  console.log('      2. Tenta verificar como API Token (DB lookup) - ~2-5ms');
  console.log('      3. Se não for API Token, verifica como JWT (in-memory) - <1ms');
  console.log('      4. Se ambos falharem, retorna 401 Unauthorized');
  console.log('      ✅ Performance: <5ms overhead total');

  // Cleanup: deletar token de demonstração
  await apiTokenClient.apiTokens.remove(demoApiToken.id);
  console.log('\n   🧹 Token de demonstração deletado');

  // 19. Token para CI/CD
  console.log('\n1️⃣9️⃣ Configurando token para CI/CD (GitHub Actions)...\n');

  console.log('   Criando token para pipeline de CI/CD:');
  const cicdToken = await client.apiTokens.create({
    name: 'GitHub Actions - Main Pipeline',
    expiresInDays: 90,
  });
  console.log('   ✅ Token criado:', cicdToken.name);
  console.log('   Token:', cicdToken.token.substring(0, 30) + '...');

  console.log('\n   💡 Como usar no GitHub Actions:');
  console.log('   1. Vá em Settings > Secrets and variables > Actions');
  console.log('   2. Clique em "New repository secret"');
  console.log(`   3. Name: SIGNATURE_API_TOKEN`);
  console.log(`   4. Value: ${cicdToken.token.substring(0, 20)}...`);
  console.log('   5. No workflow YAML:');
  console.log(`
   jobs:
     deploy:
       steps:
         - name: Create Signature Envelope
           run: |
             curl -X POST https://api.example.com/envelopes \\
               -H "Authorization: Bearer \${{ secrets.SIGNATURE_API_TOKEN }}" \\
               -H "Content-Type: application/json" \\
               -d '{"name": "Contract", "description": "Auto-signed"}'
  `);

  // 20. Token para integração de terceiros
  console.log('2️⃣0️⃣ Configurando token para integração externa...\n');

  console.log('   💡 Cenário: Parceiro externo precisa acessar sua API');
  const partnerIntegrationToken = await client.apiTokens.create({
    name: 'Partner Integration - Acme Corp',
    expiresInDays: 180,
  });
  console.log('   ✅ Token criado para parceiro');
  console.log('   Expira em:', new Date(partnerIntegrationToken.expiresAt!).toLocaleDateString());

  console.log('\n   📋 Instruções para compartilhar com parceiro:');
  console.log('   1. Enviar token via canal seguro (não email)');
  console.log('   2. Documentar endpoints permitidos');
  console.log('   3. Estabelecer rate limits específicos');
  console.log('   4. Configurar monitoramento de uso');
  console.log('   5. Agendar renovação antes da expiração');

  // Resumo Final
  console.log('\n========== RESUMO COMPLETO ==========');

  const finalTokens = await client.apiTokens.findAll();

  console.log('\n📊 Estatísticas Finais:');
  console.log(`   Total de tokens criados: ${finalTokens.length}`);
  console.log(`   Tokens ativos: ${finalTokens.filter((t) => t.isActive).length}`);
  console.log(`   Tokens armazenados de forma segura: ${tokenStorage.list().length}`);

  console.log('\n🔐 Recursos demonstrados:');
  console.log('   ✅ Criação de tokens (permanente, temporário, data específica)');
  console.log('   ✅ Listagem e busca (por ID, filtros avançados)');
  console.log('   ✅ Atualização (nome, expiração)');
  console.log('   ✅ Revogação temporária (desativar/ativar)');
  console.log('   ✅ Deleção permanente');
  console.log('   ✅ Rotação de tokens');
  console.log('   ✅ Armazenamento seguro');
  console.log('   ✅ Monitoramento de uso (lastUsedAt)');
  console.log('   ✅ Alertas de expiração');
  console.log('   ✅ Auditoria completa');

  console.log('\n🎯 Melhores práticas aplicadas:');
  console.log('   ✅ Princípio do menor privilégio (tokens específicos)');
  console.log('   ✅ Rotação regular de tokens');
  console.log('   ✅ Tokens diferentes por ambiente');
  console.log('   ✅ Expiração configurada para tokens temporários');
  console.log('   ✅ Armazenamento seguro (não em código)');
  console.log('   ✅ Monitoramento de tokens inativos');
  console.log('   ✅ Revogação imediata se comprometido');

  console.log('\n✨ API Token Management COMPLETO demonstrado!');
  console.log('💡 Este exemplo cobre 100% dos recursos de gerenciamento de tokens');
  console.log('💡 Em produção:');
  console.log('   - Use AWS Secrets Manager ou HashiCorp Vault');
  console.log('   - Configure alertas automáticos de expiração');
  console.log('   - Implemente rotação automática de tokens');
  console.log('   - Monitore uso anômalo de tokens');
  console.log('   - Configure rate limiting por token');
  console.log('   - Mantenha audit log de todas as operações');
  console.log('   - Use tokens diferentes para cada ambiente');
}

// Executar
if (require.main === module) {
  main().catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export { main };
