# Empezá acá: el Umami de CHANWE (chanwe-umami)

[English](../en/start_here.md)

## Qué es este repo

`chanwe-ar/chanwe-umami` es la copia de CHANWE de [Polyjapan/umami-sso](https://github.com/Polyjapan/umami-sso), que a su
vez es un fork de [umami-software/umami](https://github.com/umami-software/umami) con inicio de sesión OIDC. Corre la
analítica web de CHANWE en **https://umami.chanwe.ar**. La rama por defecto es **`master`** (el nombre de upstream), no
`main`.

A diferencia de la Wiki, esta imagen **se construye desde el código de este repo** (`Dockerfile`: pnpm, Prisma, Next.js
standalone). La versión de `package.json` lleva un sufijo de CHANWE: `3.4.1-chanwe.1`.

La capa de CHANWE (todo lo demás es Umami o el SSO de Polyjapan, documentado en upstream y en `README.md`):

| Área | Archivos | Qué hace |
|---|---|---|
| Entrada con Identity | `src/lib/oidc.ts`, `src/app/api/auth/oidc/{login,callback}/` (+ `contract.ts`) | El OIDC de Polyjapan, cambiado por CHANWE para mandar PKCE `S256` y autenticarse con `client_secret_basic`, como pide Identity; contratos OpenAPI de las dos rutas. |
| Sesiones de 7 días | `src/lib/auth.ts`, `src/app/api/auth/oidc/callback/route.ts`, `src/lib/jwt.test.ts`, `src/lib/auth.test.ts` | Cada token de sesión y cada clave `auth:` de Redis vence a los 7 días; los tokens sin `exp` se rechazan. |
| Salida desde Espacios | `src/app/signout/route.ts`, `docker/proxy.ts` | `/signout` es una página que solo `https://espacios.chanwe.ar` puede enmarcar; llama a `api/auth/logout`, borra el token de `localStorage` y responde `chanweSignedOut`. Umami no tiene botón de salir. |
| Shell y navegación | `src/app/(main)/{App,TopNav,SideNav,MobileNav,ChanweWebNavigation}.tsx`, `src/lib/chanwe-web-navigation.mjs`, `src/app/chanwe-web-navigation.css` | La barra de 56px y el riel 248/76 del kit; la barra solo web (grilla de apps hacia Espacios, menú Opciones, vista de la cuenta desde `espacios.chanwe.ar/api/navigation-profile`). Se oculta en la app de escritorio (`__CHANWE_DESKTOP__`). |
| Tema y gráficos | `src/app/chanwe-theme.css`, `src/brand/tokens.{css,json}`, `src/lib/brand.ts`, `src/lib/colors.ts`, `src/components/charts/Chart.tsx`, `src/components/metrics/*`, `src/components/common/{ChanweBrand,PageHeader}.tsx` | Mapea las variables Zen de Umami a los tokens de marca (claro y oscuro) y colorea las series de Chart.js con los tokens. |
| Fuentes, íconos, velo | `src/fonts/`, `src/app/layout.tsx`, `public/favicon*`, `public/*-chrome-*.png`, `public/site.webmanifest`, `public/brand/` | Satoshi, Schibsted Grotesk y JetBrains Mono con `next/font/local`; el ícono de la app; el velo. Copias de `chanwe-brandbook` (`brand/consumers.json`). |
| Seguridad | `src/lib/crypto.ts`, `src/lib/two-factor/crypto.ts` (+ tests) | Tags AES-GCM de 16 bytes. |
| Operación | `Dockerfile`, `.github/workflows/`, `.env.chanwe.example` | Imagen Node 22 Alpine; CI en los runners estándar de GitHub, gitleaks por su CLI, sin el deploy a la nube de upstream. |

## Quién lo usa

- El equipo de CHANWE mira los tableros y entra con CHANWE Identity (cliente `chanwe-umami-web` por defecto en la
  configuración de Identity).
- Los sitios le mandan visitas y eventos con `https://umami.chanwe.ar/script.js`: el Portal (`portal.chanwe.ar`) y el sitio
  público (`chanwe-main`).
- Espacios enmarca `/signout` cuando alguien cierra sesión en todo. La app de escritorio lo abre como pestaña web.

## Dónde corre

**En el servidor de casa** (`chanwe-proxmox-server`), stack `stacks/umami`: contenedor `umami`, construido en la VM desde
`/srv/src/umami` (este repo, rama `master`) con este `Dockerfile`, puerto 3000, health `/api/heartbeat`, sitio de Caddy
`15-umami.caddy`. Base `umami` en el PostgreSQL compartido, Redis base 2. El servicio `chanwe-umami` de Railway es
historia.

Ahí Umami es un **stack de infraestructura**: un merge a `master` no lo despliega solo (ver
[guide.md](guide.md#desplegar)).

## Correrlo local

Con Docker (lo más parecido a producción):

```bash
docker compose -f docker/compose.local.yml up --build
curl -s http://localhost:3000/api/heartbeat
open http://localhost:3000            # sin OIDC_*: formulario de clave, cuenta sembrada admin / umami
docker compose -f docker/compose.local.yml down -v
```

El `docker-compose.yml` de la raíz es el del fork de upstream y baja la imagen de Polyjapan, no este código.

Sin Docker (Node 22, pnpm 12.3.4 y un PostgreSQL al que llegues):

```bash
cp .env.chanwe.example .env      # completá DATABASE_URL y APP_SECRET; dejá OIDC_* vacío para usar la clave
pnpm install
pnpm build                       # revisa el entorno, genera Prisma, corre migraciones (check:db), arma tracker y app
pnpm start                       # o pnpm dev para next dev
pnpm test                        # Vitest (genera antes el cliente de Prisma)
pnpm lint
```

Para entrar con Identity en local hace falta un cliente cuya lista de redirects incluya
`http://localhost:3000/api/auth/oidc/callback`; hoy no hay ninguno para localhost (no lo verifiqué contra la
configuración en vivo de Identity). No corrí el build ni los tests al escribir esto (2026-11-03).

## Mapa de la documentación

| Doc | Qué tiene |
|---|---|
| [start_here.md](start_here.md) | Esta página. |
| [data-tree.md](data-tree.md) | Tablas que toca la capa de CHANWE, de dónde salen los datos de analítica, entrada y salida. |
| [guide.md](guide.md) | Cambios del día a día: marca, navegación, entrada, merges de upstream; verificar, versionar, desplegar. |
| [`../../CHANGELOG.md`](../../CHANGELOG.md) | Los cambios de CHANWE (`## Unreleased` primero). |
| [`../../.env.chanwe.example`](../../.env.chanwe.example) | Las variables que define el deploy de CHANWE. `.env.example` y los otros `.env.*.example` son del fork y el catálogo auditado. |
| [`../../README.md`](../../README.md) | Umami de upstream y las opciones del SSO de Polyjapan. |
| [`../report-api-migration.md`](../report-api-migration.md), [`../../dependabot-review.md`](../../dependabot-review.md) | Notas de upstream, donde upstream las tiene. |
| `chanwe-proxmox-server/stacks/umami/README.md` | El stack del servidor. |
