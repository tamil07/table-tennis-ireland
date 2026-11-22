import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import {
  CALENDAR_EVENTS,
  CALENDAR_FEED,
  SEASON_START,
  dublinWall,
  loadLiveTimetable,
  weeklyOccurrences,
  type CalendarEvent,
  type LiveTimetable,
} from "./content/calendar";
import { PageShell } from "./Pages";

type Selected = {
  title: string;
  when: string;
  venue: string | null;
  description: string | null;
  source: string | null;
  cancelled: boolean;
};

/** End of the season window shown in the fallback calendar: one year from the season start. */
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

type Source = { kind: "live"; data: LiveTimetable } | { kind: "fallback"; reason: string } | { kind: "loading" };

export function CalendarPage() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [source, setSource] = useState<Source>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    loadLiveTimetable()
      .then((data) => active && setSource({ kind: "live", data }))
      .catch((error: Error) => active && setSource({ kind: "fallback", reason: error.message }));
    return () => {
      active = false;
    };
  }, []);

  const events = useMemo(() => {
    const oneOffs = CALENDAR_EVENTS.map(oneOffEvent);
    if (source.kind === "live") {
      const sessions = source.data.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        start: dublinWall(s.start),
        end: dublinWall(s.end),
        classNames: ["calendar-training"],
        extendedProps: { venue: s.venue, description: null, source: null, cancelled: false } as Record<string, unknown>,
      }));
      const closures = source.data.closures.map((c) => ({
        id: `closure-${c.id}`,
        title: c.reason,
        start: dublinWall(c.start),
        end: dublinWall(c.end),
        display: "background",
        classNames: ["calendar-closed"],
        extendedProps: { venue: null, description: null, source: null, cancelled: true } as Record<string, unknown>,
      }));
      return [...sessions, ...closures, ...oneOffs];
    }
    // Fallback: the confirmed regular timetable, clearly labelled on the page.
    return [
      ...weeklyOccurrences(SEASON_START, SEASON_END).map((o) => ({
        id: o.id,
        title: o.title,
        start: o.start,
        end: o.end,
        classNames: ["calendar-training"],
        extendedProps: { venue: o.venue, description: o.audience, source: null, cancelled: false } as Record<string, unknown>,
      })),
      ...oneOffs,
    ];
  }, [source]);

  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const feedUrl = `${origin}${CALENDAR_FEED}`;

  return (
    <PageShell title="Club calendar">
      <p>
        Weekly training, club events and closures. Subscribe once and the calendar on your phone or computer keeps itself up to date.
      </p>
      {source.kind === "fallback" && (
        <p className="source-note" role="status">
          The live timetable is not available right now, so the regular weekly timetable is shown. Check with the club before travelling.
        </p>
      )}
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
          displayEventTime={narrow}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          noEventsContent="No events in this view"
          eventClick={(info) => {
            if (info.event.display === "background") return;
            const p = info.event.extendedProps;
            const start = info.event.start;
            setSelected({
              title: info.event.title,
              when: start ? start.toLocaleString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "",
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
