# FlowGen Microservices Architecture Plan

## Goal

Evolve FlowGen from its current Node/Express backend into independently deployable and scalable services without disrupting the existing product. The initial service boundaries are:

1. **Authentication Service** — accounts, credentials, sessions/tokens, and identity.
2. **Course Outline Service** — generates and owns course outlines only.
3. **Lesson Generation Service** — asynchronously generates and owns lesson content.

The AI Tutor is explicitly **disabled for this phase**. Its UI entry points and API route must be unavailable, and no tutor messages should be created or processed. Tutor data can remain in the existing database until a later dedicated design is approved.

## Current Starting Point

The current backend is a Node/Express application using MongoDB, Redis, BullMQ, and a separate lesson worker. It already has useful seams:

- `/auth/*` for signup and login.
- `/course/generate/outline` for outline generation.
- `/course/jobs/lessons` and the lesson worker for asynchronous lesson work.
- `Course`, `Module`, `Lesson`, `User`, and `TutorMessage` MongoDB models.

This is a good candidate for a **strangler migration**: preserve the frontend contract and progressively move one capability at a time behind a gateway. Do not split the database or rewrite every endpoint in one release.

## Target Architecture

```text
                         +-------------------+
                         |     Frontend      |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         | API Gateway / BFF |
                         | auth, routing,    |
                         | rate limits       |
                         +--+-----------+----+
                            |           |
              +-------------+           +--------------+
              v                                        v
  +------------------------+              +---------------------------+
  | Authentication Service |              | Course Outline Service    |
  | users, credentials,    |              | course/module/lesson      |
  | JWT/JWKS, refresh      |              | metadata and outlines     |
  +-----------+------------+              +-------------+-------------+
              |                                         |
              | signed access tokens                    | outline.ready
              v                                         v
      +---------------+                         +-----------------------+
      | Auth database |                         | Event broker / queue  |
      +---------------+                         +-----------+-----------+
                                                            |
                                                            v
                                             +---------------------------+
                                             | Lesson Generation Service |
                                             | API + scalable workers +  |
                                             | AI provider adapter       |
                                             +-------------+-------------+
                                                           |
                                                           v
                                               +-------------------------+
                                               | Lesson database/storage |
                                               +-------------------------+
```

The gateway is the only public backend entry point. Services are private network workloads. AI provider keys exist only in the two generation services, never in the frontend or gateway.

## Service Contracts and Ownership

| Service | Owns | Public responsibility | Scaling driver |
| --- | --- | --- | --- |
| Authentication | user identity, password hashes, OAuth links, refresh-token/session records | signup, login, logout, token refresh, JWKS | login/token traffic |
| Course Outline | course intent, outline, modules, lesson metadata, outline generation status | request/retrieve course outlines | AI outline requests |
| Lesson Generation | lesson-generation jobs, lesson content, provider usage, generation status | enqueue, read status, retrieve lesson content | queue depth and AI latency |

Each service owns its data. Other services refer to records only by immutable IDs (`userId`, `courseId`, `lessonId`) and must not read or write another service’s collections directly.

For the first migration, MongoDB may remain the physical cluster, but use **separate databases/credentials per service**. Treat this as a strict ownership boundary. A future move to separate database clusters should not change service APIs.

## Communication Rules

- **Synchronous HTTP**: frontend → gateway and gateway → service queries/commands that need an immediate validation response.
- **Asynchronous events/jobs**: outline completion and all lesson generation. The user receives a `jobId` and checks status or subscribes to server-sent events.
- **JWT verification**: gateway and internal services verify access tokens using the Authentication Service’s published JWKS. Services never call the auth service for every request.
- **Events are at-least-once**: consumers must be idempotent, with a stable event ID/idempotency key and a processed-event record.
- **Transactional outbox**: write a database change and its outgoing event atomically; publish the event from an outbox relay. This prevents lost `outline.ready` events.

Initial event vocabulary:

```text
course.outline.requested.v1
course.outline.ready.v1
course.outline.failed.v1
lesson.generation.requested.v1
lesson.generation.completed.v1
lesson.generation.failed.v1
```

Keep event payloads small and versioned. Include IDs, status, timestamps, correlation ID, and schema version—never full lesson text or secrets.

## Primary User Flow

```text
1. Frontend calls POST /v1/courses/outlines through the gateway.
2. Gateway verifies the user token and forwards userId plus a request ID.
3. Course Outline Service stores GENERATING, records an outbox event, and returns courseId/job status.
4. Its worker generates the outline, stores modules and lesson metadata, then emits course.outline.ready.v1.
5. The frontend reads the ready outline through the gateway.
6. User requests a lesson. Lesson Generation Service accepts a deduplicated job and returns jobId.
7. A scalable worker generates content, persists it, and emits lesson.generation.completed.v1.
8. Frontend reads lesson content/status through the gateway.
```

The Course Outline Service creates the lesson metadata. The Lesson Generation Service writes only lesson content and generation state. This avoids two services competing to own the same aggregate.

## API Shape (Version 1)

The gateway exposes stable, versioned endpoints. It can temporarily translate existing `/auth` and `/course` paths while the frontend is migrated.

```text
POST /v1/auth/signup
POST /v1/auth/login
POST /v1/auth/refresh
POST /v1/auth/logout

POST /v1/courses/outlines
GET  /v1/courses/{courseId}
GET  /v1/courses

POST /v1/lessons/{lessonId}/generation-jobs
GET  /v1/generation-jobs/{jobId}
GET  /v1/lessons/{lessonId}
GET  /v1/generation-jobs/{jobId}/events
```

