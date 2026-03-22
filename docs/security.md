# Security

last-updated: 2026-03-22

## Firestore Security Rules

The source of truth is [firestore.rules](/home/mikan/projects/task-cooker/apps/task-cooker-web/firestore.rules).

Current policy summary:

- `users/{userId}`
  - authenticated users can read profiles
  - only the signed-in user can update their own profile
- `teams/{teamId}`
  - team members can read
  - only the owner can update or delete
- `projects/{projectId}`
  - only project members can read
  - create requires the signed-in user to be included in `memberIds`
  - members can update and delete
- `projects/{projectId}/tasks/{taskId}`
  - only project members can read and write
- `projects/{projectId}/activities/{activityId}`
  - only project members can read
  - create additionally requires:
    - `request.resource.data.userId == request.auth.uid`
    - `request.resource.data.projectId == projectId`
- task and activity access is project-scoped
- dashboard / profile style aggregation should subscribe per project, not via unscoped collection group reads

## Indexes

The source of truth is [firestore.indexes.json](/home/mikan/projects/task-cooker/apps/task-cooker-web/firestore.indexes.json).

This repository currently tracks indexes for:

- project list queries by `memberIds` + `updatedAt`
- ordered task queries
- collection group task status queries
- activity timeline queries
- user activity queries
- ordered task comment queries

## How To Verify

Run the automated rules test with the emulator:

```bash
# start the emulator in another terminal if it is not already running
pnpm emulators

# then run the rules test
pnpm test:firestore-rules
```

This test connects to the running Firestore emulator, loads `firestore.rules`, and executes [firestore.rules.test.ts](/home/mikan/projects/task-cooker/apps/task-cooker-web/src/firestore.rules.test.ts).

The current automated coverage checks:

- unauthenticated profile reads are denied
- users can update only their own profile
- project members can read their own tasks
- non-members cannot read other projects' tasks
- activity writes cannot spoof `userId`
