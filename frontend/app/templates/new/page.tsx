'use client';

import { useRouter } from 'next/navigation';
import { useCreateTemplate, type CreateTemplatePayload } from '@/hooks/useEmailTemplates';
import { TemplateEditor } from '@/components/templates/TemplateEditor';

export default function NewTemplatePage() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();

  const handleSubmit = (data: CreateTemplatePayload) => {
    createTemplate.mutate(data, {
      onSuccess: (created) => {
        router.push(`/templates/${created.id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push('/templates')}
        className="text-sm text-brand hover:text-brand-dark transition-colors"
      >
        &larr; Back to templates
      </button>

      <h1 className="text-2xl font-bold text-gray-900">New template</h1>

      <div className="rounded-lg border border-black/[0.08] bg-white p-6">
        <TemplateEditor
          onSubmit={handleSubmit}
          onCancel={() => router.push('/templates')}
          isSubmitting={createTemplate.isPending}
        />
      </div>
    </div>
  );
}
