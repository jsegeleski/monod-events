import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {

  sendKlaviyoEvent,

  subscribeToKlaviyoNewsletter,

} from "@/lib/klaviyo";
import { formatEventDate } from "@/lib/dates";

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
    if (error.code === "23505") {
      redirect(`/embed/register/${slug}?duplicate=true`);
    }

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
  searchParams: Promise<{ success?: string; duplicate?: string }>;
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
    <main className="embed-page">
      <h1>{event.title}</h1>

      <p>{event.description}</p>

      <p>
        <strong>Date:</strong>{" "}
        {formatEventDate(event.event_date)}
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

      {resolvedSearchParams.duplicate && (
        <div
          style={{
            background: "#f1ede3",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          Looks like you’re already registered for this event.
        </div>
      )}

      <form action={registerRunner} className="embed-form">
  <input type="hidden" name="event_id" value={event.id} />
  <input type="hidden" name="slug" value={event.slug} />

  <div className="embed-name-row">
    <label>
      First Name
      <input name="first_name" required placeholder="First Name" />
    </label>

    <label>
      Last Name
      <input name="last_name" required placeholder="Last Name" />
    </label>
  </div>

  <label>
    Email
    <input
      type="email"
      name="email"
      required
      placeholder="Enter your email address"
    />
  </label>

  <p className="embed-legal-text">
    All participants must read and agree to the event{" "}
    <a href="https://www.monodsports.com/pages/liability-waiver" target="_blank" rel="noreferrer">
      Waiver
    </a>{" "}
    and{" "}
    <a href="https://www.monodsports.com/pages/terms-of-use" target="_blank" rel="noreferrer">
      Terms & Conditions
    </a>{" "}
    prior to registering.
  </p>

  <label className="embed-checkbox">
    <input type="checkbox" name="accepted_waiver" required />
    <span>I accept the terms in the waiver</span>
  </label>

  <label className="embed-checkbox">
    <input type="checkbox" name="accepted_terms" required />
    <span>I agree to the Terms and Conditions</span>
  </label>

  <label className="embed-checkbox">
    <input type="checkbox" name="newsletter_opt_in" />
    <span>Keep me in the loop about latest events and news from Monod's</span>
  </label>

  <button type="submit">Sign Me Up</button>
</form>
    </main>
  );
}

<script
  dangerouslySetInnerHTML={{
    __html: `
      function sendHeight() {
        window.parent.postMessage({
          type: 'monod-event-form-height',
          height: document.documentElement.scrollHeight
        }, '*');
      }

      window.addEventListener('load', sendHeight);
      window.addEventListener('resize', sendHeight);
      setTimeout(sendHeight, 250);
      setTimeout(sendHeight, 1000);
    `,
  }}
/>