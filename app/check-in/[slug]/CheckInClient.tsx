"use client";

import { useMemo, useState } from "react";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  checked_in: boolean;
};

export default function CheckInClient({
  eventTitle,
  slug,
  registrations,
  checkedInCount,
  registeredCount,
  checkInAction,
}: {
  eventTitle: string;
  slug: string;
  registrations: Registration[];
  checkedInCount: number;
  registeredCount: number;
  checkInAction: (formData: FormData) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredRegistrations = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return registrations;

    return registrations.filter((runner) => {
      const fullName = `${runner.first_name} ${runner.last_name}`.toLowerCase();
      return fullName.includes(query) || runner.email.toLowerCase().includes(query);
    });
  }, [search, registrations]);

  return (
    <main className="checkin-shell">
      <section className="checkin-header">
        <div>
          <div className="eyebrow">Check-In</div>
          <h1>{eventTitle}</h1>
          <p className="muted">
            <strong>{checkedInCount}</strong> checked in /{" "}
            <strong>{registeredCount}</strong> registered
          </p>
        </div>
      </section>

      <input
        type="search"
        placeholder="Search runners"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        autoFocus
        className="checkin-search"
      />

      <section className="checkin-list">
        {filteredRegistrations.map((runner) => (
          <article key={runner.id} className="checkin-card">
            <div>
              <h3>
                {runner.first_name} {runner.last_name}
              </h3>
              <p>{runner.email}</p>
            </div>

            {runner.checked_in ? (
              <form action={checkInAction} className="checked-actions">
  <div className="checked-pill">Checked In</div>

  <input type="hidden" name="registration_id" value={runner.id} />
  <input type="hidden" name="slug" value={slug} />
  <input type="hidden" name="checked_in" value="false" />

  <button type="submit" className="undo-checkin-button">
    Undo
  </button>
</form>
            ) : (
              <form action={checkInAction}>
                <input type="hidden" name="registration_id" value={runner.id} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="checked_in" value="true" />

                <button type="submit" className="checkin-button">
                  Check In
                </button>
              </form>
            )}
          </article>
        ))}

        {filteredRegistrations.length === 0 && (
          <div className="empty-card">
            <p>No runners found.</p>
          </div>
        )}
      </section>
    </main>
  );
}