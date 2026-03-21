import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useTeams } from '@/features/teams/hooks/useTeams';
import { projectFormSchema } from '@/types/schemas';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { Select, SelectItem } from '@/ui/components/Select';
import { TextArea } from '@/ui/components/TextArea';
import { TextField } from '@/ui/components/TextField';
import { useProjectMutations } from '../hooks/useProjects';

const createProjectSchema = projectFormSchema.extend({
  slug: z.string(),
  teamId: z.string().min(1, 'チームを選択してください'),
});

type FormValues = z.infer<typeof createProjectSchema>;

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
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
        <h2 className="mb-4 text-lg font-semibold text-body">
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
                errorMessage={errors.name?.message}
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
                errorMessage={errors.slug?.message}
              />
            )}
          />
          <Controller
            name="overview"
            control={control}
            render={({ field }) => (
              <TextArea
                label="概要"
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.overview?.message}
              />
            )}
          />
          <Controller
            name="teamId"
            control={control}
            render={({ field }) => (
              <Select
                label="チーム"
                selectedKey={field.value || null}
                onSelectionChange={(key) =>
                  field.onChange((key as string) ?? '')
                }
                errorMessage={errors.teamId?.message}
                isRequired
              >
                {(teams ?? []).map((team) =>
                  team.id ? (
                    <SelectItem key={team.id} id={team.id}>
                      {team.name}
                    </SelectItem>
                  ) : null
                )}
              </Select>
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
