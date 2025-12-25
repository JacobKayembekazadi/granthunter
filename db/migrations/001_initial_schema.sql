-- GrantHunter Database Schema Migration
-- Run this in Supabase SQL Editor

-- Enable pgvector extension (REQUIRED for RAG embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users table (extends Supabase Auth)
-- Note: This syncs with auth.users via triggers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Opportunities (from SAM.gov)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sam_gov_id TEXT UNIQUE,
  title TEXT NOT NULL,
  agency TEXT NOT NULL,
  value TEXT,
  due_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  match_score INTEGER DEFAULT 0,
  naics_code TEXT,
  description TEXT,
  rfp_document_url TEXT,
  rfp_content TEXT,
  metadata JSONB,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Search Agents
CREATE TABLE IF NOT EXISTS search_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  hits INTEGER DEFAULT 0,
  last_run TIMESTAMP,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Agent Runs (execution logs)
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES search_agents(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) NOT NULL,
  opportunities_found INTEGER DEFAULT 0,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  error TEXT,
  metadata JSONB
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  stage TEXT,
  priority VARCHAR(10) DEFAULT 'Normal',
  opportunity_id UUID REFERENCES opportunities(id),
  organization_id UUID REFERENCES organizations(id),
  configuration JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Proposal Sections
CREATE TABLE IF NOT EXISTS proposal_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  section_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Past Performance (for RAG)
-- Using vector type for embeddings (1536 dimensions for OpenAI)
CREATE TABLE IF NOT EXISTS past_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  agency TEXT,
  value TEXT,
  description TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Artifacts (generated documents)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'ready',
  opportunity_id UUID REFERENCES opportunities(id),
  proposal_id UUID REFERENCES proposals(id),
  storage_url TEXT,
  size INTEGER,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Job Logs (for proposal generation tracking)
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_organization ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_due_date ON opportunities(due_date);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_organization ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposal_sections_proposal ON proposal_sections(proposal_id);
CREATE INDEX IF NOT EXISTS idx_past_performance_organization ON past_performance(organization_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_proposal ON artifacts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_opportunity ON artifacts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_proposal ON job_logs(proposal_id);

-- Create vector similarity search index for RAG
CREATE INDEX IF NOT EXISTS idx_past_performance_embedding ON past_performance 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their organization's data
-- Organizations
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Opportunities
CREATE POLICY "Users can view their organization's opportunities" ON opportunities
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert opportunities for their organization" ON opportunities
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their organization's opportunities" ON opportunities
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Search Agents
CREATE POLICY "Users can manage their organization's agents" ON search_agents
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Agent Runs
CREATE POLICY "Users can view their organization's agent runs" ON agent_runs
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM search_agents 
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Proposals
CREATE POLICY "Users can manage their organization's proposals" ON proposals
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Proposal Sections
CREATE POLICY "Users can manage sections for their organization's proposals" ON proposal_sections
  FOR ALL USING (
    proposal_id IN (
      SELECT id FROM proposals 
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Past Performance
CREATE POLICY "Users can manage their organization's past performance" ON past_performance
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Artifacts
CREATE POLICY "Users can manage their organization's artifacts" ON artifacts
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Job Logs
CREATE POLICY "Users can view logs for their organization's proposals" ON job_logs
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM proposals 
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_agents_updated_at BEFORE UPDATE ON search_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_sections_updated_at BEFORE UPDATE ON proposal_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_past_performance_updated_at BEFORE UPDATE ON past_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



