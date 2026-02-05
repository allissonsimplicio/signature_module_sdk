import { SignatureClient } from '../src';
import { EnvelopeInput } from '../src/types/envelope.types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  // 1. Initialize client
  const client = new SignatureClient({
    baseURL: process.env.API_URL || 'http://localhost:3000',
    accessToken: process.env.API_TOKEN || '',
  });

  try {
    console.log('🚀 Starting Audit Trail & History Example...');

    // 2. Create an envelope
    console.log('\n📝 Creating envelope...');
    const envelopeInput: EnvelopeInput = {
      name: 'Audit Trail Demo Envelope',
      description: 'Envelope to demonstrate history and audit trail capabilities',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      autoClose: true,
      notificationSettings: {
        emailEnabled: true,
        reminderEnabled: true,
        reminderIntervalHours: 48
      }
    };

    const envelope = await client.envelopes.create(envelopeInput);
    console.log(`✅ Envelope created: ${envelope.id}`);

    // 3. Add signers
    console.log('\n👥 Adding signers...');
    const signer1 = await client.signers.create(envelope.id, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      signingOrder: 1,
      role: 'SIGNER'
    });
    console.log(`✅ Signer 1 added: ${signer1.name} (${signer1.email})`);

    const signer2 = await client.signers.create(envelope.id, {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      signingOrder: 2,
      role: 'WITNESS'
    });
    console.log(`✅ Signer 2 added: ${signer2.name} (${signer2.email})`);

    // 4. List signers using findByEnvelope (NEW METHOD)
    console.log('\n🔍 Listing signers for envelope (New Method)...');
    const signers = await client.signers.findByEnvelope(envelope.id);
    console.log(`✅ Found ${signers.length} signers in envelope:`);
    signers.forEach(s => console.log(`   - ${s.name} (${s.role}) - Status: ${s.status}`));

    // 5. Activate envelope (generates events)
    console.log('\n▶️ Activating envelope...');
    // We need a document to activate, but this is just a demo of the API methods
    // In a real scenario, we would upload a document first.
    // For this example, we'll skip activation if it fails due to missing documents
    // and proceed to check the audit trail for creation events.
    
    try {
      await client.envelopes.activate(envelope.id);
      console.log('✅ Envelope activated');
    } catch (error) {
      console.log('⚠️ Could not activate envelope (expected if no documents):', error.message);
    }

    // 6. Get Audit Trail (NEW METHOD)
    console.log('\n📜 Fetching Audit Trail (New Method)...');
    const auditTrail = await client.envelopes.getAuditTrail(envelope.id);
    
    console.log(`✅ Audit Trail for "${auditTrail.envelopeName}"`);
    console.log(`   Total Entries: ${auditTrail.totalEntries}`);
    console.log('   Events:');
    
    auditTrail.entries.forEach(entry => {
      const actor = entry.actor.name || entry.actor.id;
      const target = entry.target ? ` on ${entry.target.type} ${entry.target.name || entry.target.id}` : '';
      console.log(`   - [${entry.occurredAt}] ${entry.action} by ${actor}${target}`);
    });

    // 7. Get Notification History (EXISTING METHOD - Verification)
    console.log('\n🔔 Fetching Notification History...');
    try {
      const notifications = await client.notifications.getHistoryByEnvelope(envelope.id);
      console.log(`✅ Found ${notifications.data.length} notifications`);
      notifications.data.forEach(n => {
        const recipient = n.recipientEmail || n.recipientPhone || n.recipientName;
        console.log(`   - ${n.channel} to ${recipient}: ${n.status}`);
      });
    } catch (error) {
      console.log('ℹ️ No notifications found (expected if activation failed or no emails sent yet)');
    }

    console.log('\n✨ Example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Data:', error.response.data);
    }
  }
}

main();
