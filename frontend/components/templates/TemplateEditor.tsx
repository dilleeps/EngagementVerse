'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePreviewTemplate, type EmailTemplate, type CreateTemplatePayload } from '@/hooks/useEmailTemplates';
import { TemplatePreview } from '@/components/templates/TemplatePreview';

const CATEGORY_OPTIONS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'OUTREACH', label: 'Outreach' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'DRUG_UPDATE', label: 'Drug Update' },
  { value: 'SAFETY_ALERT', label: 'Safety Alert' },
  { value: 'CONFERENCE', label: 'Conference' },
];

interface TemplateEditorProps {
  template?: EmailTemplate | null;
  onSubmit: (data: CreateTemplatePayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TemplateEditor({ template, onSubmit, onCancel, isSubmitting }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name ?? '');
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [category, setCategory] = useState(template?.category ?? 'GENERAL');
  const [variablesInput, setVariablesInput] = useState(
    template?.variables?.join(', ') ?? '',
  );
  const [previewText, setPreviewText] = useState(template?.preview_text ?? '');
  const [isActive, setIsActive] = useState(template?.is_active ?? true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewBody, setPreviewBody] = useState('');

  const previewMutation = usePreviewTemplate();

  // Auto-detect {{variables}} from body and subject
  const detectedVariables = useMemo(() => {
    const combined = `${subject} ${body}`;
    const matches = combined.match(/\{\{\s*(\w+)\s*\}\}/g);
    if (!matches) return [];
    const unique = new Set(
      matches.map((m) => m.replace(/\{\{\s*/, '').replace(/\s*\}\}/, '')),
    );
    return Array.from(unique);
  }, [subject, body]);

  // Sync detected variables into the input field
  useEffect(() => {
    if (detectedVariables.length > 0) {
      setVariablesInput(detectedVariables.join(', '));
    }
  }, [detectedVariables]);

  const parsedVariables = useMemo(() => {
    return variablesInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }, [variablesInput]);

  const handlePreview = useCallback(() => {
    if (template?.id) {
      // Use API preview for existing templates
      const sampleValues: Record<string, string> = {};
      parsedVariables.forEach((v) => {
        sampleValues[v] = `[${v}]`;
      });
      previewMutation.mutate(
        { id: template.id, variable_values: sampleValues },
        {
          onSuccess: (data) => {
            setPreviewSubject(data.rendered_subject);
            setPreviewBody(data.rendered_body);
            setShowPreview(true);
          },
        },
      );
    } else {
      // Local preview for new templates
      let rendered = body;
      let renderedSubject = subject;
      parsedVariables.forEach((v) => {
        const regex = new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g');
        rendered = rendered.replace(regex, `[${v}]`);
        renderedSubject = renderedSubject.replace(regex, `[${v}]`);
      });
      setPreviewSubject(renderedSubject);
      setPreviewBody(rendered);
      setShowPreview(true);
    }
  }, [body, subject, parsedVariables, template?.id, previewMutation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      subject,
      body,
      category,
      variables: parsedVariables.length > 0 ? parsedVariables : undefined,
      preview_text: previewText || undefined,
      is_active: isActive,
    });
  };

  const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor side */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HCP Outreach - Drug Launch"
              required
              className={inputClass}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='e.g. Important update regarding {{drug_name}}'
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">
              Use {'{{variable_name}}'} for dynamic content
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email body (HTML)
            </label>
            {parsedVariables.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {parsedVariables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBody((b) => b + `{{${v}}}`)}
                    className="inline-flex rounded bg-brand-light px-2 py-0.5 text-xs font-medium text-brand hover:bg-teal-100 transition-colors"
                    title={`Insert {{${v}}}`}
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='<p>Dear {{hcp_name}},</p><p>We are excited to share...</p>'
              rows={12}
              required
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          {/* Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variables (auto-detected)
            </label>
            <input
              type="text"
              value={variablesInput}
              onChange={(e) => setVariablesInput(e.target.value)}
              placeholder="hcp_name, drug_name, ..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">
              Comma-separated. Variables are auto-detected from {'{{...}}'} in subject and body.
            </p>
          </div>

          {/* Preview text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview text
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Text shown in email client preview..."
              className={inputClass}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                isActive ? 'bg-brand' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Preview side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Live preview</h3>
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewMutation.isPending}
              className="rounded-md border border-brand bg-brand-light px-3 py-1.5 text-xs font-medium text-brand hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              {previewMutation.isPending ? 'Loading...' : 'Refresh preview'}
            </button>
          </div>

          {showPreview ? (
            <TemplatePreview
              subject={previewSubject}
              body={previewBody}
              previewText={previewText}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-400">
                Click &ldquo;Refresh preview&rdquo; to see how the template will render
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-black/[0.08] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name || !subject || !body}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : template ? 'Update template' : 'Create template'}
        </button>
      </div>
    </form>
  );
}
