# Task Cooker

A task management application using cooking metaphors for task statuses.

_This is a learning project focused on modern React architecture patterns._

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Firebase (Auth & Firestore)
- **UI**: Tailwind CSS 4.x + React Aria Components
- **State Management**: TanStack Query + Zustand
- **Form Validation**: React Hooks Form + Zod

## Task Metaphors

- `order` - Not started
- `prep` - In preparation
- `cook` - In progress
- `serve` - Completed

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Firebase / Emulator

This app uses Firebase Auth and Firestore.

- Firebase config is loaded from `.env.*`
- local emulator config is defined in [firebase.json](/home/mikan/projects/task-cooker/apps/task-cooker-web/firebase.json)
- Firestore rules live in [firestore.rules](/home/mikan/projects/task-cooker/apps/task-cooker-web/firestore.rules)
- Firestore indexes live in [firestore.indexes.json](/home/mikan/projects/task-cooker/apps/task-cooker-web/firestore.indexes.json)

Start the local emulators:

```bash
pnpm emulators
```

Seed local data into the emulator:

```bash
pnpm seed
```

## Verification

```bash
# App test suite
pnpm test

# Type and lint checks
pnpm typecheck
pnpm lint

# Firestore security rules verification
pnpm test:firestore-rules
```

`pnpm test:firestore-rules` expects the Firestore emulator to already be running and verifies core membership / profile / activity constraints against the checked-in rules file.

More detail is in [docs/security.md](/home/mikan/projects/task-cooker/apps/task-cooker-web/docs/security.md).
