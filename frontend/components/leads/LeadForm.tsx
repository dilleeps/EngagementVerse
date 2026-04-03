'use client';

import { useState, type FormEvent } from 'react';
import type { Lead, CreateLeadPayload } from '@/hooks/useLeads';

const SOURCE_OPTIONS = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'HUBSPOT', label: 'HubSpot' },
  { value: 'CSV', label: 'CSV Import' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WEBSITE', label: 'Website' },
];

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (data: CreateLeadPayload) => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const isEdit = !!lead;

  const [form, setForm] = useState({
    company_name: lead?.company_name ?? '',
    contact_name: lead?.contact_name ?? '',
    contact_email: lead?.contact_email ?? '',
    contact_phone: lead?.contact_phone ?? '',
    title: lead?.title ?? '',
    specialty: lead?.specialty ?? '',
    institution: lead?.institution ?? '',
    state: lead?.state ?? '',
    lead_source: lead?.lead_source ?? 'MANUAL',
    deal_value: lead?.deal_value?.toString() ?? '',
    notes: lead?.notes ?? '',
    tags: (lead?.tags ?? []).join(', '),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.company_name.trim()) newErrors.company_name = 'Required';
    if (!form.contact_name.trim()) newErrors.contact_name = 'Required';
    if (!form.contact_email.trim()) {
      newErrors.contact_email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      newErrors.contact_email = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateLeadPayload = {
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim() || undefined,
      title: form.title.trim() || undefined,
      specialty: form.specialty.trim() || undefined,
      institution: form.institution.trim() || undefined,
      state: form.state.trim() || undefined,
      lead_source: form.lead_source,
      deal_value: form.deal_value ? parseFloat(form.deal_value) : undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };
    onSubmit(payload);
  };

  const inputClass = (field: string) =>
    `w-full rounded-md border ${
      errors[field] ? 'border-red-300' : 'border-gray-300'
    } bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Company Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Acme Corp"
            className={inputClass('company_name')}
          />
          {errors.company_name && (
            <span className="text-xs text-red-500">{errors.company_name}</span>
          )}
        </div>

        {/* Contact Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Contact name <span className="text-red-500">*</span>
          </label>
          <input
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className={inputClass('contact_name')}
          />
          {errors.contact_name && (
            <span className="text-xs text-red-500">{errors.contact_name}</span>
          )}
        </div>

        {/* Contact Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="contact_email"
            type="email"
            value={form.contact_email}
            onChange={handleChange}
            placeholder="jane@acme.com"
            className={inputClass('contact_email')}
          />
          {errors.contact_email && (
            <span className="text-xs text-red-500">
              {errors.contact_email}
            </span>
          )}
        </div>

        {/* Contact Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Phone</label>
          <input
            name="contact_phone"
            value={form.contact_phone}
            onChange={handleChange}
            placeholder="+1 555-0123"
            className={inputClass('contact_phone')}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VP of Marketing"
            className={inputClass('title')}
          />
        </div>

        {/* Specialty */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Specialty
          </label>
          <input
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            placeholder="Cardiology"
            className={inputClass('specialty')}
          />
        </div>

        {/* Institution */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Institution
          </label>
          <input
            name="institution"
            value={form.institution}
            onChange={handleChange}
            placeholder="General Hospital"
            className={inputClass('institution')}
          />
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="CA"
            className={inputClass('state')}
          />
        </div>

        {/* Lead Source */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Lead source
          </label>
          <select
            name="lead_source"
            value={form.lead_source}
            onChange={handleChange}
            className={inputClass('lead_source')}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deal Value */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Deal value ($)
          </label>
          <input
            name="deal_value"
            type="number"
            min="0"
            step="0.01"
            value={form.deal_value}
            onChange={handleChange}
            placeholder="10000"
            className={inputClass('deal_value')}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">
          Tags (comma-separated)
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="pharma, enterprise, high-priority"
          className={inputClass('tags')}
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Notes</label>
        <textarea
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          className={inputClass('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          {isEdit ? 'Update lead' : 'Create lead'}
        </button>
      </div>
    </form>
  );
}
