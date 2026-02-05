/**
 * Example 13: Self-Signing Workflow
 *
 * Demonstrates how to create an envelope and automatically add yourself as a signer
 * with simplified authentication (email + SMS tokens only).
 *
 * Use Cases:
 * - Owner needs to sign their own contracts
 * - Quick self-signing with simplified authentication
 * - Contracts where the creator is also a party
 */

import { SignatureClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function selfSigningWorkflow() {
  // Initialize client
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000/api/v1',
    apiKey: process.env.API_KEY || 'your-api-key',
  });

  console.log('🚀 Self-Signing Workflow Example\n');
  console.log('This example shows how to:');
  console.log('1. Create an envelope and add yourself as a signer automatically');
  console.log('2. Use simplified authentication (email + SMS tokens only)');
  console.log('3. Position signature fields for yourself');
  console.log('4. Sign the document\n');

  try {
    // =================================================================
    // Step 1: Create envelope with self-signing enabled
    // =================================================================
    console.log('📝 Step 1: Creating envelope with self-signing...');

    const envelope = await client.envelopes.create({
      name: 'Service Agreement - Self-Signed',
      description: 'Service agreement that I need to sign as the service provider',

      // 🆕 Enable self-signing
      addMeAsSigner: true,

      // 🆕 Optional: Configure self-signing
      selfSignerConfig: {
        signingOrder: 1,          // You sign first
        role: 'Service Provider',  // Your role in the document
        preferredChannel: 'email',  // Preferred notification channel
        customMessage: 'You created this envelope and need to sign it as the service provider',
      },
    });

    console.log(`✅ Envelope created: ${envelope.id}`);
    console.log(`   Status: ${envelope.status}`);
    console.log(`   You are automatically added as a signer with simplified authentication\n`);

    // =================================================================
    // Step 2: Upload document
    // =================================================================
    console.log('📄 Step 2: Uploading document...');

    const pdfPath = path.join(__dirname, 'sample-documents', 'service-agreement.pdf');

    // Check if file exists, otherwise create a placeholder
    if (!fs.existsSync(pdfPath)) {
      console.log('   ⚠️  Sample PDF not found, please provide a PDF file');
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const document = await client.documents.upload(
      envelope.id,
      pdfBuffer,
      'service-agreement.pdf'
    );

    console.log(`✅ Document uploaded: ${document.id}\n`);

    // =================================================================
    // Step 3: Find your signer record
    // =================================================================
    console.log('👤 Step 3: Finding your signer record...');

    const signers = await client.signers.findByEnvelope(envelope.id);
    const mySigner = signers.find(s => s.isSelfSigning === true);

    if (!mySigner) {
      console.log('❌ Self-signer not found');
      return;
    }

    console.log(`✅ Found self-signer: ${mySigner.id}`);
    console.log(`   Name: ${mySigner.name}`);
    console.log(`   Email: ${mySigner.email}`);
    console.log(`   Status: ${mySigner.status}`);
    console.log(`   Signing Order: ${mySigner.signingOrder}`);
    console.log(`   Is Self-Signing: ${mySigner.isSelfSigning}`);

    // Show authentication requirements
    console.log(`\n   Authentication Requirements (Simplified):`);
    for (const authReq of mySigner.authenticationRequirements) {
      console.log(`   - ${authReq.method}: ${authReq.description}`);
    }
    console.log();

    // =================================================================
    // Step 4: Position signature fields for yourself
    // =================================================================
    console.log('✍️  Step 4: Positioning signature fields...');

    // Add signature field at the bottom of page 1
    const signatureField = await client.signatureFields.create(document.id, {
      signerId: mySigner.id,
      page: 1,
      x: 50,
      y: 700,
      width: 200,
      height: 80,
      type: 'signature',
      required: true,
    });

    console.log(`✅ Signature field created: ${signatureField.id}`);
    console.log(`   Page: ${signatureField.page}`);
    console.log(`   Position: (${signatureField.x}, ${signatureField.y})`);
    console.log(`   Size: ${signatureField.width}x${signatureField.height}\n`);

    // Optional: Add other signers if needed
    console.log('👥 Step 5 (Optional): Adding other signers...');
    const clientSigner = await client.signers.create(envelope.id, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+5511999999999',
      signingOrder: 2, // Signs after you
      role: 'Client',
    });

    console.log(`✅ Client signer added: ${clientSigner.id}\n`);

    // Add authentication requirements for the client
    // Note: Authentication requirements are created automatically when signer is added
    // For custom requirements, use the appropriate API endpoints

    // Position signature field for client
    const clientField = await client.signatureFields.create(document.id, {
      signerId: clientSigner.id,
      page: 1,
      x: 50,
      y: 500,
      width: 200,
      height: 80,
      type: 'signature',
      required: true,
    });

    console.log(`✅ Client signature field created: ${clientField.id}\n`);

    // =================================================================
    // Step 6: Activate envelope
    // =================================================================
    console.log('🚀 Step 6: Activating envelope...');

    const activatedEnvelope = await client.envelopes.activate(envelope.id);

    console.log(`✅ Envelope activated!`);
    console.log(`   Status: ${activatedEnvelope.envelope.status}`);
    console.log(`   Notifications sent: ${activatedEnvelope.notificationsSent}\n`);

    console.log('📧 You will receive:');
    console.log('   - Email with authentication token');
    console.log('   - SMS with authentication token (if phone number is configured)');
    console.log('   - Link to access the signing page\n');

    // =================================================================
    // Step 7: Simulate signing process (in real scenario, user accesses the URL)
    // =================================================================
    console.log('📝 Step 7: Signing process...\n');

    console.log('In a real scenario, you would:');
    console.log('1. Check your email for the authentication token');
    console.log('2. Check your SMS for the authentication token');
    console.log('3. Access the signing URL provided in the email');
    console.log('4. Enter both tokens to authenticate');
    console.log('5. Draw or type your signature');
    console.log('6. Submit the signature\n');

    // Get signing URL (for reference)
    const signingUrl = await client.signers.getSigningUrl(mySigner.id);
    console.log(`🔗 Your signing URL: ${signingUrl.url}`);
    console.log(`   Access token expires at: ${signingUrl.expiresAt}`);
    console.log(`   Refresh token expires at: ${signingUrl.refreshExpiresAt}\n`);

    // =================================================================
    // Summary
    // =================================================================
    console.log('✅ Self-Signing Workflow Complete!\n');
    console.log('Summary:');
    console.log(`- Envelope ID: ${envelope.id}`);
    console.log(`- Your Signer ID: ${mySigner.id}`);
    console.log(`- Client Signer ID: ${clientSigner.id}`);
    console.log(`- Document ID: ${document.id}`);
    console.log(`- Your Signature Field ID: ${signatureField.id}`);
    console.log(`- Client Signature Field ID: ${clientField.id}`);
    console.log(`\nStatus: Envelope activated and ready for signing`);
    console.log(`Next steps: Check your email and SMS for authentication tokens\n`);

    // =================================================================
    // Key Benefits of Self-Signing
    // =================================================================
    console.log('🎯 Key Benefits:');
    console.log('✓ Simplified authentication (only email + SMS tokens)');
    console.log('✓ No biometric validation required');
    console.log('✓ No document upload required');
    console.log('✓ Faster signing process');
    console.log('✓ Full audit trail maintained');
    console.log('✓ Complete security and compliance\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  selfSigningWorkflow()
    .then(() => {
      console.log('✅ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
}

export { selfSigningWorkflow };
