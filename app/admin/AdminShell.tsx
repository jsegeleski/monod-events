import Link from "next/link";

type EventLink = {
  id: string;
  title: string;
  status: string;
};

export default function AdminShell({
  children,
  events = [],
}: {
  children: React.ReactNode;
  events?: EventLink[];
}) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-main">MONOD SPORTS</div>
          <div className="admin-brand-sub">Events</div>
        </div>

        <nav className="admin-nav">
          <Link href="/admin">Home</Link>
          <Link href="/admin">Events</Link>
          <Link href="/admin?create=true">Create Event</Link>
        </nav>

        <div className="admin-sidebar-section">
          <div className="admin-sidebar-label">Events</div>

          <div className="admin-event-links">
            {events.slice(0, 8).map((event) => (
              <Link key={event.id} href={`/admin/events/${event.id}`}>
                <span>{event.title}</span>
                <small>{event.status}</small>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <section className="admin-main">{children}</section>
    </div>
  );
}