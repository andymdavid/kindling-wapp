# Kindling Frontend Prototype

Kindling is a frontend prototype for a salesperson decision feed. It explores the daily deck, prospect card, dossier, reply queue, outreach review, and model-aware command/chat surfaces.

This repo is currently a UX experimentation space. The production data loops and agent plumbing are expected to live elsewhere, though this prototype keeps a small local WApp backend from the starter app so the frontend can run and the existing chat route remains available.

## What Is Included

- Deck-first home screen with stateful greeting.
- Focused prospect card and overview carousel.
- Contextual dossier, replies, offerings, and pipeline/admin surfaces.
- Editable email preview with copy and `mailto:` handoff.
- Bottom command/chat surface with active-card context.
- Local mock data projected through the documented Kindling data model.

## Data Model

`DataModel.md` describes the intended backend/API contract for owner companies, market profiles, companies, people, sources, matches, outreach drafts, feedback, and activities.

The frontend currently uses local seed data and an adapter in `public/app.js` to project that data into card-ready UI state. It does not require a production Kindling API to run.

## Run Locally

Install dependencies:

```sh
bun install
```

Start the app:

```sh
bun run start
```

For development with reloads:

```sh
bun run dev
```

Then open the printed local URL. The main prototype is available via the preview flow or directly at:

```txt
/act
```

## Checks

```sh
bun run check
```

## Scope Notes

This is not the final production backend. The current implementation is intentionally frontend-heavy and uses mock/model-shaped data to test UX decisions before the real Kindling services are connected.
