import type { ZodOpenApiOperationObject } from 'zod-openapi';
import { defineOperation } from '@/openapi/operation';
import { notFoundResponse, serverErrorResponse } from '@/openapi/schemas';

const oidcLoginOperation = defineOperation({
  method: 'get',
  path: '/api/auth/oidc/login',
  audience: 'internal',
  auth: 'none',
  operation: {
    operationId: 'oidcLogin',
    summary: 'Start single sign-on',
    description:
      'Browser navigation that starts the OpenID Connect authorization code flow (PKCE S256). Stores the state, nonce and PKCE verifier in short-lived cookies and redirects to the identity provider.',
    tags: ['Authentication'],
    responses: {
      '302': {
        description: 'Redirects to the identity provider authorization endpoint.',
        headers: {
          Location: {
            description: 'Authorization request URL at the identity provider.',
            schema: { type: 'string', format: 'uri' },
          },
        },
      },
      '404': notFoundResponse,
      '500': serverErrorResponse,
    },
  } as ZodOpenApiOperationObject,
});

export const operations = [oidcLoginOperation] as const;
