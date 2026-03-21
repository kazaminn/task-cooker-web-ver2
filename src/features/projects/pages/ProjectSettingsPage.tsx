import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import type { Project, ProjectFormInput } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { Select, SelectItem } from '@/ui/components/Select';
import { TextArea } from '@/ui/components/TextArea';
import { TextField } from '@/ui/components/TextField';
import { useProjectMutations } from '../hooks/useProjects';

export function ProjectSettingsPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { update, remove } = useProjectMutations();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { control, handleSubmit } = useForm<ProjectFormInput>({
    defaultValues: {
      name: project.name,
      slug: project.slug,
      overview: project.overview,
      status: project.status,
    },
  });

  const onSubmit = async (values: ProjectFormInput) => {
    if (!projectId) return;
    await update(projectId, values);
  };

  const handleDelete = async () => {
    if (!projectId) return;
    await remove(projectId);
    void navigate('/projects');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-body">
          プロジェクト設定
        </h1>
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
                label="名前"
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
              <TextArea
                label="概要"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="ステータス"
                selectedKey={field.value}
                onSelectionChange={(key) => field.onChange(key as string)}
              >
                <SelectItem id="planning">企画中</SelectItem>
                <SelectItem id="cooking">進行中</SelectItem>
                <SelectItem id="on_hold">保留</SelectItem>
                <SelectItem id="completed">完了</SelectItem>
              </Select>
            )}
          />
          <Button variant="primary" type="submit">
            保存
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-danger bg-danger-subtle p-4">
        <h2 className="mb-2 text-sm font-semibold text-danger">危険ゾーン</h2>
        <p className="mb-3 text-sm text-danger">
          プロジェクトを削除すると、すべてのタスクとデータが失われます。この操作は取り消せません。
        </p>
        <Button
          variant="destructive"
          onPress={() => setShowDeleteConfirm(true)}
        >
          削除する
        </Button>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onOpenChange={(open) => setShowDeleteConfirm(open)}
      >
        <Dialog aria-label="プロジェクト削除の確認">
          <h2 className="mb-3 text-lg font-semibold text-body">
            プロジェクトを削除しますか
          </h2>
          <p className="mb-4 text-sm text-muted">
            この操作は取り消せません。削除すると `/projects` に戻ります。
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onPress={() => setShowDeleteConfirm(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onPress={() => void handleDelete()}>
              本当に削除する
            </Button>
          </div>
        </Dialog>
      </Modal>
    </div>
  );
}
