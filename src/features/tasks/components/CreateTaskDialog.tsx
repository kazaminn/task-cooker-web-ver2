import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { useForm, Controller } from 'react-hook-form';
import { useTeam } from '@/features/teams/hooks/useTeams';
import { taskFormSchema } from '@/types/schemas';
import type { TaskFormInput } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { DatePicker } from '@/ui/components/DatePicker';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { Select, SelectItem } from '@/ui/components/Select';
import { TextArea } from '@/ui/components/TextArea';
import { TextField } from '@/ui/components/TextField';
import { useTaskMutations } from '../hooks/useTasks';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (taskId: string) => void;
  projectId: string;
  teamId: string;
}

type CreateTaskFormValues = Omit<TaskFormInput, 'dueDate'>;

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreated,
  projectId,
  teamId,
}: CreateTaskDialogProps) {
  const { create, createMutation } = useTaskMutations(projectId, teamId);
  const { team } = useTeam(teamId);
  const [dueDate, setDueDate] = useState<CalendarDate | null>(null);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(taskFormSchema.omit({ dueDate: true })),
    defaultValues: {
      title: '',
      description: '',
      status: 'order',
      priority: 'medium',
      assigneeId: '',
    },
  });

  const onSubmit = async (values: CreateTaskFormValues) => {
    setSubmitError(undefined);

    try {
      const taskId = await create({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId ?? undefined,
        dueDate: dueDate ? dueDate.toDate(getLocalTimeZone()) : undefined,
      });
      reset();
      setDueDate(null);
      onClose();
      onCreated?.(taskId);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '注文の作成に失敗しました。'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSubmitError(undefined);
          onClose();
        }
      }}
    >
      <Dialog aria-label="新しい注文を作成">
        <h2 className="mb-4 text-lg font-semibold text-body">新しい注文</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(onSubmit)(event);
          }}
          className="space-y-4 sm:space-y-5"
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                label="タイトル (必須)"
                value={field.value}
                onChange={field.onChange}
                isRequired
                errorMessage={errors.title?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                label="説明"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="ステータス"
                  selectedKey={field.value}
                  onSelectionChange={(key) => field.onChange(key as string)}
                  isRequired
                >
                  <SelectItem id="order">注文済み</SelectItem>
                  <SelectItem id="prep">仕込み中</SelectItem>
                  <SelectItem id="cook">調理中</SelectItem>
                  <SelectItem id="serve">提供済み</SelectItem>
                </Select>
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  label="優先順位"
                  selectedKey={field.value}
                  onSelectionChange={(key) => field.onChange(key as string)}
                  isRequired
                >
                  <SelectItem id="urgent">緊急</SelectItem>
                  <SelectItem id="high">高</SelectItem>
                  <SelectItem id="medium">中</SelectItem>
                  <SelectItem id="low">低</SelectItem>
                </Select>
              )}
            />
            <DatePicker
              label="期限"
              value={dueDate}
              onChange={(value) =>
                setDueDate((value as CalendarDate | null) ?? null)
              }
            />
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  label="担当者"
                  placeholder="未割り当て"
                  selectedKey={field.value ?? null}
                  onSelectionChange={(key) =>
                    field.onChange(
                      ((key as string) ?? '') === 'unassigned'
                        ? ''
                        : (key as string)
                    )
                  }
                >
                  <SelectItem id="unassigned">未割り当て</SelectItem>
                  {(team?.memberIds ?? []).map((memberId) => (
                    <SelectItem key={memberId} id={memberId}>
                      {memberId}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
          {submitError ? (
            <p role="alert" className="text-sm text-danger">
              {submitError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onPress={onClose}
              isDisabled={isSubmitting || createMutation.isPending}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              type="submit"
              isPending={isSubmitting || createMutation.isPending}
            >
              作成
            </Button>
          </div>
        </form>
      </Dialog>
    </Modal>
  );
}
