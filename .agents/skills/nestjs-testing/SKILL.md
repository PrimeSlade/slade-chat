---
name: nestjs-testing
description: Write and review tests for NestJS services/controllers/modules using Jest and Supertest. Use to classify and implement unit, integration, and e2e tests with project-accurate test commands and stable mocking boundaries.
---

# NestJS Testing Skill

Use this skill when the user asks to add, fix, review, or improve tests for a NestJS codebase.

This skill mirrors the global `test_agent` role and always classifies tests into:

- unit
- integration
- e2e

## Delegation Rule

- Default behavior: delegate implementation and test authoring work to the global `test_agent`.
- Treat `test_agent` as the execution engine for test tasks, and keep this skill focused on NestJS-specific constraints and quality bar.
- Only skip delegation when the user explicitly asks to avoid sub-agents.

## Scope and Defaults

- Target framework: NestJS 11 + Jest + `@nestjs/testing` + Supertest.
- In this repo, backend tests live under `backend/`.
- Default behavior: add or update tests first, avoid changing production code unless the user explicitly requests implementation changes.

## Repo-Specific Commands

Run commands from `backend/`:

```bash
pnpm test
pnpm test -- src/path/to/file.spec.ts
pnpm test:watch
pnpm test:cov
pnpm test:e2e
pnpm test:e2e -- test/path/to/file.e2e-spec.ts
```

## Test Type Classifier

Choose the smallest test type that can prove the behavior:

1. Unit test

- Single class/function behavior.
- Mock collaborators (`useValue`, `useFactory`, `jest.fn()`).
- No network/DB side effects.

2. Integration test

- Multiple providers/modules wired with Nest DI.
- Real module composition with selected fakes at boundaries.
- Useful for service + repository + mapper flows.

3. E2E test

- Boot `INestApplication` and hit HTTP endpoints with Supertest.
- Validate status, payload shape, and core auth/validation behavior.

## Workflow

1. Identify behavior under test

- Convert request into explicit assertions (input, output, side effects, errors).

2. Map boundaries

- Service tests: mock repositories/external APIs.
- Controller tests: mock service layer.
- E2E tests: use app module and keep assertions user-facing.

3. Build deterministic fixture setup

- Use `Test.createTestingModule(...)`.
- Keep one focused expectation per test case when possible.
- Use stable data builders to avoid duplicated literals.

4. Implement and run targeted tests first

- Run only changed spec files, then broader suite.

5. Harden coverage for failure paths

- Add negative cases: invalid input, not found, unauthorized, dependency error.

## NestJS Patterns

### Unit: Service

- Build module with service + mocked providers.
- Assert calls to dependencies and returned values.
- Prefer explicit token-based provider mocks for repos/adapters.

### Unit: Controller

- Instantiate controller via testing module.
- Mock service contract only.
- Verify request DTO mapping and response mapping expectations.

### Integration

- Import module under test when practical.
- Replace only external boundaries (DB, Redis, HTTP clients, queues).
- Assert behavior through public methods/events, not private internals.

### E2E

- Create app from `AppModule` (or feature test module).
- `await app.init()` in setup and `await app.close()` in teardown.
- Use Supertest for endpoint behavior and contract assertions.

## Quality Bar

- Tests are deterministic and order-independent.
- No hidden shared state across test cases.
- Mocks are minimal and reflect real contracts.
- Assertions verify behavior, not implementation details.
- Include success path + at least one failure path for changed logic.

## Review Mode (when user asks for review)

Prioritize findings in this order:

1. Behavioral gaps (missing assertions / false positives)
2. Incorrect boundaries (over-mocking or under-mocking)
3. Flaky patterns (timers, async race, global state)
4. Maintainability (duplication, unreadable fixtures)

Report findings with file and line references, then recommend minimal fixes.
