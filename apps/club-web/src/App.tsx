import { useEffect, useRef, useState } from "react";
import { leesideSessions, nextWeeklySession } from "@tti/domain";
import {
  BrandMark,
  Card,
  Pill,
  SectionHeading,
  ClubPortal,
  ClubPublished,
  ClosureNotice,
  clubServicesEnabled,
} from "@tti/ui";

const nav = [
  ["#sessions", "Sessions"],
  ["#about", "About"],
  ["/news", "News"],
  ["/events", "Event archive"],
  ["#membership", "Membership"],
  ["#faq", "FAQ"],
  ["#club-portal", "Members & bookings"],
  ["#contact", "Contact"],
] as const;
const address =
  "James Kenneally Sports Hall, Hollyhill Lane, Gurranabraher, Cork, T23 W880";
const enquiry =
  "mailto:leesidettie@gmail.com?subject=Leeside%20first%20session%20enquiry";
const ticker = [
  "All ages",
  "All abilities",
  "Five sessions a week",
  "Gurranabraher, Cork",
  "Coaching available",
  "Beginners welcome",
];
const faq = [
  [
    "Who can play at Leeside?",
    "Every weekly session is listed for all ages and abilities. A parent or guardian should make the enquiry for a junior player.",
  ],
  [
    "Where are the sessions?",
    `All five sessions take place at ${address}.`,
  ],
  [
    "How do I pay?",
    "Payments are arranged directly with the club. There is no online payment on this website.",
  ],
  [
    "Do sessions run on public holidays?",
    "The existing club website states public-holiday closures. Please confirm with the club before travelling.",
  ],
  [
    "Is coaching available?",
    "The club's coaches are introduced on the existing About page. Contact Leeside about current coaching availability.",
  ],
] as const;

const dublinDay = (now: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    weekday: "long",
  }).format(now);

function nextSessionText(now: number) {
  const next = nextWeeklySession(leesideSessions, now);
  if (!next) return null;
  const { session, daysAhead, inProgress } = next;
  const when = inProgress
    ? "Happening now"
    : daysAhead === 0
      ? "Today"
      : daysAhead === 1
        ? "Tomorrow"
        : session.day;
  return { when, session };
}

