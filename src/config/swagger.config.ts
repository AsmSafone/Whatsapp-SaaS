import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

/**
 * Security scheme name for the API key, used both when defining the scheme and
 * when applying it as a global requirement so Swagger UI sends the header.
 */
export const API_KEY_SECURITY_SCHEME = 'X-API-Key';

// Routes whose controllers are @Public() — the ApiKeyGuard skips them at runtime, but the
// global X-API-Key requirement applied below would otherwise make the spec claim they need a
// key. Mirror the @Public() decorators: add a path here when you add one there.
export const PUBLIC_PATHS = [
  '/api/health',
  '/api/health/live',
  '/api/health/ready',
  '/api/infra/health',
  '/api/ingress/{pluginId}/{instanceId}/{path}',
  '/api/account/register',
  '/api/account/login',
  '/api/account/plans',
];

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace', 'search'] as const;

type PathItem = Record<string, { security?: unknown } | undefined>;

/**
 * The complete field set an OpenAPI 3.0 Path Item Object may carry. The 3.0 schema declares the object
 * `additionalProperties: false` apart from `^x-`, so anything outside this set makes the whole document
 * fail schema validation — not just the path it appears on.
 */
const OPENAPI_3_PATH_ITEM_FIELDS = new Set([
  '$ref',
  'summary',
  'description',
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
  'servers',
  'parameters',
]);

/**
 * Drop path-item entries OpenAPI 3.0 cannot express, so the published document validates.
 *
 * `@nestjs/swagger` expands an `@All()` route over its own hardcoded method list, which includes
 * `search` (`swagger-explorer.js`). SEARCH is a real HTTP method Nest routes at runtime — `RequestMethod`
 * defines it, along with the WebDAV verbs — but OpenAPI 3.0 has no field for it, so publishing the
 * operation trades a documented method for an invalid document. The route keeps answering it; only the
 * unexpressible description of it goes.
 *
 * Written as an allowlist rather than a denylist on purpose: upstream is free to widen its expansion
 * list again (PROPFIND, MKCOL, …), and a denylist would silently let the next one through. Mutates and
 * returns the document.
 */
export function dropUnexpressibleOperations(document: OpenAPIObject): OpenAPIObject {
  for (const item of Object.values(document.paths ?? {})) {
    for (const field of Object.keys(item)) {
      if (!OPENAPI_3_PATH_ITEM_FIELDS.has(field) && !field.startsWith('x-')) {
        delete (item as Record<string, unknown>)[field];
      }
    }
  }
  return document;
}

/**
 * Set `security: []` on every operation of a @Public route so the published spec reflects
 * that no API key is required (an empty `security` array overrides the document's global
 * X-API-Key requirement per OpenAPI 3). Mutates and returns the document.
 */
export function exemptPublicOperations(document: OpenAPIObject): OpenAPIObject {
  for (const path of PUBLIC_PATHS) {
    const item = document.paths?.[path] as PathItem | undefined;
    if (!item) continue;
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (op) op.security = [];
    }
  }
  return document;
}

/**
 * Builds the OpenAPI document configuration for the Zaptura API.
 */
