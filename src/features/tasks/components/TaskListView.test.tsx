import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskListView } from './TaskListView';

const navigate = vi.fn();
const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('@/api/users', () => ({
  getUser,
}));

describe('TaskListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue(null);
  });

  it('renders tasks as two-line rows with display id, status, priority, and due date', () => {
    render(
      <TaskListView
        projectId="project-1"
        tasks={[
          {
            id: 'task-1',
            displayId: 12,
            projectRef: 'project-1',
            teamId: 'team-1',
            title: 'Plate dessert',
            description: '',
            status: 'serve',
            priority: 'high',
            dueDate: new Date('2026-03-22T00:00:00Z'),
            linkedTaskIds: [],
            position: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
      />
    );

    expect(screen.getByText('Plate dessert')).toBeInTheDocument();
    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(screen.getByText('提供済み')).toBeInTheDocument();
    expect(screen.getByLabelText('高')).toBeInTheDocument();
    expect(screen.getByText('期限 3/22')).toBeInTheDocument();
  });

  it('renders the assignee display name when user data is available', async () => {
    getUser.mockResolvedValue({
      id: 'user-alice',
      displayName: 'アリス（姫）',
      email: 'alice@example.com',
      preferences: { theme: 'system', fontSize: 'medium', highContrast: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(
      <TaskListView
        projectId="project-1"
        tasks={[
          {
            id: 'task-9',
            displayId: 9,
            projectRef: 'project-1',
            teamId: 'team-1',
            title: 'Prep garnish',
            description: '',
            status: 'prep',
            priority: 'medium',
            assigneeId: 'user-alice',
            linkedTaskIds: [],
            position: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
      />
    );

    expect(await screen.findByText('アリス（姫）')).toBeInTheDocument();
  });

  it('navigates to the task detail when a row is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskListView
        projectId="project-9"
        tasks={[
          {
            id: 'task-3',
            displayId: 3,
            projectRef: 'project-9',
            teamId: 'team-1',
            title: 'Prep broth',
            description: '',
            status: 'prep',
            priority: 'urgent',
            linkedTaskIds: [],
            position: 2000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /Prep broth/ }));

    expect(navigate).toHaveBeenCalledWith('/projects/project-9/tasks/task-3');
  });

  it('shows an empty state when no tasks are available', () => {
    render(<TaskListView projectId="project-1" tasks={[]} />);

    expect(screen.getByText('タスクはまだありません')).toBeInTheDocument();
  });
});
