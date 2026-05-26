import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {

  sendKlaviyoEvent,

  subscribeToKlaviyoNewsletter,

} from "@/lib/klaviyo";

async function registerRunner(formData: FormData) {
  "use server";

  const eventId = String(formData.get("event_id"));
  const slug = String(formData.get("slug"));

  const firstName = String(formData.get("first_name"));
  const lastName = String(formData.get("last_name"));
  const email = String(formData.get("email"));

  const acceptedWaiver = formData.get("accepted_waiver") === "on";
  const acceptedTerms = formData.get("accepted_terms") === "on";
  const newsletterOptIn = formData.get("newsletter_opt_in") === "on";

  const now = new Date().toISOString();

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    throw new Error("Event not found");
  }

  const { data: registration, error } = await supabaseAdmin
    .from("registrations")
    .insert({
      event_id: eventId,
      first_name: firstName,
      last_name: lastName,
      email,
      accepted_waiver: acceptedWaiver,
      accepted_terms: acceptedTerms,
      newsletter_opt_in: newsletterOptIn,
      source: "monod_events_app",
      waiver_accepted_at: acceptedWaiver ? now : null,
      terms_accepted_at: acceptedTerms ? now : null,
      marketing_consent_timestamp: newsletterOptIn ? now : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  try {
    await sendKlaviyoEvent({
      email,
      firstName,
      lastName,
      eventTitle: event.title,
      eventSlug: event.slug,
      eventDate: event.event_date,
      location: event.location,
      
    });

    if (newsletterOptIn) {
  await subscribeToKlaviyoNewsletter({
    email,
    firstName,
    lastName,
  });
}

    await supabaseAdmin
      .from("registrations")
      .update({
        klaviyo_event_sent: true,
        klaviyo_event_sent_at: now,
      })
      .eq("id", registration.id);
  } catch (klaviyoError: any) {
    await supabaseAdmin
      .from("registrations")
      .update({
        klaviyo_error:
  klaviyoError.response?.data
    ? JSON.stringify(klaviyoError.response.data)
    : klaviyoError.message,
      })
      .eq("id", registration.id);
  }

  redirect(`/embed/register/${slug}?success=true`);
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "600px" }}>
      <h1>{event.title}</h1>

      <p>{event.description}</p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(event.event_date).toLocaleString()}
      </p>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      {resolvedSearchParams.success && (
        <div
          style={{
            background: "#dff0d8",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          Registration successful.
        </div>
      )}

      <form action={registerRunner} style={{ display: "grid", gap: "14px" }}>
        <input type="hidden" name="event_id" value={event.id} />
        <input type="hidden" name="slug" value={event.slug} />

        <label>
          First Name
          <input
            name="first_name"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </label>

        <label>
          Last Name
          <input
            name="last_name"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </label>

        <label>
          <input type="checkbox" name="accepted_waiver" required /> I accept
          the waiver
        </label>

        <label>
          <input type="checkbox" name="accepted_terms" required /> I accept the
          terms & conditions
        </label>

        <label>
          <input type="checkbox" name="newsletter_opt_in" /> Subscribe to email
          updates and newsletters
        </label>

        <button type="submit" style={{ padding: "12px 16px" }}>
          Register
        </button>
      </form>
    </main>
  );
}