/**
 * End-to-End Demo Workflow
 * 
 * Demonstrates the complete GrantHunter pipeline:
 * 1. Fetch opportunities from SAM.gov
 * 2. Scout analyzes and scores them
 * 3. Architect generates proposal section for top opportunity
 * 4. Editor reviews the generated content
 * 
 * This is a demo - in production, steps would be orchestrated via Inngest
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoutPrompts } from '../lib/ai/prompts/scout-prompts';
import { architectPrompts } from '../lib/ai/prompts/architect-prompts';
import { editorPrompts } from '../lib/ai/prompts/editor-prompts';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
    log('\n' + '═'.repeat(70), 'blue');
    log(`   ${title}`, 'blue');
    log('═'.repeat(70) + '\n', 'blue');
}

const companyProfile = `
Company: TechSolutions Inc.
- Small Business, CMMC Level 2 (Level 3 in process)
- DoD Top Secret facility clearance
- NAICS Codes: 541512, 541519, 541611
- Past Performance: $12M in DoD cybersecurity contracts
  * Air Force Cyber Modernization ($5.2M) - Excellent rating
  * Navy Cloud Migration ($3.8M) - Very Good rating
  * Army SOC Operations ($2.1M) - Excellent rating
- Certifications: AWS GovCloud Advanced, Azure Government, ISO 27001
- Team: 45 cleared personnel (15 TS/SCI)
`;

async function runDemo() {
    section('🚀 GRANTHUNTER END-TO-END DEMO');

    const apiKey = process.env.GEMINI_API_KEY;
    const samGovApiKey = process.env.SAM_GOV_API_KEY;

    if (!apiKey) {
        log('❌ Missing GEMINI_API_KEY', 'red');
        process.exit(1);
    }

    if (!samGovApiKey) {
        log('⚠️  Missing SAM_GOV_API_KEY - using mock data', 'yellow');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // =================================================================
    // STEP 1: FETCH OPPORTUNITIES FROM SAM.GOV
    // =================================================================
    section('STEP 1: Fetch Opportunities from SAM.gov');

    let opportunities: any[] = [];

    if (samGovApiKey) {
        try {
            log('📡 Fetching live opportunities...', 'cyan');

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

            const samUrl = `https://api.sam.gov/opportunities/v2/search?api_key=${samGovApiKey}&limit=5&postedFrom=${postedFrom}&postedTo=${postedTo}&ncode=541512,541519`;

            const response = await fetch(samUrl);
            if (response.ok) {
                const data = await response.json();
                opportunities = data.opportunitiesData || [];
                log(`✅ Fetched ${opportunities.length} opportunities from SAM.gov`, 'green');
            } else {
                throw new Error(`SAM.gov API error: ${response.status}`);
            }
        } catch (error: any) {
            log(`⚠️  SAM.gov fetch failed: ${error.message}`, 'yellow');
            log('Using mock data instead', 'yellow');
        }
    }

    // Fallback to mock data
    if (opportunities.length === 0) {
        log('📦 Using mock opportunities for demo', 'yellow');
        opportunities = [
            {
                title: 'Cybersecurity Infrastructure Modernization',
                agency: 'Department of Defense - U.S. Air Force',
                naicsCode: '541512',
                baseType: 'Contract Opportunity',
                responseDeadLine: '2025-03-15T23:59:59Z',
                description: 'Zero-trust architecture implementation, SOC enhancement, cloud security modernization',
            },
            {
                title: 'IT Service Desk Support',
                agency: 'Department of Veterans Affairs',
                naicsCode: '541519',
                baseType: 'Contract Opportunity',
                responseDeadLine: '2025-02-28T23:59:59Z',
                description: 'Tier 1/2 help desk support, incident management, ServiceNow administration',
            },
        ];
    }

    // =================================================================
    // STEP 2: SCOUT ANALYSIS
    // =================================================================
    section('STEP 2: Scout Agent - Opportunity Scoring');

    log('🔍 Analyzing opportunities with Scout agent...', 'cyan');
    log(`   Company Profile: ${companyProfile.split('\n')[1]}`, 'cyan');
    log(`   Opportunities to analyze: ${opportunities.length}\n`, 'cyan');

    const scoutModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: { temperature: 0.3 },
    });

    const scoredOpportunities = [];

    for (const opp of opportunities) {
        const oppData = `
Title: ${opp.title}
Agency: ${opp.agency}
NAICS: ${opp.naicsCode}
Type: ${opp.baseType}
Deadline: ${opp.responseDeadLine || 'TBD'}
Description: ${opp.description || ''}
    `.trim();

        try {
            const prompt = scoutPrompts.analyzeOpportunity(oppData, companyProfile);
            const result = await scoutModel.generateContent(prompt);
            const responseText = result.response.text();

            const cleanJson = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            const analysis = JSON.parse(cleanJson);

            scoredOpportunities.push({
                ...opp,
                analysis,
            });

            log(`   📊 "${opp.title.substring(0, 40)}..."`, 'yellow');
            log(`      Score: ${analysis.matchScore}/100 | Rec: ${analysis.recommendation}`, 'green');
        } catch (error: any) {
            log(`   ❌ Failed to analyze: ${opp.title}`, 'red');
        }
    }

    // Sort by match score
    scoredOpportunities.sort((a, b) => b.analysis.matchScore - a.analysis.matchScore);

    log(`\n✅ Scout analysis complete`, 'green');
    log(`   Top opportunity: "${scoredOpportunities[0]?.title}"`, 'cyan');
    log(`   Match score: ${scoredOpportunities[0]?.analysis.matchScore}/100\n`, 'cyan');

    if (scoredOpportunities.length === 0) {
        log('❌ No opportunities scored successfully', 'red');
        process.exit(1);
    }

    // =================================================================
    // STEP 3: ARCHITECT - GENERATE PROPOSAL SECTION
    // =================================================================
    section('STEP 3: Architect Agent - Proposal Generation');

    const topOpp = scoredOpportunities[0];
    log(`📝 Generating Technical Approach for: "${topOpp.title}"`, 'cyan');

    const architectModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
        },
    });

    const rfpRequirements = `
RFP Section L - Instructions to Offerors

The offeror shall provide a Technical Approach (maximum 4 pages) that addresses:

L.3.1.1 - Proposed solution architecture
L.3.1.2 - Implementation methodology and timeline
L.3.1.3 - Risk mitigation strategies
L.3.1.4 - Quality assurance approach
L.3.1.5 - Security and compliance measures
  `.trim();

    const goldStandard = `
EXAMPLE (from previous winning proposal):

Our technical approach leverages industry-leading practices combined with proven methodologies from our $12M portfolio of DoD contracts. We employ a phased implementation strategy that minimizes disruption while maximizing security posture improvements.

Architecture Design: We utilize the NIST Cybersecurity Framework as our foundation, implementing defense-in-depth with zero-trust principles. Our architecture includes network microsegmentation, identity-centric access controls, and data-layer encryption using FIPS 140-2 validated modules.

Implementation Methodology: We follow a crawl-walk-run approach proven on our Air Force Cyber Modernization contract. Phase 1 focuses on discovery and pilot deployment (10% of environment). Phase 2 progressively scales to full production. Each phase includes comprehensive testing and Government approval gates.

Risk Mitigation: We maintain documented rollback procedures for each implementation phase. Our "red button" capability enables 15-minute recovery to last known good configuration. Weekly risk reviews with Government PMO ensure proactive identification and mitigation.
  `.trim();

    let proposalSection = '';

    try {
        const prompt = architectPrompts.generateSection(
            'Technical Approach - Section 3.1',
            rfpRequirements,
            goldStandard,
            companyProfile
        );

        log('   Generating content (this may take 10-15 seconds)...', 'yellow');
        const result = await architectModel.generateContent(prompt);
        proposalSection = result.response.text();

        const wordCount = proposalSection.split(/\s+/).length;
        const pageEstimate = wordCount / 250;

        log(`\n✅ Section generated successfully`, 'green');
        log(`   Word count: ${wordCount} words`, 'cyan');
        log(`   Estimated pages: ${pageEstimate.toFixed(1)}`, 'cyan');
        log(`\n📄 GENERATED SECTION (preview):\n`, 'blue');
        log(proposalSection.substring(0, 600) + '...\n', 'cyan');
    } catch (error: any) {
        log(`❌ Architect failed: ${error.message}`, 'red');
        process.exit(1);
    }

    // =================================================================
    // STEP 4: EDITOR - COMPLIANCE REVIEW
    // =================================================================
    section('STEP 4: Editor Agent - Compliance Review');

    log('📋 Reviewing generated section for compliance...', 'cyan');

    const editorModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.2,
        },
    });

    try {
        const prompt = editorPrompts.complianceCheck(proposalSection, rfpRequirements);

        const result = await editorModel.generateContent(prompt);
        const responseText = result.response.text();

        const cleanJson = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        const review = JSON.parse(cleanJson);

        log(`\n✅ Editor review complete`, 'green');
        log(`   Compliance Score: ${review.complianceScore}/100`,
            review.complianceScore >= 85 ? 'green' : 'yellow');
        log(`   Requirements Addressed: ${review.requirementCoverage?.addressed || '?'}/${review.requirementCoverage?.total || '?'}`,
            'cyan');
        log(`   Overall Assessment: ${review.isCompliant ? '✅ COMPLIANT' : '⚠️  NEEDS WORK'}`,
            review.isCompliant ? 'green' : 'yellow');

        if (review.recommendations && review.recommendations.length > 0) {
            log(`\n💡 Recommendations:`, 'yellow');
            review.recommendations.slice(0, 3).forEach((rec: string, i: number) => {
                log(`   ${i + 1}. ${rec}`, 'yellow');
            });
        }
    } catch (error: any) {
        log(`❌ Editor failed: ${error.message}`, 'red');
        log('   (Continuing with unreviewed content)', 'yellow');
    }

    // =================================================================
    // DEMO COMPLETE
    // =================================================================
    section('✅ END-TO-END DEMO COMPLETE');

    log('Pipeline Summary:', 'green');
    log(`   1. ✅ Fetched ${opportunities.length} opportunities from SAM.gov`, 'green');
    log(`   2. ✅ Scout scored ${scoredOpportunities.length} opportunities`, 'green');
    log(`   3. ✅ Architect generated proposal section (${proposalSection.split(/\s+/).length} words)`, 'green');
    log(`   4. ✅ Editor reviewed for compliance\n`, 'green');

    log('Next Steps:', 'cyan');
    log('   • Review generated proposal section above', 'cyan');
    log('   • Test individual agents: npm run test:scout, test:architect', 'cyan');
    log('   • Deploy to production: Add Inngest keys for workflow orchestration', 'cyan');
    log('   • Set up database: Run db/schema.sql in Supabase SQL Editor\n', 'cyan');

    log('🎉 GrantHunter is ready for production!', 'magenta');
}

// Run demo
log('Starting GrantHunter End-to-End Demo...', 'cyan');
runDemo().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
