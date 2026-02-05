/**
 * Example 19: Receipt Workflow
 *
 * This example demonstrates the document receipt confirmation workflow:
 * - Creating a receipt envelope with receivers
 * - Sending receipt confirmation tokens
 * - Validating tokens and confirming receipt
 * - Downloading documents with receipt stamps
 *
 * Use cases:
 * - Proof of document delivery
 * - Invoice receipt confirmation
 * - Policy acknowledgment
 * - Contract delivery tracking
 */

import { SignatureClient } from '../src/client/SignatureClient';
import {
  NotificationChannel,
  CreateReceiptEnvelopeInput,
} from '../src/types/receipt.types';
import * as fs from 'fs';

async function receiptWorkflowExample() {
  // ==========================================
  // 1. Initialize Client
  // ==========================================

  const client = new SignatureClient({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    accessToken: process.env.ACCESS_TOKEN || 'your-jwt-token',
  });

  console.log('✅ Client initialized\n');

  // ==========================================
  // 2. Create Receipt Envelope
  // ==========================================

  console.log('📋 Creating receipt envelope...');

  const receiptEnvelopeInput: CreateReceiptEnvelopeInput = {
    name: 'Invoice Delivery - December 2024',
    description: 'Monthly invoice requiring confirmation of receipt',
    receivers: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+5511987654321',
        allowedChannels: [NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        allowedChannels: [NotificationChannel.EMAIL],
      },
    ],
  };

  const envelope = await client.receipts.create(receiptEnvelopeInput);

  console.log(`✅ Receipt envelope created: ${envelope.id}`);
  console.log(`   Type: ${envelope.type}`);
  console.log(`   Receivers: ${envelope.receiversCount}`);
  console.log(`   Status: ${envelope.status}\n`);

  // ==========================================
  // 3. Send Receipt Tokens
  // ==========================================

  console.log('📤 Sending receipt confirmation tokens...');

  const tokensResult = await client.receipts.sendTokens(envelope.id);

  console.log(`✅ Tokens sent: ${tokensResult.sent}`);
  console.log(`   Message: ${tokensResult.message}\n`);

  // ==========================================
  // 4. Validate Receipt Token (Public API)
  // ==========================================

  console.log('🔐 Validating receipt token...');

  // Simulate receiver receiving token and validating
  const tokenValidation = await client.receipts.validateToken({
    signerId: 'signer-id-from-url', // From the receipt URL
    token: '123456', // 6-digit token from email/SMS/WhatsApp
  });

  if (tokenValidation.valid) {
    console.log('✅ Token is valid!');
    console.log(`   Receiver: ${tokenValidation.receiver?.name}`);
    console.log(`   Envelope: ${tokenValidation.envelope?.name}\n`);
  } else {
    console.log(`❌ Token validation failed: ${tokenValidation.message}\n`);
  }

  // ==========================================
  // 5. Get Receipt Information
  // ==========================================

  console.log('📊 Getting receipt information...');

  const receiptInfo = await client.receipts.getInfo(envelope.id, '123456');

  console.log(`✅ Envelope: ${receiptInfo.envelopeName}`);
  console.log(`   Progress: ${receiptInfo.receivedCount}/${receiptInfo.receiversCount} confirmed`);
  console.log(`   Pending: ${receiptInfo.pendingCount}`);
  console.log(`   Current receiver: ${receiptInfo.receiver.name}\n`);

  if (receiptInfo.documents) {
    console.log('   Documents:');
    receiptInfo.documents.forEach((doc, index) => {
      console.log(`     ${index + 1}. ${doc.name} (${doc.contentType})`);
    });
    console.log('');
  }

  // ==========================================
  // 6. Confirm Receipt
  // ==========================================

  console.log('✅ Confirming document receipt...');

  const confirmResult = await client.receipts.confirm(
    envelope.id,
    {
      token: '123456',
      channel: NotificationChannel.EMAIL,
      signerId: 'signer-id',
    },
    {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    }
  );

  console.log(`✅ Receipt confirmed!`);
  console.log(`   Confirmed at: ${confirmResult.confirmedAt}`);
  console.log(`   Channel: ${confirmResult.channel}`);
  console.log(`   Envelope completed: ${confirmResult.isCompleted}\n`);

  // ==========================================
  // 7. Download Document with Receipt Stamp
  // ==========================================

  console.log('📥 Downloading document with receipt stamp...');

  try {
    const documentBuffer = await client.receipts.downloadDocument(
      envelope.id,
      '123456'
    );

    // Save to file
    const filename = `receipt-stamped-document-${Date.now()}.pdf`;
    fs.writeFileSync(filename, documentBuffer);

    console.log(`✅ Document downloaded: ${filename}`);
    console.log(`   Size: ${(documentBuffer.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.log('⚠️  Document not available yet\n');
  }

  // ==========================================
  // 8. Get Receipt History
  // ==========================================

  console.log('📜 Getting receipt history...');

  const history = await client.receipts.getHistory(envelope.id, '123456');

  console.log(`✅ Receipt history for: ${history.envelopeName}`);
  console.log(`   Total confirmations: ${history.history.length}\n`);

  history.history.forEach((entry, index) => {
    console.log(`   ${index + 1}. ${entry.receiverName} (${entry.receiverEmail})`);
    console.log(`      Confirmed at: ${entry.confirmedAt}`);
    console.log(`      Channel: ${entry.channel}`);
    console.log(`      IP: ${entry.ipAddress}`);
    console.log('');
  });

  // ==========================================
  // Additional Example: Multiple Receivers
  // ==========================================

  console.log('═══════════════════════════════════════════');
  console.log('📋 CREATING ENVELOPE WITH MULTIPLE RECEIVERS');
  console.log('═══════════════════════════════════════════\n');

  const multiReceiverEnvelope = await client.receipts.create({
    name: 'Policy Update Notification',
    description: 'New privacy policy requiring acknowledgment',
    receivers: [
      {
        name: 'Employee 1',
        email: 'employee1@company.com',
        allowedChannels: [NotificationChannel.EMAIL],
      },
      {
        name: 'Employee 2',
        email: 'employee2@company.com',
        phone: '+5511999998888',
        allowedChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      },
      {
        name: 'Employee 3',
        email: 'employee3@company.com',
        phone: '+5511977776666',
        allowedChannels: [NotificationChannel.WHATSAPP],
      },
    ],
  });

  console.log(`✅ Multi-receiver envelope created: ${multiReceiverEnvelope.id}`);
  console.log(`   Receivers: ${multiReceiverEnvelope.receiversCount}\n`);

  // Send tokens to all receivers
  const multiTokensResult = await client.receipts.sendTokens(multiReceiverEnvelope.id);
  console.log(`✅ Sent ${multiTokensResult.sent} receipt tokens\n`);

  // ==========================================
  // Summary
  // ==========================================

  console.log('═══════════════════════════════════════════');
  console.log('📊 RECEIPT WORKFLOW SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Created 2 receipt envelopes`);
  console.log(`   - Invoice delivery: ${envelope.id}`);
  console.log(`   - Policy update: ${multiReceiverEnvelope.id}`);
  console.log(`✅ Sent receipt tokens to receivers`);
  console.log(`✅ Validated tokens and confirmed receipt`);
  console.log(`✅ Downloaded stamped documents`);
  console.log(`✅ Retrieved receipt history`);
  console.log('═══════════════════════════════════════════\n');
}

// ==========================================
// Run the example
// ==========================================

if (require.main === module) {
  receiptWorkflowExample()
    .then(() => {
      console.log('✅ Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      process.exit(1);
    });
}

export { receiptWorkflowExample };
