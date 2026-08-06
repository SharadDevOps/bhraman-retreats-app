"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { publishMediaAsset, uploadMediaForReview } from "@/lib/media-upload-client";

type Retreat = {
  id: string;
  slug: string;
  title: string;
  edition: string | null;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  priceInPaise: number;
  capacity: number;
  status: string;
  publicationStatus: string;
  highlight: string | null;
  heroImageUrl: string | null;
};

type Draft = {
  id?: string;
  slug: string;
  title: string;
  edition: string;
  location: string;
  status: string;
  startDate: string;
  endDate: string;
  priceRupees: number;
  capacity: number;
  highlight: string;
  summary: string;
  description: string;
  heroImageUrl: string;
};

const MAX_UPCOMING = 3;
const STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Booking opens soon" },
  { value: "BOOKING_OPEN", label: "Booking open" },
  { value: "SOLD_OUT", label: "Sold out" },
  { value: "ENQUIRY", label: "By enquiry" },
] as const;
const DISPLAY_STATUSES = new Set<string>(STATUS_OPTIONS.map((option) => option.value));

const EMPTY: Draft = {
  slug: "", title: "", edition: "", location: "", status: "UPCOMING",
  startDate: "", endDate: "", priceRupees: 29999, capacity: 12,
  highlight: "", summary: "", description: "", heroImageUrl: "",
};

const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function isUpcoming(retreat: Retreat) {
  return retreat.publicationStatus === "PUBLISHED"
    && DISPLAY_STATUSES.has(retreat.status)
    && new Date(retreat.endDate).getTime() >= Date.now();
}

