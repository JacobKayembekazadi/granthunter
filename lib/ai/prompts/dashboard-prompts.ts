/**
 * Dashboard AI - Insights Generation Prompts
 * 
 * Purpose: Generate actionable strategic insights from dashboard metrics
 * Technique: Pattern recognition + predictive analytics
 * Model: Gemini 2.0 Flash (fast, good at structured output)
 */

import { DashboardContext } from '@/types/dashboard';

export interface DashboardInsight {
  type: 'opportunity' | 'deadline' | 'proposal' | 'agent' | 'risk' | 'strategic';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  metrics?: {
    current: number;
    target?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export const dashboardPrompts = {
  /**
   * Generate strategic insights from dashboard with ML-style pattern recognition.
   * This is a high-stakes prompt - insights drive user action.
   */
  generateInsights: (context: DashboardContext) => `
You are a strategic AI analyzing a government contractor's operational dashboard.
Your mission: Identify 3-5 HIGH-VALUE insights that drive immediate action.

CURRENT STATE:
┌─ USER ──────────────────────┐
│ Name: ${context.user.name}
│ Organization: ${context.user.org}
└─────────────────────────────┘

┌─ OPPORTUNITIES ─────────────┐
│ Total: ${context.opportunities.total}
│ Pipeline Status:
│   • New/Unreviewed: ${context.opportunities.byStatus.new || 0}
│   • Analyzing: ${context.opportunities.byStatus.analyzing || 0}
│   • Drafting Proposals: ${context.opportunities.byStatus.drafting || 0}
│   • Submitted: ${context.opportunities.byStatus.submitted || 0}
│
│ Quality Indicators:
│   • High Match (≥80): ${context.opportunities.highMatch.length} opportunities
│   • Urgent (7 days): ${context.opportunities.upcomingDeadlines.length} deadlines
│
│ Agency Distribution:
${Object.entries(context.opportunities.byAgency)
      .map(([agency, count]) => `│   • ${agency}: ${count}`)
      .join('\n')}
└─────────────────────────────┘

┌─ PROPOSAL METRICS ──────────┐
│ Active: ${context.proposals.active}
│ Completed: ${context.proposals.completed}
│ Win Rate: ${context.proposals.metrics.completionRate.toFixed(1)}%
└─────────────────────────────┘

┌─ AUTOMATION ────────────────┐
│ Active Agents: ${context.agents.active}
│ Recent Scans: ${context.agents.recentRuns.length}
└─────────────────────────────┘

┌─ HISTORICAL INTELLIGENCE ───┐
│ Top Agencies: ${context.pastPerformance.patterns.topAgencies.join(', ')}
│ Historical Win Rate: ${context.pastPerformance.patterns.winRate.toFixed(1)}%
│
│ Recent Wins:
${context.pastPerformance.relevant
      .slice(0, 3)
      .map((pp, i) => `│   ${i + 1}. ${pp.title} (${pp.agency})`)
      .join('\n')}
└─────────────────────────────┘

INSIGHT GENERATION RULES:

1. PRIORITIZATION FRAMEWORK:
   HIGH priority:
   - Deadlines approaching (<7 days) with high match scores
   - Bottlenecks blocking multiple proposals
   - High-value opportunities at risk
   - Win rate anomalies or trends
   
   MEDIUM priority:
   - Optimization opportunities (efficiency gains)
   - Pattern-based recommendations
   - Agent tuning suggestions
   
   LOW priority:
   - General improvements
   - Nice-to-have optimizations

2. INSIGHT QUALITY CRITERIA:
   ✓ ACTIONABLE: User can act on it immediately
   ✓ SPECIFIC: No vague "you should improve X" - tell them HOW
   ✓ DATA-DRIVEN: Based on metrics, not assumptions
   ✓ VALUABLE: Moves the needle (revenue, win rate, efficiency)
   ✗ AVOID: Generic advice, obvious observations

3. INSIGHT TYPES TO CONSIDER:

   TYPE: "opportunity"
   - High-match opportunities being ignored
   - Opportunities in sweet-spot agencies
   - Cross-opportunity patterns (bundling potential)
   
   TYPE: "deadline"
   - Urgent submissions with high win probability
   - Timeline conflicts across proposals
   - Resource allocation warnings
   
   TYPE: "proposal"
   - Stuck proposals (drafting too long)
   - Quality concerns (sections pending review)
   - Resource gaps
   
   TYPE: "agent"
   - Agent performance issues (low hit rate)
   - Missing opportunities (gaps in coverage)
   - Optimization opportunities
   
   TYPE: "risk"
   - Over-commitment warnings
   - Win rate decline in specific agency
   - Budget/resource constraints
   
   TYPE: "strategic"
   - Agency focus recommendations
   - Teaming opportunities
   - Market positioning insights

4. CONFIDENCE SCORING:
   90-100: Hard data, clear causation
   70-89: Strong pattern, likely correlation
   50-69: Hypothesis based on limited data
   <50: Don't include (too speculative)

OUTPUT FORMAT:
Return ONLY valid JSON array. No markdown, no code blocks, no explanations.

[
  {
    "type": "deadline" | "opportunity" | "proposal" | "agent" | "risk" | "strategic",
    "title": "Clear, action-oriented title (max 60 chars)",
    "description": "2-3 sentences explaining WHY this matters and WHAT to do",
    "confidence": 85,
    "priority": "high" | "medium" | "low",
    "actionUrl": "/hunter?filter=highMatch" (optional, if specific page),
    "metrics": {
      "current": 15,
      "target": 20,
      "trend": "up" | "down" | "stable"
    } (optional)
  }
]

EXAMPLE GOOD INSIGHTS:

✅ {
  "type": "deadline",
  "title": "3 High-Match Opportunities Closing This Week",
  "description": "You have 3 opportunities with 85+ match scores expiring in 5 days: DoD Cyber (Nov 15), Navy IT (Nov 16), Air Force Cloud (Nov 17). All align with your past DoD performance. Recommend immediate bid/no-bid decision.",
  "confidence": 95,
  "priority": "high",
  "actionUrl": "/hunter?filter=urgent&minScore=80",
  "metrics": { "current": 3, "trend": "stable" }
}

✅ {
  "type": "proposal",
  "title": "Proposal Pipeline Bottleneck at Review Stage",
  "description": "5 proposals stuck in drafting for 7+ days, double your normal cycle time. Common blocker: technical approach sections pending SME review. Recommend dedicated reviewer or temp resource.",
  "confidence": 88,
  "priority": "high",
  "actionUrl": "/factory"
}

❌ BAD (too vague):
{
  "title": "Improve Your Win Rate",
  "description": "You should focus on better opportunities to improve your success rate."
}

GENERATE 3-5 INSIGHTS NOW:
Return ONLY the JSON array. Nothing else.
`,

  /**
   * Generate quick summary for executive dashboard widget.
   */
  generateExecutiveSummary: (context: DashboardContext): string => `
Generate a 2-sentence executive summary of current state.

Metrics:
- ${context.opportunities.total} opportunities (${context.opportunities.highMatch.length} high-match)
- ${context.proposals.active} active proposals
- ${context.opportunities.upcomingDeadlines.length} deadlines this week
- ${context.proposals.metrics.completionRate.toFixed(0)}% win rate

Format: "Current state. Key action item."

Example: "Pipeline healthy with 24 opportunities including 8 high-match targets. Critical: 3 proposals due this week need immediate review."
`,

  /**
   * Trend analysis - comparing this period to last period.
   */
  analyzeTrends: (
    currentMetrics: { opportunities: number; proposals: number; winRate: number },
    previousMetrics: { opportunities: number; proposals: number; winRate: number }
  ) => `
Compare these periods and identify significant trends:

CURRENT:
- Opportunities: ${currentMetrics.opportunities}
- Active Proposals: ${currentMetrics.proposals}
- Win Rate: ${currentMetrics.winRate}%

PREVIOUS:
- Opportunities: ${previousMetrics.opportunities}
- Active Proposals: ${previousMetrics.proposals}
- Win Rate: ${previousMetrics.winRate}%

Calculate:
1. % change in each metric
2. Statistical significance (is change meaningful?)
3. Likely causes
4. Recommended action

Output JSON:
{
  "trends": [
    {
      "metric": "opportunities",
      "change": "+15%",
      "direction": "up",
      "significant": true,
      "interpretation": "explanation",
      "recommendation": "action"
    }
  ],
  "overallHealth": "improving" | "declining" | "stable"
}
`,

  /**
   * Anomaly detection - flag unusual patterns.
   */
  detectAnomalies: (recentActivity: string) => `
Analyze this activity log for anomalies or unusual patterns:

${recentActivity}

Look for:
- Sudden spikes or drops in activity
- Unusual timing patterns
- Missing expected events
- Repeated failures or errors
- Deviation from historical norms

Return JSON array of anomalies:
[
  {
    "type": "spike" | "drop" | "pattern" | "missing" | "error",
    "description": "what's unusual",
    "severity": "high" | "medium" | "low",
    "possibleCause": "hypothesis",
    "recommendedAction": "what to do"
  }
]

Only flag if confidence > 70%. Be concise.
`,
};
