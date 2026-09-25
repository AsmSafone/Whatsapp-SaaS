/**
 * Zaptura JavaScript/TypeScript SDK.
 *
 * Official client library for the Zaptura WhatsApp API Gateway.
 *
 * @example
 * ```typescript
 * import { ZapturaClient, ZapturaApiError } from '@asmsafone/zaptura';
 *
 * const client = new ZapturaClient({
 *   baseUrl: 'http://localhost:2785',
 *   apiKey: 'zap_k1_…',
 * });
 *
 * await client.sessions.start('my-session');
 * const result = await client.messages.sendText('my-session', {
 *   chatId: '628123456789@c.us',
 *   text: 'Hello from the Zaptura SDK!',
 * });
 * console.log(result.messageId);
 * ```
 *
 * @packageDocumentation
 */

export { ZapturaClient } from './client.js';
export { default } from './client.js';
export type { ZapturaClientOptions } from './client.js';
export * from './errors.js';
export type * from './types.js';
export type { BinaryResponse, ClientConfig, FetchLike, HttpMethod, RequestOptions } from './http.js';
export { buildUrl, warnIfInsecureHttpUrl } from './http.js';
