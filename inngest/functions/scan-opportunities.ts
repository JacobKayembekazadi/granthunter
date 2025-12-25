import { inngest } from '../client';
import { db } from '@/db';
import { opportunities, searchAgents, agentRuns } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const scanOpportunities = inngest.createFunction(
  { id: 'scan-opportunities' },
  { event: 'agent/scan' },
  async ({ event, step }) => {
    const { agentId } = event.data;

    // Get agent details
    const agent = await step.run('get-agent', async () => {
      const [result] = await db
        .select()
        .from(searchAgents)
        .where(eq(searchAgents.id, agentId))
        .limit(1);
      return result;
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Create agent run record
    const run = await step.run('create-run', async () => {
      const [result] = await db
        .insert(agentRuns)
        .values({
          agentId,
          status: 'running',
          startedAt: new Date(),
        })
        .returning();
      return result;
    });

    // Scan SAM.gov for opportunities
    const foundOpportunities = await step.run('scan-sam-gov', async () => {
      const { samGovClient } = await import('@/lib/sam-gov/client');
      const { parseOpportunity } = await import('@/lib/sam-gov/parser');
      
      // Parse agent target (NAICS codes, keywords)
      const targetParts = agent.target.split(',').map(t => t.trim());
      const naicsCodes = targetParts.filter(p => /^\d+$/.test(p));
      const keywords = targetParts.filter(p => !/^\d+$/.test(p));

      // Search SAM.gov
      const searchResults = await samGovClient.searchOpportunities({
        naicsCodes: naicsCodes.length > 0 ? naicsCodes : undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        limit: 50,
      });

      // Parse and score opportunities
      const parsed = await Promise.all(
        searchResults.opportunities.map(opp => parseOpportunity(opp))
      );

      // Filter by match score (>= 70)
      const matches = parsed.filter(p => p.matchScore >= 70);

      // Store opportunities in database
      if (matches.length > 0) {
        const { opportunities } = await import('@/db/schema');
        await db.insert(opportunities).values(
          matches.map(m => ({
            samGovId: m.opportunity.noticeId,
            title: m.opportunity.title,
            agency: m.opportunity.agency,
            value: m.opportunity.value,
            dueDate: m.opportunity.responseDate ? new Date(m.opportunity.responseDate) : null,
            status: 'new',
            matchScore: m.matchScore,
            naicsCode: m.opportunity.naicsCode,
            description: m.opportunity.description,
            rfpDocumentUrl: m.opportunity.links?.opportunityUrl,
            metadata: {
              keyRequirements: m.keyRequirements,
              technicalFocus: m.technicalFocus,
              complianceNotes: m.complianceNotes,
              riskLevel: m.riskLevel,
            },
            // organizationId: agent.organizationId,
          }))
        ).onConflictDoNothing();
      }

      return matches;
    });

    // Update agent run
    await step.run('update-run', async () => {
      await db
        .update(agentRuns)
        .set({
          status: 'completed',
          opportunitiesFound: foundOpportunities.length,
          completedAt: new Date(),
        })
        .where(eq(agentRuns.id, run.id));
    });

    // Update agent stats
    await step.run('update-agent', async () => {
      await db
        .update(searchAgents)
        .set({
          hits: (agent.hits || 0) + foundOpportunities.length,
          lastRun: new Date(),
        })
        .where(eq(searchAgents.id, agentId));
    });

    return { agentId, opportunitiesFound: foundOpportunities.length };
  }
);

