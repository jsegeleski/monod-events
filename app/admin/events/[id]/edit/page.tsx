import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { eventInputToUtcIso, eventDateToInputValue } from "@/lib/dates";

async function updateEvent(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));

  const { error } = await supabaseAdmin
    .from("events")
    .update({
      title: String(formData.get("title")),
      slug: String(formData.get("slug")),
      event_date: eventInputToUtcIso(String(formData.get("event_date"))),
      location: String(formData.get("location")),
      description: String(formData.get("description")),
      waiver_url: String(formData.get("waiver_url")),
      terms_url: String(formData.get("terms_url")),
      status: String(formData.get("status")),
      early_badge_enabled: formData.get("early_badge_enabled") === "on",
early_badge_limit: formData.get("early_badge_limit")
  ? Number(formData.get("early_badge_limit"))
  : null,
early_badge_label: String(formData.get("early_badge_label") || ""),
early_badge_email_message: String(formData.get("early_badge_email_message") || ""),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/events/${id}`);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  const localDate = eventDateToInputValue(event.event_date);

  return (
    <main className="modal-page">
      <section className="modal-card">
        <Link href={`/admin/events/${event.id}`} className="back-link">
          ← Back to Event
        </Link>

        <div className="modal-header">
          <div className="eyebrow">Editing Event</div>
          <h1>{event.title}</h1>
          <p className="muted">
            Update the public event details, registration links, and current event status.
          </p>
        </div>

        <form action={updateEvent} className="form-grid">
          <input type="hidden" name="id" value={event.id} />

          <label className="label">
            Event Title
            <input className="input" name="title" required defaultValue={event.title} />
          </label>

          <label className="label">
            URL Slug
            <input className="input" name="slug" required defaultValue={event.slug} />
          </label>

          <label className="label">
            Event Date / Time
            <input
              className="input"
              name="event_date"
              required
              type="datetime-local"
              defaultValue={localDate}
            />
          </label>

          <label className="label">
            Location
            <input className="input" name="location" defaultValue={event.location || ""} />
          </label>

          <label className="label">
            Description
            <textarea
              className="textarea"
              name="description"
              rows={4}
              defaultValue={event.description || ""}
            />
          </label>

          <label className="label">
            Waiver URL
            <input className="input" name="waiver_url" defaultValue={event.waiver_url || ""} />
          </label>

          <label className="label">
            Terms URL
            <input className="input" name="terms_url" defaultValue={event.terms_url || ""} />
          </label>

          <div className="form-section">
  <div className="eyebrow">Early Signup Badge</div>

  <label className="checkbox-label">
    <input
      type="checkbox"
      name="early_badge_enabled"
      defaultChecked={event.early_badge_enabled}
    />
    <span>Enable badge for first signups</span>
  </label>

  <label className="label">
    First X People
    <input
      className="input"
      type="number"
      name="early_badge_limit"
      min="1"
      defaultValue={event.early_badge_limit || ""}
    />
  </label>

  <label className="label">
    Badge Label
    <input
      className="input"
      name="early_badge_label"
      defaultValue={event.early_badge_label || ""}
    />
  </label>

  <label className="label">
    Email Message
    <textarea
      className="textarea"
      name="early_badge_email_message"
      rows={3}
      defaultValue={event.early_badge_email_message || ""}
    />
  </label>
</div>

          <label className="label">
            Status
            <select className="select" name="status" defaultValue={event.status}>
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="submit">Save Changes</button>

            <Link href={`/admin/events/${event.id}`}>
              <button type="button" className="secondary">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}