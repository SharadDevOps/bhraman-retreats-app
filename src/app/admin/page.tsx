"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, LogOut, Plus, Trash2, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { publishMediaAsset, uploadMediaForReview } from "@/lib/media-upload-client";

type Testimonial = { name: string; location: string; quote: string };
type RetreatContent = {
  slug: string; title: string; edition: string | null; summary: string; location: string;
  startDate: string; endDate: string; priceInPaise: number; capacity: number;
};
type Media = { retreat?: string; founder?: string; hero?: string };
type PendingMedia = { id: string; url: string };
type Booking = {
  id: string; reference: string; guests: number; totalInPaise: number;
  status: string; paymentStatus: string; dietaryNotes: string | null; healthNotes: string | null;
  createdAt: string; user: { name: string | null; email: string; phone: string | null };
};

const TABS = ["Content", "Testimonials", "Images", "Bookings"] as const;
const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Content");
  const [retreat, setRetreat] = useState<RetreatContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [media, setMedia] = useState<Media>({});
  const [pendingMedia, setPendingMedia] = useState<Partial<Record<"retreat" | "founder", PendingMedia>>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => { setMessage(msg); setError(null); setTimeout(() => setMessage(null), 3000); };
  const fail = (msg: string) => { setError(msg); setMessage(null); };

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    setRetreat({
      ...data.retreat,
      startDate: String(data.retreat.startDate).slice(0, 10),
      endDate: String(data.retreat.endDate).slice(0, 10),
    });
    setTestimonials(data.testimonials);
    setMedia(data.media);
    setAuthed(true);
  }, []);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings");
    if (res.ok) setBookings((await res.json()).bookings);
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);
  useEffect(() => { if (authed && tab === "Bookings") loadBookings(); }, [authed, tab, loadBookings]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) { fail((await res.json()).error ?? "Login failed"); return; }
    setPassword("");
    loadContent();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  async function save(payload: object, okMsg: string) {
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/content", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) { fail((await res.json()).error ?? "Save failed"); return; }
    flash(okMsg);
  }

  function mediaFolderFor(slot: "retreat" | "founder") {
    if (slot === "founder") return "founder/profile";
    if (retreat?.slug.includes("uttarakhand")) return "retreats/uttarakhand-december/cover";
    if (retreat?.slug.includes("edition-1")) return "retreats/ladakh-edition-1/cover";
    return "retreats/ladakh-edition-2/cover";
  }

  async function uploadImage(slot: "retreat" | "founder", file: File) {
    setBusy(true); setError(null);
    try {
      const label = slot === "founder" ? "Bhraman founder portrait" : `${retreat?.title ?? "Bhraman retreat"} cover`;
      const asset = await uploadMediaForReview(file, {
        folder: mediaFolderFor(slot),
        altText: label,
        title: label,
      });
      setPendingMedia((current) => ({ ...current, [slot]: { id: asset.id, url: asset.url } }));
      setMedia((current) => ({ ...current, [slot]: asset.url }));
      flash("Upload confirmed. Review and publish it to make it live.");
    } catch (uploadError) {
      fail(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function publishImage(slot: "retreat" | "founder") {
    const pending = pendingMedia[slot];
    if (!pending) return;
    setBusy(true); setError(null);
    try {
      const asset = await publishMediaAsset(pending.id, slot);
      setMedia((current) => ({ ...current, [slot]: asset.url }));
      setPendingMedia((current) => ({ ...current, [slot]: undefined }));
      flash("Media reviewed and published.");
    } catch (publishError) {
      fail(publishError instanceof Error ? publishError.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateBooking(id: string, patch: { status?: string; paymentStatus?: string }) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) loadBookings(); else fail("Update failed");
  }

  if (authed === null) return <main className="admin-shell"><p className="admin-loading"><Loader2 className="spin" size={18} /> Loading…</p></main>;

  if (!authed) {
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={handleLogin}>
          <BrandLogo />
          <h1>Admin</h1>
          <p>Bhraman Retreats content manager</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark" disabled={busy || !password}>{busy ? "Checking…" : "Sign in"}</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/"><BrandLogo context="admin" /></Link>
        <nav>{TABS.map((t) => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</nav>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
      </header>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {tab === "Content" && retreat && (
        <form className="admin-card" onSubmit={(e) => { e.preventDefault(); save({ retreat }, "Retreat content saved"); }}>
          <h2>Upcoming retreat</h2>
          <p className="admin-note">Editing the next retreat selected automatically from its dates: {retreat.title}.</p>
          <div className="admin-grid">
            <label>Title<input value={retreat.title} onChange={(e) => setRetreat({ ...retreat, title: e.target.value })} /></label>
            <label>Edition<input value={retreat.edition ?? ""} onChange={(e) => setRetreat({ ...retreat, edition: e.target.value })} /></label>
            <label>Location<input value={retreat.location} onChange={(e) => setRetreat({ ...retreat, location: e.target.value })} /></label>
            <label>Capacity<input type="number" min={1} value={retreat.capacity} onChange={(e) => setRetreat({ ...retreat, capacity: Number(e.target.value) })} /></label>
            <label>Start date<input type="date" value={retreat.startDate} onChange={(e) => setRetreat({ ...retreat, startDate: e.target.value })} /></label>
            <label>End date<input type="date" value={retreat.endDate} onChange={(e) => setRetreat({ ...retreat, endDate: e.target.value })} /></label>
            <label>Price per person (₹)<input type="number" min={0} value={retreat.priceInPaise / 100} onChange={(e) => setRetreat({ ...retreat, priceInPaise: Number(e.target.value) * 100 })} /></label>
          </div>
          <label>Summary<textarea rows={3} value={retreat.summary} onChange={(e) => setRetreat({ ...retreat, summary: e.target.value })} /></label>
          <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save content"}</button>
        </form>
      )}

      {tab === "Testimonials" && (
        <div className="admin-card">
          <h2>Testimonials</h2>
          {testimonials.map((t, i) => (
            <div className="admin-testimonial" key={i}>
              <div className="admin-grid">
                <label>Name<input value={t.name} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /></label>
                <label>Location<input value={t.location} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, location: e.target.value } : x))} /></label>
              </div>
              <label>Quote<textarea rows={2} value={t.quote} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, quote: e.target.value } : x))} /></label>
              <button type="button" className="admin-delete" onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}><Trash2 size={14} /> Remove</button>
            </div>
          ))}
          <button type="button" className="admin-add" onClick={() => setTestimonials([...testimonials, { name: "", location: "", quote: "" }])}><Plus size={15} /> Add testimonial</button>
          <button className="button button-dark" disabled={busy} onClick={() => save({ testimonials }, "Testimonials saved")}>{busy ? "Saving…" : "Save testimonials"}</button>
        </div>
      )}

      {tab === "Images" && (
        <div className="admin-card">
          <h2>Site images</h2>
          <div className="admin-images">
            {([["retreat", "Retreat image"], ["founder", "Founder portrait"]] as const).map(([slot, label]) => (
              <div className="admin-image-slot" key={slot}>
                <h3>{label}</h3>
                {media[slot] ? <img src={media[slot]} alt={label} /> : <div className="admin-image-empty">No image yet</div>}
                <label className="admin-upload">
                  <Upload size={15} /> {media[slot] ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(slot, file); e.target.value = ""; }} />
                </label>
                {pendingMedia[slot] && (
                  <div className="admin-media-review">
                    <p className="admin-note">Uploaded to Azure Blob Storage as a draft.</p>
                    <button type="button" className="admin-add" disabled={busy} onClick={() => publishImage(slot)}>
                      Publish to site
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="admin-note">JPEG, PNG, WebP or AVIF, up to 20 MB. Files upload directly to Azure and remain draft until reviewed and published.</p>
        </div>
      )}

      {tab === "Bookings" && (
        <div className="admin-card">
          <h2>Bookings <span className="admin-count">{bookings.length}</span></h2>
          {bookings.length === 0 && <p className="admin-note">No bookings yet.</p>}
          <div className="admin-bookings">
            {bookings.map((b) => (
              <div className="admin-booking" key={b.id}>
                <div className="admin-booking-head">
                  <strong>{b.reference}</strong>
                  <span className={`pill pill-${b.status.toLowerCase()}`}>{b.status}</span>
                  <span className={`pill pill-${b.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>{b.paymentStatus === "PAID" ? "Paid" : "Payment pending"}</span>
                  <em>{new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</em>
                </div>
                <p>{b.user.name ?? "—"} · {b.user.email} · {b.user.phone ?? "—"} · {b.guests} {b.guests === 1 ? "guest" : "guests"} · {inr(b.totalInPaise)}</p>
                {(b.dietaryNotes || b.healthNotes) && <p className="admin-note">{[b.dietaryNotes && `Diet: ${b.dietaryNotes}`, b.healthNotes && `Health: ${b.healthNotes}`].filter(Boolean).join(" · ")}</p>}
                <div className="admin-booking-actions">
                  {b.status !== "CONFIRMED" && <button onClick={() => updateBooking(b.id, { status: "CONFIRMED" })}>Confirm</button>}
                  {b.paymentStatus !== "PAID" && <button onClick={() => updateBooking(b.id, { paymentStatus: "PAID" })}>Mark paid</button>}
                  {b.status !== "CANCELLED" && <button className="danger" onClick={() => updateBooking(b.id, { status: "CANCELLED" })}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
