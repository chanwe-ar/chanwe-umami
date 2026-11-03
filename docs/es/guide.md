# Guía: usar y cambiar el Umami de CHANWE

[English](../en/guide.md)

## Usarlo

- Abrí **https://umami.chanwe.ar** (o la pestaña Umami de la app de escritorio) y entrá con CHANWE Identity. Tu rol
  (admin o view-only) sale del claim de roles de Identity en cada entrada; si no coincide ningún rol, ves `sso_no_role`
  y no se crea la cuenta.
- No hay botón de salir: cerrá sesión desde Espacios, o la sesión vence a los 7 días.
- La grilla de apps de la barra te devuelve a Espacios; el menú Opciones tiene Ayuda, tema, idioma y la salida de Espacios.
- Los tableros, sitios, reportes y equipos son Umami tal cual: https://umami.is/docs

## La regla para cambiar algo

Trabajá en una rama que salga de **`master`** y mergeá a `master`. Mantené los cambios de CHANWE en los archivos que
lista [start_here.md](start_here.md), así los merges de upstream quedan chicos; los archivos de marca son copias de
`chanwe-brandbook` y nunca se editan acá. Cada merge lleva una nota bajo `## Unreleased` en `CHANGELOG.md`.

## Cambios del día a día

### Archivos de marca (tokens, fuentes, íconos, velo)

1. Cambialos en `chanwe-brandbook` (`brand/`); las copias de este repo están en su `brand/consumers.json`.
2. En el brandbook, `pnpm brand:sync` las escribe acá; commitealas en este repo.
3. `src/brand/tokens.json` alimenta `src/lib/brand.ts` (colores de gráficos, meta tags): ahí se mapea un nombre de token,
   nunca un hex.

### Tema y layout

`src/app/chanwe-theme.css` mapea las variables `--zen-*` de Zen a los tokens y acerca el shell al kit. Se carga último
desde `src/app/layout.tsx`, sin capa, así que no hace falta `!important`. Revisá claro y oscuro, el riel cerrado y
abierto, y la navegación móvil.

### Barra web y vista de la cuenta

`src/lib/chanwe-web-navigation.mjs` (copia, textos en es/en/it/pt) y `src/app/(main)/ChanweWebNavigation.tsx`. Dentro de
la app de escritorio no hace nada (`window.__CHANWE_DESKTOP__`). Tests: `src/lib/chanwe-web-navigation.test.ts`,
`src/app/(main)/TopNav.test.tsx`.

### Entrada con Identity

`src/lib/oidc.ts` y las dos rutas de `src/app/api/auth/oidc/`. Identity exige PKCE y `client_secret_basic`: no saques
ninguno. El mapeo de roles es configuración (`OIDC_ROLES_CLAIM`, `OIDC_WRITE_ROLE`, `OIDC_VIEW_ROLE`, `OIDC_DEFAULT_ROLE`
en el `.env` del servidor). Si cambiás la forma de una ruta, regenerá su contrato con `pnpm openapi:contracts` y revisá
con `pnpm openapi:check`.

### Traer cambios de Umami (upstream)

```bash
git fetch upstream
git switch -c upstream-<versión> origin/master
git merge <tag de upstream>       # resolvé primero los conflictos en los archivos de CHANWE
```

Después poné `version` de `package.json` en `<upstream>-chanwe.1`, sumá la entrada en `CHANGELOG.md`, mantené
`PRISMA_VERSION` del `Dockerfile` igual a las versiones de `prisma` / `@prisma/*` y corré todos los controles de abajo.
Leé las migraciones de upstream: corren al arrancar el contenedor.

### Variables de entorno

Los valores reales están en `stacks/umami/.env` del servidor y en chanwe-locker. Una variable nueva va a
`.env.chanwe.example` (nombre, comentario de una línea, valor de ejemplo) en el mismo cambio. Nunca commitees un valor.

## Verificar

```bash
pnpm install
pnpm test                     # Vitest
pnpm lint
docker build -t chanwe/umami:local .
docker compose -f docker/compose.local.yml up --build    # http://localhost:3000, admin / umami
```

Después de desplegar: `curl -s https://umami.chanwe.ar/api/heartbeat`, entrá con Identity, abrí el tablero de un sitio y
fijate que `https://umami.chanwe.ar/script.js` siga cargando (el Portal y el sitio público dependen de él).

## Versionar

Una versión es el `version` de `package.json` (`<upstream>-chanwe.<n>`; subí `<n>` para un cambio solo de CHANWE) y su
título en `CHANGELOG.md`, en el mismo merge. No hay tag ni paquete que publicar.

## Desplegar

En el servidor de casa, Umami es un stack de infraestructura (`INFRA` en
`chanwe-proxmox-server/stacks/ops/lib/common.sh`), así que el timer de deploy de cada 5 minutos no toma los merges.
Después del merge a `master`:

```bash
ssh apps chanwe-update --infra umami --rebuild
```

Lleva `/srv/src/umami` a `origin/master`, etiqueta la imagen que corre como `chanwe/umami:previous`, construye, recrea y
espera el health check. Este camino no tiene rollback automático: revertí en `master` y corrélo de nuevo (`:previous`
queda para cambiarla a mano). Las migraciones no se deshacen. `ssh apps chanwe-update --infra umami --dry-run` te dice si
upstream tiene una versión más nueva.
