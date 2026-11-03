# Guide: using and changing CHANWE's Umami

[Español](../es/guide.md)

## Using it

- Open **https://umami.chanwe.ar** (or the Umami tab in the desktop app) and sign in with CHANWE Identity. Your role
  (admin or view-only) comes from Identity's roles claim at every sign-in; with no matching role you get
  `sso_no_role` and no account.
- There is no sign-out button: sign out from Espacios, or the session ends after 7 days.
- The apps grid in the bar goes back to Espacios; the Options menu holds Help, theme, language and the Espacios sign-out.
- Reading dashboards, websites, reports and teams is plain Umami: https://umami.is/docs

## The rule for changes

Work on a branch off **`master`**, merge to `master`. Keep CHANWE's changes in the files listed in
[start_here.md](start_here.md) so upstream merges stay small; brand files are copies from `chanwe-brandbook` and are
never edited here. Every merge gets a note under `## Unreleased` in `CHANGELOG.md`.

## Day-to-day changes

### Brand files (tokens, fonts, icons, app veil)

1. Change them in `chanwe-brandbook` (`brand/`); the copies in this repo are listed in its `brand/consumers.json`.
2. In the brandbook, `pnpm brand:sync` writes them here; commit them in this repo.
3. `src/brand/tokens.json` feeds `src/lib/brand.ts` (chart colours, meta tags): map a token name there, never a hex value.

### Theme and layout

`src/app/chanwe-theme.css` maps Zen's `--zen-*` variables onto the tokens and restyles the shell toward the kit. It is
loaded last from `src/app/layout.tsx`, unlayered, so no `!important`. Check light and dark, the rail collapsed and open,
and the mobile nav.

### Web bar and account preview

`src/lib/chanwe-web-navigation.mjs` (copy, labels in es/en/it/pt) and `src/app/(main)/ChanweWebNavigation.tsx`. It does
nothing inside the desktop app (`window.__CHANWE_DESKTOP__`). Tests: `src/lib/chanwe-web-navigation.test.ts`,
`src/app/(main)/TopNav.test.tsx`.

### Identity sign-in

`src/lib/oidc.ts` and the two routes under `src/app/api/auth/oidc/`. Identity requires PKCE and `client_secret_basic`;
keep both. Role mapping is configuration (`OIDC_ROLES_CLAIM`, `OIDC_WRITE_ROLE`, `OIDC_VIEW_ROLE`, `OIDC_DEFAULT_ROLE`
in the server's `.env`). If you change a route's shape, regenerate its contract with `pnpm openapi:contracts` and check
`pnpm openapi:check`.

### Merge upstream Umami

```bash
git fetch upstream
git switch -c upstream-<version> origin/master
git merge <upstream tag>          # resolve conflicts in CHANWE's files first
```

Then set `package.json` `version` to `<upstream>-chanwe.1`, add a `CHANGELOG.md` entry, keep `PRISMA_VERSION` in the
`Dockerfile` equal to the `prisma` / `@prisma/*` versions, and run every check below. Read upstream's migrations: they
run at container start.

### Environment variables

Real values are in the server's `stacks/umami/.env` and chanwe-locker. A new variable goes into `.env.chanwe.example`
(name, one-line comment, placeholder) in the same change. Never commit a value.

## Verify

```bash
pnpm install
pnpm test                     # Vitest
pnpm lint
docker build -t chanwe/umami:local .
docker compose -f docker/compose.local.yml up --build    # http://localhost:3000, admin / umami
```

After deploying: `curl -s https://umami.chanwe.ar/api/heartbeat`, sign in through Identity, open a website's dashboard,
and check that `https://umami.chanwe.ar/script.js` still loads (the Portal and the public site depend on it).

## Release

A release is the `version` in `package.json` (`<upstream>-chanwe.<n>`; raise `<n>` for a CHANWE-only change) and its
`CHANGELOG.md` heading, in the same merge. There is no tag or package to publish.

## Deploy

Umami is an infrastructure stack on the home server (`INFRA` in `chanwe-proxmox-server/stacks/ops/lib/common.sh`), so
the 5-minute deploy timer does not pick up merges. After the merge to `master`:

```bash
ssh apps chanwe-update --infra umami --rebuild
```

It resets `/srv/src/umami` to `origin/master`, tags the running image `chanwe/umami:previous`, builds, recreates and waits
for the health check. No automatic rollback on this path: revert on `master` and run it again (`:previous` stays for a
manual switch). Migrations are not undone. `ssh apps chanwe-update --infra umami --dry-run` tells you whether upstream
has a newer release.
