# GrantHunter Context Engineering & Implementation Guide

## 📋 Executive Summary

I have successfully reviewed all documentation and verified your **GrantHunter** system's core APIs. Here's your comprehensive roadmap for Context Engineering and deployment.

---

## ✅ Phase 1: System Verification - COMPLETE

### API Connection Status
| Service | Status | Notes |
|---------|--------|-------|
| **Supabase** | ✅ Connected | Database ready, 15 env vars loaded |
| **SAM.gov** | ✅ Connected | 15,488 opportunities available |
| **Gemini AI** | ✅ Connected | Using `gemini-2.0-flash-exp` model |

### What Works
- ✅ `.env.local` created with your provided keys
- ✅ Dependencies installed (708 packages)
- ✅ Verification script created and tested

### Missing Keys (Non-Critical for Now)
- ⚠️ **Inngest** - Required for long-running workflows
- ⚠️ **Upstash Redis** - Required for rate limiting
- ⚠️ **Anthropic (Claude)** - Required for "Editor" agent
- ⚠️ **DeepSeek** - Optional, for "Scout" agent
- ⚠️ **OpenAI** - Required for embeddings (RAG system)

---

## 🧠 Phase 2: Context Engineering Strategy

### Overview
Context Engineering is the "Brain" of GrantHunter. It determines how each AI specialist (Scout, Architect, Navigator, Editor) processes information.

### A. The Three-Layer Context Architecture

1. **Global Context** (Identity Layer)
   - Who we are: Company profile, capabilities, compliance stance
   - Constraints: FAR/DFARS guidelines
   - Style Guide: "Spatial Computing" aesthetic

2. **Task Context** (Mission Layer)
   - Current RFP details
   - Parsed requirements from Sections C (SOW) and L (Instructions)
   - Compliance matrix

3. **RAG Context** (Knowledge Layer)
   - Retrieved past performance examples
   - Corporate knowledge base
   - Similar proposal sections

### B. Agent-Specific Prompt Engineering

#### 1. The Scout (Lead Qualifier)
**Current Location**: `lib/ai/prompts/scout-prompts.ts`

**Goal**: Filter 100 SAM.gov leads → 5 high-probability matches

**Optimization Strategy**:
- **Input**: Raw SAM.gov JSON + NAICS Codes + Keyword Strategy
- **Technique**: Chain-of-Thought (CoT) reasoning
- **Prompt Template**:
```typescript
You are a federal contracting analyst evaluating opportunities.
For each RFP, calculate:
1. Relevance Score (0-100): Match to our NAICS codes and capabilities
2. Win Probability: Based on set-aside type, incumbent presence, contract value
3. Effort Estimateconfigurated: Hours required for proposal

CRITICAL: If ANY factor is below threshold, REJECT immediately.
Output format: JSON with scores and reasoning.
```

#### 2. The Architect (Proposal Drafter)
**Current Location**: `lib/ai/prompts/architect-prompts.ts`

**Goal**: Generate FAR-compliant technical volumes

**Optimization Strategy**:
- **Input**: RFP Sections C & L + RAG Context
- **Technique**: One-Shot Prompting with "Gold Standard" examples
- **Example Instruction**:
```
Generate Section 3.1 (Technical Approach) following this structure:
[Insert past performance example from RAG]

Ensure:
- Every RFP requirement from Section L is addressed
- Match tone and structure of the example
- Include specific technical details for [opportunity topic]
```

#### 3. The Navigator (Voice Interface)
**Current Location**: `lib/ai/prompts/navigator-prompts.ts`

**Goal**: Real-time tactical analysis via voice

**Optimization Strategy**:
- **Input**: Streaming Audio + Live Opportunity State
- **Technique**: Low-latency instructions optimized for spoken output
- **System Prompt**:
```
You are a tactical operations officer for federal contracting.
Be:
- Concise (max 2 sentences per response)
- Action-oriented ("Recommend X because Y")
- Spoken-word optimized (no bullet points)

Current mission: [opportunity name]
Budget: [value]
Deadline: [date]
```

#### 4. The Editor (Compliance Reviewer)
**Current Location**: `lib/ai/prompts/editor-prompts.ts`

**Goal**: FAR/DFARS compliance checking

**Optimization Strategy**:
- **Model**: Claude 3.5 Sonnet (when key is added)
- **Technique**: Multi-pass review (tone → compliance → formatting)
- **Checklist**:
```
Pass 1: Tone & Clarity
Pass 2: FAR Compliance (cite specific clauses)
Pass 3: Formatting & Consistency
```

