import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { teamFormSchema } from '@/types/schemas';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { Select, SelectItem } from '@/ui/components/Select';
import { TextField } from '@/ui/components/TextField';
import { useTeamMutations } from '../hooks/useTeams';

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const createTeamSchema = teamFormSchema.extend({
  type: z.enum(['team', 'personal']),
});

type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
  const { create } = useTeamMutations();
  const { control, handleSubmit, reset } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      type: 'team',
    },
  });

  const handleCreate = async (values: CreateTeamFormValues) => {
    await create(values.name.trim(), values.type);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog aria-label="新規チーム作成">
        <h2 className="mb-4 text-lg font-semibold text-body">新規チーム</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(handleCreate)(e);
          }}
          className="space-y-4"
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                label="チーム名"
                value={field.value}
                onChange={field.onChange}
                isRequired
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="種別"
                selectedKey={field.value}
                onSelectionChange={(key) =>
                  field.onChange(key as 'team' | 'personal')
                }
              >
                <SelectItem id="team">Team</SelectItem>
                <SelectItem id="personal">Personal</SelectItem>
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
