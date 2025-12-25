import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { pastPerformance } from '@/db/schema';
import { generateEmbedding } from '@/lib/rag/embeddings';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select()
      .from(pastPerformance)
      .orderBy(pastPerformance.createdAt);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const agency = formData.get('agency') as string;
    const value = formData.get('value') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Store in database
    const [item] = await db
      .insert(pastPerformance)
      .values({
        title,
        agency,
        value,
        description,
        content,
        embedding: JSON.stringify(embedding),
        metadata: file ? { fileName: file.name, fileSize: file.size } : {},
      })
      .returning();

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error adding to knowledge base:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

