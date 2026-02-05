import {
  SignatureClient,
  SignatureStrategy,
} from '../src';
import {
  readFileSync,
  writeFileSync,
} from 'fs';
import { resolve } from 'path';

// Variáveis de configuração - substitua pelos seus dados
const API_TOKEN = process.env.API_TOKEN || 'seu-api-token-aqui';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3333/api/v1';
const CERTIFICATE_PATH = resolve(__dirname, 'assets', 'certificate-a1-test.p12');
const CERTIFICATE_PASSWORD = process.env.CERTIFICATE_PASSWORD || '1234';

/**
 * ===================================================================================
 * Exemplo 17: Gerenciamento de Certificados Digitais (A1)
 * ===================================================================================
 *
 * Este exemplo demonstra o ciclo de vida completo do gerenciamento de certificados
 * digitais (A1) para uma organização, que são essenciais para assinaturas PAdES
 * automáticas (estratégia HYBRID_SEALED).
 *
 * O fluxo aborda:
 * 1. Conexão com o SDK.
 * 2. Limpeza de certificados de teste anteriores para garantir um estado limpo.
 * 3. Upload de um certificado digital (arquivo .p12) e sua senha.
 * 4. Listagem de todos os certificados da organização.
 * 5. Ativação do certificado recém-carregado.
 * 6. Definição do certificado como padrão nas configurações da organização.
 * 7. Verificação da configuração PAdES.
 * 8. Exclusão do certificado ao final do processo.
 *
 * Pré-requisitos:
 * - Um token de API válido.
 * - Um arquivo de certificado A1 (.p12) e sua senha.
 *   (Um certificado de teste é fornecido em `sdk/examples/assets/certificate-a1-test.p12`)
 */
async function main() {
  console.log(`===================================================================================`);
  console.log(`== Exemplo 17: Gerenciamento de Certificados Digitais (A1)                       ==`);
  console.log(`===================================================================================`);

  if (API_TOKEN === 'seu-api-token-aqui') {
    console.error('⚠️  Por favor, defina seu API_TOKEN no topo do arquivo para continuar.');
    return;
  }

  // 1. Conecte-se ao SDK
  const client = new SignatureClient({
    baseURL: API_BASE_URL,
    apiKey: API_TOKEN,
  });

  try {
    // ===================================================================================
    // 2. Limpeza: Garante que o ambiente de teste esteja limpo
    // ===================================================================================
    console.log('🧹 2. Limpando certificados de teste anteriores...');
    const existingCerts = await client.digitalSignatures.listCertificates();
    const testCert = existingCerts.find(
      (c) => c.commonName === 'Signature API Test Certificate (SDK)'
    );

    if (testCert) {
      // Primeiro, remove a referência do certificado nas configurações da organização
      const orgSettings = await client.organizationSettings.get();
      if (orgSettings.defaultCertificateId === testCert.id) {
        await client.organizationSettings.update({ defaultCertificateId: null });
        console.log(`   - Certificado padrão [${testCert.id}] desvinculado da organização.`);
      }
      // Depois, deleta o certificado
      await client.digitalSignatures.deleteCertificate(testCert.id);
      console.log(`   - Certificado de teste anterior [${testCert.id}] deletado com sucesso.`);
    } else {
      console.log('   - Nenhum certificado de teste anterior encontrado.');
    }
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 3. Upload do Certificado A1
    // ===================================================================================
    console.log('⬆️  3. Fazendo upload do certificado A1...');
    const certificateFile = readFileSync(CERTIFICATE_PATH);

    const uploadedCertificate = await client.digitalSignatures.uploadCertificate(
      certificateFile,
      CERTIFICATE_PASSWORD,
      {
        passwordHint: 'Senha de teste (1234)',
        certificateType: 'A1',
        storePassword: true, // Essencial para automação (PADES_FINAL, HYBRID_SEALED)
      }
    );

    console.log(`   - Certificado carregado com sucesso!`);
    console.log(`     - ID: ${uploadedCertificate.id}`);
    console.log(`     - Nome: ${uploadedCertificate.commonName}`);
    console.log(`     - Expira em: ${new Date(uploadedCertificate.notAfter).toLocaleDateString()}`);
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 4. Listagem dos Certificados
    // ===================================================================================
    console.log('📄 4. Listando todos os certificados da organização...');
    const allCertificates = await client.digitalSignatures.listCertificates();
    console.log(`   - Total de certificados encontrados: ${allCertificates.length}`);
    allCertificates.forEach((cert) => {
      console.log(`     - [${cert.id}] ${cert.commonName} - Ativo: ${cert.isActive}`);
    });
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 5. Ativação do Certificado
    // ===================================================================================
    console.log(`⚡ 5. Ativando o certificado [${uploadedCertificate.id}]...`);
    await client.digitalSignatures.activateCertificate(uploadedCertificate.id);
    const detailedCert = await client.digitalSignatures.getCertificate(uploadedCertificate.id);
    console.log(`   - Status do certificado: ${detailedCert.isActive ? 'Ativo' : 'Inativo'}`);
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 6. Definindo como Padrão da Organização
    // ===================================================================================
    console.log('⚙️  6. Definindo certificado como padrão da organização...');
    await client.organizationSettings.update({
      defaultCertificateId: uploadedCertificate.id,
      signatureStrategy: SignatureStrategy.HYBRID_SEALED, // Estratégia que usa certificado da organização
    });
    console.log(`   - Certificado [${uploadedCertificate.id}] definido como padrão.`);
    console.log(`   - Estratégia de assinatura definida como: ${SignatureStrategy.HYBRID_SEALED}`);
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 7. Verificando a Configuração PAdES
    // ===================================================================================
    console.log('🔍 7. Verificando configuração PAdES da organização...');
    const padesConfig = await client.organizationSettings.getPadesConfig();
    console.log('   - Configurações PAdES atuais:');
    console.log(`     - Estratégia: ${padesConfig.signatureStrategy}`);
    console.log(`     - Certificado padrão: ${padesConfig.defaultCertificateId}`);
    console.log(`     - Certificado pronto para uso: ${!!padesConfig.defaultCertificateId}`);
    console.log('-----------------------------------------------------------------------------------');


    // ===================================================================================
    // 8. Limpeza Final
    // ===================================================================================
    console.log('🗑️  8. Limpeza final: removendo o certificado de teste...');
    // Desvincular da organização antes de deletar
    await client.organizationSettings.update({ defaultCertificateId: null });
    console.log('   - Certificado desvinculado da organização.');

    // Deletar o certificado
    await client.digitalSignatures.deleteCertificate(uploadedCertificate.id);
    console.log(`   - Certificado [${uploadedCertificate.id}] deletado com sucesso.`);
    console.log('-----------------------------------------------------------------------------------');


    console.log('✅ Exemplo de gerenciamento de certificados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Ocorreu um erro durante o exemplo:', error);
  }
}

main();
