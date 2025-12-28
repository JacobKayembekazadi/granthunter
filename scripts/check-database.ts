/**
 * Database Schema Verification
 * Checks if all tables exist in Supabase
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

const expectedTables = [
    'users',
    'organizations',
    'opportunities',
    'search_agents',
    'agent_runs',
    'proposals',
    'proposal_sections',
    'past_performance',
    'artifacts',
    'job_logs',
];

async function checkDatabase() {
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('   DATABASE SCHEMA VERIFICATION', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        log('❌ Missing Supabase credentials', 'red');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    log('📊 Checking tables in database...\n', 'cyan');

    const results = [];
    let existingCount = 0;

    for (const table of expectedTables) {
        try {
            // Try to query the table (limit 0 just to check existence)
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(0);

            if (error) {
                if (error.code === '42P01') {
                    // Table does not exist
                    log(`   ❌ ${table.padEnd(25)} - NOT FOUND`, 'red');
                    results.push({ table, exists: false });
                } else {
                    log(`   ⚠️  ${table.padEnd(25)} - ERROR: ${error.message}`, 'yellow');
                    results.push({ table, exists: false, error: error.message });
                }
            } else {
                log(`   ✅ ${table.padEnd(25)} - EXISTS`, 'green');
                results.push({ table, exists: true });
                existingCount++;
            }
        } catch (err: any) {
            log(`   ⚠️  ${table.padEnd(25)} - ERROR: ${err.message}`, 'yellow');
            results.push({ table, exists: false, error: err.message });
        }
    }

    // Summary
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('   SUMMARY', 'blue');
    log('═══════════════════════════════════════════════════════', 'blue');
    log(`Total Tables Expected: ${expectedTables.length}`, 'yellow');
    log(`Tables Found: ${existingCount}`, existingCount === expectedTables.length ? 'green' : 'yellow');
    log(`Tables Missing: ${expectedTables.length - existingCount}`,
        existingCount === expectedTables.length ? 'green' : 'red');

    if (existingCount === expectedTables.length) {
        log('\n🎉 All tables exist! Database schema is deployed correctly.', 'green');

        // Check for demo organization
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (data && !error) {
                log(`✅ Demo organization found: "${data.name}"`, 'green');
            }
        } catch (e) {
            // Demo org doesn't exist, that's fine
        }

        process.exit(0);
    } else {
        log('\n⚠️  Some tables are missing. Run db/schema.sql in Supabase SQL Editor.', 'yellow');

        const missing = results
            .filter(r => !r.exists)
            .map(r => r.table);

        log('\nMissing tables:', 'yellow');
        missing.forEach(t => log(`  - ${t}`, 'red'));

        process.exit(1);
    }
}

checkDatabase().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
