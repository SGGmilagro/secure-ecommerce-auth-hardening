## Authentication Findings

- JWT tokens have no expiration
- Tokens use HS256 with a generic environment secret
- Secret naming is inconsistent and legacy
- Token revocation logic exists but requires audit
- Access control relies on path-based exclusions

