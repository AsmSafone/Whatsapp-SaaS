# Zaptura Java SDK

Official Java client for the [Zaptura](https://github.com/AsmSafone/ZapturaWA)
WhatsApp API Gateway.

Hand-written against the exact API surface (paths, DTOs, response shapes) and
unit-tested with a mock HTTP transport that asserts on the precise request URL,
method, and body — so contract drift is caught at test time. Synchronous,
Java 17+, one runtime dependency ([Gson](https://github.com/google/gson)).

## Install

**Maven**

```xml
<dependency>
  <groupId>com.asmsafone</groupId>
  <artifactId>zaptura</artifactId>
  <version>0.5.0</version>
</dependency>
```

**Gradle**

```groovy
implementation 'com.asmsafone:zaptura:0.5.0'
```

## Quickstart

```java
import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.model.MessageResponse;
import com.asmsafone.zaptura.model.SendTextRequest;

ZapturaClient client = new ZapturaClient("http://localhost:2785", "zap_k1_…");

client.sessions.start("my-session");

MessageResponse result = client.messages.sendText("my-session",
    SendTextRequest.builder()
        .chatId("628123456789@c.us")
        .text("Hello from the Zaptura Java SDK!")
        .build());

System.out.println(result.messageId());
```

For full control over configuration (timeout, default headers, a custom
transport), build a `ClientConfig`:

```java
import com.asmsafone.zaptura.ClientConfig;
import java.time.Duration;

ZapturaClient client = new ZapturaClient(ClientConfig.builder()
    .baseUrl("https://wa.example.com")
    .apiKey("zap_k1_…")
    .timeout(Duration.ofSeconds(15))
    .build());
```

## Resources

The client exposes the same fluent resource surface as the JavaScript, Python,
and PHP SDKs:

`sessions` · `messages` · `contacts` · `groups` · `webhooks` · `chats` ·
`labels` · `channels` · `catalog` · `status` · `templates` · `health` · `search` ·
`profile` · `calls` · `media`,
plus `client.auth()`.

Admin-only modules (`docker`, `metrics`, `infra`, `plugins`, `mcp`) are
intentionally not exposed; all user-facing resources are.

## Error handling

Errors are a typed, unchecked hierarchy — branch with `instanceof` or on
`.status()`:

```java
import com.asmsafone.zaptura.errors.ZapturaConflictError;
import com.asmsafone.zaptura.errors.ZapturaNotFoundError;

try {
    client.messages.sendText("my-session", body);
} catch (ZapturaConflictError e) {
    // 409 — engine not ready
} catch (ZapturaNotFoundError e) {
    // 404 — session or chat not found
}
```

| Class                           | HTTP | Meaning                                                 |
| ------------------------------- | ---- | ------------------------------------------------------- |
| `ZapturaAuthError`               | 401  | Missing or invalid API key                              |
| `ZapturaForbiddenError`          | 403  | API key role insufficient                               |
| `ZapturaNotFoundError`           | 404  | Resource not found                                      |
| `ZapturaConflictError`           | 409  | Engine not ready                                        |
| `ZapturaRateLimitError`          | 429  | Rate limited                                            |
| `ZapturaNotImplementedError`     | 501  | Active engine does not support the call                 |
| `ZapturaServiceUnavailableError` | 503  | Engine did not confirm in time — the only retryable one |
| `ZapturaApiError`                | —    | Any other non-2xx (carries `.status()`)                 |
| `ZapturaTimeoutError`            | —    | Request exceeded the configured timeout                 |

All extend `ZapturaError` (a `RuntimeException`). In a routed deployment only 503 proves the request was never carried out: a forward that fails after the request reached the owner node answers 502 or 504.

## Reliability & security

- **Use HTTPS in production.** The API key is sent as `X-API-Key` on every
  request and is bearer-equivalent — never send it over plaintext `http://`
  outside local development.
- **No automatic retries.** A failed request throws immediately; wrap calls in
  your own backoff if you need retries (especially for `429`). Inject a custom
  `HttpTransport` for retry or observability middleware.
- **Redirects are never followed.** A `3xx` surfaces as an `ZapturaApiError`
  rather than being followed, so the API key is never re-sent to a redirect
  target.
- **Default per-request timeout** is 30 s (configurable). Path segments (chat /
  message ids) are percent-encoded; a base-URL path prefix (e.g. behind a proxy
  at `/v1`) is preserved.

## Development

```bash
cd sdk/java
mvn -B verify        # compile + run the full test suite
```

Tests inject a recording `HttpTransport` and assert on the exact path — so the
regression that would ship a broken `messages/text` path (the real path is
`messages/send-text`) can never recur silently.

## Releasing

Publishing to Maven Central is done by the
[`java-sdk-release.yml`](../../.github/workflows/java-sdk-release.yml) workflow,
which deploys with `mvn -B -Prelease deploy`. The `release` profile attaches the
sources/javadoc jars, GPG-signs every artifact, and auto-publishes via the
Sonatype Central Publishing plugin — a plain `mvn verify` never runs any of it.

One-time setup (repository secrets):

- `MAVEN_CENTRAL_USERNAME` / `MAVEN_CENTRAL_PASSWORD` — the two halves of a
  Sonatype Central Portal user token for the verified `com.asmsafone`
  namespace.
- `GPG_PRIVATE_KEY` — ASCII-armored signing key.
- `GPG_PASSPHRASE` — passphrase for that key.

All four secrets are checked before anything is built, and a missing one **fails
the run**. That is deliberate: skipping the deploy and reporting green is
indistinguishable from a real release in the run list, so configure the secrets
before tagging rather than tagging to see what happens.

Cutting a release:

1. Bump `<version>` in `pom.xml` and land it on `main`.
2. Tag that commit `java-sdk-v<version>` (e.g. `java-sdk-v0.5.0`) and push the
   tag. The SDK has its own version line — the monorepo's `v*` tags are the app
   version and never trigger an SDK publish.
3. The workflow builds, signs, and publishes; Central syncs within a few hours.
