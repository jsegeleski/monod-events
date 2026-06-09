import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password"));

  if (password !== process.env.CHECKIN_PASSWORD) {
    redirect("/checkin-login?error=true");
  }

  const cookieStore = await cookies();

  cookieStore.set("checkin_auth", "true", {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});

  const next = String(formData.get("next") || "/admin");
  redirect(next);
}

export default async function CheckInLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="modal-page">
      <section className="modal-card">
        <div className="modal-header">
          <div className="eyebrow">Event Check-In</div>
          <h1>Check-In Login</h1>
          <p className="muted">Enter the check-in password to continue.</p>
        </div>

        {resolvedSearchParams.error && (
          <p style={{ color: "var(--danger-text)" }}>Wrong password.</p>
        )}

        <form action={login} className="form-grid">
          <input
            type="hidden"
            name="next"
            value={resolvedSearchParams.next || "/admin"}
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            required
          />

          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}