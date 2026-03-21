import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTeams } from '@/features/teams/hooks/useTeams';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { TextField } from '@/ui/components/TextField';
import { useProjectMutations } from '../hooks/useProjects';

interface FormValues {
  name: string;
  slug: string;
  overview: string;
  teamId: string;
}

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({
  isOpen,
  onClose,
}: CreateProjectDialogProps) {
  const { create } = useProjectMutations();
  const { teams } = useTeams();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: '', slug: '', overview: '', teamId: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const teamId = values.teamId ?? teams?.[0]?.id ?? '';
    await create({
      name: values.name,
      slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
      overview: values.overview,
      status: 'planning',
      teamId,
    });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog aria-label="新規プロジェクト作成">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          新規プロジェクト
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                label="プロジェクト名"
                value={field.value}
                onChange={field.onChange}
                isRequired
              />
            )}
          />
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <TextField
                label="Slug"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="overview"
            control={control}
            render={({ field }) => (
              <TextField
                label="概要"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onPress={onClose}>
              キャンセル
            </Button>
            <Button variant="primary" type="submit">
              作成
            </Button>
          </div>
        </form>
      </Dialog>
    </Modal>
  );
}
