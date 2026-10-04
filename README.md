# Classroom Teaching Assistant

Private Google Classroom integration designed to expose teacher workflows to an AI assistant through a Cloudflare Worker.

## Goals
- List courses and rosters
- Read coursework and student submissions
- Create/edit coursework
- Read and update grades (when authorized)
- Manage announcements/materials as scopes are added
- Keep Google secrets out of GitHub

## Architecture
ChatGPT / MCP client -> Cloudflare Worker -> Google OAuth 2.0 -> Google Classroom API

## Security
Never commit Google client secrets, access tokens, refresh tokens, or authorization codes. Store secrets with Cloudflare Worker secrets.

## Current setup
Google Cloud project: Classroom Teaching Assistant
Google Classroom API: enabled
OAuth audience: External / Testing
OAuth client type: Web application

See docs/SETUP.md and docs/GOOGLE-OAUTH.md.
