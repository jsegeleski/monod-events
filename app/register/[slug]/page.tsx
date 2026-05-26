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
    if (error.code === "23505") {
      redirect(`/register/${slug}?duplicate=true`);
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
        klaviyo_error: klaviyoError.response?.data
          ? JSON.stringify(klaviyoError.response.data)
          : klaviyoError.message,
      })
      .eq("id", registration.id);
  }

  redirect(`/register/${slug}?success=true`);
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
    <main
      style={{
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "720px",
        margin: "0 auto",
        background: "#f4f5f5",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "20px", fontSize: "28px" }}>
        {event.title}
      </h1>

      {event.description && (
        <p style={{ fontSize: "16px", lineHeight: 1.5 }}>{event.description}</p>
      )}

      <p style={{ fontSize: "15px", marginBottom: "6px" }}>
        <strong>Date:</strong> {new Date(event.event_date).toLocaleString()}
      </p>

      {event.location && (
        <p style={{ fontSize: "15px", marginTop: 0 }}>
          <strong>Location:</strong> {event.location}
        </p>
      )}

      {resolvedSearchParams.success && (
        <div
          style={{
            background: "#e7f3e7",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "6px",
          }}
        >
          Registration successful.
        </div>
      )}
      {resolvedSearchParams.duplicate && (
        <div
          style={{
            background: "#f1ede3",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "6px",
          }}
        >
          Looks like you’re already registered for this event.
        </div>
      )}

      <form action={registerRunner} style={{ display: "grid", gap: "16px" }}>
        <input type="hidden" name="event_id" value={event.id} />
        <input type="hidden" name="slug" value={event.slug} />

        <label style={labelStyle}>
          First Name
          <input
            name="first_name"
            required
            placeholder="First Name"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Last Name
          <input
            name="last_name"
            required
            placeholder="Last Name"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email address"
            style={inputStyle}
          />
        </label>

        <p style={{ fontSize: "16px", lineHeight: 1.5, margin: "4px 0" }}>
          All participants must read and agree to the event{" "}
          {event.waiver_url ? (
            <a href={event.waiver_url} target="_blank" rel="noreferrer">
              Waiver
            </a>
          ) : (
            "Waiver"
          )}{" "}
          and{" "}
          {event.terms_url ? (
            <a href={event.terms_url} target="_blank" rel="noreferrer">
              Terms & Conditions
            </a>
          ) : (
            "Terms & Conditions"
          )}{" "}
          prior to registering.
        </p>

        <label style={checkboxStyle}>
          <input type="checkbox" name="accepted_waiver" required />
          <span>I accept the terms in the waiver</span>
        </label>

        <label style={checkboxStyle}>
          <input type="checkbox" name="accepted_terms" required />
          <span>I agree to the Terms and Conditions</span>
        </label>

        <label style={checkboxStyle}>
          <input type="checkbox" name="newsletter_opt_in" />
          <span>Keep me in the loop about latest events and news from Monod's</span>
        </label>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "999px",
            border: "0",
            background: "#1a1a1a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sign Me Up
        </button>
      </form>
    </main>
  );
}

const labelStyle = {
  display: "grid",
  gap: "8px",
  fontWeight: "bold",
  fontSize: "15px",
} as const;

const inputStyle = {
  width: "100%",
  padding: "14px",
  fontSize: "16px",
  border: "1px solid #aaa",
  borderRadius: "4px",
  boxSizing: "border-box",
} as const;

const checkboxStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  fontSize: "16px",
  lineHeight: 1.4,
} as const;