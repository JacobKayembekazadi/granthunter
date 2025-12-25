# GrantHunter - Project Context

## Mission

GrantHunter is an autonomous AI system designed to replace Government Contracting Proposal Teams. It automates the entire lifecycle: from scouting leads on SAM.gov to qualifying them via voice (Gemini Live) and generating 50+ page compliant technical proposals.

## Architecture Philosophy

GrantHunter is built as a **Durable Orchestration System** rather than a simple chatbot. It uses a "Swarm of Specialists" coordinated via a central nervous system.

### The Nervous System (Orchestration)
- **Framework:** Next.js 15 (App Router) + Tailwind CSS
- **Workflow Engine:** Inngest - Handles durable, long-running AI workflows (e.g., generating a 100-page proposal section-by-section without timing out)
- **Database/Persistence:** Supabase - Handles Auth, Postgres storage for leads, and Vector storage (pgvector) for "Past Performance" RAG
- **Cache/Rate Limiting:** Upstash Redis

### The Intelligence Swarm (Models)
- **The Navigator (Gemini 2.5 Flash Native Audio):** Real-time voice interface for the "Live API." Used for qualifying leads through conversational intelligence.
- **The Scout (DeepSeek-R1 / Gemini 1.5 Flash):** High-speed lead parsing. Scans thousands of RFP documents to find "matches."
- **The Architect (Gemini 1.5 Pro):** Heavy-duty reasoning. Used for compliance matrix generation and technical writing.
- **The Editor (Claude 3.5 Sonnet):** Final polish, tone adjustment, and FAR (Federal Acquisition Regulation) compliance checking.

## Design Language

- **Aesthetic:** "Spatial Computing" / Premium Dark Dashboard
- **Palette:** Deep Space (#050505), Surface Grey (#1A1A1A), Volt Green (#B4FF00) for primary actions
- **Geometry:** Ultra-high border-radius (2.5rem), soft-depth shadows, and "Glassmorphism" blur effects
- **Vibe:** It should feel like a sovereign AI operating system, not a website

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI (for component primitives)
- Framer Motion (animations)

### Backend
- Next.js API Routes
- Inngest (workflow orchestration)
- Supabase (database, auth, storage)
- Upstash Redis (caching, rate limiting)

### AI Models
- Gemini 2.5 Flash Native Audio (Navigator)
- DeepSeek-R1 / Gemini 1.5 Flash (Scout)
- Gemini 1.5 Pro (Architect)
- Claude 3.5 Sonnet (Editor)

### Database
- PostgreSQL (via Supabase)
- Drizzle ORM
- pgvector (for RAG)

## Key Design Patterns

1. **Durable Workflows:** All long-running tasks use Inngest to prevent timeouts
2. **Rate Limiting:** Redis-based rate limiting for all AI API calls
3. **Caching:** Aggressive caching of AI responses to reduce costs
4. **RAG System:** Past performance documents are embedded and retrieved via vector search
5. **Real-time Updates:** Supabase Realtime for live proposal progress

## Development Guidelines

- **Stay Spatial:** Always adhere to the high-radius, high-contrast visual style
- **Durable Logic:** Prefer Inngest workflows over simple API routes for long-running tasks
- **Agentic Tone:** UI text should be tactical, professional, and slightly futuristic
- **Safety & Compliance:** The system must prioritize FAR/DFARS compliance in all generated text

