/**
 * Test Script: Scout Agent - Opportunity Screening
 * 
 * Tests the Chain-of-Thought reasoning and scoring system
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoutPrompts } from '../lib/ai/prompts/scout-prompts';

// Load .env.local
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

// Sample opportunities for testing
const testOpportunities = [
    {
        name: 'High Match - DoD Cybersecurity',
        data: `
Title: Cybersecurity Infrastructure Modernization
Agency: Department of Defense - U.S. Air Force
NAICS: 541512 (Computer Systems Design Services)
Contract Value: $8,500,000
Set-Aside: Small Business
Submission Deadline: 2025-03-15 (75 days from now)
Place of Performance: Wright-Patterson AFB, Ohio

Description:
The U.S. Air Force seeks cybersecurity infrastructure modernization services including:
- Zero Trust Architecture implementation
- Security Operations Center (SOC) enhancement
- Cloud security (AWS GovCloud, Azure Government)
- Continuous monitoring and threat detection
- Incident response capabilities
- Security awareness training

Requirements:
- Active DoD Top Secret clearance for key personnel
- CMMC Level 3 certification (or in process)
- AWS/Azure government certifications
- Past performance with DoD on similar contracts
- NIST 800-171 compliance expertise

Evaluation Criteria:
- Technical Approach (40%)
- Past Performance (30%)
- Price (20%)
- Small Business Participation (10%)
    `.trim(),
        expectedScore: 85, // Should be high match
    },
    {
        name: 'Medium Match - VA IT Services',
        data: `
Title: IT Service Desk Support
Agency: Department of Veterans Affairs
NAICS: 541519 (Other Computer Related Services)
Contract Value: $2,100,000
Set-Aside: Service-Disabled Veteran-Owned Small Business (SDVOSB)
Submission Deadline: 2025-02-01 (35 days from now)
Place of Performance: Multiple VA facilities nationwide

Description:
The VA requires IT service desk support services including:
- Tier 1 and Tier 2 help desk support
- Incident and problem management
- Asset management
- Knowledge base maintenance
- User training and documentation

Requirements:
- SDVOSB certification required
- ITIL v4 certification preferred
- Experience with ServiceNow platform
- VA past performance required

Evaluation Criteria:
- Past Performance (40%)
- Technical Approach (30%)
- Price (30%)
    `.trim(),
        expectedScore: 60, // Medium - depends on SDVOSB status
    },
    {
        name: 'Low Match - Construction Services',
        data: `
Title: Facility Construction and Renovation
Agency: General Services Administration (GSA)
NAICS: 236220 (Commercial and Institutional Building Construction)
Contract Value: $15,000,000
Set-Aside: 8(a) Small Business
Submission Deadline: 2025-01-20 (23 days from now)
Place of Performance: Washington, DC metro area

Description:
GSA seeks construction contractor for federal building renovation including:
- Structural modifications
- HVAC system replacement
- Electrical infrastructure upgrade
- Interior finishing
- Project management

Requirements:
- 8(a) certification required
- Licensed general contractor
- $10M+ bonding capacity
- LEED certification preferred
- 5+ years commercial construction experience

Evaluation Criteria:
- Past Performance (50%)
- Price (30%)
- Technical Approach (20%)
    `.trim(),
        expectedScore: 20, // Low - wrong industry (construction vs. IT)
    },
];

const companyProfile = `
Company Profile:
- Name: TechSolutions Inc.
- Certifications: Small Business, CMMC Level 2 (Level 3 in process)
- Clearances: Active DoD Top Secret facility clearance
- NAICS Codes: 541512, 541519, 541611, 541990
- Past Performance:
  * DoD Contract #1: $5.2M cybersecurity modernization (Air Force) - Excellent rating
  * DoD Contract #2: $3.8M cloud migration (Navy) - Very Good rating
  * DoD Contract #3: $2.1M SOC operations (Army) - Excellent rating
  * Civilian Contract: $1.5M IT services (DHS) - Good rating
- Capabilities:
  * AWS Advanced Consulting Partner (Government competency)
  * Azure Government certified
  * ISO 27001, SOC 2 Type II certified
  * NIST 800-171 compliant infrastructure
  * 45 cleared personnel (15 TS/SCI)
- NOT certified: SDVOSB, 8(a)
- NOT experienced in: Construction, facilities management
`;

async function testScout() {
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('   SCOUT AGENT TEST - Chain-of-Thought Reasoning', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log('❌ Missing GEMINI_API_KEY', 'red');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.3, // Low for consistent scoring
        },
    });

    let passCount = 0;
    let failCount = 0;

    for (const testCase of testOpportunities) {
        log(`\n🔍 Testing: ${testCase.name}`, 'cyan');
        log('─'.repeat(60), 'cyan');

        try {
            const prompt = scoutPrompts.analyzeOpportunity(
                testCase.data,
                companyProfile
            );

            const startTime = Date.now();
            const result = await model.generateContent(prompt);
            const duration = Date.now() - startTime;

            const responseText = result.response.text();

            // Try to parse JSON response
            let analysis;
            try {
                // Remove markdown code blocks if present
                const cleanJson = responseText
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();
                analysis = JSON.parse(cleanJson);
            } catch (e) {
                log(`❌ Failed to parse JSON response`, 'red');
                log(`Raw response: ${responseText.substring(0, 200)}...`, 'yellow');
                failCount++;
                continue;
            }

            // Display results
            log(`\n📊 Analysis Results (${duration}ms):`, 'yellow');
            log(`   Match Score: ${analysis.matchScore}/100`, 'yellow');
            log(`   Win Probability: ${analysis.winProbability}%`, 'yellow');
            log(`   Effort Estimate: ${analysis.effortEstimate}`, 'yellow');
            log(`   Risk Level: ${analysis.riskLevel}`, 'yellow');
            log(`   Recommendation: ${analysis.recommendation}`, 'yellow');

            log(`\n💡 Key Requirements:`, 'cyan');
            analysis.keyRequirements?.slice(0, 3).forEach((req: string) => {
                log(`   • ${req}`, 'cyan');
            });

            log(`\n🧠 Scout's Reasoning:`, 'blue');
            const reasoning = analysis.reasoning || 'No reasoning provided';
            log(`   ${reasoning.substring(0, 300)}...`, 'blue');

            // Validate against expected score
            const scoreDiff = Math.abs(analysis.matchScore - testCase.expectedScore);
            const passed = scoreDiff <= 15; // Allow 15 point variance

            if (passed) {
                log(`\n✅ PASS: Score ${analysis.matchScore} within range of expected ${testCase.expectedScore}`, 'green');
                passCount++;
            } else {
                log(`\n❌ FAIL: Score ${analysis.matchScore} too far from expected ${testCase.expectedScore} (diff: ${scoreDiff})`, 'red');
                failCount++;
            }

        } catch (error: any) {
            log(`❌ Error: ${error.message}`, 'red');
            failCount++;
        }
    }

    // Summary
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('   TEST SUMMARY', 'blue');
    log('═══════════════════════════════════════════════════════', 'blue');
    log(`Total Tests: ${testOpportunities.length}`, 'yellow');
    log(`Passed: ${passCount}`, passCount > 0 ? 'green' : 'yellow');
    log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'yellow');
    log(`Success Rate: ${((passCount / testOpportunities.length) * 100).toFixed(1)}%`,
        passCount === testOpportunities.length ? 'green' : 'yellow');

    if (passCount === testOpportunities.length) {
        log('\n🎉 All tests passed! Scout agent is working correctly.', 'green');
        process.exit(0);
    } else {
        log('\n⚠️  Some tests failed. Review the scoring logic.', 'yellow');
        process.exit(1);
    }
}

// Run the test
log('Starting Scout Agent Test Suite...', 'cyan');
testScout().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