### C. RAG Pipeline Enhancement

**Current Implementation**: `lib/rag/`
- ✅ Basic vector search with cosine similarity
- ✅ Context builder with relevance scoring

**Recommended Upgrades**:

1. **Hybrid Search** (Semantic + Keyword)
   ```typescript
   // Combine vector search with keyword matching
   // Example: For SBIR/STTR, ensure exact acronym match
   const results = await retrievePastPerformance(query, {
     semantic: true,
     keywords: ['SBIR', 'Phase II', 'DoD'],
     minScore: 0.7
   });
   ```

2. **Re-ranking**
   - After retrieval, re-rank using cross-encoder
   - Ensures most relevant examples surface first

3. **Context Compression**
   - Summarize long examples to fit in context window
   - Use Gemini 2.0 Flash for fast summarization

---

## 🚀 Phase 3: Implementation Checklist

### Immediate Next Steps

1. **Test Database Schema**
   ```bash
   npm run db:push  # Deploy Drizzle schema to Supabase
   ```

2. **Prompt Audit**
   - Review `lib/ai/prompts/*.ts`
   - Test Scout agent with live SAM.gov data
   - Measure: How many false positives in top 10 results?

3. **RAG Test**
   Create test script:
   ```typescript
   // scripts/test-rag.ts
   import { buildRAGContext } from '../lib/rag/context-builder';
   
   const query = "drone swarm technical proposal";
   const context = await buildRAGContext(query);
   console.log(context);
   ```

4. **End-to-End Workflow** (Requires Inngest setup)
   - Create search agent via API
   - Trigger SAM.gov scan
   - Generate a mini proposal (1 section only)

### Optional: Get Missing API Keys

**Inngest** (Free tier available)
1. Visit https://www.inngest.com/
2. Create account → Get `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
3. Add to `.env.local`

**Upstash Redis** (Free 10,000 commands/day)
1. Visit https://upstash.com/
2. Create Redis database → Copy REST URL and Token
3. Add to `.env.local`

**Anthropic Claude** ($5 free credit)
1. Visit https://console.anthropic.com/
2. Get API key
3. Add as `ANTHROPIC_API_KEY`

---

## 📊 Context Engineering Best Practices

### 1. Prompt Versioning
- Store prompts in database with version numbers
- A/B test different templates
- Track: Proposal win rate by prompt version

### 2. Few-Shot Examples
- Maintain library of "Gold Standard" proposals
- Tag by: Agency, Contract Type, Technical Domain
- Dynamically select best example based on current RFP

### 3. Compliance Validation
- Create compliance checklist from FAR clauses
- Auto-verify each proposal section
- Flag: Missing requirements, prohibited content

### 4. Hallucination Prevention
- Use structured outputs (JSON mode)
- Require citations for technical claims
- Cross-check against RAG knowledge base

---

## 🎯 Success Metrics

**Scout Performance**:
- Precision: % of recommended opportunities that are actually relevant
- Recall: % of good opportunities not missed
- Target: 90% precision, 80% recall

**Architect Quality**:
- Compliance Score: All RFP requirements addressed?
- Similarity to Gold Standard: Cosine similarity > 0.8
- Human Review Time: < 30 min per section (goal)

**System Efficiency**:
- Time to Generate: Full proposal in < 30 minutes
- Cost per Proposal: Target < $10 (with caching)

---

## 🔗 Quick Reference Links

- **Implementation Plan**: [implementation_plan.md](file:///C:/Users/jacob/.gemini/antigravity/brain/d8592483-ef19-4df4-885b-3108408aa97f/implementation_plan.md)
- **Verification Script**: `scripts/verify-apis.ts`
- **Prompts Directory**: `lib/ai/prompts/`
- **RAG System**: `lib/rag/`
- **Architecture Docs**: `docs/architecture.md`

---

## 💡 Pro Tips

1. **Start Small**: Test with 1 RFP section before generating full proposals
2. **Monitor Costs**: Set up billing alerts on Gemini API
3. **Version Control Prompts**: Treat them like code
4. **Use Caching Aggressively**: Same RFP analysis shouldn't cost 2x

---

**Status**: ✅ Ready for Phase 2 (Prompt Engineering)

**Next Action**: Review and refine prompts in `lib/ai/prompts/`, then run live test with SAM.gov data
