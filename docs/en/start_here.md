# Start here: CHANWE's Umami (chanwe-umami)

[Español](../es/start_here.md)

## What this repo is

`chanwe-ar/chanwe-umami` is CHANWE's copy of [Polyjapan/umami-sso](https://github.com/Polyjapan/umami-sso), itself a fork
of [umami-software/umami](https://github.com/umami-software/umami) that adds OIDC sign-in. It runs CHANWE's web analytics
at **https://umami.chanwe.ar**. The default branch is **`master`** (upstream's name), not `main`.

Unlike the Wiki, this image **is built from this repo's source** (`Dockerfile`: pnpm, Prisma, Next.js standalone). The
version in `package.json` carries a CHANWE suffix: `3.4.1-chanwe.1`.

CHANWE's layer (everything else is Umami or Polyjapan's SSO, documented upstream and in `README.md`):

| Area | Files | What it does |
|---|---|---|
| Identity sign-in | `src/lib/oidc.ts`, `src/app/api/auth/oidc/{login,callback}/` (+ `contract.ts`) | Polyjapan's OIDC, changed by CHANWE to send PKCE `S256` and authenticate with `client_secret_basic`, as Identity requires; OpenAPI contracts for both routes. |
| 7-day sessions | `src/lib/auth.ts`, `src/app/api/auth/oidc/callback/route.ts`, `src/lib/jwt.test.ts`, `src/lib/auth.test.ts` | Every session token and Redis `auth:` key expires after 7 days; tokens without `exp` are refused. |
| Sign-out from Espacios | `src/app/signout/route.ts`, `docker/proxy.ts` | `/signout` is a page only `https://espacios.chanwe.ar` may frame; it calls `api/auth/logout`, clears the token in `localStorage` and posts `chanweSignedOut` back. No sign-out button in Umami itself. |
| App shell and navigation | `src/app/(main)/{App,TopNav,SideNav,MobileNav,ChanweWebNavigation}.tsx`, `src/lib/chanwe-web-navigation.mjs`, `src/app/chanwe-web-navigation.css` | The kit's 56px bar and 248/76 rail; the web-only bar (apps grid to Espacios, Options menu, account preview from `espacios.chanwe.ar/api/navigation-profile`). Hidden in the desktop app (`__CHANWE_DESKTOP__`). |
| Theme and charts | `src/app/chanwe-theme.css`, `src/brand/tokens.{css,json}`, `src/lib/brand.ts`, `src/lib/colors.ts`, `src/components/charts/Chart.tsx`, `src/components/metrics/*`, `src/components/common/{ChanweBrand,PageHeader}.tsx` | Maps Umami's Zen variables onto the brand tokens (light and dark) and colours Chart.js series from the tokens. |
| Fonts, icons, veil | `src/fonts/`, `src/app/layout.tsx`, `public/favicon*`, `public/*-chrome-*.png`, `public/site.webmanifest`, `public/brand/` | Satoshi, Schibsted Grotesk and JetBrains Mono via `next/font/local`; the app icon; the app veil. Copies from `chanwe-brandbook` (`brand/consumers.json`). |
| Security | `src/lib/crypto.ts`, `src/lib/two-factor/crypto.ts` (+ tests) | 16-byte AES-GCM tags. |
| Ops | `Dockerfile`, `.github/workflows/`, `.env.chanwe.example` | Node 22 Alpine image; CI on GitHub's standard runners, gitleaks via its CLI, upstream cloud deploy dropped. |

## Who uses it

- The CHANWE team reads the dashboards, signed in through CHANWE Identity (client `chanwe-umami-web` by default in
  Identity's config).
- Websites send it visits and events through `https://umami.chanwe.ar/script.js`: the Portal (`portal.chanwe.ar`) and the
  public site (`chanwe-main`).
- Espacios frames `/signout` when someone signs out everywhere. The desktop app opens it as a web tab.

## Where it runs

**The home server** (`chanwe-proxmox-server`), stack `stacks/umami`: container `umami`, built on the VM from
`/srv/src/umami` (this repo, branch `master`) with this `Dockerfile`, port 3000, health `/api/heartbeat`, Caddy site
`15-umami.caddy`. Database `umami` on the shared PostgreSQL, Redis database 2. The Railway service `chanwe-umami` is
history.

Umami is an **infrastructure stack** there: a merge to `master` does not deploy it by itself (see
[guide.md](guide.md#deploy)).

## Run it locally

With Docker (closest to production):

```bash
docker compose -f docker/compose.local.yml up --build
curl -s http://localhost:3000/api/heartbeat
open http://localhost:3000            # without OIDC_*: password form, seeded admin / umami
docker compose -f docker/compose.local.yml down -v
```

The root `docker-compose.yml` is the upstream fork's and pulls Polyjapan's image, not this code.

Without Docker (Node 22, pnpm 12.3.4, a PostgreSQL you can reach):

```bash
cp .env.chanwe.example .env      # set DATABASE_URL and APP_SECRET; leave OIDC_* empty for the password form
pnpm install
pnpm build                       # checks env, generates Prisma, runs migrations (check:db), builds tracker and app
pnpm start                       # or pnpm dev for next dev
pnpm test                        # Vitest (generates the Prisma client first)
pnpm lint
```

Signing in with Identity locally needs a client whose redirects include `http://localhost:3000/api/auth/oidc/callback`;
none is registered for localhost today (not verified against Identity's live configuration). I did not run the build or
the tests while writing this (2026-11-03).

## Map of the docs

| Doc | What's in it |
|---|---|
| [start_here.md](start_here.md) | This page. |
| [data-tree.md](data-tree.md) | Tables CHANWE's layer touches, where analytics data comes from, sign-in and sign-out flows. |
| [guide.md](guide.md) | Day-to-day changes: brand, navigation, sign-in, upstream merges; verify, release, deploy. |
| [`../../CHANGELOG.md`](../../CHANGELOG.md) | CHANWE's changes (`## Unreleased` first). |
| [`../../.env.chanwe.example`](../../.env.chanwe.example) | The variables CHANWE's deployment sets. `.env.example` and the other `.env.*.example` files are the fork's and the audited catalogue. |
| [`../../README.md`](../../README.md) | Upstream Umami and Polyjapan's SSO options. |
| [`../report-api-migration.md`](../report-api-migration.md), [`../../dependabot-review.md`](../../dependabot-review.md) | Upstream notes, kept where upstream has them. |
| `chanwe-proxmox-server/stacks/umami/README.md` | The server stack. |
