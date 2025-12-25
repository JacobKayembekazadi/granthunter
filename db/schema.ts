import { pgTable, text, timestamp, integer, jsonb, boolean, uuid, varchar, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (extends Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  domain: text('domain'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Opportunities (from SAM.gov)
export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  samGovId: text('sam_gov_id').unique(),
  title: text('title').notNull(),
  agency: text('agency').notNull(),
  value: text('value'),
  dueDate: timestamp('due_date'),
  status: varchar('status', { length: 20 }).notNull().default('new'), // new, analyzing, drafting, submitted
  matchScore: integer('match_score').default(0),
  naicsCode: text('naics_code'),
  description: text('description'),
  rfpDocumentUrl: text('rfp_document_url'),
  rfpContent: text('rfp_content'), // Full text content
  metadata: jsonb('metadata'), // Additional SAM.gov data
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Search Agents
export const searchAgents = pgTable('search_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  target: text('target').notNull(), // NAICS codes, keywords, etc.
  status: varchar('status', { length: 20 }).notNull().default('Active'), // Active, Paused, Learning
  hits: integer('hits').default(0),
  lastRun: timestamp('last_run'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Agent Runs (execution logs)
export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => searchAgents.id).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // running, completed, failed
  opportunitiesFound: integer('opportunities_found').default(0),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
  metadata: jsonb('metadata'),
});

// Proposals
export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // Technical Proposal, Compliance Matrix, etc.
  status: varchar('status', { length: 20 }).notNull().default('queued'), // queued, processing, completed, failed, paused
  progress: integer('progress').default(0),
  stage: text('stage'),
  priority: varchar('priority', { length: 10 }).default('Normal'), // High, Normal, Low
  opportunityId: uuid('opportunity_id').references(() => opportunities.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  configuration: jsonb('configuration'), // Model, creativity, depth settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Proposal Sections
export const proposalSections = pgTable('proposal_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').references(() => proposals.id).notNull(),
  sectionNumber: text('section_number').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  status: varchar('status', { length: 20 }).default('draft'), // draft, completed, reviewed
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Past Performance (for RAG)
export const pastPerformance = pgTable('past_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  agency: text('agency'),
  value: text('value'),
  description: text('description'),
  content: text('content').notNull(), // Full text content for embedding
  embedding: text('embedding'), // Vector stored as text (pgvector), dimensions: 1536
  metadata: jsonb('metadata'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Artifacts (generated documents)
export const artifacts = pgTable('artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: varchar('type', { length: 10 }).notNull(), // pdf, docx, pptx, xlsx, txt
  status: varchar('status', { length: 20 }).default('ready'), // ready, processing
  opportunityId: uuid('opportunity_id').references(() => opportunities.id),
  proposalId: uuid('proposal_id').references(() => proposals.id),
  storageUrl: text('storage_url'), // Supabase Storage URL
  size: integer('size'), // Size in bytes
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Job Logs (for proposal generation tracking)
export const jobLogs = pgTable('job_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').references(() => proposals.id).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // info, warning, error, success
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [opportunities.organizationId],
    references: [organizations.id],
  }),
  proposals: many(proposals),
  artifacts: many(artifacts),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  opportunity: one(opportunities, {
    fields: [proposals.opportunityId],
    references: [opportunities.id],
  }),
  sections: many(proposalSections),
  logs: many(jobLogs),
  artifacts: many(artifacts),
}));

