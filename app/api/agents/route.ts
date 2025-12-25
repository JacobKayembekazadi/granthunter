import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { searchAgents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/inngest/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization (simplified - you'd get this from user metadata)
    const agents = await db
      .select()
      .from(searchAgents)
      // .where(eq(searchAgents.organizationId, userOrganizationId))
      .orderBy(searchAgents.createdAt);

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, target, status = 'Active' } = body;

    if (!name || !target) {
      return NextResponse.json({ error: 'Name and target are required' }, { status: 400 });
    }

    // Create agent
    const [agent] = await db
      .insert(searchAgents)
      .values({
        name,
        target,
        status,
        // organizationId: userOrganizationId,
      })
      .returning();

    // Trigger initial scan
    await inngest.send({
      name: 'agent/scan',
      data: { agentId: agent.id },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

