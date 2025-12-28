-- GrantHunter Database Schema
-- Execute this in Supabase SQL Editor or via psql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Opportunities table (SAM.gov data)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sam_gov_id TEXT UNIQUE,
  title TEXT NOT NULL,
  agency TEXT NOT NULL,
  value TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  match_score INTEGER DEFAULT 0,
  naics_code TEXT,
  description TEXT,
  rfp_document_url TEXT,
  rfp_content TEXT,
  metadata JSONB,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Search Agents table
CREATE TABLE IF NOT EXISTS search_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  hits INTEGER DEFAULT 0,
  last_run TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Agent Runs table
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES search_agents(id) NOT NULL,
  status VARCHAR(20) NOT NULL,
  opportunities_found INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  metadata JSONB
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  stage TEXT,
  priority VARCHAR(10) DEFAULT 'Normal',
  opportunity_id UUID REFERENCES opportunities(id),
  organization_id UUID REFERENCES organizations(id),
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Proposal Sections table
CREATE TABLE IF NOT EXISTS proposal_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  section_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Past Performance table (for RAG)
CREATE TABLE IF NOT EXISTS past_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  agency TEXT,
  value TEXT,
  description TEXT,
  content TEXT NOT NULL,
  embedding TEXT,
  metadata JSONB,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Artifacts table (generated documents)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'ready',
  opportunity_id UUID REFERENCES opportunities(id),
  proposal_id UUID REFERENCES proposals(id),
  storage_url TEXT,
  size INTEGER,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Job Logs table
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_organization ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_match_score ON opportunities(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_due_date ON opportunities(due_date);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_organization ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_search_agents_organization ON search_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sections_proposal ON proposal_sections(proposal_id);

-- Create updated_at triggers (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_agents_updated_at ON search_agents;
CREATE TRIGGER update_search_agents_updated_at BEFORE UPDATE ON search_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposal_sections_updated_at ON proposal_sections;
CREATE TRIGGER update_proposal_sections_updated_at BEFORE UPDATE ON proposal_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_past_performance_updated_at ON past_performance;
CREATE TRIGGER update_past_performance_updated_at BEFORE UPDATE ON past_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artifacts_updated_at ON artifacts;
CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON artifacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo organization and user (optional - comment out if not needed)
INSERT INTO organizations (id, name, domain)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo.example.com')
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'GrantHunter schema deployed successfully!';
    RAISE NOTICE 'Tables created: users, organizations, opportunities, search_agents, agent_runs, proposals, proposal_sections, past_performance, artifacts, job_logs';
    RAISE NOTICE 'Next step: Enable Row Level Security (RLS) policies if needed';
END $$;
