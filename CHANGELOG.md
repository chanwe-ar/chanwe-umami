# Chanwe changes

CHANWE's changes to the fork (formerly `CHANGELOG.chanwe.md`). Upstream Umami's are in its releases:
https://github.com/umami-software/umami/releases

## Unreleased

- `pnpm test` runs the brand guard first (`pnpm test:brand`, `brand-copies.test.mjs`; nothing ran it before). It now checks the tokens' copy too and every stylesheet in the repo, not only `src/app`: the ones that aren't brandbook copies are upstream Umami's, listed by path.

- Docker build fits the home server's 2 GB builder again (it was killed with `cannot allocate memory` on
  2026-11-24): the builder stage sets `NEXT_LOW_MEMORY_BUILD=1`, and `next.config.ts` then builds without
  Turbopack's filesystem cache (on by default in Next 16.4, thrown away by a Docker build) and source maps, with one
  page-data worker. The build's peak drops from ~3.3 GB to ~1.85 GB. Server stack traces in the image are no longer
  source-mapped.

## 3.4.1-chanwe.2 - 2026-11-23

- Brand copies from chanwe-brandbook (D-0062, 2026-11-23): the tokens gain `signal-{ok,warn,fail,plan}` and their `-bg` washes (light and dark), for screens that show a live system's state; nothing else changes.

- `src/app/chanwe-theme.css` and `src/app/chanwe-web-navigation.css` are written in chanwe-brandbook (`brand/ui/apps/umami.css`, `umami-web-navigation.css`, D-0060) and copied here by its `brand:sync`; their only change is a first line naming the source. `node --test brand-copies.test.mjs` fails on a copy without it or a new stylesheet beside them.

- Docs: merging no longer deploys; deploys are by hand (S24, chanwe-proxmox-server, 2026-11-23).

- CHANWE v2 brand copies synced from chanwe-brandbook 2.0.1 (`pnpm brand:sync`): 12 files (v2 wordmark, icons and favicons; generated files only change the brand paths in their comments).

- Brand copies refreshed from kit 1.1.0 (`pnpm brand:sync`): fg-subtle is now #5B6677, new tokens primary-hover, primary-pressed and shell-bar.
- Docs: `docs/es/` and `docs/en/` with `start_here.md`, `data-tree.md` and `guide.md` for CHANWE's layer; this file
  renamed from `CHANGELOG.chanwe.md`.
- `docker/compose.local.yml`: builds the image and runs it locally with a throwaway PostgreSQL and Redis.
- `.env.chanwe.example`: adds `OIDC_VIEW_ROLE`, `DISABLE_LOGIN` and `BASE_PATH`, which the code reads.

## 3.4.1-chanwe.1 - 2026-10-27

- Upstream security fixes, Next.js 16.4.2, React 19.3.1, Node 22.23.4 in the Dockerfile (entry written on 2026-11-03
  from commit d91de4e36).

## 3.4.0-chanwe.2 - 2026-10-17

- Replace utility dots with a hamburger and use the shared authenticated photo/account/roles/access preview with a link to Espacios Cuenta. Preserve desktop navigation.

## 3.4.0-chanwe.1 - 2026-10-17

- Keep the account control visible in the web header; group Help, native theme/language preferences and the existing Espacios sign-out route in one Brandbook utilities menu. Preserve desktop navigation.
- Navigation unit tests pass; full TypeScript checking reports errors in unchanged MCP/2FA files.