export function App() {
  const [menu, setMenu] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [menu]);
  // Entrance animation is progressive: content is visible unless the browser
  // supports IntersectionObserver and the visitor has not asked for less motion.
  useEffect(() => {
    const element = root.current;
    if (
      !element ||
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    element.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    element.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const next = nextSessionText(now);
  const today = dublinDay(now);
  return (
    <div className="club-site" ref={root}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="club-header">
        <a className="club-brand" href="#top" aria-label="Leeside home">
          <img className="club-logo" src="/icon-180.png" alt="" width="44" height="44" />
          <span>
            Leeside <small>Table Tennis Club</small>
          </span>
        </a>
        <nav
          id="site-menu"
          aria-label="Main navigation"
          className={menu ? "is-open" : undefined}
        >
          {nav.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="header-action" href="#join">
          Join the club <span aria-hidden="true">↗</span>
        </a>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="site-menu"
          onClick={() => setMenu((open) => !open)}
        >
          <span className="sr-only">{menu ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="menu-icon" />
        </button>
      </header>

      <main id="main">
        <span id="top" />
        <p className="site-preview">
          {clubServicesEnabled
            ? "Sign in to the member workspace for club services. Payments are arranged directly with Leeside."
            : "Website preview · Online registration and live reservations are not yet available. Contact the club for actual arrangements."}
        </p>

        <ClosureNotice />
        <section className="hero">
          <div className="hero__copy">
            <Pill>Based in Cork · Open to all levels</Pill>
            <h1>
              Find your rhythm.
              <br />
              <em>Own the table.</em>
            </h1>
            <p>
              Friendly sessions, focused coaching and competitive play, built
              around a community that keeps everyone moving.
            </p>
            <div className="hero__actions">
              <a className="primary-link" href="#join">
                Start playing
              </a>
              <a className="text-link" href="#sessions">
                See weekly sessions <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="hero__visual">
            <div
              className="court"
              role="img"
              aria-label="Illustration of a table tennis table"
            >
              <svg className="net-svg" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <defs>
                  <pattern id="rally-mesh" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M0 0H6M0 0V6" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
                  </pattern>
                </defs>
                <rect className="net-svg__post" x="0" y="0" width="4" height="40" />
                <rect className="net-svg__post" x="196" y="0" width="4" height="40" />
                <rect x="4" y="6" width="192" height="30" fill="url(#rally-mesh)" />
                <rect className="net-svg__tape" x="0" y="2" width="200" height="4" />
              </svg>
              <svg className="rally" viewBox="0 0 300 200" aria-hidden="true" focusable="false">
                <defs>
                  <g id="rally-bat">
                    <path className="rally__handle" d="M -4 4 L -5.5 42 Q 0 48 5.5 42 L 4 4 Z" />
                    <path className="rally__blade" d="M -16 -34 C -22 -34 -24 -20 -22 -8 C -20 4 -10 9 -4 7 L 4 7 C 10 9 20 4 22 -8 C 24 -20 22 -34 16 -34 Z" />
                    <path className="rally__rubber" d="M -12 -30 C -16 -30 -18 -20 -16 -9 C -14 1 -8 4 -4 3 L 4 3 C 8 4 14 1 16 -9 C 18 -20 16 -30 12 -30 Z" />
                    <path className="rally__shine" d="M -9 -24 Q -10 -16 -8 -10" />
                  </g>
                </defs>
                {/* bounce marks: the ball lands once on the south half, then once on the north half */}
                <g transform="translate(150 150)">
                  <ellipse className="rally__ripple rally__ripple--south" rx="10" ry="4" />
                </g>
                <g transform="translate(150 50)">
                  <ellipse className="rally__ripple rally__ripple--north" rx="10" ry="4" />
                </g>
                {/* north bat, handle outside the north end, blade facing south */}
                <g transform="translate(150 14)">
                  <g className="rally__bat">
                    <g transform="rotate(180) scale(0.6) translate(0 12)"><use href="#rally-bat" /></g>
                  </g>
                </g>
                {/* south bat, handle outside the south end, blade facing north */}
                <g transform="translate(150 186)">
                  <g className="rally__bat rally__bat--south">
                    <g transform="scale(0.6) translate(0 12)"><use href="#rally-bat" /></g>
                  </g>
                </g>
                {/* the ball travels north and south along the centre line */}
                <g transform="translate(150 14)">
                  <g className="rally__ball-y">
                    <circle className="rally__ball" r="6" />
                    <circle className="rally__ball-shine" cx="-2" cy="-2" r="1.8" />
                  </g>
                </g>
              </svg>
            </div>
            {next && (
              <aside className="next-session" aria-live="polite">
                <span className="next-session__label">Next session</span>
                <strong>
                  {next.when} · {next.session.time}
                </strong>
                <span>
                  {next.session.title} · {next.session.venue}
                </span>
                <small>Confirm public-holiday closures with the club.</small>
              </aside>
            )}
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            {[...ticker, ...ticker].map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>

        <section className="section bento-section" aria-label="At a glance">
          <div className="bento">
            <Card className="tile tile--stat reveal">
              <strong>5</strong>
              <span>sessions every week</span>
            </Card>
            <Card className="tile tile--wide reveal">
              <p className="eyebrow">Play your way</p>
              <h2>All ages. All abilities.</h2>
              <p>
                Whether you are picking up a bat for the first time or training
                towards school, provincial and national competition, there is a
                session for you.
              </p>
            </Card>
            <Card className="tile tile--accent reveal">
              <p className="eyebrow">Find us</p>
              <h2>Gurranabraher, Cork</h2>
              <p>{address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open in Maps ↗
              </a>
            </Card>
            <Card className="tile reveal">
              <p className="eyebrow">Coaching</p>
              <h2>Learn from the club’s coaches</h2>
              <p>
                Ben Haughton, Gary Mahoney, Conall Conroy, Jean Auchapt and
                Alessandra Fada are introduced on the club’s existing About
                page.
              </p>
            </Card>
            <Card className="tile reveal">
              <p className="eyebrow">Keep improving</p>
              <h2>Track your progress</h2>
              <p>
                Match history and coach-published development goals are part of
                the member app as the club pilot rolls out.
              </p>
            </Card>
          </div>
        </section>

        <section className="sessions section" id="sessions">
          <SectionHeading
            eyebrow="Weekly timetable"
            title="A session for every player"
            action={<a href="#membership">View membership →</a>}
          />
          <p className="source-note">
            Club-confirmed timetable · Europe/Dublin local time. The existing
            club website states public-holiday closures; check with the club for
            exceptions.
          </p>
          <ol className="session-list">
            {leesideSessions.map((session) => (
              <li
                key={session.id}
                className={`session reveal${session.day === today ? " session--today" : ""}`}
              >
                <span className="session__day">{session.day.slice(0, 3)}</span>
                <div>
                  <h3>
                    {session.title}
                    {session.day === today && <Pill tone="good">Today</Pill>}
                  </h3>
                  <p>
                    {session.audience} · {session.venue}
                  </p>
                </div>
                <time>{session.time}</time>
              </li>
            ))}
          </ol>
        </section>

        <section className="section" id="about">
          <SectionHeading
            eyebrow="Your Cork club"
            title="Play, belong and improve"
          />
          <div className="about reveal">
            <p>
              Leeside welcomes players who want to play for fun or develop
              towards school, provincial and national competition. Five weekly
              sessions take place at {address}.
            </p>
            <p>
              Contact the club about current coaching availability.
            </p>
            <a href="https://leesidetabletennis.wixsite.com/home/about">
              Read the club’s existing About and coaching page →
            </a>
          </div>
        </section>

        <div className="surface">
          <ClubPublished />
          <ClubPortal />
        </div>

        <section className="membership section" id="membership">
          <div className="reveal">
            <p className="eyebrow">Flexible membership</p>
            <h2>
              More time at the table.
              <br />
              Less admin.
            </h2>
            <p>
              Choose full, partial or pay-as-you-go membership. Arrange payments
              directly with the club. Online membership management and optional
              email acknowledgements are being prepared for the pilot.
            </p>
            {!clubServicesEnabled && (
              <>
                <ul className="price-cards">
                  <li>
                    <strong>Full</strong>
                    <span className="price">€190</span>
                    <span>six months · five weekly sessions</span>
                  </li>
                  <li>
                    <strong>Partial</strong>
                    <span className="price">€100</span>
                    <span>six months · one weekly session</span>
                  </li>
                  <li>
                    <strong>Pay as you go</strong>
                    <span className="price">€10 / €5</span>
                    <span>per adult / per child, per session</span>
                  </li>
                </ul>
                <p className="source-note">
                  Published on the existing club About page, recorded 6
                  November 2026. Confirm current prices and availability with
                  Leeside; these are not live account entitlements.
                </p>
              </>
            )}
            {clubServicesEnabled && (
              <p>
                Current membership types are listed in Published by Leeside
                above. Management can update them at any time.
              </p>
            )}
          </div>
          <Card className="join-card reveal" id="join">
            <Pill tone="good">New players welcome</Pill>
            <h3>Ready for your first session?</h3>
            <p>
              {clubServicesEnabled
                ? "Open the member workspace to register and apply to Leeside. A parent or guardian registers a junior. Contact the club with any questions."
                : "Contact Leeside to arrange your first visit. A parent or guardian should enquire for a junior. Online registration and the configurable trial process are still being prepared."}
            </p>
            <a
              className="primary-link"
              href={clubServicesEnabled ? "#club-portal" : enquiry}
            >
              {clubServicesEnabled ? "Open member workspace" : "Email the club"}
            </a>
            <small>
              {clubServicesEnabled
                ? "Registration and booking require sign-in; no payment is processed here."
                : "This opens your email app. No registration or reservation is submitted by this website."}
            </small>
          </Card>
        </section>

        <section className="section" id="faq">
          <SectionHeading eyebrow="Good to know" title="Questions, answered" />
          <div className="faq reveal">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="news section" id="news">
          <SectionHeading
            eyebrow="Club noticeboard"
            title="Latest from Leeside"
          />
          <div className="news-grid">
            <Card className="reveal">
              <Pill>Club news</Pill>
              <h3>News from the club</h3>
              <p>
                Read the existing club news archive while articles and
                photographs are being migrated.
              </p>
              <a href="https://leesidetabletennis.wixsite.com/home/blog">
                Open Leeside news →
              </a>
            </Card>
            <Card className="reveal">
              <Pill>Club calendar</Pill>
              <h3>Events and competitions</h3>
              <p>
                Check the existing calendar and contact Leeside to confirm event
                dates and availability.
              </p>
              <a href="https://leesidetabletennis.wixsite.com/home/general-1">
                Open the existing calendar →
              </a>
            </Card>
          </div>
        </section>

        <section className="section" id="contact">
          <SectionHeading
            eyebrow="Contact and club information"
            title="Talk to Leeside"
          />
          <div className="news-grid">
            <Card className="reveal">
              <h3>Contact</h3>
              <p>{address}.</p>
              <p>
                <a href="mailto:leesidettie@gmail.com">leesidettie@gmail.com</a>
              </p>
              <p>
                <a href="tel:+353838307259">+353 (0)83 830 7259</a>
              </p>
              <a href="https://www.facebook.com/people/Leeside-Table-Tennis-Club/100069763473060/">
                Leeside on Facebook →
              </a>
            </Card>
            <Card className="reveal">
              <h3>Policies and safeguarding</h3>
              <p>
                Use the club’s existing policies page for published documents
                and safeguarding information. Updated contacts and privacy
                information will be managed by Leeside’s authorized team.
              </p>
              <a href="https://leesidetabletennis.wixsite.com/home/general-5">
                Open club policies →
              </a>
              <p>
                Please contact the club directly for the current safeguarding or
                privacy contact. This preview does not collect membership
                applications.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <footer>
        <div>
          <strong>Leeside Table Tennis Club</strong>
          <span>James Kenneally Sports Hall · Hollyhill Lane · Cork · T23 W880</span>
          <a href="tel:+353838307259">+353 (0)83 830 7259</a>
        </div>
        <p>Club website powered by the independent TT Clubs platform.</p>
      </footer>
    </div>
  );
}
