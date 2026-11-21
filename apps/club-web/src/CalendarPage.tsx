import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { CALENDAR_EVENTS, CALENDAR_FEED, SEASON_START, weeklyOccurrences, type CalendarEvent } from "./content/calendar";
import { PageShell } from "./Pages";

type Selected = {
  title: string;
  when: string;
  venue: string | null;
  description: string | null;
  source: string | null;
  cancelled: boolean;
};

/** End of the season window shown in the calendar: one year from the season start. */
const SEASON_END = (() => {
  const d = new Date(`${SEASON_START}T12:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
})();

const oneOffEvent = (e: CalendarEvent) => ({
  id: e.id,
  title: e.title,
  start: e.start,
  end: e.end ?? undefined,
  classNames: e.cancelled ? ["calendar-cancelled"] : ["calendar-event"],
  extendedProps: { venue: e.venue, description: e.description, source: e.source, cancelled: e.cancelled } as Record<string, unknown>,
});

export function CalendarPage() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const events = useMemo(
    () => [
      ...weeklyOccurrences(SEASON_START, SEASON_END).map((o) => ({
        id: o.id,
        title: o.title,
        start: o.start,
        end: o.end,
        classNames: ["calendar-training"],
        extendedProps: { venue: o.venue, description: o.audience, source: null, cancelled: false } as Record<string, unknown>,
      })),
      ...CALENDAR_EVENTS.map(oneOffEvent),
    ],
    [],
  );
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const feedUrl = `${origin}${CALENDAR_FEED}`;

  return (
    <PageShell title="Club calendar">
      <p>
        Weekly training and club events. Subscribe once and the calendar on your phone or computer keeps itself up to date.
      </p>
      <section className="calendar-subscribe" aria-labelledby="subscribe-heading">
        <h2 id="subscribe-heading">Add to your calendar</h2>
        <ul className="calendar-links">
          <li><a href={`webcal://${host}${CALENDAR_FEED}`}>iPhone, iPad and Mac: subscribe</a></li>
          <li><a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`} rel="noopener">Google Calendar: add by URL</a></li>
          <li><a href={CALENDAR_FEED} download="leeside-calendar.ics">Android, Windows or any calendar app: download (.ics)</a></li>
        </ul>
        <p className="source-note">
          Subscription address: <code>{feedUrl}</code>. Android: copy this address into Google Calendar under "From URL" to keep it updated.
        </p>
      </section>
      <section aria-label="Calendar" className="club-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView={narrow ? "listMonth" : "dayGridMonth"}
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,listMonth" }}
          buttonText={{ today: "Today", dayGridMonth: "Month", listMonth: "List" }}
          locale="en-gb"
          firstDay={1}
          height="auto"
          events={events}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          displayEventTime={narrow}
          noEventsContent="No events in this view"
          eventClick={(info) => {
            const p = info.event.extendedProps;
            const start = info.event.start;
            setSelected({
              title: info.event.title,
              when: start ? start.toLocaleString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: undefined }) : "",
              venue: (p.venue as string | null) ?? null,
              description: (p.description as string | null) ?? null,
              source: (p.source as string | null) ?? null,
              cancelled: Boolean(p.cancelled),
            });
          }}
        />
      </section>
      {selected && (
        <section aria-live="polite" className="card calendar-detail">
          <h2>{selected.title}{selected.cancelled ? " (cancelled)" : ""}</h2>
          <p>{selected.when}</p>
          {selected.venue && <p>{selected.venue}</p>}
          {selected.description && <p>{selected.description}</p>}
          {selected.source && (
            <p className="source-note">Originally published on the club's earlier website: <a href={selected.source} rel="noopener">{selected.source}</a></p>
          )}
          <button type="button" onClick={() => setSelected(null)}>Close</button>
        </section>
      )}
    </PageShell>
  );
}
