import { z } from 'zod';
import type { ZodOpenApiOperationObject } from 'zod-openapi';
import { defineOperation } from '@/openapi/operation';
import { notFoundResponse } from '@/openapi/schemas';

const oidcCallbackQuerySchema = z
  .object({
    code: z
      .string()
      .optional()
      .meta({ description: 'Authorization code issued by the identity provider.' }),
    state: z
      .string()
      .optional()
      .meta({ description: 'State echoed by the identity provider; must match the state cookie.' }),
    error: z
      .string()
      .optional()
      .meta({ description: 'Error code when the identity provider refused the request.' }),
    error_description: z
      .string()
      .optional()
      .meta({ description: 'Human-readable detail for `error`.' }),
  })
  .meta({ id: 'OidcCallbackQuery' });

const oidcCallbackOperation = defineOperation({
  method: 'get',
  path: '/api/auth/oidc/callback',
  audience: 'internal',
  auth: 'none',
  operation: {
    operationId: 'oidcCallback',
    summary: 'Complete single sign-on',
    description:
      'Redirect target of the identity provider. Exchanges the authorization code (with the PKCE verifier), provisions or updates the Umami user, clears the flow cookies and redirects to the login page with either a session token in the URL fragment or an `error` query parameter (`sso_failed`, `sso_no_role`, `sso_admin_reserved`).',
    tags: ['Authentication'],
    requestParams: {
      query: oidcCallbackQuerySchema,
    },
    responses: {
      '302': {
        description: 'Redirects to `/login/sso` with a session token or an error code.',
        headers: {
          Location: {
            description: 'Login page URL carrying `#token=` on success or `?error=` on failure.',
            schema: { type: 'string', format: 'uri' },
          },
        },
      },
      '404': notFoundResponse,
    },
  } as ZodOpenApiOperationObject,
});

export const operations = [oidcCallbackOperation] as const;
