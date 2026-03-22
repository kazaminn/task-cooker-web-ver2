export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (userId: string) => [...queryKeys.projects.all, userId] as const,
    detail: (projectId: string | undefined) =>
      [...queryKeys.projects.all, 'detail', projectId] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (projectId: string | undefined) =>
      [...queryKeys.tasks.all, projectId] as const,
    profile: (userId: string | undefined) =>
      [...queryKeys.tasks.all, 'profile', userId] as const,
    detail: (projectId: string | undefined, taskId: string | undefined) =>
      [...queryKeys.tasks.all, 'detail', projectId, taskId] as const,
    dashboard: (projectIds: string[] = []) =>
      [...queryKeys.tasks.all, 'dashboard', ...projectIds] as const,
  },
  comments: {
    all: ['comments'] as const,
    list: (projectId: string | undefined, taskId: string | undefined) =>
      [...queryKeys.comments.all, projectId, taskId] as const,
  },
  teams: {
    all: ['teams'] as const,
    list: (userId: string) => [...queryKeys.teams.all, userId] as const,
    detail: (teamId: string | undefined) =>
      [...queryKeys.teams.all, 'detail', teamId] as const,
  },
  activities: {
    all: ['activities'] as const,
    dashboard: (projectIds: string[] = []) =>
      [...queryKeys.activities.all, 'dashboard', ...projectIds] as const,
    user: (userId: string | undefined) =>
      [...queryKeys.activities.all, 'user', userId] as const,
    project: (projectId: string | undefined, limitCount: number) =>
      [...queryKeys.activities.all, 'project', projectId, limitCount] as const,
  },
} as const;