function fmtRange(startIso: string, endIso: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(startIso).toLocaleDateString("en-IN", opts)} – ${new Date(endIso).toLocaleDateString("en-IN", opts)}`;
}

export function RetreatsManager() {
  const [items, setItems] = useState<Retreat[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => { setMessage(msg); setError(null); setTimeout(() => setMessage(null), 3500); };
  const fail = (msg: string) => { setError(msg); setMessage(null); };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/retreats?page=1&pageSize=50&sort=startDate&order=asc");
      if (!res.ok) { fail("Could not load retreats."); return; }
      const json = await res.json();
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch {
      fail("Could not load retreats.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const publishedUpcomingCount = useMemo(
    () => (items ?? []).filter(isUpcoming).length,
    [items],
  );

  function startCreate() {
    setError(null);
    setDraft({ ...EMPTY });
  }

  function startEdit(retreat: Retreat) {
    setError(null);
    setDraft({
      id: retreat.id,
      slug: retreat.slug,
      title: retreat.title,
      edition: retreat.edition ?? "",
      location: retreat.location,
      status: retreat.status,
      startDate: retreat.startDate.slice(0, 10),
      endDate: retreat.endDate.slice(0, 10),
      priceRupees: Math.round(retreat.priceInPaise / 100),
      capacity: retreat.capacity,
      highlight: retreat.highlight ?? "",
      summary: retreat.summary,
      description: retreat.description,
      heroImageUrl: retreat.heroImageUrl ?? "",
    });
  }

  async function uploadCover(file: File) {
    if (!draft) return;
    setBusy(true); setError(null);
    try {
      const label = `${draft.title || "Bhraman retreat"} cover`;
      const asset = await uploadMediaForReview(file, { folder: "retreats/covers", altText: label, title: label });
      await publishMediaAsset(asset.id);
      setDraft((current) => (current ? { ...current, heroImageUrl: asset.url } : current));
      flash("Cover image uploaded. Save the retreat to apply it.");
    } catch (uploadError) {
      fail(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.location.trim() || !draft.startDate || !draft.endDate || !draft.summary.trim()) {
      fail("Title, location, dates and summary are required.");
      return;
    }
    setBusy(true); setError(null);
    const payload = {
      slug: (draft.slug || slugify(draft.title)).trim(),
      title: draft.title.trim(),
      edition: draft.edition.trim() || null,
      location: draft.location.trim(),
      status: draft.status,
      startDate: draft.startDate,
      endDate: draft.endDate,
      priceInPaise: Math.round(Number(draft.priceRupees) * 100),
      capacity: Math.round(Number(draft.capacity)),
      highlight: draft.highlight.trim() || null,
      summary: draft.summary.trim(),
      description: (draft.description.trim() || draft.summary.trim()),
      heroImageUrl: draft.heroImageUrl.trim() || null,
    };
    const url = draft.id ? `/api/admin/cms/retreats/${draft.id}` : "/api/admin/cms/retreats";
    const method = draft.id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      setBusy(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = body?.error?.message ?? (typeof body?.error === "string" ? body.error : null)
          ?? (body?.errors ? Object.values(body.errors).join(" ") : null);
        fail(detail ?? "Save failed. Please check the fields.");
        return;
      }
      setDraft(null);
      flash(draft.id ? "Retreat updated." : "Retreat created as a draft. Publish it to show it on the site.");
      load();
    } catch {
      setBusy(false);
      fail("Save failed. Please try again.");
    }
  }

  async function remove(retreat: Retreat) {
    if (!window.confirm(`Delete "${retreat.title}"? This permanently removes the retreat.`)) return;
    try {
      const res = await fetch(`/api/admin/cms/retreats/${retreat.id}`, { method: "DELETE" });
      if (!res.ok) { fail("Delete failed."); return; }
      flash("Retreat deleted.");
      load();
    } catch {
      fail("Delete failed.");
    }
  }

  async function setPublication(retreat: Retreat, action: "publish" | "draft") {
    if (action === "publish" && !isUpcoming(retreat) && publishedUpcomingCount >= MAX_UPCOMING) {
      fail(`You can have at most ${MAX_UPCOMING} upcoming retreats published. Move one to draft first.`);
      return;
    }
    try {
      const res = await fetch(`/api/admin/cms/retreats/${retreat.id}/publish`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      if (!res.ok) { fail("Could not update publication status."); return; }
      flash(action === "publish" ? "Published — now visible on the site." : "Moved to draft — hidden from the site.");
      load();
    } catch {
      fail("Could not update publication status.");
    }
  }

  if (items === null) {
    return <div className="admin-card"><p className="admin-loading"><Loader2 className="spin" size={18} /> Loading retreats…</p></div>;
  }

  return (
    <div className="admin-card">
      <div className="admin-retreats-head">
        <div>
          <h2>Retreats</h2>
          <p className="admin-note">
            {publishedUpcomingCount} of {MAX_UPCOMING} upcoming retreats published. The soonest is featured on the homepage; the next two appear as cards.
          </p>
        </div>
        {!draft && <button type="button" className="button button-dark" onClick={startCreate}><Plus size={15} /> Add retreat</button>}
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {draft && (
        <form className="admin-retreat-form" onSubmit={(event) => { event.preventDefault(); save(); }}>
          <h3>{draft.id ? "Edit retreat" : "New retreat"}</h3>
          <div className="admin-grid">
            <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label>Edition<input value={draft.edition} onChange={(e) => setDraft({ ...draft, edition: e.target.value })} /></label>
            <label>Slug (URL)<input value={draft.slug} placeholder={slugify(draft.title) || "auto"} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
            <label>Location<input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></label>
            <label>Status
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>Capacity<input type="number" min={1} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} /></label>
            <label>Start date<input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></label>
            <label>End date<input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} /></label>
            <label>Price per person (₹)<input type="number" min={0} value={draft.priceRupees} onChange={(e) => setDraft({ ...draft, priceRupees: Number(e.target.value) })} /></label>
            <label>Highlight<input value={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.value })} /></label>
          </div>
          <div className="admin-retreat-cover">
            <span className="admin-cover-label">Cover image</span>
            {draft.heroImageUrl
              ? <img src={draft.heroImageUrl} alt="Retreat cover preview" />
              : <div className="admin-image-empty">No cover image yet</div>}
            <label className="admin-upload">
              <Upload size={15} /> {draft.heroImageUrl ? "Replace cover image" : "Upload cover image"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden
                onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadCover(file); e.target.value = ""; }} />
            </label>
          </div>
          <label>Summary<textarea rows={2} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></label>
          <label>Description<textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          <div className="admin-retreat-form-actions">
            <button type="submit" className="button button-dark" disabled={busy}>{busy ? "Saving…" : draft.id ? "Save changes" : "Create retreat"}</button>
            <button type="button" className="admin-cancel" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-retreat-list">
        {items.length === 0 && <p className="admin-note">No retreats yet. Add your first one.</p>}
        {items.map((retreat) => {
          const published = retreat.publicationStatus === "PUBLISHED";
          return (
            <div className="admin-retreat-row" key={retreat.id}>
              <div className="admin-retreat-info">
                <div className="admin-retreat-title">
                  <strong>{retreat.title}</strong>
                  <span className={`pill ${published ? "pill-paid" : "pill-unpaid"}`}>{published ? "Published" : "Draft"}</span>
                  {isUpcoming(retreat) && <span className="pill pill-confirmed">Upcoming</span>}
                </div>
                <p className="admin-note">{fmtRange(retreat.startDate, retreat.endDate)} · {retreat.location} · {inr(retreat.priceInPaise)} · {retreat.capacity} spots</p>
              </div>
              <div className="admin-retreat-actions">
                <button type="button" onClick={() => startEdit(retreat)}><Pencil size={14} /> Edit</button>
                {published
                  ? <button type="button" onClick={() => setPublication(retreat, "draft")}><EyeOff size={14} /> Unpublish</button>
                  : <button type="button" onClick={() => setPublication(retreat, "publish")}><Eye size={14} /> Publish</button>}
                <button type="button" className="danger" onClick={() => remove(retreat)}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
