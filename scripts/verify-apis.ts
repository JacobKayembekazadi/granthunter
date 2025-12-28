/**
 * Verification script for API connectivity
 * Tests: Supabase, SAM.gov, and Gemini
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Color codes for terminal
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifySupabase() {
    log('\n🔍 Testing Supabase Connection...', 'blue');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        log('❌ Missing Supabase credentials', 'red');
        return false;
    }

    try {
        const supabase = createClient(url, anonKey);
        const { data, error } = await supabase.from('users').select('count').limit(1);

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
            log(`❌ Supabase Error: ${error.message}`, 'red');
            return false;
        }

        log('✅ Supabase connection successful!', 'green');
        return true;
    } catch (err: any) {
        log(`❌ Supabase Error: ${err.message}`, 'red');
        return false;
    }
}

async function verifySamGov() {
    log('\n🔍 Testing SAM.gov API...', 'blue');

    const apiKey = process.env.SAM_GOV_API_KEY;

    if (!apiKey) {
        log('❌ Missing SAM_GOV_API_KEY', 'red');
        return false;
    }

    try {
        // SAM.gov requires PostedFrom and PostedTo dates in MM/dd/yyyy format
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const formatDate = (date: Date) => {
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
        };

        const postedFrom = formatDate(thirtyDaysAgo);
        const postedTo = formatDate(today);

        const url = `https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&limit=1&postedFrom=${postedFrom}&postedTo=${postedTo}`;

        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            log(`❌ SAM.gov API Error: ${response.status} ${response.statusText}`, 'red');
            const text = await response.text();
            log(`Response: ${text.substring(0, 200)}`, 'yellow');
            return false;
        }

        const data = await response.json();
        log('✅ SAM.gov API connection successful!', 'green');
        log(`   Total opportunities available: ${data.totalRecords || 'N/A'}`, 'yellow');
        return true;
    } catch (err: any) {
        log(`❌ SAM.gov Error: ${err.message}`, 'red');
        return false;
    }
}

async function verifyGemini() {
    log('\n🔍 Testing Gemini API...', 'blue');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log('❌ Missing GEMINI_API_KEY', 'red');
        return false;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent('Say "API Connected" in exactly 2 words.');
        const response = await result.response;
        const text = response.text();

        log('✅ Gemini API connection successful!', 'green');
        log(`   Response: ${text.trim()}`, 'yellow');
        return true;
    } catch (err: any) {
        log(`❌ Gemini Error: ${err.message}`, 'red');
        return false;
    }
}

async function main() {
    log('═══════════════════════════════════════', 'blue');
    log('   GrantHunter API Verification', 'blue');
    log('═══════════════════════════════════════', 'blue');

    const results = {
        supabase: await verifySupabase(),
        samGov: await verifySamGov(),
        gemini: await verifyGemini(),
    };

    log('\n═══════════════════════════════════════', 'blue');
    log('   VERIFICATION SUMMARY', 'blue');
    log('═══════════════════════════════════════', 'blue');
    log(`Supabase: ${results.supabase ? '✅' : '❌'}`, results.supabase ? 'green' : 'red');
    log(`SAM.gov:  ${results.samGov ? '✅' : '❌'}`, results.samGov ? 'green' : 'red');
    log(`Gemini:   ${results.gemini ? '✅' : '❌'}`, results.gemini ? 'green' : 'red');

    const allPassed = Object.values(results).every(r => r);

    if (allPassed) {
        log('\n🎉 All API connections verified!', 'green');
        process.exit(0);
    } else {
        log('\n⚠️  Some API connections failed. Check the logs above.', 'yellow');
        process.exit(1);
    }
}

main().catch(err => {
    log(`Fatal error: ${err.message}`, 'red');
    process.exit(1);
});
