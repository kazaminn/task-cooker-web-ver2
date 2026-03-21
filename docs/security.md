# Security

last-updated: 2026-03-21

## Firestore Security Rules

トップレベルコレクション構成に対応した memberIds ベースのアクセス制御。

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isProjectMember(projectId) {
      return request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
    }

    match /projects/{projectId} {
      allow read, write: if isProjectMember(projectId);

      match /{document=**} {
        allow read, write: if isProjectMember(projectId);
      }
    }

    match /teams/{teamId} {
      allow read: if request.auth.uid in resource.data.memberIds;
      allow update: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

## Client side route

Use the `ProtectedRoute` component to determine the user's logged-in status, and branch the route depending on the status.

This prevents users who are not logged in from accessing protected pages. See `routing.md` for the full route configuration.
