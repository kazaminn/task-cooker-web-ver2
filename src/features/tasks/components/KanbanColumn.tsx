import {
  DropIndicator,
  GridList,
  GridListItem,
  isTextDropItem,
  useDragAndDrop,
  type DropItem,
  type DropTarget,
  type ItemDropTarget,
  type Key,
  type TextDropItem,
} from 'react-aria-components';
import { useNavigate } from 'react-router';
import type { Task, TaskStatus } from '@/types/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  colorClass: string;
  tasks: Task[];
  projectId: string;
  onInsert: (
    taskIds: string[],
    targetKey: Key,
    dropPosition: 'before' | 'after'
  ) => void;
  onRootDrop: (taskIds: string[]) => void;
  onReorder: (
    taskIds: string[],
    targetKey: Key,
    dropPosition: 'before' | 'after'
  ) => void;
}

async function getTaskIdsFromDropItems(items: Iterable<unknown>) {
  const droppedItems = Array.from(items).filter(
    (dropItem): dropItem is TextDropItem => isTextDropItem(dropItem as DropItem)
  );
  return Promise.all(droppedItems.map((item) => item.getText('task-id')));
}

function isItemDropTarget(target: DropTarget): target is ItemDropTarget {
  return 'key' in target && 'dropPosition' in target;
}

function isListDropPosition(
  dropPosition: string
): dropPosition is 'before' | 'after' {
  return dropPosition === 'before' || dropPosition === 'after';
}

function renderDropIndicator(target: DropTarget) {
  if (!isItemDropTarget(target)) {
    return <></>;
  }

  return (
    <DropIndicator
      target={target}
      className="invisible -mx-2 -my-1.5 h-0 drop-target:visible"
    >
      <svg
        height={10}
        className="stroke-primary block w-full fill-none forced-colors:stroke-[Highlight]"
      >
        <circle cx={5} cy={5} r={4} strokeWidth={2} />
        <line
          x1={20}
          x2="100%"
          y1={5}
          y2={5}
          transform="translate(-10 0)"
          strokeWidth={2}
        />
        <circle
          cx="100%"
          cy={5}
          r={4}
          transform="translate(-5 0)"
          strokeWidth={2}
        />
      </svg>
    </DropIndicator>
  );
}

export function KanbanColumn({
  status: _status,
  label,
  colorClass,
  tasks,
  projectId,
  onInsert,
  onRootDrop,
  onReorder,
}: KanbanColumnProps) {
  const navigate = useNavigate();
  const { dragAndDropHooks } = useDragAndDrop<Task>({
    getItems(keys) {
      const draggedTasks = tasks.filter((task) => keys.has(task.id!));
      return draggedTasks.map((task) => ({
        'task-id': task.id!,
        'text/plain': task.title,
      }));
    },
    renderDropIndicator,
    acceptedDragTypes: ['task-id'],
    getDropOperation: () => 'move',
    onInsert(event) {
      if (!isListDropPosition(event.target.dropPosition)) {
        return;
      }
      const dropPosition = event.target.dropPosition;

      void getTaskIdsFromDropItems(event.items).then((taskIds) => {
        onInsert(taskIds, event.target.key, dropPosition);
      });
    },
    onRootDrop(event) {
      void getTaskIdsFromDropItems(event.items).then((taskIds) => {
        onRootDrop(taskIds);
      });
    },
    onReorder(event) {
      if (!isListDropPosition(event.target.dropPosition)) {
        return;
      }
      const dropPosition = event.target.dropPosition;

      onReorder(
        Array.from(event.keys).map(String),
        event.target.key,
        dropPosition
      );
    },
  });

  return (
    <section className="flex w-72 shrink-0 snap-center flex-col gap-2">
      <header className="px-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass.split(' ')[0]}`}
          />
          <h3 className="text-sm font-semibold text-body">{label}</h3>
        </div>
        <span className="text-xs text-muted">{tasks.length} tasks</span>
      </header>

      <GridList
        aria-label={label}
        items={tasks}
        selectionMode="multiple"
        dragAndDropHooks={dragAndDropHooks}
        onAction={(key) => void navigate(`/projects/${projectId}/tasks/${key}`)}
        renderEmptyState={() => 'No tasks.'}
        className="flex min-h-80 flex-col gap-3 rounded-xl border border-main bg-surface p-3 outline-0 data-[drop-target]:border-primary data-[drop-target]:bg-primary/5"
      >
        {(task) => (
          <GridListItem
            id={task.id}
            textValue={task.title}
            className="data-[focused]:outline-primary cursor-default rounded-xl outline-offset-2 data-[focused]:outline data-[selected]:bg-primary/5"
          >
            <TaskCard
              task={task}
              projectId={projectId}
              variant="compact"
              interactive={false}
            />
          </GridListItem>
        )}
      </GridList>
    </section>
  );
}
