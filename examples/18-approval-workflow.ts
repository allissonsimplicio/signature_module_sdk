/**
 * Example 18: Approval Workflow
 *
 * This example demonstrates the complete approval workflow:
 * - Creating an approval envelope with multiple approvers
 * - Sending approval tokens via notification channels
 * - Validating tokens and making approval decisions
 * - Handling parallel and sequential approval modes
 * - Downloading approved documents with stamps
 *
 * Use cases:
 * - Budget approvals requiring multiple managers
 * - Contract reviews with sequential approval chain
 * - Policy changes requiring stakeholder approval
 * - Document validation with blocking on rejection
 */

import { SignatureClient } from '../src/client/SignatureClient';
import {
  ApprovalMode,
  NotificationChannel,
  CreateApprovalEnvelopeInput,
} from '../src/types/approval.types';
import * as fs from 'fs';

async function approvalWorkflowExample() {
  // ==========================================
  // 1. Initialize Client
  // ==========================================

  const client = new SignatureClient({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    accessToken: process.env.ACCESS_TOKEN || 'your-jwt-token',
  });

  console.log('✅ Client initialized\n');

  // ==========================================
  // 2. Create Parallel Approval Envelope
  // ==========================================

  console.log('📋 Creating parallel approval envelope...');

  const parallelEnvelopeInput: CreateApprovalEnvelopeInput = {
    name: 'Budget Approval - Q4 2024',
    description: 'Budget request for Q4 2024 requiring approval from department heads',
    approvers: [
      {
        name: 'Finance Manager',
        email: 'finance@example.com',
        phone: '+5511987654321',
        allowedChannels: [NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
      },
      {
        name: 'Operations Director',
        email: 'operations@example.com',
        allowedChannels: [NotificationChannel.EMAIL],
      },
      {
        name: 'CEO',
        email: 'ceo@example.com',
        phone: '+5511999998888',
        allowedChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      },
    ],
    approvalMode: ApprovalMode.PARALLEL, // All can approve simultaneously
    blockOnRejection: true, // Cancel if any approver rejects
    requireApprovalComment: false,
  };

  const parallelEnvelope = await client.approvals.create(parallelEnvelopeInput);

  console.log(`✅ Parallel envelope created: ${parallelEnvelope.id}`);
  console.log(`   Mode: ${parallelEnvelope.approvalMode}`);
  console.log(`   Approvers: ${parallelEnvelope.approversCount}`);
  console.log(`   Block on rejection: ${parallelEnvelope.blockOnRejection}\n`);

  // ==========================================
  // 3. Create Sequential Approval Envelope
  // ==========================================

  console.log('📋 Creating sequential approval envelope...');

  const sequentialEnvelopeInput: CreateApprovalEnvelopeInput = {
    name: 'Contract Review - Legal Chain',
    description: 'Contract requiring sequential approval from legal team',
    approvers: [
      {
        name: 'Junior Legal Analyst',
        email: 'legal-analyst@example.com',
        allowedChannels: [NotificationChannel.EMAIL],
        approvalOrder: 1, // First in chain
      },
      {
        name: 'Senior Legal Counsel',
        email: 'legal-counsel@example.com',
        allowedChannels: [NotificationChannel.EMAIL],
        approvalOrder: 2, // Second in chain
      },
      {
        name: 'Chief Legal Officer',
        email: 'clo@example.com',
        phone: '+5511977776666',
        allowedChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        approvalOrder: 3, // Last in chain
      },
    ],
    approvalMode: ApprovalMode.SEQUENTIAL, // Must approve in order
    blockOnRejection: true,
    requireApprovalComment: true, // Comments are mandatory
  };

  const sequentialEnvelope = await client.approvals.create(sequentialEnvelopeInput);

  console.log(`✅ Sequential envelope created: ${sequentialEnvelope.id}`);
  console.log(`   Mode: ${sequentialEnvelope.approvalMode}`);
  console.log(`   Approvers: ${sequentialEnvelope.approversCount}`);
  console.log(`   Require comments: ${sequentialEnvelope.requireApprovalComment}\n`);

  // ==========================================
  // 4. Send Approval Tokens
  // ==========================================

  console.log('📤 Sending approval tokens...');

  // For parallel mode: sends to all approvers
  const parallelTokensResult = await client.approvals.sendTokens(parallelEnvelope.id);
  console.log(`✅ Parallel mode: ${parallelTokensResult.sent} tokens sent (all approvers)`);

  // For sequential mode: sends only to first approver
  const sequentialTokensResult = await client.approvals.sendTokens(sequentialEnvelope.id);
  console.log(`✅ Sequential mode: ${sequentialTokensResult.sent} token sent (first approver only)\n`);

  // ==========================================
  // 5. Validate Approval Token (Public API)
  // ==========================================

  console.log('🔐 Validating approval token...');

  // Simulate approver receiving token and validating
  const tokenValidation = await client.approvals.validateToken({
    signerId: 'signer-id-from-url', // From the approval URL
    token: '123456', // 6-digit token from email/SMS/WhatsApp
  });

  if (tokenValidation.valid && tokenValidation.canApprove) {
    console.log('✅ Token is valid and approver can approve now');
    console.log(`   Approver: ${tokenValidation.approver?.name}`);
    console.log(`   Envelope: ${tokenValidation.envelope?.name}`);
    console.log(`   Requires comment: ${tokenValidation.envelope?.requireApprovalComment}\n`);
  } else {
    console.log(`❌ Token validation failed: ${tokenValidation.message}\n`);
  }

  // ==========================================
  // 6. Get Approval Information
  // ==========================================

  console.log('📊 Getting approval information...');

  const approvalInfo = await client.approvals.getInfo(parallelEnvelope.id);

  console.log(`✅ Envelope: ${approvalInfo.envelopeName}`);
  console.log(`   Progress: ${approvalInfo.approvedCount}/${approvalInfo.approversCount} approved`);
  console.log(`   Rejected: ${approvalInfo.rejectedCount}`);
  console.log(`   Pending: ${approvalInfo.pendingCount}`);
  console.log(`   Current approver: ${approvalInfo.approver.name}\n`);

  // ==========================================
  // 7. Make Approval Decision (Approve)
  // ==========================================

  console.log('✅ Making approval decision (APPROVED)...');

  const approveResult = await client.approvals.decide(
    parallelEnvelope.id,
    {
      envelopeId: parallelEnvelope.id,
      signerId: 'signer-id',
      token: '123456',
      decision: 'APPROVED',
      comment: 'Budget allocation approved. All numbers look good.',
      channel: NotificationChannel.EMAIL,
    },
    {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    }
  );

  console.log(`✅ Decision recorded: ${approveResult.decision}`);
  console.log(`   Envelope status: ${approveResult.envelopeStatus}`);
  console.log(`   Is completed: ${approveResult.isCompleted}`);
  console.log(`   Is canceled: ${approveResult.isCanceled}\n`);

  // ==========================================
  // 8. Make Approval Decision (Reject)
  // ==========================================

  console.log('❌ Making approval decision (REJECTED)...');

  const rejectResult = await client.approvals.decide(
    sequentialEnvelope.id,
    {
      envelopeId: sequentialEnvelope.id,
      signerId: 'signer-id-2',
      token: '654321',
      decision: 'REJECTED',
      comment: 'Legal concerns identified. Contract requires revisions before approval.',
      channel: NotificationChannel.EMAIL,
    },
    {
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    }
  );

  console.log(`❌ Decision recorded: ${rejectResult.decision}`);
  console.log(`   Envelope status: ${rejectResult.envelopeStatus}`);

  if (rejectResult.isCanceled) {
    console.log(`   ⚠️  Envelope was CANCELED due to blockOnRejection setting\n`);
  } else {
    console.log(`   ℹ️  Envelope continues despite rejection\n`);
  }

  // ==========================================
  // 9. Get Approval History
  // ==========================================

  console.log('📜 Getting approval history...');

  const history = await client.approvals.getHistory(parallelEnvelope.id);

  console.log(`✅ Approval history for: ${history.envelopeName}`);
  console.log(`   Total decisions: ${history.history.length}\n`);

  history.history.forEach((entry, index) => {
    console.log(`   ${index + 1}. ${entry.approverName} (${entry.approverEmail})`);
    console.log(`      Decision: ${entry.decision}`);
    console.log(`      Date: ${entry.decidedAt}`);
    console.log(`      Channel: ${entry.channel}`);
    console.log(`      Comment: ${entry.comment || 'No comment'}`);
    if (entry.approvalOrder) {
      console.log(`      Order: ${entry.approvalOrder}`);
    }
    console.log('');
  });

  // ==========================================
  // 10. Download Approved Document with Stamps
  // ==========================================

  console.log('📥 Downloading approved document...');

  try {
    const documentBuffer = await client.approvals.downloadDocument(
      parallelEnvelope.id,
      'document-id'
    );

    // Save to file
    const filename = `approved-document-${Date.now()}.pdf`;
    fs.writeFileSync(filename, documentBuffer);

    console.log(`✅ Document downloaded with approval stamps: ${filename}`);
    console.log(`   Size: ${(documentBuffer.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.log('⚠️  Document not available yet (waiting for all approvals)\n');
  }

  // ==========================================
  // 11. Update Approval Mode (if needed)
  // ==========================================

  console.log('⚙️  Updating approval mode...');

  const updatedEnvelope = await client.approvals.setMode(parallelEnvelope.id, {
    approvalMode: ApprovalMode.SEQUENTIAL,
    blockOnRejection: false,
    requireApprovalComment: true,
  });

  console.log(`✅ Approval mode updated for envelope ${updatedEnvelope.id}`);
  console.log(`   New mode: ${updatedEnvelope.approvalMode}`);
  console.log(`   Block on rejection: ${updatedEnvelope.blockOnRejection}`);
  console.log(`   Require comment: ${updatedEnvelope.requireApprovalComment}\n`);

  // ==========================================
  // Summary
  // ==========================================

  console.log('═══════════════════════════════════════════');
  console.log('📊 APPROVAL WORKFLOW SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Created 2 approval envelopes`);
  console.log(`   - Parallel mode: ${parallelEnvelope.id}`);
  console.log(`   - Sequential mode: ${sequentialEnvelope.id}`);
  console.log(`✅ Sent approval tokens to approvers`);
  console.log(`✅ Validated tokens and made decisions`);
  console.log(`✅ Retrieved approval history and documents`);
  console.log('═══════════════════════════════════════════\n');
}

// ==========================================
// Run the example
// ==========================================

if (require.main === module) {
  approvalWorkflowExample()
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

export { approvalWorkflowExample };
