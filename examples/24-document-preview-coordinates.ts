/**
 * Exemplo 24: Preview de Documentos e Conversão de Coordenadas
 *
 * Este exemplo demonstra os novos recursos de preview avançado e sistema de coordenadas:
 *
 * **FASE 1: Upload e Preview**
 * - Upload de documento PDF
 * - Obtenção de preview com metadados PDF (dimensões em pontos, MediaBox, CropBox)
 *
 * **FASE 2: Conversão de Coordenadas (Pixel <-> Point)**
 * - Simulação de interação no frontend (clique em pixels)
 * - Conversão de pixels (visualização) para pontos PDF (armazenamento)
 * - Conversão de pontos PDF para pixels (renderização)
 *
 * **FASE 3: Aplicação Prática**
 * - Uso das coordenadas convertidas para criar um campo de assinatura na posição exata
 * - Verificação do posicionamento correto
 *
 * **Contexto:**
 * O Backend utiliza sistema 'Web-Centric' (Top-Left) para persistência e API.
 * Interfaces web usam "top-left" (Y cresce para baixo) e unidade "pixels".
 * A inversão para PDF nativo (Bottom-Left) ocorre apenas internamente no backend durante a assinatura.
 * O endpoint `convertCoordinates` facilita a conversão de unidades (px <-> pt) mantendo a orientação (sem flip de Y).
 */

