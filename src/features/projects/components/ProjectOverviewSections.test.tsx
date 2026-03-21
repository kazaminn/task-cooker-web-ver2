import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectMetaGrid } from './ProjectMetaGrid';
import { ProjectOverviewEditor } from './ProjectOverviewEditor';
import { ProjectProgressSection } from './ProjectProgressSection';
import { ProjectRecentActivitySection } from './ProjectRecentActivitySection';

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

describe('project overview sections', () => {
  it('renders project metadata that explains ownership and freshness at a glance', () => {
    render(
      <ProjectMetaGrid
        project={{
          id: 'project-1',
          slug: 'alpha',
          teamId: 'team-1',
          name: 'Alpha',
          overview: 'Overview',
          status: 'cooking',
          ownerId: 'user-1',
          memberIds: ['user-1', 'user-2'],
          createdAt: new Date('2026-03-20T00:00:00Z'),
          updatedAt: new Date('2026-03-22T09:30:00Z'),
        }}
      />
    );

    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2026/03/20')).toBeInTheDocument();
  });

  it('saves edited overview text through the provided callback', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectOverviewEditor overview="Current overview" onSave={onSave} />
    );

    await user.click(screen.getByRole('button', { name: '編集' }));
    await user.clear(screen.getByLabelText('概要'));
    await user.type(screen.getByLabelText('概要'), 'Updated overview');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith('Updated overview');
  });

  it('renders progress counts for each task status so project health is easy to read', () => {
    render(
      <ProjectProgressSection
        total={10}
        served={4}
        statusCounts={{
          order: 2,
          prep: 2,
          cook: 2,
          serve: 4,
        }}
      />
    );

    expect(screen.getByText('注文済み: 2')).toBeInTheDocument();
    expect(screen.getByText('仕込み中: 2')).toBeInTheDocument();
    expect(screen.getByText('調理中: 2')).toBeInTheDocument();
    expect(screen.getByText('提供済み: 4')).toBeInTheDocument();
  });

  it('shows recent activity entries and falls back to a clear empty state', () => {
    const { rerender } = render(
      <ProjectRecentActivitySection activities={[]} />
    );

    expect(
      screen.getByText('まだアクティビティはありません')
    ).toBeInTheDocument();

    rerender(
      <ProjectRecentActivitySection
        activities={[
          {
            id: 'activity-1',
            type: 'project_update',
            userId: 'user-1',
            userName: 'Alice',
            text: 'Updated project overview',
            createdAt: new Date('2026-03-22T09:30:00Z'),
          },
        ]}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Updated project overview')).toBeInTheDocument();
  });
});
