# Setup

## 1. Google Cloud
1. Create/select the **Classroom Teaching Assistant** project.
2. Enable the Google Classroom API.
3. Configure Google Auth Platform.
4. Keep the app in Testing while private.
5. Add the teacher account as a test user.
6. Create a **Web application** OAuth client.
7. Mark that the client is used by an AI-powered agent when applicable.

## 2. Deploy Worker
Install dependencies and deploy with Wrangler.

After the first deploy, note the Worker URL.

The Google OAuth redirect URI will be:

`https://YOUR-WORKER-DOMAIN/oauth/google/callback`

Add that exact HTTPS URL to:

Google Cloud -> Google Auth Platform -> Clients -> Classroom Teaching Assistant -> Authorized redirect URIs.

## 3. Secrets
Never commit secrets.

Set these as Cloudflare Worker secrets:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- APP_AUTH_TOKEN

After OAuth authorization, securely store:
- GOOGLE_REFRESH_TOKEN

## 4. First test
Open:

`https://YOUR-WORKER-DOMAIN/oauth/google/start`

Authorize with the teacher test account.

Then call:

`GET /api/classroom/courses`

with:

`Authorization: Bearer <APP_AUTH_TOKEN>`
