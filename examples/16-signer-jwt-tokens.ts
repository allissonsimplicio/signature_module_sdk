/**
 * Exemplo 16: Sistema de Tokens JWT para Signatários
 *
 * Este exemplo demonstra o novo sistema de autenticação JWT para signatários:
 *
 * **RECURSOS DEMONSTRADOS:**
 * - Geração de URL de assinatura com JWT tokens
 * - Access token de curta duração (15 minutos padrão)
 * - Refresh token de longa duração (7 dias padrão)
 * - Renovação automática de tokens expirados
 * - Revogação de tokens (logout)
 * - Token rotation para segurança
 *
 * **SEGURANÇA:**
 * - Access token: JWT assinado criptograficamente
 * - Refresh token: UUID único armazenado no banco
 * - Validação de expiração em cada requisição
 * - Token rotation: refresh gera novos tokens
 * - Revogação irreversível
 *
 * **CASOS DE USO:**
 * 1. Fluxo normal: obter tokens e renovar antes da expiração
 * 2. Token expirado: renovar usando refresh token
 * 3. Logout: revogar todos os tokens
 * 4. Múltiplas sessões: cada sessão com seu próprio par de tokens
 */

import { SignatureClient } from '../src';

async function main() {
  console.log('========== EXEMPLO 16: SISTEMA DE TOKENS JWT ==========\n');

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
      name: 'Contrato com JWT Tokens',
      description: 'Demonstração do sistema de tokens JWT',
    });
    console.log('✅ Envelope criado:', envelope.id);

    console.log('\n2️⃣ Adicionando signatário...');
    const signer = await client.signers.create(envelope.id, {
      name: 'Maria Souza',
      email: 'maria@example.com',
      phoneNumber: '+5585987654321',
    });
    console.log('✅ Signatário criado:', signer.id);

    console.log('\n3️⃣ Ativando envelope...');
    await client.envelopes.activate(envelope.id);
    console.log('✅ Envelope ativado');

    // ===========================
    // FLUXO 1: Obter URL de Assinatura com Tokens JWT
    // ===========================
    console.log('\n========== FLUXO 1: OBTER TOKENS JWT ==========\n');

    console.log('4️⃣ Gerando URL de assinatura com tokens JWT...');
    const signingUrl = await client.signers.getSigningUrl(signer.id);

    console.log('\n✅ URL de assinatura gerada com sucesso!');
    console.log('\n📋 Resposta completa:');
    console.log('   URL:', signingUrl.url);
    console.log('   Access Token (JWT):', signingUrl.accessToken.substring(0, 50) + '...');
    console.log('   Refresh Token:', signingUrl.refreshToken);
    console.log('   Access expira em:', signingUrl.expiresAt);
    console.log('   Refresh expira em:', signingUrl.refreshExpiresAt);

    console.log('\n📄 Preview e campos com token do signatário:');
    console.log('   - O access token também permite preview/pages/fields sem usuário interno.');
    console.log('   - Use um client separado com o JWT do signatário.');
    console.log('   - 🆕 v3.0.1: Use getSigningSession() para obter contexto completo!');

    const documentId = process.env.DOCUMENT_ID;
    if (documentId) {
      const signerClient = new SignatureClient({
        baseURL: process.env.API_URL || 'http://localhost:3000',
        accessToken: signingUrl.accessToken,
      });

      // 🆕 v3.0.1: Método recomendado - obter contexto completo
      try {
        console.log('\n   🆕 Tentando getSigningSession() (v3.0.1)...');
        const session = await signerClient.signers.getSigningSession();
        console.log('   ✅ Signing Session recuperada:');
        console.log('      - Envelope:', session.envelope.name);
        console.log('      - Documentos:', session.documents.length);
        console.log('      - Progresso:', session.progress.percentComplete + '%');
        console.log('      💡 Veja exemplo 23 para detalhes completos!');
      } catch (err: any) {
        console.log('   ⚠️ getSigningSession() não disponível:', err.message);
        console.log('   💡 Certifique-se de ativar o envelope primeiro.');
      }

      // Método legado: chamadas individuais
      const preview = await signerClient.documents.preview(documentId, { page: 1 });
      const pages = await signerClient.documents.getPagesMetadata(documentId);
      const fields = await signerClient.signatureFields.findByDocument(documentId);

      console.log('\n   ✅ Preview URL:', preview.pdfUrl.substring(0, 50) + '...');
      console.log('   ✅ Total de páginas:', pages.totalPages);
      console.log('   ✅ Campos visíveis:', fields.length);
    } else {
      console.log('   ℹ️  Defina DOCUMENT_ID para testar preview/pages/fields com token do signatário.');
    }

    console.log('\n🔐 Informações sobre os tokens:');
    console.log('   Access Token:');
    console.log('     - Tipo: JWT assinado criptograficamente');
    console.log('     - Duração: 15 minutos (padrão)');
    console.log('     - Uso: Autenticar requisições de assinatura');
    console.log('     - Validação: Signature + expiração + revogação');
    console.log('');
    console.log('   Refresh Token:');
    console.log('     - Tipo: UUID único');
    console.log('     - Duração: 7 dias (padrão)');
    console.log('     - Uso: Renovar access token expirado');
    console.log('     - Armazenamento: Banco de dados');

    // ===========================
    // FLUXO 2: Renovar Access Token
    // ===========================
    console.log('\n========== FLUXO 2: RENOVAR ACCESS TOKEN ==========\n');

    console.log('5️⃣ Simulando expiração do access token...');
    console.log('   💡 Em produção, você verificaria a data de expiração:');
    console.log('   const tokenExpiresAt = new Date(signingUrl.expiresAt);');
    console.log('   const now = new Date();');
    console.log('   const timeUntilExpiry = tokenExpiresAt.getTime() - now.getTime();');
    console.log('   const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60000);');
    console.log('');
    console.log('   if (minutesUntilExpiry < 2) {');
    console.log('     // Renovar token automaticamente 2 minutos antes da expiração');
    console.log('     const newTokens = await client.signers.refreshSignerToken(refreshToken);');
    console.log('   }');

    console.log('\n6️⃣ Renovando access token usando refresh token...');
    const newTokens = await client.signers.refreshSignerToken(signingUrl.refreshToken);

    console.log('\n✅ Tokens renovados com sucesso!');
    console.log('\n📋 Novo par de tokens (token rotation):');
    console.log('   Novo Access Token:', newTokens.accessToken.substring(0, 50) + '...');
    console.log('   Novo Refresh Token:', newTokens.refreshToken);
    console.log('   Expira em:', newTokens.expiresIn, 'segundos');
    console.log('   Access expira em:', newTokens.accessExpiresAt);
    console.log('   Refresh expira em:', newTokens.refreshExpiresAt);

    console.log('\n🔄 Token Rotation:');
    console.log('   ✅ Novo access token gerado');
    console.log('   ✅ Novo refresh token gerado');
    console.log('   ✅ Tokens antigos revogados automaticamente');
    console.log('   ✅ Maior segurança: tokens comprometidos têm validade limitada');

    // ===========================
    // FLUXO 3: Implementação de Auto-Refresh
    // ===========================
    console.log('\n========== FLUXO 3: AUTO-REFRESH (BEST PRACTICE) ==========\n');

    console.log('7️⃣ Implementação recomendada de auto-refresh:');
    console.log('');
    console.log('   class SignerSession {');
    console.log('     private accessToken: string;');
    console.log('     private refreshToken: string;');
    console.log('     private expiresAt: Date;');
    console.log('');
    console.log('     async getValidToken(): Promise<string> {');
    console.log('       const now = new Date();');
    console.log('       const timeUntilExpiry = this.expiresAt.getTime() - now.getTime();');
    console.log('       const minutesLeft = Math.floor(timeUntilExpiry / 60000);');
    console.log('');
    console.log('       // Renovar 2 minutos antes da expiração');
    console.log('       if (minutesLeft < 2) {');
    console.log('         await this.refreshTokens();');
    console.log('       }');
    console.log('');
    console.log('       return this.accessToken;');
    console.log('     }');
    console.log('');
    console.log('     private async refreshTokens() {');
    console.log('       try {');
    console.log('         const response = await client.signers.refreshSignerToken(');
    console.log('           this.refreshToken');
    console.log('         );');
    console.log('');
    console.log('         this.accessToken = response.accessToken;');
    console.log('         this.refreshToken = response.refreshToken;');
    console.log('         this.expiresAt = new Date(response.accessExpiresAt);');
    console.log('');
    console.log('         console.log("✅ Tokens renovados automaticamente");');
    console.log('       } catch (error) {');
    console.log('         console.error("❌ Falha ao renovar tokens:", error.message);');
    console.log('         // Redirecionar para login');
    console.log('       }');
    console.log('     }');
    console.log('   }');

    console.log('\n💡 Uso:');
    console.log('   const session = new SignerSession(signingUrl);');
    console.log('   ');
    console.log('   // Ao fazer requisições:');
    console.log('   const token = await session.getValidToken();');
    console.log('   // Token sempre válido - renovado automaticamente se necessário');

    // ===========================
    // FLUXO 4: Revogação de Tokens (Logout)
    // ===========================
    console.log('\n========== FLUXO 4: REVOGAÇÃO DE TOKENS (LOGOUT) ==========\n');

    console.log('8️⃣ Revogando tokens (logout do signatário)...');
    const revokeResult = await client.signers.revokeSignerToken(newTokens.refreshToken);

    console.log('\n✅ Tokens revogados:', revokeResult.message);
    console.log('\n⚠️ Efeitos da revogação:');
    console.log('   ❌ Access token invalidado imediatamente');
    console.log('   ❌ Refresh token invalidado');
    console.log('   ❌ Não é possível renovar');
    console.log('   ❌ Todas requisições com esse token falharão');
    console.log('   ℹ️  Signatário precisa refazer autenticação completa');

    console.log('\n9️⃣ Tentando usar token revogado (deve falhar)...');
    try {
      await client.signers.refreshSignerToken(newTokens.refreshToken);
      console.log('❌ ERRO: Token revogado deveria ter sido rejeitado!');
    } catch (error: any) {
      console.log('✅ Token revogado corretamente rejeitado');
      console.log('   Status:', error.response?.status || 'N/A');
      console.log('   Mensagem:', error.response?.data?.message || error.message);
    }

    // ===========================
    // RESUMO E BOAS PRÁTICAS
    // ===========================
    console.log('\n========== RESUMO E BOAS PRÁTICAS ==========\n');

    console.log('📋 Resumo do fluxo de tokens:');
    console.log('   1. getSigningUrl() → Retorna access + refresh token');
    console.log('   2. Usar access token para requisições (válido 15 min)');
    console.log('   3. Renovar com refreshSignerToken() antes de expirar');
    console.log('   4. revokeSignerToken() para logout (irreversível)');

    console.log('\n✅ Boas práticas de implementação:');
    console.log('   1. Auto-refresh: Renovar 2-5 minutos antes da expiração');
    console.log('   2. Armazenamento seguro: Usar localStorage/sessionStorage com cuidado');
    console.log('   3. Erro handling: Tratar 401 Unauthorized → refresh → retry');
    console.log('   4. Múltiplas tabs: Sincronizar tokens via localStorage events');
    console.log('   5. Logout: Sempre revogar tokens no servidor');
    console.log('   6. HTTPS: Sempre usar HTTPS em produção');
    console.log('   7. Token exposure: Não incluir em URLs (query params)');

    console.log('\n⚠️ Considerações de segurança:');
    console.log('   ✅ Tokens são únicos por signatário e envelope');
    console.log('   ✅ JWT assinado previne adulteração');
    console.log('   ✅ Refresh token rotation previne reutilização');
    console.log('   ✅ Validação de expiração em cada requisição (defense in depth)');
    console.log('   ✅ Revogação no banco permite invalidação imediata');
    console.log('   ✅ Token mismatch detection previne replay attacks');

    console.log('\n🎯 Casos de uso:');
    console.log('   1. Web App: Auto-refresh em background');
    console.log('   2. Mobile App: Refresh ao abrir app se expirado');
    console.log('   3. Múltiplas sessões: Um par de tokens por dispositivo');
    console.log('   4. Logout global: Revogar todos tokens do signatário (admin)');

    console.log('\n⏱️ Tempos de expiração configuráveis:');
    console.log('   - Access Token: SIGNER_JWT_EXPIRES_IN (padrão: 15m)');
    console.log('   - Refresh Token: SIGNER_JWT_REFRESH_EXPIRES_IN (padrão: 7d)');
    console.log('   - Ajustar em .env conforme necessidade de segurança vs UX');

    console.log('\n✨ Sistema de tokens JWT implementado com sucesso!');
    console.log('💡 Próximos passos:');
    console.log('   1. Implementar auto-refresh no frontend');
    console.log('   2. Adicionar interceptor HTTP para renovação automática');
    console.log('   3. Implementar logout em todos os dispositivos (admin)');
    console.log('   4. Monitorar tokens expirados/revogados (analytics)');
    console.log('   5. 🆕 Usar getSigningSession() para contexto agregado (v3.0.1)');
    console.log('   6. 🆕 Ver exemplo 23 para detalhes completos de signing-session');

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
