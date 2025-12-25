# GrantHunter - Pricing Model

## Infrastructure Costs (Monthly)

### Base Infrastructure
- **Supabase Pro:** $25/month
  - Postgres database
  - Vector storage (pgvector)
  - Authentication
  - Storage (for generated documents)
  
- **Inngest:** $20/month
  - Workflow orchestration
  - Long-running job execution
  
- **Upstash Redis:** $10/month
  - Rate limiting
  - Response caching
  
- **Vercel Pro:** $20/month
  - Hosting and deployment
  
**Total Base:** ~$75/month

## AI Model Costs (Variable)

### Cost Breakdown by Use Case

#### 1. Navigator (Voice Interface)
- **Model:** Gemini 2.5 Flash Native Audio
- **Cost:** ~$0.10/hour
- **Usage:** 2 hours/day average
- **Monthly:** ~$6/month

#### 2. Scout (Lead Parsing)
- **Model:** DeepSeek-R1 (primary) or Gemini 1.5 Flash (fallback)
- **DeepSeek Cost:** ~$0.14/1M tokens
- **Gemini 1.5 Flash Cost:** ~$0.075/1M tokens
- **Usage:** 100 leads/day × 10K tokens = 1M tokens/day
- **Monthly (DeepSeek):** ~$4.20/month
- **Monthly (Gemini):** ~$2.25/month

#### 3. Architect (Proposal Writing)
- **Model:** Gemini 1.5 Pro
- **Cost:** ~$1.25/1M input, $5/1M output
- **Usage:** 50 proposals/month × 200K input + 100K output
- **Monthly:** ~$37.50/month

#### 4. Editor (Compliance Checking)
- **Model:** Claude 3.5 Sonnet
- **Cost:** ~$3/1M input, $15/1M output
- **Usage:** 50 proposals/month × 50K input + 20K output
- **Monthly:** ~$22.50/month

### Total AI Costs (Optimized)
- **Option A (Hybrid):** $6 + $4.20 + $37.50 + $22.50 = **$70.20/month**
- **Option B (Gemini-heavy):** $6 + $2.25 + $37.50 + $22.50 = **$68.25/month**

## User Tier Pricing Strategy

### Tier 1: Starter - $99/month
- 10 proposals/month
- 50 leads/day scanning
- Basic compliance checking
- 5 hours voice/month
- Email support

### Tier 2: Professional - $299/month
- 50 proposals/month
- 200 leads/day scanning
- Advanced compliance + RAG
- 20 hours voice/month
- Priority support
- Custom integrations

### Tier 3: Enterprise - Custom Pricing
- Unlimited proposals
- Unlimited scanning
- Custom integrations
- Dedicated support
- SLA guarantees
- On-premise deployment options

## Cost Optimization Tips

1. **Caching:** Aggressive caching of AI responses reduces costs by 40-60%
2. **Model Selection:** Using DeepSeek for Scout saves ~$2/month vs Gemini
3. **Batch Processing:** Processing multiple proposals together reduces overhead
4. **Rate Limiting:** Prevents accidental overuse and cost spikes
5. **Monitoring:** Track AI usage per user to identify optimization opportunities

## Revenue Projections

### Conservative (10 Starter, 5 Professional customers)
- Revenue: (10 × $99) + (5 × $299) = $2,485/month
- Costs: $75 (infra) + $70 (AI × 15 users) = $1,125/month
- **Profit Margin:** ~55%

### Growth (50 Starter, 20 Professional, 2 Enterprise)
- Revenue: (50 × $99) + (20 × $299) + (2 × $2,000) = $15,350/month
- Costs: $75 (infra) + $350 (AI × 72 users) = $425/month
- **Profit Margin:** ~97%

