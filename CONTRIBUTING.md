# Contributing to Traillearn

Thank you for helping us build a platform that helps young people orient, integrate internationally, and find studies, scholarships, mentors, jobs, and events—powered by AI and community forums.

TL;DR
1. Fork → branch → PR.
2. Follow the Code of Conduct, Conventional Commits, and the PR checklist.
3. Add tests, types, and docs for any non-trivial change.

## 0) Code of Conduct

We follow a respectful, inclusive Code of Conduct (based on Contributor Covenant).
Be kind. No harassment, doxxing, hate speech, or personal attacks.

## 1) Monorepo Architecture
Here is a description of the repository architecture

```
/apps
  /web        → Next.js + TypeScript + Tailwind + shadcn/ui
  /api        → NestJS + TypeScript + Prisma (PostgreSQL)
  /e2e        → Playwright (end-to-end tests)

 /packages
  /ui         → design system (shadcn/ui-based components, tokens)
  /config     → shared configs (eslint, prettier, tsconfig, commitlint)
  /types      → shared types (zod/ts)
  /schemas    → zod/prisma schemas (scholarships, events, mentors, profiles)
```


- Services (via Docker):
- PostgreSQL (primary DB)
- Redis (optional; jobs/cache)
- Meilisearch (optional; scholarships & content search)

## 2) Prerequisites

- Node >= 20
- Docker + Docker Compose
- Git (and make optional)

## 3) Getting Started (Local)

## 4) Git Workflow

- GitHub Flow (simple trunk-based):
- Branch from main: feat/scholarship-deadlines, fix/auth-timeout, docs/contributing
- Keep PRs small; open as Draft if WIP
- 1 approval + green CI → squash merge to main
- Conventional Commits for messages:
  - feat(web): scholarship card with deadline badges
  - fix(api): handle null eligibility in scholarship DTO
  - chore: bump prisma to 5.15
  - docs: add issue template
  - refactor(ui): extract tag component
  - test(e2e): add mentor matching flow

## 5) Quality Gates & Tooling

## 6) Frontend Guidelines (apps/web)

- Stack: Next.js + TS + Tailwind + shadcn/ui
- Accessibility: AA contrast, visible focus, proper ARIA roles, keyboard navigation
- i18n: fr/en keys (feature.key_name), default fallback en
- Performance: Next/Image, lazy-loading, memoization, RSC where applicable
- UX: consistent spacing, tokens, responsive design (mobile-first)

## 7) API Guidelines (apps/api)

- NestJS with feature modules
- Prisma for ORM; versioned migrations; deterministic seed
- Validation: zod/class-validator on all inputs
- Auth: JWT + sessions; RBAC roles: student, mentor, partner, admin
- Observability: pino logs; OpenTelemetry (optional)
- Background jobs: BullMQ/Redis for emails, re-index, scholarship deadline alerts
- Error handling: typed errors, consistent API error envelope

## 8) Issues & Pull Requests

- Create an issue : Clear title + context + acceptance criteria
- Labels: type:bug|feat|docs|chore, area:web|api|data|infra|ai, priority P0..P3 : “Definition of Ready”: inputs, constraints, dependencies
- PR checklist
 - Conventional commit title
 - Problem → solution described
 - Screenshots / video (for UI)
 - Tests added/updated and passing
 - Types strict; lints clean
 - Docs/Storybook/ADR updated if architecture changes
 - DB migrations/seed included + backward-compatible where possible

- Templates (put in .github/ as needed) :
```
issue.md
### Context
...

### Acceptance criteria
- [ ] ...

### Repro steps (if bug)
1. ...
2. ...

### Technical context
Version, env, logs, related PRs…
```

```
pr.md
## Purpose
...

## Changes
- ...

## Tests
- ...

## Screenshots
...

## Notes
Breaking changes? Migrations? Feature flags?
```

## 9) Releases

- SemVer: vMAJOR.MINOR.PATCH
- Changelog auto-generated from Conventional Commits
- Tag on main via CI after review
- Environments: dev → staging → prod (promotions through CI/CD)

## 10) Security & Responsible Disclosure

- Report vulnerabilities privately to `coachprotalent@gmail.com`
- Do not open a public issue with exploitable details.

## 10) License & Rights

By contributing, you agree your work is licensed under the project’s license (see LICENSE).
A CLA may be requested for substantial contributions (we’ll inform you in the PR).

## 11) Command Cheatsheet


If you need help, open an issue with label type:question or join the #contrib channel on our chat.
Thanks for helping students find their path! 🙌
