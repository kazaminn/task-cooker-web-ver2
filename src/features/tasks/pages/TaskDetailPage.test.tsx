import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDetailPage } from './TaskDetailPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  createComment: vi.fn(),
  useTaskQuery: vi.fn(),
  useTaskMutations: vi.fn(),
  useCommentsQuery: vi.fn(),
  useCommentMutations: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useOutletContext: () => ({
      project: {
        id: 'project-1',
        teamId: 'team-1',
        memberIds: ['user-1'],
      },
    }),
    useParams: () => ({
      projectId: 'project-1',
      taskId: 'task-1',
    }),
  };
});

vi.mock('../hooks/useTasks', () => ({
  useTaskQuery: mocks.useTaskQuery,
  useTaskMutations: mocks.useTaskMutations,
}));

vi.mock('../hooks/useComments', () => ({
  useCommentsQuery: mocks.useCommentsQuery,
  useCommentMutations: mocks.useCommentMutations,
}));

vi.mock('@/ui/components/Button', () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}));

vi.mock('@/ui/components/TextField', () => ({
  TextField: ({
    value,
    onChange,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/ui/components/TextArea', () => ({
  TextArea: ({
    value,
    onChange,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/ui/components/Select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@/ui/components/DatePicker', () => ({
  DatePicker: () => <div>date-picker</div>,
}));

vi.mock('../components/CommentThread', () => ({
  CommentThread: () => <div>comments</div>,
}));

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
    mocks.createComment.mockResolvedValue(undefined);
    mocks.useTaskMutations.mockReturnValue({
      update: mocks.update,
      remove: mocks.remove,
    });
    mocks.useCommentsQuery.mockReturnValue({ comments: [] });
    mocks.useCommentMutations.mockReturnValue({
      create: mocks.createComment,
    });
  });

  it('shows a loading state while the task is loading', () => {
    mocks.useTaskQuery.mockReturnValue({
      task: undefined,
      isLoading: true,
    });

    render(<TaskDetailPage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('saves an edited title', async () => {
    const user = userEvent.setup();
    mocks.useTaskQuery.mockReturnValue({
      task: {
        id: 'task-1',
        displayId: 11,
        title: 'Old title',
        description: 'Current description',
        status: 'prep',
        priority: 'medium',
        assigneeId: 'user-1',
        dueDate: new Date('2026-03-22T00:00:00Z'),
      },
      isLoading: false,
    });

    render(<TaskDetailPage />);

    await user.click(screen.getAllByText('編集')[0]);
    await user.clear(screen.getByLabelText('タイトル'));
    await user.type(screen.getByLabelText('タイトル'), 'New title');
    await user.click(screen.getByText('保存'));

    expect(mocks.update).toHaveBeenCalledWith('task-1', {
      title: 'New title',
    });
  });

  it('deletes the task and redirects back to the task list', async () => {
    const user = userEvent.setup();
    mocks.useTaskQuery.mockReturnValue({
      task: {
        id: 'task-1',
        displayId: 11,
        title: 'Delete me',
        description: '',
        status: 'order',
        priority: 'medium',
      },
      isLoading: false,
    });

    render(<TaskDetailPage />);

    await user.click(screen.getByText('削除'));
    await user.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(mocks.remove).toHaveBeenCalledWith('task-1');
      expect(mocks.navigate).toHaveBeenCalledWith('/projects/project-1/tasks');
    });
  });
});
