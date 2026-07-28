"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function EnquiryForm({ retreatId }: { retreatId?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = event.currentTarget;
      const fields = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, retreatId, source: "homepage" }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "We could not send your enquiry.");
      form.reset();
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not send your enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <div className="enquiry-success" role="status"><CheckCircle2 aria-hidden="true" /><strong>Thank you.</strong><span>We will be in touch with thoughtful next steps.</span></div>;
  }

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="field-row">
        <label>Full name<input name="name" required minLength={2} autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label>What would you like to know?<textarea name="message" required minLength={10} rows={4} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark" type="submit" disabled={submitting}>
        {submitting ? <><Loader2 className="spin" aria-hidden="true" /> Sending…</> : <>Send enquiry <ArrowRight aria-hidden="true" /></>}
      </button>
    </form>
  );
}
