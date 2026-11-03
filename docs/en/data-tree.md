# Data tree: CHANWE's Umami

[Español](../es/data-tree.md) · Checked against the code on **2026-11-03** (`prisma/schema.prisma`, `src/lib/oidc.ts`,
`src/app/api/auth/oidc/callback/route.ts`, `src/lib/auth.ts`, `src/app/signout/route.ts`, the Portal's
`src/lib/umami.ts`, `chanwe-main/js/components.js`, `chanwe-proxmox-server/stacks/umami`). Live data, the website rows
and the server's `.env` (role mapping) were not checked.

The schema is Umami's (Prisma, migrations in `prisma/migrations`, applied at container start by `scripts/check-db.js`).
CHANWE adds **no tables or columns**.

## 1. Where the data lives

```mermaid
flowchart LR
  subgraph VM["home server, VM apps"]
    U["container umami<br/>(Next.js standalone, built from this repo)"]
    PG[("PostgreSQL 18, container postgres<br/>database umami")]
    RD[("Redis (stack cache), db 2<br/>auth:* session keys, 7-day TTL")]
  end
  U --> PG
  U --> RD
  SITES["Portal, chanwe-main<br/>script.js in the browser"] -->|POST /api/send| U
  TEAM["Team browser / desktop tab"] -->|dashboards, umami.chanwe.ar| U
```

## 2. Main entities and keys

```mermaid
erDiagram
  USER ||--o{ WEBSITE : "owns (user_id)"
  TEAM ||--o{ WEBSITE : "owns (team_id)"
  TEAM ||--o{ TEAM_USER : has
  USER ||--o{ TEAM_USER : "member of"
  WEBSITE ||--o{ SESSION : "website_id"
  SESSION ||--o{ WEBSITE_EVENT : "session_id"
  WEBSITE ||--o{ WEBSITE_EVENT : "website_id"
  WEBSITE_EVENT ||--o{ EVENT_DATA : "event properties"
  SESSION ||--o{ SESSION_DATA : "identify() properties"
  USER ||--o{ REPORT : saves
  USER {
    uuid user_id PK
    string username UK "Identity email, lower-cased"
    string password "random for SSO users"
    string role "admin or view-only, from the roles claim"
  }
  WEBSITE {
    uuid website_id PK
    string domain
  }
  SESSION {
    uuid session_id PK "hash of website, IP, UA, rotating salt"
    string distinct_id "Portal: user:<id> or client:<id>"
  }
  WEBSITE_EVENT {
    uuid event_id PK
    uuid visit_id
    string url_path
    string event_name
  }
```

## 3. Where the analytics data comes from

```mermaid
flowchart TB
  P["Portal (portal.chanwe.ar)<br/>src/lib/umami.ts"] -->|script.js, data-website-id bc0062cb…, data-domains portal.chanwe.ar| S["/api/send"]
  M["Public site (chanwe.ar)<br/>js/components.js"] -->|script.js, same website id, track() events| S
  P -->|"identify(): id user:/client:, client_id, user_kind, auth_method, organization_id"| S
  S --> SE[(SESSION / SESSION_DATA)]
  S --> WE[(WEBSITE_EVENT / EVENT_DATA)]
```

The Portal skips tracking on localhost and in admin previews (`authMethod === "admin-preview"`). Both sites post to the same
website id in the code read on 2026-11-03.

## 4. Sign-in: where an Umami user comes from

```mermaid
sequenceDiagram
  participant P as Person
  participant U as Umami
  participant I as CHANWE Identity
  P->>U: /login → /api/auth/oidc/login
  U->>P: cookies umami.oidc-state, -nonce, -pkce (5 min)
  U->>I: /authorize (PKCE S256, scope openid profile email)
  I->>U: code → /token (client_secret_basic): ID token
  U->>U: role from OIDC_ROLES_CLAIM (ID token, else userinfo): write → admin, view-only → view-only, else OIDC_DEFAULT_ROLE
  alt no role
    U-->>P: /login/sso?error=sso_no_role
  else role
    U->>U: find or create USER by username (email), update role, seeded admin refused
    U-->>P: /login/sso, token in the URL hash (JWT 7 days, Redis auth:* key 7 days when Redis is on)
  end
```

The token lives in the browser's `localStorage` (key `umami.auth`) and is sent as `Authorization: Bearer`.

## 5. Sign-out and who reads what

```mermaid
flowchart LR
  E["Espacios sign-out page"] -->|hidden frame /signout, only espacios.chanwe.ar may frame it| SO["/signout page"]
  SO -->|POST api/auth/logout| U[(Umami)]
  SO -->|"localStorage.removeItem, postMessage chanweSignedOut"| E
  NAV["Umami web bar"] -->|GET espacios.chanwe.ar/api/navigation-profile, with Espacios cookies| ESP["Espacios"]
```

| Data | Source | Writer | Readers |
|---|---|---|---|
| Sessions, events, event and session properties | Portal and public site visitors | `/api/send` | Team dashboards |
| Users, roles | Identity's claims at sign-in | OIDC callback | Umami |
| Session token | Callback | Umami (JWT, Redis key) | Umami; removed by `/signout` |
| Account preview (photo, roles) | Espacios `/api/navigation-profile` | Espacios | Umami's web bar, in the browser only |
| Brand files | `chanwe-brandbook` | `pnpm brand:sync` | Build |
| Secrets (`APP_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY`, `OIDC_CLIENT_SECRET`, DB password) | Server stack `.env`, chanwe-locker | Ale | Container |
