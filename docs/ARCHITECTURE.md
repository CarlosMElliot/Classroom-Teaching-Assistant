# Architecture

## Components
1. ChatGPT-compatible client/integration
2. Cloudflare Worker API
3. Google OAuth 2.0
4. Google Classroom API

## Trust boundaries
- GitHub contains source code only.
- Cloudflare contains runtime secrets.
- Google owns authorization and Classroom data.

## API namespaces
- `/oauth/google/*` - authorization
- `/api/classroom/*` - protected Classroom operations

## Roadmap
- courses
- rosters
- coursework CRUD
- submissions
- grading and return workflows
- announcements
- materials
- topics
- confirmation policy for destructive actions
- MCP/ChatGPT tool manifest