Every mutating request accepts `Idempotency-Key`. Every request propagates `X-Request-Id`; services create one if absent and add it to logs, events, and AI-provider calls.

## AI Tutor: Disabled by Design

- Remove or hide all tutor UI routes, buttons, and network calls.
- Gateway returns `404 Not Found` for `/learning/tutor`; do not expose a dormant endpoint that can be accidentally used.
- Do not deploy a tutor worker or give any deployed service tutor-specific AI credentials.
- Retain the `TutorMessage` collection as read-only legacy data. Do not migrate it in this phase.
- Add a regression test that ensures tutor endpoints and UI navigation are unavailable.

Notes can remain only if they are product-critical. Otherwise, defer their ownership decision rather than adding a fourth service prematurely.

## Migration Plan

### Phase 0 — Baseline and contracts

1. Document current endpoint behavior, request/response schemas, and MongoDB collection ownership.
2. Add API contract tests around the existing auth, outline, lesson job, and lesson-read flows.
3. Add request IDs, structured logs, health/readiness endpoints, and basic metrics to the current backend/worker.
4. Disable the tutor feature at the frontend and gateway boundary.

### Phase 1 — Introduce the gateway

1. Deploy an API Gateway/BFF in front of the current backend.
2. Keep existing frontend behavior through gateway routing; do not change all clients at once.
3. Centralize CORS, public rate limits, request-size limits, authentication enforcement, and correlation IDs.
4. Route every service privately; only the gateway is internet-facing.

### Phase 2 — Extract Authentication Service

1. Move signup/login/token issuance and user credential data into the Authentication Service.
2. Publish a JWKS endpoint and use short-lived access tokens plus rotated refresh tokens.
3. Migrate users safely with one-time password verification/re-hash or a forced password-reset plan; decide this before implementation.
4. Update gateway and services to verify tokens locally through JWKS caching.
5. Retire the monolith’s auth route only after contract, security, and migration checks pass.

### Phase 3 — Extract Course Outline Service

1. Move course-outline prompts, AI adapter, course/module creation, and outline status into this service.
2. Transfer ownership of course, module, and lesson-metadata records to its database boundary.
3. Implement the outbox and publish `course.outline.*` events.
4. Route outline and course-read endpoints through the gateway to the new service.
5. Shadow-test generated outlines against the existing flow before fully cutting over.

### Phase 4 — Extract Lesson Generation Service

1. Move BullMQ job handling and lesson-generation worker from the monolith.
2. Make jobs durable, idempotent, retryable, and independently autoscalable.
3. Consume `course.outline.ready.v1` only where automatic lesson preparation is desired; otherwise generate on explicit user request.
4. Move lesson content, generation usage, failures, and provider-specific retry logic into the service.
5. Switch gateway lesson endpoints to the new service, then remove the legacy worker.

### Phase 5 — Production hardening

1. Deploy each service as a separate container image with independent CI/CD and rollback.
2. Add dashboards for request rate, error rate, latency, queue depth, job age, retry count, AI token/cost, and provider failures.
3. Add alerting, dead-letter reprocessing with audit logs, backups, restore tests, load tests, and failure drills.
4. Autoscale APIs on CPU/concurrency and workers on queue depth/job age; cap AI-provider concurrency per provider and per user.

## Security and Reliability Requirements

- Store secrets in a managed secret store; rotate JWT signing and AI-provider keys.
- Use least-privilege database users and separate Redis/queue namespaces per service.
- Enforce per-user quotas and rate limits on both outline and lesson generation to control AI cost.
- Validate all external input and enforce structured AI output schemas before persistence.
- Use timeouts, bounded retries with exponential backoff, circuit breakers, and dead-letter queues for AI calls.
- Encrypt traffic in transit, record audit events for auth/security actions, and avoid logging tokens, prompts containing personal data, or generated private content.
- Health checks must distinguish `liveness` (process alive) from `readiness` (dependencies usable).

## Deployment and Repository Direction

Keep a monorepo initially to reduce operational friction while services are still evolving:

```text
apps/
  api-gateway/
  auth-service/
  course-outline-service/
  lesson-generation-service/
packages/
  api-contracts/
  event-schemas/
  observability/
infra/
  docker/
  compose/
  kubernetes-or-terraform/
docs/
```

Use local Docker Compose for development. For production, run stateless APIs and workers on an orchestrator (for example Kubernetes/ECS/Container Apps), with managed MongoDB/Redis and a managed event broker when queue throughput or durability exceeds the current Redis/BullMQ operating envelope.

## Decisions to Make Before Implementation

1. Identity approach: retain Auth0 as the authentication authority or operate the new Authentication Service as the authority. Do not run two token issuers indefinitely.
2. Queue/event platform: retain Redis/BullMQ initially or introduce a durable broker (for example RabbitMQ, SQS/SNS, or Kafka) based on expected throughput and operational capability.
3. Course visibility: are outlines private per user, reusable templates, or both? This determines course ownership and authorization rules.
4. Lesson trigger: explicit learner request, automatic pre-generation after outline completion, or a paid-plan-dependent mix.
5. Data retention and deletion requirements for generated content, AI prompts, usage records, and legacy tutor messages.

## Definition of Done for This Architecture

- Authentication, outline generation, and lesson generation deploy and scale independently.
- No service accesses another service’s data store directly.
- Lesson generation is asynchronous, idempotent, observable, retryable, and cost-limited.
- Gateway is the sole public API surface and enforces identity, quotas, and request tracing.
- AI Tutor is inaccessible in UI and API tests.
- The migration has zero-downtime cutover and rollback procedures for each extracted service.