export function createSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  // Source the API version from package.json so it tracks releases automatically — no manual bump, no drift.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { version } = require('../../package.json') as { version: string };
  return (
    new DocumentBuilder()
      .setTitle('Zaptura API')
      // Two refusals are issued by middleware BEFORE routing, so they apply to every operation
      // below and cannot be expressed as a per-operation @ApiResponse without repeating them 187
      // times. Documenting them here keeps the contract honest for clients that would otherwise
      // meet an undocumented status.
      .setDescription(
        'Zaptura Autonomous WhatsApp API Gateway & SaaS Platform\n\n' +
          '**Gateway-wide responses.** Two statuses are returned by middleware before routing, ' +
          'so any operation can emit them:\n\n' +
          '- `415 Unsupported Media Type` — the request body carries a `Content-Encoding` other ' +
          'than `identity`. The aggregate in-flight body cap counts wire bytes, so a compressed ' +
          'body would be admitted on its compressed size and then inflated past the memory it is ' +
          'meant to bound. Send the body uncompressed.\n' +
          '- `503 Service Unavailable` with `Retry-After` — the gateway already has too much ' +
          'request body data in flight. The body is not read; retry after the given delay.',
      )
      .setVersion(version)
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, API_KEY_SECURITY_SCHEME)
      // Apply the scheme globally so Swagger UI sends the key with every request
      // (mirrors the global ApiKeyGuard). Without this, "Authorize" is cosmetic.
      .addSecurityRequirements(API_KEY_SECURITY_SCHEME)
      .setContact('Zaptura', 'https://zapturawa.com', 'support@zapturawa.com')
      .addTag('account', 'Tenant account registration, authentication, and plan queries')
      .addTag('admin-users', '[Admin Only] User account administration, plan management, and password resets')
      .addTag('sessions', 'WhatsApp session lifecycle and multi-device connection management (Tenant / Per-User)')
      .addTag('messages', 'Send and manage WhatsApp messages, text, media, and location (Tenant / Per-User)')
      .addTag('media', 'Media file upload, preview, and conversion for WhatsApp chats (Tenant / Per-User)')
      .addTag('automation', 'Automated keyword, event, and autoreply response rules (Tenant / Per-User)')
      .addTag('webhooks', 'Webhook event configuration, filtering, and delivery logs (Tenant / Per-User)')
      .addTag('contacts', 'Contact management and address book queries (Tenant / Per-User)')
      .addTag('groups', 'WhatsApp group creation, metadata, and participant management (Tenant / Per-User)')
      .addTag('labels', 'Label management for WhatsApp Business (Tenant / Per-User)')
      .addTag('channels', 'Channel and newsletter management (Tenant / Per-User)')
      .addTag('catalog', 'Product catalog management for WhatsApp Business (Tenant / Per-User)')
      .addTag('status', 'Status and story broadcast handling (Tenant / Per-User)')
      .addTag('calls', 'WhatsApp voice and video call handling (Tenant / Per-User)')
      .addTag('profile', 'Own WhatsApp profile and presence management (Tenant / Per-User)')
      .addTag('search', 'Global message and contact search (Tenant / Per-User)')
      .addTag('statistics', 'Account and session usage statistics (Tenant / Per-User)')
      .addTag('templates', 'Message templates and parameter injection (Tenant / Per-User)')
      .addTag('plugins', 'Plugin catalog, installation, and per-user configuration (Tenant / Per-User)')
      .addTag('integration', 'Integration Fabric: provider webhooks and instances (Tenant / Per-User)')
      .addTag('auth', 'API key generation, listing, and revocation (Tenant / Per-User)')
      .addTag('infrastructure', '[Admin Only] Infrastructure datastores, disk cleanup, and maintenance')
      .addTag('audit', '[Admin Only] Security audit logging and administration trail')
      .addTag('health', 'System health check and liveness probes')
      // ORDER MATTERS. Swagger UI resolves "Try it" against servers[0], substituting the variable
      // defaults — it does not consider the origin the page was served from. A templated server
      // alone therefore aimed every request at `http://localhost:2785`, so on any deployment that
      // is not exactly that (a LAN address, a different PORT, a TLS proxy) Try-it called the
      // reader's own machine and failed with "Failed to fetch" — the browser's CSP `connect-src
      // 'self'` rejects the cross-origin call before it is even sent (#1068). A relative URL is
      // resolved against the document's own location, which is what OpenAPI 3 specifies and what
      // the spec did implicitly before it declared any server at all.
      //
      // So: relative first, and keep the templated absolute one second. Static consumers of
      // openapi.json still get a concrete base URL to display (#975), and the host/port editor
      // stays in the Servers dropdown for anyone pointing the docs at a different instance.
      .addServer('/', 'This instance (the origin serving these docs)')
      .addServer('http://{host}:{port}', 'Another instance (set host and port)', {
        host: { default: 'localhost' },
        port: { default: '2785', description: 'PORT env var' },
      })
      .build()
  );
}
