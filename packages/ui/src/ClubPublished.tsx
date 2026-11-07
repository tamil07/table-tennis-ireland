import { useEffect, useState } from "react";
import { pilotClubId } from "@tti/domain";
import { liveMode } from "./club-client";
type Published = {
  name: string;
  appUrl: string;
  pages: { id: string; title: string; body: string; event: string }[];
  plans: {
    id: string;
    name: string;
    price: number;
    months: number;
    entitlement: string;
  }[];
  events: { id: string; title: string; date: string; status: string }[];
  privacy: string;
  safeguarding: string;
  policy: string;
};
export function ClubPublished() {
  const [published, setPublished] = useState<Published | null>(null),
    [error, setError] = useState("");
  const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
  const url = `${env.VITE_SUPABASE_URL}/functions/v1/club-public?club=${pilotClubId}`;
  useEffect(() => {
    if (!liveMode) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active) {
          setPublished(data);
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Current published updates are unavailable. Contact the club or use the existing Wix links below.",
          );
      }
    };
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  if (!liveMode) return null;
  return (
    <section className="club-ops" id="published">
      <h2>Published by Leeside</h2>
      {error && <p role="status">{error}</p>}
      {published && (
        <>
          <div className="ops-grid">
            {published.pages.map((p) => (
              <article key={p.id}>
                <h3>{p.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{p.body}</p>
                {p.event && (
                  <a
                    href={`${published.appUrl}/#club=${pilotClubId}&view=matches&event=${encodeURIComponent(p.event)}`}
                  >
                    Open event / add your result →
                  </a>
                )}
              </article>
            ))}
            <article>
              <h3>Current membership types</h3>
              {published.plans.map((p) => (
                <p key={p.id}>
                  <strong>{p.name}</strong>: €{(p.price / 100).toFixed(2)} ·{" "}
                  {p.months} months · {p.entitlement}
                </p>
              ))}
            </article>
            <article>
              <h3>Events</h3>
              {published.events.map((e) => (
                <p key={e.id}>
                  {e.title} · {e.date} · {e.status} ·{" "}
                  <a
                    href={`${published.appUrl}/#club=${pilotClubId}&view=matches&event=${encodeURIComponent(e.id)}`}
                  >
                    Open event
                  </a>
                </p>
              ))}
              <a href={`${url}&format=rss`}>News RSS feed</a> ·{" "}
              <a href={`${url}&format=ics`}>Subscribe to calendar</a>
            </article>
          </div>
          <p>Privacy: {published.privacy || "Contact not configured"}</p>
          <p>
            Safeguarding: {published.safeguarding || "Contact not configured"}
          </p>
          <p>{published.policy}</p>
        </>
      )}
    </section>
  );
}
