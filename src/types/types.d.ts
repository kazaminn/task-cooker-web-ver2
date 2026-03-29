export interface UserPreferences {
  theme: 'tavern-light' | 'tavern-dark';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
}

export interface User {
  readonly id?: string; // Firestore doc ID (matches Auth UID)
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  preferences: UserPreferences;
  lastActiveProjectId?: string;
  lastActiveTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TeamType = 'personal' | 'team';

export interface Team {
  readonly id?: string; // Server generated doc ID
  name: string;
  type: TeamType;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'planning' | 'cooking' | 'on_hold' | 'completed';

export interface Project {
  readonly id?: string; // Server generated doc ID
  slug: string; // User-defined unique identifier for URL
  teamId: string;
  name: string;
  overview: string; // Markdown content
  status: ProjectStatus;
  ownerId: string;
  memberIds: string[];
  githubRepo?: string; // Linked GitHub repository "owner/repo" (reference only)
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'order' | 'prep' | 'cook' | 'serve';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  readonly id?: string; // Firestore doc ID (UUID)
  displayId: number; // User-facing sequential ID (#1, #2, ...)
  projectRef: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // Matches User.id
  dueDate?: Date;
  linkedTaskIds: string[]; // Firestore doc IDs of linked tasks
  position: number; // Order index for sorting
  githubIssueNumber?: number; // GitHub Issue number (reference only, written by sync skill)
  githubRepo?: string; // "owner/repo" format (reference only, written by sync skill)
  createdAt: Date;
  updatedAt: Date;
}

export interface Mix {
  readonly id?: string; // Server generated doc ID
  projectRef: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  title: string;
  status: 'open' | 'closed';
  isPublic: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MixPost {
  readonly id?: string; // Server generated doc ID
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  content: string; // Markdown content
  createdAt: Date;
}

export type ActivityType =
  | 'task_create'
  | 'task_update'
  | 'task_serve'
  | 'task_delete'
  | 'mix_create'
  | 'mix_post_create'
  | 'project_create'
  | 'project_update'
  | 'project_delete'
  | 'team_create'
  | 'user_signup'
  | 'profile_update';

export interface Activity {
  readonly id?: string; // Server generated doc ID
  teamId?: string;
  projectId?: string;
  type: ActivityType;
  userId: string;
  userName: string;
  text: string; // Log message
  createdAt: Date;
}

/**
 * Form Input Types
 */
export interface SignupFormInput extends Pick<User, 'email' | 'displayName'> {
  password?: string;
}

export interface LoginFormInput extends Pick<User, 'email'> {
  password?: string;
}

export type ProfileFormInput = Pick<User, 'displayName' | 'bio' | 'photoURL'>;
export type TeamFormInput = Pick<Team, 'name' | 'type'>;
export type ProjectFormInput = Pick<
  Project,
  'slug' | 'name' | 'overview' | 'status'
>;
export type TaskFormInput = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate'
>;
export type MixFormInput = Pick<Mix, 'title' | 'isPublic'>;
export type MixPostFormInput = Pick<MixPost, 'content'>;
export type ActivityFormInput = Pick<
  Activity,
  'type' | 'teamId' | 'projectId' | 'text' | 'userId' | 'userName'
>;

/**
 * Filter Types
 */
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string; // Filter by specific user ID
  searchQuery?: string;
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
}

/**
 * UI State Management Types
 */
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export type ModalType =
  | 'project_create'
  | 'team_create'
  | 'profile_edit'
  | 'none';

export type DrawerType =
  | 'task_upsert' // Handles Create, Edit, and Detail view
  | 'mix_thread'
  | 'mobile_nav'
  | 'none';

export type ProjectTab = 'overview' | 'tasks' | 'mixes' | 'settings';

export interface UIStateData {
  isSidebarCollapsed: boolean;
  isUserMenuOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  activeModal: ModalType;
  activeDrawer: DrawerType;
  selectedTaskId?: string;
  selectedMixId?: string;
  activeTeamId?: string;
  activeProjectId?: string;
  activeProjectTab: ProjectTab;
}
