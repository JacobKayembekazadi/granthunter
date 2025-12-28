# GrantHunter - Quick Reference Guide

## 🚀 System Status

### ✅ Verified & Working
- **Supabase**: Database connected
- **SAM.gov**: API connected (15,488 opportunities)
- **Gemini AI**: API connected (using gemini-2.0-flash-exp)
- **Dependencies**: 708 packages installed
- **Environment**: `.env.local` configured with 15 variables

### ⚠️ Optional Components (Not Required to Start)
- **Inngest**: Workflow orchestration (add keys when ready for long-running tasks)
- **Upstash Redis**: Rate limiting & caching (add for production scale)
- **Claude API**: Editor agent (add for best compliance review)
- **DeepSeek**: Alternative Scout model (optional cost optimization)
- **OpenAI**: Embeddings for RAG (add when using knowledge base)

---

## 📋 Quick Commands

### Development
```bash
# Start dev server
npm run dev

# Verify APIs
npx tsx scripts/verify-apis.ts

# Database operations
npm run db:push          # Deploy schema to Supabase
npm run db:studio        # View database (Drizzle Studio)
```

### Testing Prompts
```bash
# Test Scout (create test file)
npx tsx scripts/test-scout.ts

# Test Architect
npx tsx scripts/test-architect.ts

# Test RAG pipeline
npx tsx scripts/test-rag.ts
```

---

## 🧠 Agent Quick Reference

### The Scout (Lead Qualification)
**Location**: `lib/ai/prompts/scout-prompts.ts`  
**Purpose**: Filter 100+ opportunities → 5-10 high matches  
**Model**: Gemini 2.0 Flash (fast, cheap)  
**Temperature**: 0.3 (deterministic)  

**Key Prompts**:
- `analyzeOpportunity()` - Score single opp with CoT reasoning
- `findMatches()` - Batch screening, return top N
- `assessRisk()` - Red flag detection

**Output**: JSON with matchScore, winProbability, recommendation

---

### The Architect (Proposal Writer)
**Location**: `lib/ai/prompts/architect-prompts.ts`  
**Purpose**: Generate FAR-compliant proposal sections  
**Model**: Gemini 1.5 Pro (quality + compliance)  
**Temperature**: 0.7 (creative but coherent)  

**Key Prompts**:
- `generateSection()` - Main proposal section generator
- `generateExecutiveSummary()` - Critical 2-page summary
- `generateComplianceMatrix()` - Requirement → section mapping
- `improveSectionWithFeedback()` - Iterative refinement

**Output**: Formatted text ready for DOCX export

---

### The Editor (Compliance Reviewer)
**Location**: `lib/ai/prompts/editor-prompts.ts`  
**Purpose**: Multi-pass compliance & quality review  
**Model**: Claude 3.5 Sonnet (when API key added)  
**Temperature**: 0.2 (strict)  

**Key Prompts**:
- `complianceCheck()` - 3-pass review (requirements → FAR → quality)
- `polishContent()` - Content improvement
- `finalReview()` - Red team pre-submission check

**Output**: JSON with compliance score, issues, recommendations

---

### The Navigator (Voice Assistant)
**Location**: `lib/ai/prompts/navigator-prompts.ts`  
**Purpose**: Real-time tactical voice briefings  
**Model**: Gemini 2.5 Flash Native Audio  
**Temperature**: 0.5  

**System Instruction**: Tactical military + consultant style

**Key Prompts** (8 specialized briefings):
- `analyzeOpportunity()` - Quick win assessment
- `identifyRisks()` - Red team mode
- `meetingPrepBrief()` - Pre-meeting intelligence
- `deadlineAlert()` - Timeline recommendations
- `statusCheck()` - Proposal progress report

**Output**: Ultra-concise (under 100 words), action-oriented

---

### The Dashboard (Strategic Insights)
**Location**: `lib/ai/prompts/dashboard-prompts.ts`  
**Purpose**: Pattern recognition & strategic recommendations  
**Model**: Gemini 2.0 Flash  
**Temperature**: 0.6  

**Key Prompts**:
- `generateInsights()` - 3-5 actionable insights
- `analyzeTrends()` - Period-over-period comparison
- `detectAnomalies()` - Unusual pattern detection

**Output**: JSON array with priority, confidence, actionUrl

---

## 🎯 Testing Workflow

### 1. Test Scout (Opportunity Screening)
```typescript
// scripts/test-scout.ts
import { scoutPrompts } from '../lib/ai/prompts/scout-prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const oppData = `
Title: Cloud Infrastructure Modernization
Agency: Department of Veterans Affairs
NAICS: 541519
Contract Value: $8,500,000
Set-Aside: Small Business
Deadline: 2025-03-15
Description: Migrate legacy systems to AWS GovCloud...
`;

const prompt = scoutPrompts.analyzeOpportunity(
  oppData,
  'Our capabilities: AWS certified, VA past performance, SB status'
);

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

**Expected Output**: JSON with matchScore 75-95, recommendation "PURSUE"

### 2. Test Architect (Proposal Generation)
```typescript
// scripts/test-architect.ts
const prompt = architectPrompts.generateSection(
  'Technical Approach - Section 3.1',
  `RFP Requirements:
   L.3.1.1: Describe cloud migration methodology
   L.3.1.2: Identify security controls
   L.3.1.3: Provide transition timeline`,
  `Past Performance Example:
   [Insert 1 page from winning VA cloud proposal]`,
  'Company: Acme Tech, VA IDIQ holder, AWS Advanced Partner'
);

