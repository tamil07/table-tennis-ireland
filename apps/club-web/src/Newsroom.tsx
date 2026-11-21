import { NEWS, type Post } from "./content/wix-content";
import { CALENDAR_EVENTS, upcomingEvents, type CalendarEvent } from "./content/calendar";
import { PageShell } from "./Pages";

// News and events pages. Layout rules: one idea per block, one action per card, and no decoration
// beyond the club's own colours. Works without photos: a photo is shown only when one exists.

const TZ = "Europe/Dublin";
const shortDay = (iso: string) =>
  new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-IE", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
const longDay = (iso: string) =>
  new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-IE", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const yearOf = (iso: string) => iso.slice(0, 4);
const timeOf = (iso: string) => iso.slice(11, 16);

const newsByDate = [...NEWS].filter((p) => p.published).sort((a, b) => (b.published! > a.published! ? 1 : -1));
const RESULTS_SOURCE = "https://munstertabletennis.com/";

function EventCard({ event, past = false }: { event: CalendarEvent; past?: boolean }) {
  return (
    <article className="nr-card nr-event">
      <div className="nr-date" aria-hidden="true">
        <span>{new Date(event.start.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-IE", { timeZone: TZ, month: "short" })}</span>
        <strong>{event.start.slice(8, 10).replace(/^0/, "")}</strong>
      </div>
      <div className="nr-body">
        <p className="nr-meta">
          {longDay(event.start)} · {timeOf(event.start)}
          {event.end ? `–${timeOf(event.end)}` : ""}
          {event.cancelled ? " · Cancelled" : ""}
        </p>
        <h3>{event.title}</h3>
        {event.venue && <p className="nr-muted">{event.venue}</p>}
        {event.description && <p>{event.description}</p>}
        {event.source && (
          <a className="nr-link" href={event.source} rel="noopener">
            {past ? "Original page" : "Details"} →
          </a>
        )}
      </div>
    </article>
  );
}

function NewsCard({ post }: { post: Post }) {
  return (
    <article className="nr-card nr-news">
      {post.images[0] && <img className="nr-image" src={post.images[0]} alt="" loading="lazy" />}
      <div className="nr-body">
        {post.published && <p className="nr-meta">{longDay(post.published)}</p>}
        <h3><a href={`/news/${post.slug}`}>{post.title}</a></h3>
        <a className="nr-link" href={`/news/${post.slug}`}>Read →</a>
      </div>
    </article>
  );
}

/** The single most important item on the page: the next event, or the latest news when nothing is scheduled. */
function Featured({ now }: { now: number }) {
  const next = upcomingEvents(now)[0];
  if (next) {
    return (
      <section className="nr-feature" aria-labelledby="featured-heading">
        <p className="nr-kicker">Next event</p>
        <h2 id="featured-heading">{next.title}</h2>
        <p className="nr-meta">{longDay(next.start)} · {timeOf(next.start)}{next.venue ? ` · ${next.venue}` : ""}</p>
        {next.description && <p className="nr-lead">{next.description}</p>}
        {next.source && <a className="nr-button" href={next.source} rel="noopener">Details</a>}
      </section>
    );
  }
  const latest = newsByDate[0];
  if (!latest) return null;
  return (
    <section className="nr-feature" aria-labelledby="featured-heading">
      <p className="nr-kicker">Latest</p>
      <h2 id="featured-heading"><a href={`/news/${latest.slug}`}>{latest.title}</a></h2>
      {latest.published && <p className="nr-meta">{longDay(latest.published)}</p>}
      <a className="nr-button" href={`/news/${latest.slug}`}>Read</a>
    </section>
  );
}

export function NewsPage() {
  const now = Date.now();
  const upcoming = upcomingEvents(now);
  return (
    <PageShell title="News and events">
      <div className="nr">
        <Featured now={now} />

        <section className="nr-section" aria-labelledby="upcoming-heading">
          <header className="nr-section-head">
            <h2 id="upcoming-heading">Upcoming</h2>
            <a href="/calendar">Full calendar →</a>
          </header>
          {upcoming.length > 0 ? (
            <div className="nr-grid">
              {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <p className="nr-empty">No events are scheduled yet. Weekly training is on the <a href="/calendar">club calendar</a>.</p>
          )}
        </section>

        <section className="nr-section" aria-labelledby="results-heading">
          <header className="nr-section-head">
            <h2 id="results-heading">Results</h2>
          </header>
          <p className="nr-empty">
            Results are published after each event. Find the latest tournament results on{" "}
            <a href={RESULTS_SOURCE} rel="noopener">Munster Table Tennis</a>.
          </p>
        </section>

        <section className="nr-section" aria-labelledby="news-heading">
          <header className="nr-section-head">
            <h2 id="news-heading">Latest news</h2>
            <a href="/news/archive">Archive →</a>
          </header>
          <div className="nr-grid">
            {newsByDate.slice(0, 6).map((post) => <NewsCard key={post.slug} post={post} />)}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/** Every news post, newest first, grouped by year. */
export function NewsArchivePage() {
  const years = [...new Set(newsByDate.map((p) => yearOf(p.published!)))];
  return (
    <PageShell title="News archive">
      <div className="nr">
        {years.map((year) => (
          <section key={year} className="nr-section" aria-labelledby={`news-${year}`}>
            <header className="nr-section-head">
              <h2 id={`news-${year}`}>{year}</h2>
            </header>
            <ul className="nr-list">
              {newsByDate.filter((p) => yearOf(p.published!) === year).map((post) => (
                <li key={post.slug}>
                  <span className="nr-meta">{shortDay(post.published!)}</span>
                  <a href={`/news/${post.slug}`}>{post.title}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="nr-muted"><a href="/news">Back to news and events</a></p>
      </div>
    </PageShell>
  );
}

/** Past one-off events (tournaments and club events), grouped by year. Regular training is on the calendar. */
export function EventArchivePage() {
  const events = [...CALENDAR_EVENTS].sort((a, b) => (b.start > a.start ? 1 : -1));
  const years = [...new Set(events.map((e) => yearOf(e.start)))];
  return (
    <PageShell title="Event archive">
      <div className="nr">
        {events.length === 0 && <p className="nr-empty">No past events are listed.</p>}
        {years.map((year) => (
          <section key={year} className="nr-section" aria-labelledby={`events-${year}`}>
            <header className="nr-section-head">
              <h2 id={`events-${year}`}>{year}</h2>
            </header>
            <div className="nr-grid">
              {events.filter((e) => yearOf(e.start) === year).map((e) => (
                <EventCard key={e.id} event={e} past />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
