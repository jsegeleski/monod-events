"use client";

export default function DeleteEventButton({
  eventId,
  eventTitle,
  action,
}: {
  eventId: string;
  eventTitle: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = confirm(
          `Delete "${eventTitle}"? This will permanently delete the event and all registrations.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="event_id" value={eventId} />

      <button
        type="submit"
        className="delete-icon-button"
        aria-label={`Delete ${eventTitle}`}
        title="Delete event"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}