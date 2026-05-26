import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CopyIframeButton from "./CopyIframeButton";
import DeleteEventButton from "../../DeleteEventButton";
import { formatEventDate } from "@/lib/dates";
import AdminShell from "../../AdminShell";

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

export default async function EventAdminPage({
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

  if (!event) notFound();

  const { data: sidebarEvents } = await supabaseAdmin
    .from("events")
    .select("id, title, status")
    .order("event_date", { ascending: true });

  const { data: registrations } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  const checkedInCount =
    registrations?.filter((runner) => runner.checked_in).length || 0;

  const registeredCount = registrations?.length || 0;

  const signupUrl = `/register/${event.slug}`;
  const checkInUrl = `/check-in/${event.slug}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const embedUrl = `${appUrl}/embed/register/${event.slug}`;
  const iframeCode = `<iframe src="${embedUrl}" style="width:100%; min-height:720px; border:0;"></iframe>`;

  return (
    <AdminShell events={sidebarEvents || []}>
      <main className="app-shell dashboard-shell">
      <Link href="/admin" className="back-link">
        ← Back to Events
      </Link>

      <section className="event-detail-hero">
        <div>
          <div className="eyebrow">Event Detail</div>
          <h1>{event.title}</h1>

          <p className="muted">
            {formatEventDate(event.event_date)}
            {event.location ? ` • ${event.location}` : ""}
          </p>
        </div>

        <span className={`badge ${event.status}`}>{event.status}</span>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Registered</span>
          <strong>{registeredCount}</strong>
        </div>

        <div className="stat-card">
          <span>Checked In</span>
          <strong>{checkedInCount}</strong>
        </div>

        <div className="stat-card">
          <span>Remaining</span>
          <strong>{registeredCount - checkedInCount}</strong>
        </div>
      </section>

      <div className="button-row">
        <Link href={signupUrl}>
          <button>Open Signup Page</button>
        </Link>

        <Link href={`/admin/events/${event.id}/edit`}>
          <button>Edit Event</button>
        </Link>

        <Link href={checkInUrl}>
          <button>Open Check-In</button>
        </Link>

        <CopyIframeButton code={iframeCode} />

        <DeleteEventButton
          eventId={event.id}
          eventTitle={event.title}
          action={deleteEvent}
        />
      </div>

      <section className="section-header">
        <div>
          <div className="eyebrow">Registrations</div>
          <h2>Runner List</h2>
        </div>
      </section>

      {registrations?.length === 0 ? (
        <div className="card empty-card">
          <p>No runners registered yet.</p>
        </div>
      ) : (
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Newsletter</th>
                <th>Checked In</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {registrations?.map((runner) => (
                <tr key={runner.id}>
                  <td>
                    {runner.first_name} {runner.last_name}
                  </td>
                  <td>{runner.email}</td>
                  <td>{runner.newsletter_opt_in ? "Yes" : "No"}</td>
                  <td>{runner.checked_in ? "Yes" : "No"}</td>
                  <td>{new Date(runner.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </main>
    </AdminShell>
  );
}