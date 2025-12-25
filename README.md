# GrantHunter - The GovCon Factory

Autonomous AI System for Government Contracting Proposal Teams

## Overview

GrantHunter automates the entire government contracting lifecycle: from scouting leads on SAM.gov to qualifying them via voice (Gemini Live) and generating 50+ page compliant technical proposals.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (Postgres + pgvector)
- **ORM:** Drizzle ORM
- **Workflows:** Inngest
- **Cache:** Upstash Redis
- **AI Models:** Gemini, Claude, DeepSeek
- **UI:** Tailwind CSS + Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Inngest account
- Upstash Redis account
- AI API keys (Gemini, Anthropic, DeepSeek)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_connection_string

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# AI APIs
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key  # For embeddings

# SAM.gov
SAM_GOV_API_KEY=your_sam_gov_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up database:
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data (optional)
```

4. Run development server:
```bash
npm run dev
```

## Project Structure

```
grant-hunter/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── ai/               # AI clients and prompts
│   ├── sam-gov/          # SAM.gov integration
│   ├── proposals/        # Proposal generation
│   ├── rag/              # RAG system
│   └── supabase/         # Supabase clients
├── db/                    # Database schema and migrations
├── inngest/              # Inngest workflows
├── hooks/                # React hooks
├── types/                # TypeScript types
└── docs/                 # Documentation
```

## Documentation

- [Context & Architecture](docs/context.md)
- [Pricing Model](docs/pricing.md)
- [Updates & Changelog](docs/updates.md)
- [System Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)

## Features

- **Autonomous Scouting:** AI agents monitor SAM.gov for matching opportunities
- **Voice Intelligence:** Real-time voice interface via Gemini Live
- **Proposal Generation:** Automated 50+ page proposal creation
- **Compliance Checking:** FAR/DFARS compliance validation
- **RAG System:** Past performance retrieval for context
- **Real-time Updates:** Live progress tracking via Supabase Realtime

## License

Private - All Rights Reserved
