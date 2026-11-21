import { NEWS, ABOUT_TEXT, ABOUT_SOURCE, POLICIES_TEXT, POLICIES_SOURCE } from "./content/wix-content";
import { CALENDAR_EVENTS } from "./content/calendar";

const dateLabel = (iso: string | null) =>
  iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-IE", { timeZone: "Europe/Dublin", day: "numeric", month: "long", year: "numeric" }) : "";

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="club-site">
      <header className="club-header">
        <a className="club-brand" href="/" aria-label="Leeside home">
          <img className="club-logo" src="/icon-180.png" alt="" width={44} height={44} />
          <span>Leeside <small>Table Tennis Club</small></span>
        </a>
        <nav aria-label="Site pages">
          <a href="/news">News</a>
          <a href="/events">Event archive</a>
          <a href="/about">About</a>
          <a href="/policies">Policies</a>
          <a href="/#sessions">Sessions</a>
        </nav>
      </header>
      <main id="main" className="section">
        <p className="eyebrow">Leeside Table Tennis Club</p>
        <h1>{title}</h1>
        {children}
      </main>
      <footer>
        <div><strong>Leeside Table Tennis Club</strong><span>James Kenneally Sports Hall, Gurranabraher, Cork</span></div>
        <div><a href="/">Back to the home page</a></div>
      </footer>
    </div>
  );
}

const paragraphs = (text: string) => text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>);

export function NewsPage() {
  return (
    <PageShell title="News">
      <p className="source-note">Posts from the club's earlier website, shown in date order. Each post keeps a link to its original page.</p>
      <ul className="session-list">
        {NEWS.map((post) => (
          <li key={post.slug} className="card">
            <p className="eyebrow">{dateLabel(post.published)}{post.author ? ` · ${post.author}` : ""}</p>
            <h2><a href={`/news/${post.slug}`}>{post.title}</a></h2>
            {post.summary && <p>{post.summary}</p>}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

export function NewsPostPage({ slug }: { slug: string }) {
  const post = NEWS.find((p) => p.slug === slug);
  if (!post) return <PageShell title="Post not found"><p>This post is not on the new site. <a href="/news">See all news</a>.</p></PageShell>;
  return (
    <PageShell title={post.title}>
      <p className="eyebrow">{dateLabel(post.published)}{post.author ? ` · ${post.author}` : ""}</p>
      {post.images.map((src, i) => (
        <img key={i} src={src} alt={post.title} loading="lazy" style={{ maxWidth: "100%", height: "auto" }} />
      ))}
      {paragraphs(post.body || post.summary)}
      <p className="source-note">Originally published on the club's earlier website: <a href={post.source} rel="noopener">{post.source}</a></p>
      <p><a href="/news">All news</a></p>
    </PageShell>
  );
}

const dublinDate = (value: string) =>
  new Date(value + ":00Z").toLocaleDateString("en-IE", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" });

const dublinTime = (value: string) => value.slice(11, 16);

/** Past one-off events only. Regular weekly training is on the timetable and the calendar page, not here. */
export function EventArchivePage() {
  return (
    <PageShell title="Event archive">
      <p className="source-note">
        Tournaments and events from the club's earlier website. The weekly training timetable is on the{" "}
        <a href="/calendar">club calendar</a>.
      </p>
      <section aria-labelledby="oneoff">
        <h2 id="oneoff">Tournaments and one-off events</h2>
        {CALENDAR_EVENTS.map((e) => (
          <article key={e.id} className="card">
            <h3>{e.source ? <a href={e.source} rel="noopener">{e.title}</a> : e.title}</h3>
            <p className="eyebrow">
              {dublinDate(e.start)}, {dublinTime(e.start)}
              {e.end ? `–${dublinTime(e.end)}` : ""}
              {e.venue ? ` · ${e.venue}` : ""}
              {e.cancelled ? " · cancelled" : ""}
            </p>
            {e.description && paragraphs(e.description)}
            {e.source && <p className="source-note">Originally published on the club's earlier website: <a href={e.source} rel="noopener">{e.source}</a></p>}
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export function AboutPage() {
  return (
    <PageShell title="About the club">
      {ABOUT_TEXT.map((p, i) => <p key={i}>{p}</p>)}
      <p className="source-note">Source: <a href={ABOUT_SOURCE} rel="noopener">{ABOUT_SOURCE}</a></p>
    </PageShell>
  );
}

export function PoliciesPage() {
  return (
    <PageShell title="Policies and codes of conduct">
      {POLICIES_TEXT.map((p, i) => <p key={i}>{p}</p>)}
      <p className="source-note">Source: <a href={POLICIES_SOURCE} rel="noopener">{POLICIES_SOURCE}</a>. The full Club Handbook is available to members from a committee member.</p>
    </PageShell>
  );
}
