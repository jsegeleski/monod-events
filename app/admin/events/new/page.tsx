import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function createEvent(formData: FormData) {
  "use server";

  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const eventDate = String(formData.get("event_date"));
  const location = String(formData.get("location"));
  const description = String(formData.get("description"));
  const waiverUrl = String(formData.get("waiver_url"));
  const termsUrl = String(formData.get("terms_url"));
  const status = String(formData.get("status"));

  const { error } = await supabaseAdmin.from("events").insert({
    title,
    slug,
    event_date: eventDate,
    location,
    description,
    waiver_url: waiverUrl,
    terms_url: termsUrl,
    status,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export default function NewEventPage() {
  return (
    <main className="modal-page">
      <section className="modal-card">
        <Link href="/admin" className="back-link">
          ← Back to Dashboard
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
            <textarea
              className="textarea"
              name="description"
              rows={4}
              placeholder="Short event description for the signup form."
            />
          </label>

          <label className="label">
            Waiver URL
            <input className="input" name="waiver_url" placeholder="https://..." />
          </label>

          <label className="label">
            Terms URL
            <input className="input" name="terms_url" placeholder="https://..." />
          </label>

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