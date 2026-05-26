import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password"));

  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin-login?error=true");
  }

  const cookieStore = await cookies();

  cookieStore.set("admin_auth", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="modal-page">
      <section className="modal-card">
        <div className="modal-header">
          <div className="eyebrow">Monod Events</div>
          <h1>Admin Login</h1>
          <p className="muted">Enter the admin password to manage events.</p>
        </div>

        {resolvedSearchParams.error && (
          <p style={{ color: "var(--danger-text)" }}>Wrong password.</p>
        )}

        <form action={login} className="form-grid">
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