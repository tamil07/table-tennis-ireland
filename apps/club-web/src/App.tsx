import { leesideSessions } from "@tti/domain";
import { BrandMark, Button, Card, Pill, SectionHeading } from "@tti/ui";

const benefits = [
  ["01", "Play your way", "Coached junior groups, open practice, league training and social sessions."],
  ["02", "Belong locally", "A welcoming Cork community for first-time players, families and competitors."],
  ["03", "Keep improving", "Structured match history and coach-published development goals are coming to the member app."],
];

export function App() {
  return (
    <div className="club-site">
      <header className="club-header">
        <a className="club-brand" href="#top" aria-label="Leeside home">
          <BrandMark compact />
          <span>Leeside <small>Table Tennis Club</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#sessions">Sessions</a>
          <a href="#membership">Membership</a>
          <a href="#news">News</a>
        </nav>
        <a className="header-action" href="#join">Join the club <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <Pill>Based in Cork · Open to all levels</Pill>
            <h1>Find your rhythm.<br /><em>Own the table.</em></h1>
            <p>Friendly sessions, focused coaching and competitive play—built around a community that keeps everyone moving.</p>
            <div className="hero__actions">
              <a className="primary-link" href="#join">Start playing</a>
              <a className="text-link" href="#sessions">See weekly sessions <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero__visual" aria-label="Abstract table tennis court illustration">
            <div className="court"><span className="net" /><span className="ball" /></div>
            <div className="hero-note"><strong>5</strong><span>sessions<br />every week</span></div>
          </div>
        </section>

        <section className="benefits" aria-label="Why join">
          {benefits.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span><h2>{title}</h2><p>{description}</p>
            </article>
          ))}
        </section>

        <section className="sessions section" id="sessions">
          <SectionHeading eyebrow="Weekly timetable" title="A session for every player" action={<a href="#join">View membership →</a>} />
          <div className="session-list">
            {leesideSessions.map((session) => (
              <Card className="session" key={session.id}>
                <div><span className="session__day">{session.day.slice(0, 3)}</span><strong>{session.day}</strong></div>
                <div><h3>{session.title}</h3><p>{session.audience} · {session.venue}</p></div>
                <time>{session.time}</time>
              </Card>
            ))}
          </div>
        </section>

        <section className="membership section" id="membership">
          <div>
            <p className="eyebrow">Flexible membership</p>
            <h2>More time at the table.<br />Less admin.</h2>
            <p>Choose full, partial or pay-as-you-go membership. Payments remain offline during the pilot; club admins record membership dates and send an email acknowledgement.</p>
          </div>
          <Card className="join-card" id="join">
            <Pill tone="good">New players welcome</Pill>
            <h3>Ready for your first session?</h3>
            <p>Scan the entrance QR or use the national app with Leeside’s join code. A parent or guardian completes registration for juniors.</p>
            <Button>Begin registration</Button>
            <small>Demo foundation—registration connection follows the membership task.</small>
          </Card>
        </section>

        <section className="news section" id="news">
          <SectionHeading eyebrow="Club noticeboard" title="Latest from Leeside" />
          <div className="news-grid">
            <Card><Pill>Club update</Pill><h3>New season sessions announced</h3><p>Our weekly timetable is ready for the season. Existing and new members are welcome.</p><a href="#sessions">Read update →</a></Card>
            <Card><Pill>Platform pilot</Pill><h3>A simpler club experience is coming</h3><p>Membership, attendance, matches and coaching information will move into one secure platform.</p><a href="#join">Learn more →</a></Card>
          </div>
        </section>
      </main>

      <footer><div><strong>Leeside Table Tennis Club</strong><span>Cork, Ireland</span></div><p>Club website powered by the independent TT Clubs platform.</p></footer>
    </div>
  );
}
