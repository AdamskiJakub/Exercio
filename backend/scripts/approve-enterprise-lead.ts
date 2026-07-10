/**
 * CLI script to approve an enterprise lead.
 *
 * Usage:
 *   npm run enterprise:approve <leadId>
 *
 * This script calls PATCH /enterprise/leads/:id/approve-cli with the
 * APPROVE_SECRET from the environment as a Bearer token.
 *
 * Environment variables (loaded from .env):
 *   APPROVE_SECRET   - Secret token for CLI authentication
 *   API_BASE_URL     - Backend base URL (default: http://localhost:3001)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from the backend root
config({ path: resolve(__dirname, '..', '.env') });

const APPROVE_SECRET = process.env.APPROVE_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function main() {
  const leadId = process.argv[2];

  if (!leadId) {
    console.error('❌ Usage: npm run enterprise:approve <leadId>');
    console.error('');
    console.error(
      '   Example: npm run enterprise:approve 7b81dcb0-1234-5678-9abc-def012345678',
    );
    process.exit(1);
  }

  if (!APPROVE_SECRET) {
    console.error('❌ APPROVE_SECRET is not set in .env');
    console.error('');
    console.error('   Add it to backend/.env:');
    console.error('   APPROVE_SECRET=your-secret-token');
    process.exit(1);
  }

  const url = `${API_BASE_URL}/enterprise/leads/${leadId}/approve-cli`;

  console.log(`🔍 Approving enterprise lead: ${leadId}`);
  console.log(`   PATCH ${url}`);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${APPROVE_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Request failed (${response.status}): ${errorBody}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Lead approved successfully!');
    console.log('');
    console.log('   Result:');
    console.log(`   - User ID:    ${result.userId}`);
    console.log(`   - Email:      ${result.email}`);
    console.log(`   - Company:    ${result.companyName}`);
    console.log('');
    console.log('📧 Activation email has been sent to the partner.');
  } catch (error) {
    console.error(
      `❌ Network error: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

main();
