# GrantHunter - Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js App Router + React + Tailwind CSS + Shadcn UI      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│  Next.js API Routes + Inngest Workflows + Supabase Client   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │   Inngest    │   │    Redis     │
│  (Database)  │   │ (Workflows)  │   │   (Cache)    │
└──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI Models Layer                         │
│  Gemini | Claude | DeepSeek (via orchestrator)                │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  SAM.gov API | Supabase Storage                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Proposal Generation Flow

1. User creates proposal from opportunity
2. Frontend calls `/api/proposals` (POST)
3. API creates proposal record in database
4. API triggers Inngest workflow `proposal/generate`
5. Inngest workflow:
   - Parses RFP requirements
   - Retrieves past performance (RAG)
   - Generates sections sequentially
   - Reviews for compliance
   - Compiles document
   - Stores in Supabase Storage
6. Frontend subscribes to real-time updates
7. User receives notification when complete

### Search Agent Flow

1. User creates search agent
2. Frontend calls `/api/agents` (POST)
3. API creates agent record
4. API triggers Inngest workflow `agent/scan`
5. Inngest workflow:
   - Calls SAM.gov API
   - Parses opportunities
   - Scores matches
   - Stores in database
6. Frontend displays new opportunities in real-time

## Database Schema

### Core Tables

- **users** - User accounts (extends Supabase Auth)
- **organizations** - Company/org data
- **opportunities** - SAM.gov opportunities
- **search_agents** - Autonomous search agents
- **proposals** - Proposal projects
- **proposal_sections** - Individual proposal sections
- **past_performance** - RAG knowledge base (with vector embeddings)
- **artifacts** - Generated documents
- **agent_runs** - Search agent execution logs
- **job_logs** - Proposal generation logs

### Relationships

- users → organizations (many-to-one)
- opportunities → organizations (many-to-one)
- proposals → opportunities (many-to-one)
- proposals → proposal_sections (one-to-many)
- proposals → job_logs (one-to-many)
- search_agents → agent_runs (one-to-many)

## API Documentation

See `api.md` for detailed API endpoint documentation.

## Inngest Workflows

### `agent/scan`
- **Trigger:** Manual or scheduled
- **Duration:** 1-5 minutes
- **Steps:**
  1. Get agent details
  2. Create run record
  3. Scan SAM.gov
  4. Parse opportunities
  5. Store results
  6. Update agent stats

### `proposal/generate`
- **Trigger:** User creates proposal
- **Duration:** 10-30 minutes
- **Steps:**
  1. Parse RFP requirements
  2. Retrieve past performance
  3. Generate sections sequentially
  4. Review for compliance
  5. Compile document
  6. Store in storage

## Security Considerations

1. **API Keys:** Stored server-side only, never exposed to client
2. **Authentication:** Supabase Auth with JWT tokens
3. **Rate Limiting:** Redis-based rate limiting on all AI calls
4. **Data Isolation:** Row-level security via Supabase RLS
5. **Compliance:** All generated content reviewed for FAR/DFARS compliance

