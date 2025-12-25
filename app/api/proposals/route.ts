import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { proposals } from '@/db/schema';
import { inngest } from '@/inngest/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposalsList = await db
      .select()
      .from(proposals)
      .orderBy(proposals.createdAt);

    return NextResponse.json({ proposals: proposalsList });
  } catch (error) {
    console.error('Error fetching proposals:', error);
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
    const { name, type, opportunityId, priority = 'Normal', configuration } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Create proposal
    const [proposal] = await db
      .insert(proposals)
      .values({
        name,
        type,
        opportunityId,
        priority,
        status: 'queued',
        progress: 0,
        configuration: configuration || {
          model: 'Gemini-1.5-Pro',
          creativity: 'Standard',
          depth: 'Standard',
        },
      })
      .returning();

    // Trigger generation workflow
    await inngest.send({
      name: 'proposal/generate',
      data: { proposalId: proposal.id },
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

