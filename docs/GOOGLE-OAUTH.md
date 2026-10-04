# Google OAuth

Current requested scopes:

- classroom.courses.readonly
- classroom.rosters.readonly
- classroom.coursework.me

Additional scopes should be added only when a feature needs them.

The OAuth callback intentionally does not display access or refresh tokens in the browser response.

Production token storage should use encrypted Cloudflare storage/secrets and must never be committed to GitHub.

If scopes change, Google may require re-consent.
