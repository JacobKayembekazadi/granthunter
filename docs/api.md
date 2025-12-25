# GrantHunter - API Documentation

## Base URL

```
Production: https://granthunter.io/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints (except auth) require authentication via Supabase JWT token.

**Header:**
```
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints

### Agents

#### GET /api/agents
List all search agents for the authenticated user.

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Global Energy Sweep",
      "target": "NAICS 541512, 541715",
      "status": "Active",
      "hits": 142,
      "lastRun": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/agents
Create a new search agent.

**Request:**
```json
{
  "name": "DARPA Monitor",
  "target": "Keywords: Swarm, Drone",
  "status": "Active"
}
```

#### GET /api/agents/[id]
Get agent details.

#### PATCH /api/agents/[id]
Update agent.

#### DELETE /api/agents/[id]
Delete agent.

#### POST /api/agents/[id]/scan
Trigger manual scan for agent.

### Opportunities

#### GET /api/opportunities
List opportunities.

**Query Parameters:**
- `status` - Filter by status (new, analyzing, drafting, submitted)
- `limit` - Results limit (default: 50)
- `offset` - Pagination offset

#### GET /api/opportunities/[id]
Get opportunity details.

#### POST /api/opportunities
Create opportunity (manual entry).

#### PATCH /api/opportunities/[id]
Update opportunity.

### Proposals

#### GET /api/proposals
List proposals.

#### POST /api/proposals
Create new proposal.

**Request:**
```json
{
  "name": "Drone Swarm - Technical Proposal",
  "type": "Technical Proposal",
  "opportunityId": "uuid",
  "priority": "High",
  "configuration": {
    "model": "Gemini-1.5-Pro",
    "creativity": "Standard",
    "depth": "Deep"
  }
}
```

#### GET /api/proposals/[id]
Get proposal details.

#### GET /api/proposals/[id]/status
Get real-time proposal status.

#### POST /api/proposals/[id]/generate-document
Generate DOCX or PDF document.

**Request:**
```json
{
  "format": "docx" // or "pdf"
}
```

**Response:**
```json
{
  "url": "https://...",
  "fileName": "proposal-xxx.docx",
  "format": "docx"
}
```

### Inngest Webhook

#### POST /api/inngest
Inngest webhook endpoint (handled automatically).

## Rate Limiting

- **AI API Calls:** 100 requests/hour per model
- **SAM.gov API:** 10 requests/minute
- **General API:** 1000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

