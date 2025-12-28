import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildDashboardInsightsContext } from '@/lib/ai/context/dashboard-insights-context';
import { dashboardPrompts } from '@/lib/ai/prompts/dashboard-prompts';
import { generateWithModel } from '@/lib/ai/orchestrator';
import { getCached, setCached } from '@/lib/redis';
import { DashboardInsight } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache (cache for 1 hour) - gracefully handle missing Redis
    const cacheKey = `dashboard_insights:${user.id}`;
    let cached: DashboardInsight[] | null = null;
    try {
      cached = await getCached<DashboardInsight[]>(cacheKey);
      if (cached) {
        return NextResponse.json({ insights: cached });
      }
    } catch (cacheError) {
      console.warn('Redis not available, skipping cache:', cacheError);
      // Continue without cache
    }

    // Build context
    const context = await buildDashboardInsightsContext(user.id);

    // Generate insights using AI with fallback
    let insights: DashboardInsight[];

    try {
      // Generate prompt
      const prompt = dashboardPrompts.generateInsights(context);

      // Generate insights using AI (using architect role for reasoning)
      const aiResponse = await generateWithModel({
        role: 'architect',
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse JSON response
      try {
        // Extract JSON from response (remove markdown code blocks if present)
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
        const parsed = JSON.parse(jsonString);

        insights = parsed.map((insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          type: insight.type || 'opportunity',
          title: insight.title || 'Untitled Insight',
          description: insight.description || '',
          confidence: typeof insight.confidence === 'number' ? insight.confidence : 75,
          actionUrl: insight.actionUrl,
          priority: insight.priority || 'medium',
        }));
      } catch (parseError) {
        console.warn('Could not parse AI response, using context-based insights:', parseError);
        throw parseError; // Let outer catch handle it
      }
    } catch (aiError) {
      console.warn('AI generation failed, using fallback insights:', aiError);

      // Generate fallback insights from context
      insights = [];

      if (context.opportunities.highMatch.length > 0) {
        insights.push({
          id: `insight-high-match`,
          type: 'opportunity',
          title: `${context.opportunities.highMatch.length} High-Match Opportunities`,
          description: `You have ${context.opportunities.highMatch.length} opportunities with match scores above 80%. These are excellent candidates for proposal development.`,
          confidence: 90,
          priority: 'high',
          actionUrl: '/hunter',
        });
      }

      if (context.opportunities.upcomingDeadlines.length > 0) {
        insights.push({
          id: `insight-deadlines`,
          type: 'deadline',
          title: `${context.opportunities.upcomingDeadlines.length} Upcoming Deadlines`,
          description: `${context.opportunities.upcomingDeadlines.length} opportunities have deadlines in the next 7 days. Review and prioritize soon.`,
          confidence: 95,
          priority: 'high',
          actionUrl: '/hunter',
        });
      }

      if (context.proposals.active > 0) {
        insights.push({
          id: `insight-active-proposals`,
          type: 'proposal',
          title: `${context.proposals.active} Proposals In Progress`,
          description: `Currently processing ${context.proposals.active} proposals. Monitor their status for completion.`,
          confidence: 85,
          priority: 'medium',
          actionUrl: '/factory',
        });
      }

      if (insights.length === 0) {
        insights.push({
          id: 'insight-getting-started',
          type: 'opportunity',
          title: 'Ready to Hunt for Opportunities',
          description: 'Get started by setting up search agents to automatically find relevant opportunities from SAM.gov.',
          confidence: 80,
          priority: 'medium',
          actionUrl: '/hunter',
        });
      }
    }

    // Cache results (optional - fails gracefully if Redis not available)
    try {
      await setCached(cacheKey, insights, 3600); // 1 hour
    } catch (cacheError) {
      console.warn('Could not cache insights:', cacheError);
    }

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Error generating dashboard insights:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

