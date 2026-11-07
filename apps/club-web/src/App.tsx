import { leesideSessions } from "@tti/domain";
import { BrandMark, Card, Pill, SectionHeading, SessionBookingDemo } from "@tti/ui";

const benefits = [
  ["01", "Play your way", "Five weekly sessions welcome players across ages, abilities and ambitions."],
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
          <a href="#booking">Book a place</a>
          <a href="#membership">Membership</a>
          <a href="#news">News</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-action" href="#join">Join the club <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <p className="site-preview">Website preview · Online registration and live reservations are not yet available. Contact the club for actual arrangements.</p>
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
          <p className="source-note">Club-confirmed timetable · Europe/Dublin local time. The existing club website states public-holiday closures; check with the club for exceptions.</p>
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

        <section className="section" id="about">
          <SectionHeading eyebrow="Your Cork club" title="Play, belong and improve" />
          <p>Leeside welcomes players who want to play for fun or develop towards school, provincial and national competition. Five weekly sessions take place at James Kenneally Sports Hall, Hollyhill Lane, Gurranabraher, Cork, T23 W880.</p>
          <p>The existing club website introduces coaches Ben Haughton, Gary Mahoney, Conall Conroy, Jean Auchapt and Alessandra Fada. Contact the club about current coaching availability.</p>
          <a href="https://leesidetabletennis.wixsite.com/home/about">Read the club’s existing About and coaching page →</a>
        </section>

        <SessionBookingDemo />
        <section className="membership section" id="membership">
          <div>
            <p className="eyebrow">Flexible membership</p>
            <h2>More time at the table.<br />Less admin.</h2>
            <p>Choose full, partial or pay-as-you-go membership. Arrange payments directly with the club. Online membership management and optional email acknowledgements are being prepared for the pilot.</p>
            <ul className="membership-options"><li><strong>Full:</strong> €190 for six months, five weekly sessions.</li><li><strong>Partial:</strong> €100 for six months, one weekly session.</li><li><strong>Pay as you go:</strong> €10 per adult or €5 per child per session.</li></ul>
            <p className="source-note">Published on the existing club About page, recorded 6 November 2026. Confirm current prices and availability with Leeside; these are not live account entitlements.</p>
          </div>
          <Card className="join-card" id="join">
            <Pill tone="good">New players welcome</Pill>
            <h3>Ready for your first session?</h3>
            <p>Contact Leeside to arrange your first visit. A parent or guardian should enquire for a junior. Online registration and the configurable trial process are still being prepared.</p>
            <a className="primary-link" href="mailto:leesidettie@gmail.com?subject=Leeside%20first%20session%20enquiry">Email the club</a>
            <small>This opens your email app. No registration or reservation is submitted by this website.</small>
          </Card>
        </section>

        <section className="news section" id="news">
          <SectionHeading eyebrow="Club noticeboard" title="Latest from Leeside" />
          <div className="news-grid">
            <Card><Pill>Club news</Pill><h3>News from the club</h3><p>Read the existing club news archive while articles and photographs are being migrated.</p><a href="https://leesidetabletennis.wixsite.com/home/blog">Open Leeside news →</a></Card>
            <Card><Pill>Club calendar</Pill><h3>Events and competitions</h3><p>Check the existing calendar and contact Leeside to confirm event dates and availability.</p><a href="https://leesidetabletennis.wixsite.com/home/general-1">Open the existing calendar →</a></Card>
          </div>
        </section>

        <section className="section" id="contact">
          <SectionHeading eyebrow="Contact and club information" title="Talk to Leeside" />
          <div className="news-grid"><Card><h3>Contact</h3><p>James Kenneally Sports Hall, Hollyhill Lane, Gurranabraher, Cork, T23 W880.</p><p><a href="mailto:leesidettie@gmail.com">leesidettie@gmail.com</a></p><p><a href="tel:+353838307259">+353 (0)83 830 7259</a></p><a href="https://www.facebook.com/people/Leeside-Table-Tennis-Club/100069763473060/">Leeside on Facebook →</a></Card><Card><h3>Policies and safeguarding</h3><p>Use the club’s existing policies page for published documents and safeguarding information. Updated contacts and privacy information will be managed by Leeside’s authorized team.</p><a href="https://leesidetabletennis.wixsite.com/home/general-5">Open club policies →</a><p>Please contact the club directly for the current safeguarding or privacy contact. This preview does not collect membership applications.</p></Card></div>
        </section>
      </main>

      <footer><div><strong>Leeside Table Tennis Club</strong><span>James Kenneally Sports Hall · Hollyhill Lane · Cork · T23 W880</span><a href="tel:+353838307259">+353 (0)83 830 7259</a></div><p>Club website powered by the independent TT Clubs platform.</p></footer>
    </div>
  );
}
