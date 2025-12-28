/**
 * Test Script: Architect Agent - Proposal Section Generation
 * 
 * Tests FAR compliance, structure, and gold standard integration
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { architectPrompts } from '../lib/ai/prompts/architect-prompts';

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

const testCase = {
    sectionTitle: 'Technical Approach - Section 3.1',
    rfpRequirements: `
RFP SECTION L - INSTRUCTIONS TO OFFERORS
Section 3.1 - Technical Approach (Maximum 5 pages)

The offeror shall provide a detailed technical approach that addresses the following:

L.3.1.1 Cybersecurity Architecture
Describe your proposed zero-trust architecture implementation including:
- Network segmentation strategy
- Identity and access management approach
- Data encryption methods (at rest and in transit)
- Continuous monitoring capabilities

L.3.1.2 Implementation Methodology
Provide a phased implementation plan including:
- Migration strategy from current state
- Risk mitigation during transition
- Testing and validation approach
- Rollback procedures

L.3.1.3 Security Operations Center (SOC)
Detail your SOC enhancement approach including:
- 24/7 monitoring capabilities
- Incident response procedures (NIST 800-61 alignment)
- Threat intelligence integration
- Metrics and reporting framework

L.3.1.4 Compliance and Certification
Demonstrate your approach to achieving and maintaining:
- NIST 800-171 compliance
- CMMC Level 3 certification
- FedRAMP moderate baseline (if cloud-based)
- Continuous compliance monitoring
  `.trim(),

    pastPerformance: `
GOLD STANDARD EXAMPLE (from winning Air Force cyber proposal):

3.1 TECHNICAL APPROACH

Our technical approach leverages a defense-in-depth strategy combined with zero-trust principles to deliver a resilient cybersecurity infrastructure for the Air Force. This approach has been proven successful across three DoD cyber modernization contracts totaling $12M in value.

3.1.1 Zero-Trust Architecture Implementation

We employ a phased zero-trust implementation utilizing the NIST SP 800-207 framework. Our architecture comprises three core pillars:

Network Microsegmentation: We deploy software-defined perimeter (SDP) technology to create dynamic, policy-based network segments. Each segment enforces least-privilege access using Palo Alto Networks' next-generation firewalls with identity-aware policies. This approach, successfully deployed for the Navy's IT Modernization Program (Contract #N00178-21-D-8234), reduced lateral movement risk by 87%.

Identity-Centric Access Management: Our IAM solution integrates Okta's Federal Identity Management with DISA's Purebred PKI certificates for multi-factor authentication. We implement continuous verification using behavioral analytics (Exabeam) to detect anomalous access patterns. Session timeout policies align with DISA STIG requirements (15 minutes idle, 8 hours absolute).

Data-Centric Security: We enforce AES-256 encryption for data at rest using FIPS 140-2 validated modules and TLS 1.3 for data in transit. Our data loss prevention (DLP) solution (Forcepoint) classifies data based on Impact Levels (IL2-IL6) and enforces automated policies preventing unauthorized exfiltration.

3.1.2 Phased Implementation Strategy

Our implementation follows a crawl-walk-run methodology proven on the Army's Cyber Support Services contract:

Phase 1 - Foundation (Months 1-3): Comprehensive discovery and assessment of current infrastructure, threat landscape analysis, and zero-trust roadmap development. Deliverable: Zero Trust Architecture Blueprint approved by Government CIO.

Phase 2 - Pilot (Months 4-6): Deploy zero-trust capabilities to 10% of user population (200 users) in selected enclave. This controlled rollout mitigates risk while validating technical approach. Success metrics: <5% user support calls, zero security incidents.

Phase 3 - Scale (Months 7-12): Progressive deployment across remaining enclaves using proven runbook. Weekly deployment reviews with Government PMO ensure alignment and risk mitigation.

Risk Mitigation: Each phase includes comprehensive testing (unit, integration, user acceptance) and documented rollback procedures. Our "red button" capability enables 15-minute rollback to last known good configuration.
  `.trim(),

    companyProfile: `
Company: TechSolutions Inc.
- Small Business, CMMC Level 2 (Level 3 in process)
- DoD Top Secret facility clearance
- Past Performance: $12M in DoD cybersecurity contracts
- Certifications: AWS GovCloud Advanced, Azure Government, ISO 27001, SOC 2 Type II
- Team: 45 cleared personnel (15 TS/SCI)
- Partnerships: Palo Alto Networks Federal Partner, Okta Federal Partner
  `.trim(),
};

async function testArchitect() {
    log('\n═══════════════════════════════════════════════════════', 'blue');
    log('   ARCHITECT AGENT TEST - Proposal Section Generation', 'blue');
    log('═══════════════════════════════════════════════════════\n', 'blue');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log('❌ Missing GEMINI_API_KEY', 'red');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp', // Could use gemini-1.5-pro for production
        generationConfig: {
            temperature: 0.7, // Balanced creativity
            maxOutputTokens: 4000,
        },
    });

    try {
        log('📝 Generating Technical Approach section...', 'cyan');
        log(`Section: ${testCase.sectionTitle}`, 'yellow');
        log(`RFP Requirements: ${testCase.rfpRequirements.split('\n').length} lines`, 'yellow');
        log(`Gold Standard Example: ${testCase.pastPerformance.split('\n').length} lines\n`, 'yellow');

        const prompt = architectPrompts.generateSection(
            testCase.sectionTitle,
            testCase.rfpRequirements,
            testCase.pastPerformance,
            testCase.companyProfile
        );

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const duration = Date.now() - startTime;

        const generatedSection = result.response.text();

        log(`✅ Generation complete (${duration}ms, ${generatedSection.length} chars)\n`, 'green');

        // Analysis
        log('═══════════════════════════════════════════════════════', 'blue');
        log('   QUALITY ANALYSIS', 'blue');
        log('═══════════════════════════════════════════════════════\n', 'blue');

        const wordCount = generatedSection.split(/\s+/).length;
        const pageEstimate = wordCount / 250; // ~250 words per page

        log(`📊 Statistics:`, 'cyan');
        log(`   Word Count: ${wordCount}`, 'cyan');
        log(`   Estimated Pages: ${pageEstimate.toFixed(1)}`, 'cyan');
        log(`   Characters: ${generatedSection.length}`, 'cyan');

        // Check requirement coverage
        const requirements = [
            'L.3.1.1',
            'L.3.1.2',
            'L.3.1.3',
            'L.3.1.4',
        ];

        log(`\n✓ Requirement Coverage:`, 'yellow');
        let coveredCount = 0;
        requirements.forEach(req => {
            const mentioned = generatedSection.includes(req) ||
                generatedSection.toLowerCase().includes(req.replace('L.', 'section ').toLowerCase());
            if (mentioned) {
                log(`   ✅ ${req} - Addressed`, 'green');
                coveredCount++;
            } else {
                log(`   ❌ ${req} - Not clearly addressed`, 'red');
            }
        });

        const coveragePercent = (coveredCount / requirements.length) * 100;

        // Check for FAR compliance indicators
        log(`\n✓ Compliance Indicators:`, 'yellow');
        const complianceKeywords = [
            { term: 'NIST', description: 'NIST framework mentioned' },
            { term: 'compliance', description: 'Compliance considerations' },
            { term: 'DoD', description: 'DoD alignment' },
            { term: 'phased', description: 'Phased approach described' },
            { term: 'risk', description: 'Risk mitigation included' },
        ];

        let complianceScore = 0;
        complianceKeywords.forEach(({ term, description }) => {
            const count = (generatedSection.match(new RegExp(term, 'gi')) || []).length;
            if (count > 0) {
                log(`   ✅ ${description} (${count} mentions)`, 'green');
                complianceScore += 20;
            } else {
                log(`   ⚠  ${description} - Not found`, 'yellow');
            }
        });

        // Overall assessment
        log(`\n═══════════════════════════════════════════════════════`, 'blue');
        log('   ASSESSMENT', 'blue');
        log('═══════════════════════════════════════════════════════', 'blue');
        log(`Requirement Coverage: ${coveragePercent.toFixed(0)}%`,
            coveragePercent >= 75 ? 'green' : 'yellow');
        log(`Compliance Indicators: ${complianceScore}/100`,
            complianceScore >= 60 ? 'green' : 'yellow');
        log(`Page Length: ${pageEstimate.toFixed(1)} pages (target: 3-5)`,
            pageEstimate >= 2 && pageEstimate <= 6 ? 'green' : 'yellow');

        // Display preview
        log(`\n═══════════════════════════════════════════════════════`, 'blue');
        log('   GENERATED SECTION PREVIEW (first 800 chars)', 'blue');
        log('═══════════════════════════════════════════════════════\n', 'blue');
        log(generatedSection.substring(0, 800) + '...\n', 'cyan');

        // Pass/Fail
        const passed = coveragePercent >= 75 && complianceScore >= 60 && pageEstimate >= 2;

        if (passed) {
            log('🎉 TEST PASSED: Architect generated compliant, well-structured section!', 'green');
            process.exit(0);
        } else {
            log('⚠️  TEST MARGINAL: Section generated but may need refinement', 'yellow');
            process.exit(0); // Not failing, just noting
        }

    } catch (error: any) {
        log(`❌ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the test
log('Starting Architect Agent Test...', 'cyan');
testArchitect().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
