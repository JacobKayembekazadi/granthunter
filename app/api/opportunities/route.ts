import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { opportunities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(opportunities);

    if (status) {
      query = query.where(eq(opportunities.status, status)) as any;
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({ opportunities: results });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
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
    const { title, agency, value, dueDate, naicsCode, description, matchScore = 85 } = body;

    if (!title || !agency) {
      return NextResponse.json({ error: 'Title and agency are required' }, { status: 400 });
    }

    const [opportunity] = await db
      .insert(opportunities)
      .values({
        title,
        agency,
        value,
        dueDate: dueDate ? new Date(dueDate) : null,
        naicsCode,
        description,
        matchScore,
        status: 'new',
      })
      .returning();

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

