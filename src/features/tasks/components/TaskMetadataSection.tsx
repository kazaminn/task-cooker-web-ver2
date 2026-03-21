import {
  getLocalTimeZone,
  parseDate,
  type CalendarDate,
} from '@internationalized/date';
import { format } from 'date-fns';
import { PRIORITY_META, TASK_STATUS_META } from '@/types/constants';
import type { Project, Task } from '@/types/types';
import { DatePicker } from '@/ui/components/DatePicker';
import { Select, SelectItem } from '@/ui/components/Select';

interface TaskMetadataSectionProps {
  task: Task;
  project: Project;
  onStatusChange: (
    status: 'order' | 'prep' | 'cook' | 'serve'
  ) => Promise<void>;
  onPriorityChange: (
    priority: 'urgent' | 'high' | 'medium' | 'low'
  ) => Promise<void>;
  onDueDateChange: (dueDate: Date | undefined) => Promise<void>;
  onAssigneeChange: (assigneeId: string | undefined) => Promise<void>;
}

export function TaskMetadataSection({
  task,
  project,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onAssigneeChange,
}: TaskMetadataSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Select
        label="ステータス"
        selectedKey={task.status}
        onSelectionChange={(key) =>
          void onStatusChange(key as 'order' | 'prep' | 'cook' | 'serve')
        }
      >
        {Object.entries(TASK_STATUS_META).map(([key, meta]) => (
          <SelectItem key={key} id={key}>
            {meta.ja}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="優先順位"
        selectedKey={task.priority}
        onSelectionChange={(key) =>
          void onPriorityChange(key as 'urgent' | 'high' | 'medium' | 'low')
        }
      >
        {Object.entries(PRIORITY_META).map(([key, meta]) => (
          <SelectItem key={key} id={key}>
            {meta.ja}
          </SelectItem>
        ))}
      </Select>
      <DatePicker
        label="期限"
        value={
          task.dueDate ? parseDate(format(task.dueDate, 'yyyy-MM-dd')) : null
        }
        onChange={(value) =>
          void onDueDateChange(
            value
              ? (value as CalendarDate).toDate(getLocalTimeZone())
              : undefined
          )
        }
      />
      <Select
        label="担当者"
        selectedKey={task.assigneeId ?? 'unassigned'}
        onSelectionChange={(key) =>
          void onAssigneeChange(
            key === 'unassigned' ? undefined : (key as string)
          )
        }
      >
        <SelectItem id="unassigned">未割り当て</SelectItem>
        {project.memberIds.map((memberId) => (
          <SelectItem key={memberId} id={memberId}>
            {memberId}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
