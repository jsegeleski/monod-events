import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CheckInClient from "./CheckInClient";

async function checkInRunner(formData: FormData) {
  "use server";

  const registrationId = String(formData.get("registration_id"));
  const slug = String(formData.get("slug"));

  const shouldCheckIn = formData.get("checked_in") === "true";

const { error } = await supabaseAdmin
  .from("registrations")
  .update({
    checked_in: shouldCheckIn,
    checked_in_at: shouldCheckIn ? new Date().toISOString() : null,
  })
  .eq("id", registrationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/check-in/${slug}`);
  redirect(`/check-in/${slug}`);
}

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  const { data: registrations } = await supabaseAdmin
    .from("registrations")
    .select("id, first_name, last_name, email, checked_in, early_badge_qualified")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  const checkedInCount =
    registrations?.filter((runner) => runner.checked_in).length || 0;

  const registeredCount = registrations?.length || 0;

  return (
    <CheckInClient
      eventTitle={event.title}
      slug={slug}
      registrations={registrations || []}
      checkedInCount={checkedInCount}
      registeredCount={registeredCount}
      checkInAction={checkInRunner}
    />
  );
}