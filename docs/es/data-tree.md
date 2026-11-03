# Árbol de datos: el Umami de CHANWE

[English](../en/data-tree.md) · Revisado contra el código el **2026-11-03** (`prisma/schema.prisma`, `src/lib/oidc.ts`,
`src/app/api/auth/oidc/callback/route.ts`, `src/lib/auth.ts`, `src/app/signout/route.ts`, `src/lib/umami.ts` del Portal,
`chanwe-main/js/components.js`, `chanwe-proxmox-server/stacks/umami`). No revisé datos en vivo, las filas de `website` ni
el `.env` del servidor (el mapeo de roles).

El esquema es de Umami (Prisma, migraciones en `prisma/migrations`, aplicadas al arrancar el contenedor por
`scripts/check-db.js`). CHANWE **no agrega tablas ni columnas**.

## 1. Dónde viven los datos

```mermaid
flowchart LR
  subgraph VM["servidor de casa, VM apps"]
    U["contenedor umami<br/>(Next.js standalone, construido desde este repo)"]
    PG[("PostgreSQL 18, contenedor postgres<br/>base umami")]
    RD[("Redis (stack cache), base 2<br/>claves de sesión auth:*, TTL 7 días")]
  end
  U --> PG
  U --> RD
  SITES["Portal, chanwe-main<br/>script.js en el navegador"] -->|POST /api/send| U
  TEAM["Navegador del equipo / pestaña del escritorio"] -->|tableros, umami.chanwe.ar| U
```

## 2. Entidades principales y claves

```mermaid
erDiagram
  USER ||--o{ WEBSITE : "dueño (user_id)"
  TEAM ||--o{ WEBSITE : "dueño (team_id)"
  TEAM ||--o{ TEAM_USER : tiene
  USER ||--o{ TEAM_USER : "es miembro"
  WEBSITE ||--o{ SESSION : "website_id"
  SESSION ||--o{ WEBSITE_EVENT : "session_id"
  WEBSITE ||--o{ WEBSITE_EVENT : "website_id"
  WEBSITE_EVENT ||--o{ EVENT_DATA : "propiedades del evento"
  SESSION ||--o{ SESSION_DATA : "propiedades de identify()"
  USER ||--o{ REPORT : guarda
  USER {
    uuid user_id PK
    string username UK "email de Identity, en minúsculas"
    string password "al azar para usuarios SSO"
    string role "admin o view-only, del claim de roles"
  }
  WEBSITE {
    uuid website_id PK
    string domain
  }
  SESSION {
    uuid session_id PK "hash de sitio, IP, UA y sal rotativa"
    string distinct_id "Portal: user:<id> o client:<id>"
  }
  WEBSITE_EVENT {
    uuid event_id PK
    uuid visit_id
    string url_path
    string event_name
  }
```

## 3. De dónde salen los datos de analítica

```mermaid
flowchart TB
  P["Portal (portal.chanwe.ar)<br/>src/lib/umami.ts"] -->|script.js, data-website-id bc0062cb…, data-domains portal.chanwe.ar| S["/api/send"]
  M["Sitio público (chanwe.ar)<br/>js/components.js"] -->|script.js, mismo website id, eventos track()| S
  P -->|"identify(): id user:/client:, client_id, user_kind, auth_method, organization_id"| S
  S --> SE[(SESSION / SESSION_DATA)]
  S --> WE[(WEBSITE_EVENT / EVENT_DATA)]
```

El Portal no mide en localhost ni en las vistas previas de admin (`authMethod === "admin-preview"`). En el código leído
el 2026-11-03, los dos sitios mandan al mismo website id.

## 4. Entrada: de dónde sale un usuario de Umami

```mermaid
sequenceDiagram
  participant P as Persona
  participant U as Umami
  participant I as CHANWE Identity
  P->>U: /login → /api/auth/oidc/login
  U->>P: cookies umami.oidc-state, -nonce, -pkce (5 min)
  U->>I: /authorize (PKCE S256, scope openid profile email)
  I->>U: code → /token (client_secret_basic): ID token
  U->>U: rol desde OIDC_ROLES_CLAIM (ID token, si no userinfo): write → admin, view-only → view-only, si no OIDC_DEFAULT_ROLE
  alt sin rol
    U-->>P: /login/sso?error=sso_no_role
  else con rol
    U->>U: busca o crea USER por username (email), actualiza el rol, el admin sembrado se rechaza
    U-->>P: /login/sso, token en el hash de la URL (JWT de 7 días, clave auth:* en Redis por 7 días si hay Redis)
  end
```

El token queda en el `localStorage` del navegador (clave `umami.auth`) y viaja como `Authorization: Bearer`.

## 5. Salida y quién lee qué

```mermaid
flowchart LR
  E["Página de salida de Espacios"] -->|frame oculto /signout, solo espacios.chanwe.ar lo puede enmarcar| SO["página /signout"]
  SO -->|POST api/auth/logout| U[(Umami)]
  SO -->|"localStorage.removeItem, postMessage chanweSignedOut"| E
  NAV["Barra web de Umami"] -->|GET espacios.chanwe.ar/api/navigation-profile, con las cookies de Espacios| ESP["Espacios"]
```

| Dato | Origen | Quién lo escribe | Quién lo lee |
|---|---|---|---|
| Sesiones, eventos, propiedades de evento y sesión | Visitas al Portal y al sitio público | `/api/send` | Tableros del equipo |
| Usuarios, roles | Claims de Identity al entrar | Callback OIDC | Umami |
| Token de sesión | Callback | Umami (JWT, clave en Redis) | Umami; lo borra `/signout` |
| Vista de la cuenta (foto, roles) | `/api/navigation-profile` de Espacios | Espacios | La barra web de Umami, solo en el navegador |
| Archivos de marca | `chanwe-brandbook` | `pnpm brand:sync` | El build |
| Secretos (`APP_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY`, `OIDC_CLIENT_SECRET`, clave de la base) | `.env` del stack, chanwe-locker | Ale | El contenedor |
