# Teams Premium Feature

## 1. Overview
The **Teams** module unlocks collaborative, enterprise-grade functionality for the Bookmark application. It enables groups of users to curate, organise and discuss shared bookmark collections in real-time while providing the security, compliance and integration capabilities required by modern organisations.

Key value propositions:
* **Shared productivity** – collaborate on bookmark collections with live presence, annotations and commenting.
* **Enterprise governance** – fine-grained roles, audit logs, SSO/SCIM provisioning and usage analytics.
* **Operational efficiency** – scheduled reminders, automated exports, third-party alerts and AI-powered insights.

---

## 2. Directory Structure
```
src/features/teams/
├── components/   # React/Next UI components (TeamDashboard, KnowledgeGraph, …)
├── hooks/        # Reusable React hooks (useTeamData, useRealTimeUpdates, …)
├── services/     # Front-end + shared client services (API clients, WebSocket handlers)
├── models/       # Database ORMs / Prisma schemas & TypeScript domain models
├── pages/        # Next.js route segments (/teams, /teams/[id], etc.)
└── tests/        # Unit, integration & component test suites
```

### Purpose of Each Sub-Directory
| Folder | Purpose |
| ------- | ------- |
| `components/` | Presentational & container components using Tailwind + shadcn/ui. |
| `hooks/` | Custom React hooks for state management, data fetching and RBAC checks. |
| `services/` | Client-side API / WebSocket helpers, background job interfaces, integration SDK wrappers. |
| `models/` | Prisma/TypeORM schema definitions & TypeScript interfaces shared across client/server. |
| `pages/` | Next.js page & layout files powering the `/teams` routes. |
| `tests/` | Jest + React Testing Library + Supertest suites with mocks & fixtures. |

---

## 3. Planned Sub-Features
| Feature | Description |
| ------- | ----------- |
| Shared Bookmark Collections | Create, update, reorder and share bookmark collections scoped to a team. |
| Real-Time Collaboration | Live cursors, presence indicators and optimistic updates via WebSockets. |
| Teams Knowledge Graph | D3/Vis.js powered visual graph showing relationships between bookmarks, tags & members. |
| Bookmark Status in DNA Profile | Track and surface bookmark health (valid, broken, redirected) inside user profiles. |
| Workspace Access Control | Home workspace with granular role-based permissions (Owner, Admin, Editor, Viewer). |
| Data-Centre Reminders | Scheduled link checking & sync cycles with notifications for stale or broken links. |
| Annotation & Commenting | Rich-text comments with @-mentions, emoji reactions & thread history. |
| Templates Gallery | Pre-built bookmark collection templates (onboarding, engineering, design, etc.). |
| Notifications & Activity Feed | In-app, email, Slack/MSTeams alerts summarising team activity. |
| Role-Based Permissions | RBAC guard layer across UI components & API endpoints. |
| Audit Logs & Version History | Immutable event log plus diff-based history for regulatory compliance. |
| SAML/SSO & SCIM Provisioning | Enterprise identity & user provisioning support. |
| Slack/Microsoft Teams Integration | Outgoing webhooks & slash commands for link sharing and notifications. |
| Usage Analytics & Engagement Reports | Dashboards showing top contributors, active collections & adoption trends. |
| Export / Import | CSV/JSON export, bulk import and scheduled off-line backups. |
| AI-Powered Insights | ML service surfacing stale links, content gaps and recommended contributors. |

---

## 4. Tech Stack & Integration Points
* **Frontend**: Next.js / React 18 + TypeScript, Tailwind CSS, shadcn/ui, Zustand or React Context for state, TanStack Query for data fetching, Socket.io (or Supabase Realtime/Pusher) for live events.
* **Backend**: NestJS 10 (or Express.js) with TypeScript, REST + WebSocket gateways, Zod/Joi validation, class-validator pipes.
* **Database**: PostgreSQL + Prisma ORM (or TypeORM). Migrations tracked in `backend/database`.
* **Real-Time Layer**: Socket.io, Redis pub/sub.
* **Background Jobs**: BullMQ (Redis) or Agenda (Mongo) for reminders, exports, audit log aggregation.
* **Auth**: JWT/OAuth flows via `next-auth`, RBAC via custom `PermissionsGuard`. Feature flags via LaunchDarkly/Split.io.
* **Integrations**: Slack & Microsoft Teams webhooks, SAML (SAML 2.0) / SCIM v2, SendGrid (email), Twilio (SMS).
* **Testing**: Jest, React Testing Library, Supertest, msw (mock service worker). CI via GitHub Actions (lint → typecheck → tests → preview deploy).

---

> **Next steps**: Implement domain models (`models/`), scaffold API routes (`services/` + backend controllers), and build the initial UI skeleton (`components/` + `pages/`).