import { SignatureClient } from '../src';
import { PdfPageMetadata, PixelCoordinate, PointCoordinate } from '../src/types/document.types';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========== EXEMPLO 24: PREVIEW E COORDENADAS ==========\n');

  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || 'seu-jwt-token-aqui',
  });

  try {
    // 1. Setup: Criar envelope e fazer upload de documento
    console.log('1️⃣ Criando envelope e documento...');
    const envelope = await client.envelopes.create({
      name: 'Teste de Coordenadas',
      description: 'Demonstração de conversão Pixel <-> PDF Point',
    });

    const pdfPath = path.join(__dirname, '../../tests/fixtures/sample.pdf');
    let pdfBuffer: Buffer;

    if (fs.existsSync(pdfPath)) {
      pdfBuffer = fs.readFileSync(pdfPath);
    } else {
      // PDF A4 padrão (595.28 x 841.89 points)
      console.log('   ⚠️ Usando PDF gerado em memória (A4)');
      pdfBuffer = Buffer.from('%PDF-1.4\n%Example PDF\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 595.28 841.89]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000125 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n225\n%%EOF');
    }

    const document = await client.documents.upload(envelope.id, pdfBuffer, 'coords-test.pdf');
    console.log('✅ Documento criado:', document.id);

    // 2. Adicionar signatário para o teste
    const signer = await client.signers.create(envelope.id, {
      name: 'Tester Coordenadas',
      email: 'tester@example.com',
    });
    console.log('✅ Signatário criado:', signer.id);

    // 3. Obter Preview com Metadados
    console.log('\n2️⃣ Obtendo preview e metadados PDF...');
    
    // Solicitamos o preview da página 1
    const preview = await client.documents.preview(document.id, { page: 1 });
    
    if (!preview.pdfMetadata) {
      throw new Error('Metadados PDF não retornados. Verifique se o backend suporta esta feature.');
    }

    const meta = preview.pdfMetadata;
    console.log('✅ Metadados PDF recuperados:');
    console.log(`   - Dimensões PDF (pt): ${meta.widthPt.toFixed(2)} x ${meta.heightPt.toFixed(2)}`);
    console.log(`   - Rotação: ${meta.rotation}°`);
    console.log(`   - MediaBox: [${meta.mediaBox.join(', ')}]`);
    if (meta.cropBox) console.log(`   - CropBox: [${meta.cropBox.join(', ')}]`);

    // 4. Simulação: Frontend Viewer
    console.log('\n3️⃣ Simulando interação no Frontend...');
    
    // Suponha que o frontend renderize a página com 800px de largura
    const viewerWidthPx = 800;
    
    // Calculamos a altura proporcional (apenas para log, o backend recalcula se necessário)
    const scaleFactor = viewerWidthPx / meta.widthPt;
    const viewerHeightPx = Math.round(meta.heightPt * scaleFactor);
    
    console.log(`   🖥️  Viewer simulado: ${viewerWidthPx}px x ${viewerHeightPx}px`);
    console.log(`   🔍 Scale factor estimado: ${scaleFactor.toFixed(4)} px/pt`);

    // O usuário clica para adicionar uma assinatura no centro da tela
    // No sistema de coordenadas da tela (Top-Left = 0,0)
    const clickX = 400; // Meio da largura
    const clickY = 500; // Um pouco abaixo do meio da altura
    const fieldW = 150; // Largura do campo em pixels
    const fieldH = 50;  // Altura do campo em pixels

    const pixelCoords: PixelCoordinate = {
      xPx: clickX,
      yPx: clickY,
      widthPx: fieldW,
      heightPx: fieldH
    };

    console.log('   🖱️  Clique do usuário (Pixels - TopLeft):');
    console.log(`      X: ${clickX}, Y: ${clickY}, W: ${fieldW}, H: ${fieldH}`);

    // 5. Converter Pixel -> Point (Backend)
    console.log('\n4️⃣ Convertendo Pixels para PDF Points (Backend)...');
    
    const conversionToPt = await client.documents.convertCoordinates({
      documentId: document.id,
      page: 1,
      direction: 'pixelToPoint',
      pixel: pixelCoords,
      previewHeightPx: viewerHeightPx // Usado para cálculo de escala
    });

    if (!conversionToPt.success || !conversionToPt.point) {
      throw new Error('Falha na conversão pixel -> point');
    }

    const pdfPoint = conversionToPt.point;
    console.log('✅ Coordenadas convertidas (Points - API/armazenamento TopLeft):');
    console.log(`   X: ${pdfPoint.xPt.toFixed(2)} pt`);
    console.log(`   Y: ${pdfPoint.yPt.toFixed(2)} pt`);
    console.log(`   W: ${pdfPoint.widthPt?.toFixed(2)} pt`);
    console.log(`   H: ${pdfPoint.heightPt?.toFixed(2)} pt`);

    // 6. Criar o campo usando as coordenadas em Points
    console.log('\n5️⃣ Criando campo de assinatura com coordenadas calculadas...');
    
    const field = await client.signatureFields.create(document.id, {
      signerId: signer.id,
      page: 1,
      type: 'signature',
      required: true,
      // Usamos as coordenadas convertidas
      x: pdfPoint.xPt,
      y: pdfPoint.yPt,
      width: pdfPoint.widthPt || 100,
      height: pdfPoint.heightPt || 50
    });

    console.log(`✅ Campo criado ID: ${field.id}`);
    console.log(`   Posição no DB: X=${field.x}, Y=${field.y}`);

    // 7. Validação Reversa: Point -> Pixel
    // Imagine que agora recarregamos a página e precisamos desenhar o campo sobre o PDF
    console.log('\n6️⃣ Validação Reversa: Convertendo PDF Points para Pixels (Render)...');

    const conversionToPx = await client.documents.convertCoordinates({
      documentId: document.id,
      page: 1,
      direction: 'pointToPixel',
      point: {
        xPt: field.x,
        yPt: field.y,
        widthPt: field.width,
        heightPt: field.height
      },
      previewHeightPx: viewerHeightPx
    });

    if (!conversionToPx.success || !conversionToPx.pixel) {
      throw new Error('Falha na conversão point -> pixel');
    }

    const renderedPx = conversionToPx.pixel;
    console.log('✅ Coordenadas para renderização (Pixels):');
    console.log(`   X: ${renderedPx.xPx.toFixed(0)} px (Esperado: ~${clickX})`);
    console.log(`   Y: ${renderedPx.yPx.toFixed(0)} px (Esperado: ~${clickY})`);
    
    // Verificação de precisão (aceitando margem de erro de arredondamento de 1-2px)
    const deltaX = Math.abs(renderedPx.xPx - clickX);
    const deltaY = Math.abs(renderedPx.yPx - clickY);
    
    if (deltaX < 2 && deltaY < 2) {
      console.log('🎯 PRECISÃO CONFIRMADA: O ciclo de conversão foi perfeito!');
    } else {
      console.warn(`⚠️ Diferença notada: dX=${deltaX}, dY=${deltaY}. Verifique o previewHeightPx.`);
    }

    console.log('\n========== RESUMO ==========');
    console.log('1. PDF Metadata extraído com sucesso');
    console.log('2. Conversão Pixel -> Point realizada');
    console.log('3. Campo criado na posição correta');
    console.log('4. Conversão Point -> Pixel validada');
    console.log('\n✨ Exemplo 24 concluído com sucesso!');

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
