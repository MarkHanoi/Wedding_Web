import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Dashboard = {
  emailAlerts: "ready" | "check_failed" | "not_configured";
  emailProvider?: "cloudflare";
  summary: {
    total: number;
    attending: number;
    declined: number;
    people_attending: number;
  };
  visits: {
    total: number;
    last30Days: number;
    byDay: { date: string; views: number }[];
  };
  rsvps: {
    id: string;
    name: string;
    attending: "yes" | "no";
    guests: number;
    shuttle: boolean;
    events: string[];
    arrival: string;
    transportEmail: string;
    dietary: string;
    message: string;
    receivedAt: string;
  }[];
};

const API_PREFIX = "/api";

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (body.error === "admin_not_configured") {
    return "Admin sign-in is not configured yet. Set a unique ADMIN_PASSWORD secret of at least 16 characters.";
  }
  if (body.error === "too_many_attempts") {
    return "Too many attempts. Please wait 15 minutes before trying again.";
  }
  return "We couldn’t complete that request. Please try again.";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function getLastFourteenDays() {
  const today = new Date();
  const rows = new Map<string, number>();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    rows.set(date.toISOString().slice(0, 10), 0);
  }
  return rows;
}

export default function AdminPage() {
  const [email, setEmail] = useState("lookwithinjourney@gmail.com");
  const [password, setPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const response = await fetch(`${API_PREFIX}/admin/dashboard`);
      if (response.status === 401) {
        setAuthenticated(false);
        setDashboard(null);
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      setDashboard((await response.json()) as Dashboard);
      setAuthenticated(true);
      setError("");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_PREFIX}/admin/session`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check the admin session.");
        return (await response.json()) as { authenticated: boolean };
      })
      .then(async (session) => {
        if (!active) return;
        if (session.authenticated) {
          setAuthenticated(true);
          await loadDashboard();
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load the admin page.");
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const chartRows = useMemo(() => {
    const rows = getLastFourteenDays();
    for (const row of dashboard?.visits.byDay ?? []) {
      if (rows.has(row.date)) rows.set(row.date, row.views);
    }
    const maximum = Math.max(1, ...rows.values());
    return Array.from(rows.entries()).map(([date, views]) => ({
      date,
      views,
      height: Math.max(4, Math.round((views / maximum) * 100)),
      label: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "Europe/London",
      }).format(new Date(`${date}T12:00:00Z`)),
    }));
  }, [dashboard?.visits.byDay]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_PREFIX}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setPassword("");
      setAuthenticated(true);
      await loadDashboard();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_PREFIX}/admin/logout`, { method: "POST" }).catch(() => undefined);
    setAuthenticated(false);
    setDashboard(null);
    setPassword("");
  };

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="admin-wordmark" href="/" aria-label="Return to the wedding website">
          C<span>&</span>A
        </a>
        <p>Wedding responses</p>
        {authenticated ? (
          <button className="admin-quiet-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        ) : (
          <a className="admin-back-link" href="/">Back to the website</a>
        )}
      </header>

      {checkingSession ? (
        <section className="admin-loading" role="status">Checking your secure session…</section>
      ) : !authenticated ? (
        <section className="admin-login-card">
          <p className="admin-eyebrow">PRIVATE AREA</p>
          <h1>Welcome back</h1>
          <p className="admin-intro">Sign in to see the wedding RSVPs and anonymous site visit totals.</p>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary-button" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="admin-login-note">Access is restricted to lookwithinjourney@gmail.com.</p>
        </section>
      ) : (
        <div className="admin-dashboard">
          <div className="admin-heading-row">
            <div>
              <p className="admin-eyebrow">CLÉMENCE & ANTONIO</p>
              <h1>Your wedding dashboard</h1>
              <p className="admin-intro">Responses and anonymous site opens, all in one place.</p>
            </div>
            <button
              className="admin-quiet-button admin-refresh-button"
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loadingDashboard}
            >
              {loadingDashboard ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {error && <p className="admin-error admin-dashboard-error" role="alert">{error}</p>}

          {dashboard ? (
            <>
              {dashboard.emailAlerts !== "ready" && (
                <div className="admin-mail-notice" role="status">
                  <strong>
                    {dashboard.emailAlerts === "not_configured"
                      ? "Email alerts need setup"
                      : "Email setup needs attention"}
                  </strong>
                  <span>
                    {dashboard.emailAlerts === "not_configured"
                      ? dashboard.emailProvider === "cloudflare"
                        ? "Enable Cloudflare Email Sending and set a verified sender address to send RSVP notifications."
                        : "Add the GMAIL_APP_PASSWORD secret to send RSVP notifications to lookwithinjourney@gmail.com."
                      : dashboard.emailProvider === "cloudflare"
                        ? "Cloudflare email sending could not deliver a test message. Check the Email Service setup."
                        : "Gmail could not verify the app password. Check the GMAIL_APP_PASSWORD secret and try refreshing."}
                  </span>
                </div>
              )}
              <section className="admin-stat-grid" aria-label="Wedding overview">
                <article className="admin-stat-card">
                  <span>RSVPs received</span>
                  <strong>{dashboard.summary.total}</strong>
                  <small>{dashboard.summary.attending} accepts · {dashboard.summary.declined} declines</small>
                </article>
                <article className="admin-stat-card">
                  <span>People attending</span>
                  <strong>{dashboard.summary.people_attending}</strong>
                  <small>Including additional guests</small>
                </article>
                <article className="admin-stat-card">
                  <span>Site opens</span>
                  <strong>{dashboard.visits.total}</strong>
                  <small>{dashboard.visits.last30Days} in the last 30 days</small>
                </article>
              </section>

              <section className="admin-panel admin-visits-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Site visits</h2>
                    <p>Wedding website opens over the last 14 days</p>
                  </div>
                  <span className="admin-chart-note">Anonymous totals only</span>
                </div>
                <div className="admin-chart" role="img" aria-label="Bar chart of anonymous website opens over the last 14 days">
                  {chartRows.map((row) => (
                    <div className="admin-chart-column" key={row.date} title={`${row.label}: ${row.views} opens`}>
                      <span className="admin-chart-value">{row.views || ""}</span>
                      <span className="admin-chart-bar" style={{ height: `${row.height}%` }} />
                      <span className="admin-chart-label">{row.label}</span>
                    </div>
                  ))}
                </div>
                <p className="admin-privacy-note">
                  These are page opens, not identified guests. The site does not match visits to individual people.
                </p>
              </section>

              <section className="admin-panel admin-rsvps-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Guest responses</h2>
                    <p>{dashboard.rsvps.length} {dashboard.rsvps.length === 1 ? "response" : "responses"}</p>
                  </div>
                </div>
                {dashboard.rsvps.length === 0 ? (
                  <div className="admin-empty-state">
                    <span aria-hidden="true">✳</span>
                    <h3>No responses yet</h3>
                    <p>New RSVPs will appear here as soon as guests reply.</p>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-rsvp-table">
                      <thead>
                        <tr>
                          <th scope="col">Guest</th>
                          <th scope="col">Reply</th>
                          <th scope="col">Party</th>
                          <th scope="col">Events</th>
                          <th scope="col">Transport help</th>
                          <th scope="col">Transport email</th>
                          <th scope="col">Arrival</th>
                          <th scope="col">Dietary requirements</th>
                          <th scope="col">Note</th>
                          <th scope="col">Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.rsvps.map((rsvp) => (
                          <tr key={rsvp.id}>
                            <th scope="row">{rsvp.name}</th>
                            <td>
                              <span className={`admin-status admin-status--${rsvp.attending}`}>
                                {rsvp.attending === "yes" ? "Accepts" : "Declines"}
                              </span>
                            </td>
                            <td>{rsvp.attending === "yes" ? 1 + rsvp.guests : "—"}</td>
                            <td>{rsvp.events.map((event) => event.replace(/^./, (letter) => letter.toUpperCase())).join(", ") || "—"}</td>
                            <td>{rsvp.attending === "yes" ? (rsvp.shuttle ? "Yes" : "No") : "—"}</td>
                            <td>{rsvp.transportEmail || "—"}</td>
                            <td>{rsvp.arrival || "—"}</td>
                            <td>{rsvp.dietary || "—"}</td>
                            <td>{rsvp.message || "—"}</td>
                            <td className="admin-date-cell">{formatDate(rsvp.receivedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : loadingDashboard ? (
            <section className="admin-loading" role="status">Loading your dashboard…</section>
          ) : null}
        </div>
      )}
    </main>
  );
}
