"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { paymentInstructions, upcomingRetreat } from "@/data/retreat";

type Result = { reference: string; status: string; guests: number; totalInPaise: number };

const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export function BookingForm({ priceInPaise = upcomingRetreat.priceInPaise }: { priceInPaise?: number }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, guests: Number(data.guests) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const waitlisted = result.status === "WAITLISTED";
    return (
      <div className="booking-success">
        <CheckCircle2 size={44} />
        <h3>{waitlisted ? "You're on the waitlist" : "Your spot is reserved"}</h3>
        <p className="booking-reference">
          Booking reference <strong>{result.reference}</strong>
          <button
            type="button"
            aria-label="Copy booking reference"
            onClick={() => { navigator.clipboard.writeText(result.reference); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          >
            <Copy size={14} /> {copied ? "Copied" : "Copy"}
          </button>
        </p>
        <p>
          {waitlisted
            ? "This edition is currently full. We will reach out the moment a spot opens up — no payment is needed yet."
            : `To confirm your booking for ${result.guests} ${result.guests === 1 ? "guest" : "guests"}, please transfer ${formatINR(result.totalInPaise)} using the details below.`}
        </p>
        {!waitlisted && (
          <dl className="payment-details">
            <div><dt>UPI ID</dt><dd>{paymentInstructions.upiId}</dd></div>
            <div><dt>Account name</dt><dd>{paymentInstructions.accountName}</dd></div>
            <div><dt>Account number</dt><dd>{paymentInstructions.accountNumber}</dd></div>
            <div><dt>IFSC</dt><dd>{paymentInstructions.ifsc}</dd></div>
            <div><dt>Bank</dt><dd>{paymentInstructions.bankName}</dd></div>
          </dl>
        )}
        {!waitlisted && <p className="payment-note">{paymentInstructions.note}</p>}
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>Full name<input name="name" required minLength={2} placeholder="Your name" autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label>
      </div>
      <div className="field-row">
        <label>Phone<input name="phone" type="tel" required placeholder="+91 98765 43210" autoComplete="tel" /></label>
        <label>Guests
          <select name="guests" defaultValue="1">
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <label>Dietary preferences <span>(optional)</span><input name="dietaryNotes" placeholder="Vegetarian, allergies…" /></label>
      <label>Health notes <span>(optional)</span><input name="healthNotes" placeholder="Anything we should know" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark" type="submit" disabled={submitting}>
        {submitting ? <><Loader2 size={18} className="spin" /> Reserving…</> : <>Reserve for {formatINR(priceInPaise)} / person <ArrowRight size={18} /></>}
      </button>
      <small>No payment is taken online. You&apos;ll receive payment instructions after reserving.</small>
    </form>
  );
}
