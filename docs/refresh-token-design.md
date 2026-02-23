## Refresh Token Design

- Access tokens expire after 15 minutes
- Refresh tokens are long-lived and stored server-side
- Refresh tokens are hashed before storage
- Tokens are rotated on every use
- Compromised tokens can be revoked per user
- Supports multiple concurrent sessions per user

