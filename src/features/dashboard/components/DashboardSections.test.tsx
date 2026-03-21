import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttentionSection } from './AttentionSection';
import { DashboardTaskCard } from './DashboardTaskCard';
import { KitchenLogsSection } from './KitchenLogsSection';
import { QuickAddSection } from './QuickAddSection';
import { RecentProjectsSection } from './RecentProjectsSection';
import { StoveSection } from './StoveSection';

const mocks = vi.hoisted(() => ({
  useDashboardQuickAdd: vi.fn(),
}));

vi.mock('../hooks/useDashboardQuickAdd', () => ({
  useDashboardQuickAdd: mocks.useDashboardQuickAdd,
}));

vi.mock('@/ui/components/Button', () => ({
  Button: ({
    children,
    onPress,
    isDisabled,
    className,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onPress}
      disabled={isDisabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/ui/components/TextField', () => ({
  TextField: ({
    value,
    onChange,
    isDisabled,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
    isDisabled?: boolean;
  }) => (
    <input
      {...props}
      disabled={isDisabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe('dashboard sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDashboardQuickAdd.mockReturnValue({
      quickAddText: 'Boil pasta',
      setQuickAddText: vi.fn(),
      submitQuickAdd: vi.fn(),
      isPending: false,
    });
  });

  it('submits quick add through the dashboard hook instead of calling raw api code', () => {
    const submitQuickAdd = vi.fn().mockResolvedValue(undefined);
    mocks.useDashboardQuickAdd.mockReturnValue({
      quickAddText: 'Boil pasta',
      setQuickAddText: vi.fn(),
      submitQuickAdd,
      isPending: false,
    });

    render(<QuickAddSection projectId="project-1" teamId="team-1" />);

    const form = screen
      .getByRole('textbox', { name: 'クイック追加' })
      .closest('form');
    expect(form).not.toBeNull();
    if (!form) {
      return;
    }

    fireEvent.submit(form);

    expect(submitQuickAdd).toHaveBeenCalledTimes(1);
  });

  it('shows disabled quick add controls when no default project is available', () => {
    render(
      <QuickAddSection projectId={undefined} teamId={undefined} disabled />
    );

    expect(
      screen.getByRole('textbox', { name: 'クイック追加' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: '注文を追加' })).toBeDisabled();
  });

  it('opens the selected recent project when a recipe card is clicked', async () => {
    const user = userEvent.setup();
    const onOpenProject = vi.fn();

    render(
      <RecentProjectsSection
        isLoading={false}
        onBrowseProjects={vi.fn()}
        onOpenProject={onOpenProject}
        projects={[
          {
            id: 'project-1',
            name: 'Alpha',
            status: 'cooking',
            totalTasks: 6,
            servedTasks: 2,
            activeTasks: 4,
          },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /Alpha/ }));

    expect(onOpenProject).toHaveBeenCalledWith('project-1');
  });

  it('uses dashboard-local task cards for stove tasks and routes clicks through the callback', async () => {
    const user = userEvent.setup();
    const onOpenTask = vi.fn();

    render(
      <StoveSection
        isLoading={false}
        onOpenTask={onOpenTask}
        tasks={[
          {
            id: 'task-1',
            displayId: 8,
            projectRef: 'project-1',
            teamId: 'team-1',
            title: 'Reduce sauce',
            description: '',
            status: 'cook',
            priority: 'high',
            linkedTaskIds: [],
            position: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /Reduce sauce/ }));

    expect(onOpenTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', title: 'Reduce sauce' })
    );
  });

  it('renders a dashboard task card with app-specific metadata labels', () => {
    render(
      <DashboardTaskCard
        onPress={vi.fn()}
        task={{
          id: 'task-1',
          displayId: 12,
          projectRef: 'project-1',
          teamId: 'team-1',
          title: 'Plate dessert',
          description: '',
          status: 'serve',
          priority: 'medium',
          dueDate: new Date('2026-03-22T00:00:00Z'),
          linkedTaskIds: [],
          position: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(screen.getByText('Plate dessert')).toBeInTheDocument();
    expect(screen.getByText('提供済み')).toBeInTheDocument();
    expect(screen.getByText('3/22')).toBeInTheDocument();
  });

  it('shows kitchen logs and attention empty states in clear language', () => {
    render(
      <>
        <KitchenLogsSection activities={[]} />
        <AttentionSection tasks={[]} onOpenTask={vi.fn()} />
      </>
    );

    expect(
      screen.getByText('アクティビティはまだありません')
    ).toBeInTheDocument();
    expect(screen.getByText('期限切れタスクはありません')).toBeInTheDocument();
  });
});
