import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCard } from './TaskCard';

const navigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders compact metadata and navigates on click', async () => {
    const user = userEvent.setup();

    render(
      <TaskCard
        projectId="project-1"
        variant="compact"
        task={{
          id: 'task-1',
          displayId: 1,
          projectRef: 'project-1',
          teamId: 'team-1',
          title: 'Bake pie',
          status: 'order',
          priority: 'high',
          dueDate: new Date('2026-03-22T00:00:00Z'),
          linkedTaskIds: [],
          position: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    expect(screen.getByText('Bake pie')).toBeInTheDocument();
    expect(screen.getByText('3/22')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(navigate).toHaveBeenCalledWith('/projects/project-1/tasks/task-1');
  });

  it('renders the full card with display id and status label', () => {
    render(
      <TaskCard
        projectId="project-2"
        variant="full"
        task={{
          id: 'task-7',
          displayId: 7,
          projectRef: 'project-2',
          teamId: 'team-2',
          title: 'Plate ramen',
          status: 'serve',
          priority: 'medium',
          linkedTaskIds: [],
          position: 2000,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText('Plate ramen')).toBeInTheDocument();
    expect(screen.getAllByText('提供済み')[0]).toBeInTheDocument();
  });
});