const result = await model.generateContent(prompt);
// Should output 2-3 pages of compliant technical approach
```

### 3. Test Navigator (Voice Briefing)
```typescript
// Use with Gemini Live API
const briefing = navigatorPrompts.analyzeOpportunity(
  'VA Cloud Modernization',
  87,
  '2025-03-15',
  '45 days remaining, incumbent: TechCorp'
);

// Expected spoken output:
// "Match is 87 out of 100. Win probability 65 percent - strong technical fit but incumbent risk. Recommend pursue with aggressive teaming strategy. Deadline in 45 days."
```

---

## 📊 Recommended Model Settings

```typescript
// lib/ai/orchestrator.ts
const modelConfigs = {
  scout: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.3,
    maxOutputTokens: 1000,
    topP: 0.8,
  },
  architect: {
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxOutputTokens: 4000,
    topP: 0.95,
  },
  editor: {
    model: 'claude-3-5-sonnet',
    temperature: 0.2,
    max_tokens: 2000,
  },
  navigator: {
    model: 'gemini-2.5-flash-native-audio',
    temperature: 0.5,
    maxOutputTokens: 200,
  },
  dashboard: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.6,
    maxOutputTokens: 1500,
    responseFormat: 'json',
  },
};
```

---

## 🔥 Advanced Features

### Chain-of-Thought Reasoning (Scout)
Prompts now force step-by-step thinking:
```
1. RELEVANCE SCORE (0-40):
   - NAICS alignment: 15 / 15 ✓
   - Technical match: 12 / 15 (missing cloud cert)
   - Past performance: 8 / 10
   Total: 35/40

2. WIN PROBABILITY (0-30):
   ...calculations...

FINAL SCORE: 78/100 → PURSUE
```

### Gold Standard Learning (Architect)
AI adapts winning proposal style:
```
PAST PERFORMANCE EXAMPLE:
"""
[Winning VA proposal excerpt]
Our approach leverages a phased migration...
"""

Write new section mimicking this structure and tone.
```

### Multi-Pass Review (Editor)
Systematic 3-pass checking:
```
Pass 1: Requirements ✓ (12/12 addressed)
Pass 2: FAR Compliance ✓ (no violations)
Pass 3: Quality ⚠ (2 minor grammar issues)

Overall: 94/100 compliance score
```

---

## 💰 Cost Estimation

Based on typical usage:

### Per Opportunity Evaluation
- **Scout** (1K tokens): ~$0.001
- **Architect** (4K tokens): ~$0.015
- **Editor** (2K tokens): ~$0.005

### Monthly Estimate (100 opportunities)
- Scout: $0.10
- Architect (10 proposals): $1.50
- Editor (10 proposals): $0.50

**Total: ~$2.10/month** (excluding Navigator voice usage)

With caching: **~$1.00/month** (50% reduction)

---

## 📈 Success Metrics to Track

```typescript
// Example analytics schema
interface MetricsTracker {
  // Scout Performance
  scoutPrecision: number;  // Good opps / Total recommended
  scoutRecall: number;     // Good opps found / Total good opps
  
  // Architect Quality
  complianceRate: number;  // Sections passing review / Total
  avgEditCycles: number;   // Revisions per section
  
  // Editor Accuracy
  issueDetectionRate: number;  // Issues found / Total issues
  falsePositiveRate: number;   // False alarms / Total alerts
  
  // Navigator Engagement
  actionabilityRate: number;   // Responses with next step
  avgResponseLength: number;   // Words per response
  
  // Dashboard Impact
  insightClickRate: number;    // Clicks / Insights shown
  insightAccuracy: number;     // Correct predictions
}
```

---

## 🆘 Troubleshooting

### "Model not found" error
```typescript
// Try gemini-pro instead
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Compliance check too strict
```typescript
// Adjust threshold in editor prompt
complianceScore >= 85 // instead of 95
```

### Navigator responses too long
```typescript
// Reduce maxOutputTokens
maxOutputTokens: 150 // instead of 200
```

### Dashboard insights too generic
```typescript
// Increase confidence threshold
insights.filter(i => i.confidence >= 80) // instead of 70
```

---

## 📖 Documentation Index

1. **[Context Engineering Guide](./CONTEXT_ENGINEERING_GUIDE.md)** - Deep dive into prompt strategy
2. **[Phase 2 Complete](./PHASE2_COMPLETE.md)** - Full prompt optimization summary
3. **[Architecture](./architecture.md)** - System design overview
4. **[API Documentation](./api.md)** - Endpoint reference

---

## 🎓 Learning Resources

### Prompt Engineering
- Chain-of-Thought: [Google AI Blog](https://ai.googleblog.com)
- Structured Outputs: Gemini JSON mode docs
- One-Shot Learning: Fine-tuning best practices

### Federal Contracting
- FAR Part 15: [acquisition.gov](https://www.acquisition.gov/far/part-15)
- SAM.gov API: [open.gsa.gov/api/opportunities-api](https://open.gsa.gov/api/opportunities-api/)

---

**Last Updated**: 2025-12-28  
**System Version**: 2.0 (Post-Optimization)  
**Status**: ✅ Production Ready
