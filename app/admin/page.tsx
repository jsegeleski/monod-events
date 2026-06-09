import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import DeleteEventButton from "./DeleteEventButton";
import { eventInputToUtcIso, formatEventDate } from "@/lib/dates";
import AdminShell from "./AdminShell";

async function createEvent(formData: FormData) {
  "use server";

  const { error } = await supabaseAdmin.from("events").insert({
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
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

async function deleteEvent(formData: FormData) {
  "use server";

  const eventId = String(formData.get("event_id"));

  const { error } = await supabaseAdmin
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { data: events, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    return <main className="app-shell">Error loading events: {error.message}</main>;
  }

  const total = events?.length || 0;
  const live = events?.filter((event) => event.status === "live").length || 0;
  const draft = events?.filter((event) => event.status === "draft").length || 0;
  const closed = events?.filter((event) => event.status === "closed").length || 0;
  const showCreateModal = resolvedSearchParams.create === "true";

  return (
  <AdminShell events={events || []}>
    <main className="app-shell dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <div className="eyebrow">Monod Events</div>
          <h1>Event Control Centre</h1>
          <p className="muted">
            Build events, manage signups, copy Shopify embeds, and run check-in from one clean dashboard.
          </p>
        </div>

        <Link href="/admin?create=true">
          <button className="button hero-button">Create Event</button>
        </Link>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
        <div className="stat-card">
          <span>Live</span>
          <strong>{live}</strong>
        </div>
        <div className="stat-card">
          <span>Draft</span>
          <strong>{draft}</strong>
        </div>
        <div className="stat-card">
          <span>Closed</span>
          <strong>{closed}</strong>
        </div>
      </section>

      <section className="section-header">
        <div>
          <div className="eyebrow">Manage</div>
          <h2>Events</h2>
        </div>
      </section>

      {events?.length === 0 ? (
        <div className="card empty-card">
          <p>No events yet. Create your first one.</p>
        </div>
      ) : (
        <div className="event-list">
          {events?.map((event) => (
            <div key={event.id} className="event-row event-row-with-actions">
              <Link href={`/admin/events/${event.id}`} className="event-row-link">
                <div className="event-date-block">
                  <span>
                    {formatEventDate(event.event_date).split(",")[1].trim().split(" ")[0]}
                  </span>
                  <strong>
                    {formatEventDate(event.event_date).split(",")[1].trim().split(" ")[1]}
                  </strong>
                </div>

                <div className="event-main">
                  <h3>{event.title}</h3>
                  <p>
                    {formatEventDate(event.event_date)}{" "}
                    {event.location ? `• ${event.location}` : ""}
                  </p>
                </div>

                <span className={`badge ${event.status}`}>{event.status}</span>
              </Link>

              <DeleteEventButton
                eventId={event.id}
                eventTitle={event.title}
                action={deleteEvent}
              />
            </div>
          ))}
        </div>
      )}
      {showCreateModal && (
  <div className="modal-overlay">
    <section className="modal-card">
      <Link href="/admin" className="modal-close">
        ×
      </Link>

      <div className="modal-header">
        <div className="eyebrow">Create Event</div>
        <h1>New Event</h1>
        <p className="muted">
          Add the public event details, registration links, and initial status.
        </p>
      </div>

      <form action={createEvent} className="form-grid">
  <label className="label">
    Event Title
    <input className="input" name="title" required placeholder="Tuesday Run Night" />
  </label>

  <label className="label">
    URL Slug
    <input className="input" name="slug" required placeholder="tuesday-run-night" />
  </label>

  <label className="label">
    Event Date / Time
    <input className="input" name="event_date" required type="datetime-local" />
  </label>

  <label className="label">
    Location
    <input className="input" name="location" placeholder="Monod Sports, Banff" />
  </label>

  <label className="label">
    Description
    <textarea className="textarea" name="description" rows={4} />
  </label>

  <label className="label">
    Waiver URL
    <input className="input" name="waiver_url" placeholder="https://..." />
  </label>

  <label className="label">
    Terms URL
    <input className="input" name="terms_url" placeholder="https://..." />
  </label>

  <div className="form-section">
  <div className="eyebrow">Early Signup Badge</div>

  <label className="checkbox-label">
    <input type="checkbox" name="early_badge_enabled" />
    <span>Enable badge for first signups</span>
  </label>

  <label className="label">
    First X People
    <input
      className="input"
      type="number"
      name="early_badge_limit"
      min="1"
      placeholder="20"
    />
  </label>

  <label className="label">
    Badge Label
    <input
      className="input"
      name="early_badge_label"
      placeholder="First 20"
    />
  </label>

  <label className="label">
    Email Message
    <textarea
      className="textarea"
      name="early_badge_email_message"
      rows={3}
      placeholder="You were one of the first 20 to register."
    />
  </label>
</div>

  <label className="label">
    Status
    <select className="select" name="status" defaultValue="draft">
      <option value="draft">Draft</option>
      <option value="live">Live</option>
      <option value="closed">Closed</option>
    </select>
  </label>

  <div className="modal-actions">
    <button type="submit">Save Event</button>

    <Link href="/admin">
      <button type="button" className="secondary">Cancel</button>
    </Link>
  </div>
</form>
    </section>
  </div>
)}
        </main>
  </AdminShell>
);
}