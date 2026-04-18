'use client';

import { useState } from 'react';
import Link from 'next/link';

const REGIONS = [
  'North India', 'South India', 'East India', 'West India', 'Central India', 'Export / International',
];

const SIZES = ['Small', 'Medium', 'Large', 'Custom'];

const EMPTY = {
  customerName: '',
  millName: '',
  mobile: '',
  gst: '',
  location: '',
  address: '',
  hasRequirement: null, // null = not chosen, true = Yes, false = No
  futureNote: '',
  items: [{ id: 1, modelNo: '', size: '', qty: '', priceRegion: '' }],
};

let _id = 2;

export default function EnquiryForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const setItem = (id, key, val) => {
    setForm(f => ({
      ...f,
      items: f.items.map(it => it.id === id ? { ...it, [key]: val } : it),
    }));
  };

  const addItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { id: _id++, modelNo: '', size: '', qty: '', priceRegion: '' }],
    }));
  };

  const removeItem = (id) => {
    setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.millName.trim()) e.millName = 'Required';
    if (!form.mobile.trim()) e.mobile = 'Required';
    else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) e.mobile = 'Enter valid 10-digit mobile';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (form.hasRequirement === null) e.hasRequirement = 'Please select an option';
    if (form.hasRequirement === true) {
      form.items.forEach((it, i) => {
        if (!it.modelNo.trim()) e[`item_${i}_modelNo`] = 'Required';
        if (!it.qty || +it.qty < 1) e[`item_${i}_qty`] = 'Required';
        if (!it.priceRegion) e[`item_${i}_priceRegion`] = 'Required';
      });
    }
    if (form.hasRequirement === false && !form.futureNote.trim()) {
      e.futureNote = 'Please describe the future requirement';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: save to Firestore
    console.log('Enquiry submitted:', form);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="enq-success">
        <div className="enq-success-card">
          <div className="enq-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="enq-success-title">Enquiry Submitted</h2>
          <p className="enq-success-desc">
            The enquiry for <strong>{form.customerName}</strong> has been recorded successfully.
          </p>
          <div className="enq-success-actions">
            <button className="btn-primary" onClick={handleReset}>New Enquiry</button>
            <Link href="/dashboard/enquiry" className="btn-secondary">Back to Enquiry</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enq-page">
      {/* ── Header bar ── */}
      <div className="enq-header">
        <div className="enq-header-left">
          <Link href="/dashboard/enquiry" className="enq-back-btn" title="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="enq-header-title">New Enquiry</h1>
            <span className="enq-header-sub">Fill in the customer details below</span>
          </div>
        </div>
        <div className="enq-header-actions">
          <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
          <button type="submit" form="enq-form" className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save Enquiry
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      <form id="enq-form" className="enq-body" onSubmit={handleSubmit} noValidate>

        {/* Customer Info */}
        <Section icon="👤" title="Customer Information">
          <div className="enq-grid-2">
            <Field label="Customer Name" required error={errors.customerName}>
              <input
                className={`form-input ${errors.customerName ? 'form-input--error' : ''}`}
                placeholder="e.g. Rajesh Kumar"
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
              />
            </Field>
            <Field label="Mill Name" required error={errors.millName}>
              <input
                className={`form-input ${errors.millName ? 'form-input--error' : ''}`}
                placeholder="e.g. Sri Balaji Rice Mill"
                value={form.millName}
                onChange={e => set('millName', e.target.value)}
              />
            </Field>
            <Field label="Mobile No." required error={errors.mobile}>
              <input
                className={`form-input ${errors.mobile ? 'form-input--error' : ''}`}
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
              />
            </Field>
            <Field label="GST No." hint="Optional">
              <input
                className="form-input"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={form.gst}
                onChange={e => set('gst', e.target.value.toUpperCase())}
                maxLength={15}
              />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section icon="📍" title="Location Details">
          <div className="enq-grid-2">
            <Field label="Location / City" required error={errors.location}>
              <input
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                placeholder="e.g. Nagpur, Maharashtra"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Full Address" required error={errors.address}>
            <textarea
              className={`form-textarea ${errors.address ? 'form-input--error' : ''}`}
              placeholder="Street, area, city, state, PIN..."
              rows={3}
              value={form.address}
              onChange={e => set('address', e.target.value)}
            />
          </Field>
        </Section>

        {/* Requirement toggle */}
        <Section icon="🔧" title="Requirement">
          <div className="enq-req-toggle-wrap">
            <p className="enq-req-question">Does the customer have an immediate requirement?</p>
            <div className="enq-req-toggle">
              <button
                type="button"
                className={`enq-req-btn ${form.hasRequirement === true ? 'enq-req-btn--yes' : ''}`}
                onClick={() => set('hasRequirement', true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Yes
              </button>
              <button
                type="button"
                className={`enq-req-btn ${form.hasRequirement === false ? 'enq-req-btn--no' : ''}`}
                onClick={() => set('hasRequirement', false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                No
              </button>
            </div>
            {errors.hasRequirement && <p className="field-error">{errors.hasRequirement}</p>}
          </div>

          {/* YES — product items */}
          {form.hasRequirement === true && (
            <div className="enq-items-wrap">
              {form.items.map((item, idx) => (
                <div key={item.id} className="enq-item-card">
                  <div className="enq-item-card-header">
                    <span className="enq-item-index">Item {idx + 1}</span>
                    {form.items.length > 1 && (
                      <button type="button" className="enq-item-remove" onClick={() => removeItem(item.id)} title="Remove item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="enq-item-body">
                    <div className="enq-grid-2">
                      <Field label="Model No." required error={errors[`item_${idx}_modelNo`]}>
                        <input
                          className={`form-input ${errors[`item_${idx}_modelNo`] ? 'form-input--error' : ''}`}
                          placeholder="e.g. USEPL-6V"
                          value={item.modelNo}
                          onChange={e => setItem(item.id, 'modelNo', e.target.value)}
                        />
                      </Field>
                      <Field label="Size">
                        <select
                          className="form-select"
                          value={item.size}
                          onChange={e => setItem(item.id, 'size', e.target.value)}
                        >
                          <option value="">Select size</option>
                          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Quantity" required error={errors[`item_${idx}_qty`]}>
                        <input
                          className={`form-input ${errors[`item_${idx}_qty`] ? 'form-input--error' : ''}`}
                          placeholder="e.g. 2"
                          value={item.qty}
                          onChange={e => setItem(item.id, 'qty', e.target.value.replace(/\D/g, ''))}
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="Price as per Region" required error={errors[`item_${idx}_priceRegion`]}>
                        <select
                          className={`form-select ${errors[`item_${idx}_priceRegion`] ? 'form-input--error' : ''}`}
                          value={item.priceRegion}
                          onChange={e => setItem(item.id, 'priceRegion', e.target.value)}
                        >
                          <option value="">Select region</option>
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="enq-add-item-btn" onClick={addItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Another Item
              </button>
            </div>
          )}

          {/* NO — future requirement */}
          {form.hasRequirement === false && (
            <div className="enq-future-wrap">
              <div className="enq-future-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Future Requirement
              </div>
              <Field label="Requirement Update / Notes" required error={errors.futureNote}>
                <textarea
                  className={`form-textarea ${errors.futureNote ? 'form-input--error' : ''}`}
                  placeholder="Describe what the customer might need in the future, expected timeline, or any follow-up notes..."
                  rows={4}
                  value={form.futureNote}
                  onChange={e => set('futureNote', e.target.value)}
                />
              </Field>
            </div>
          )}
        </Section>

        {/* Mobile submit */}
        <div className="enq-submit-row">
          <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
          <button type="submit" className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save Enquiry
          </button>
        </div>

      </form>
    </div>
  );
}

/* ── Reusable sub-components ── */
function Section({ icon, title, children }) {
  return (
    <div className="enq-section">
      <div className="enq-section-header">
        <span className="enq-section-icon">{icon}</span>
        <span className="enq-section-title">{title}</span>
      </div>
      <div className="enq-section-body">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="enq-field">
      <label className="enq-label">
        {label}
        {required && <span className="enq-label-req">*</span>}
        {hint && <span className="enq-label-hint">{hint}</span>}
      </label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
