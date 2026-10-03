import { useMemo, useState } from "react";
import { dashboardMetrics, demoRelationships, platformFeatures, selectClubContext } from "@tti/domain";
import type { MembershipStatus } from "@tti/domain";
import { BrandMark, Button, Card, Pill, SectionHeading } from "@tti/ui";

const toneFor = (status: MembershipStatus) => status === "active" ? "good" : status === "approaching_expiry" ? "warn" : "neutral";

export function App() {
  const [activeClubId, setActiveClubId] = useState(demoRelationships[0].club.id);
  const active = useMemo(() => selectClubContext(demoRelationships, activeClubId)!, [activeClubId]);

  return (
    <div className="platform-shell" style={{ "--club": active.club.branding.primary } as React.CSSProperties}>
      <aside className="sidebar">
        <BrandMark />
        <nav aria-label="Platform navigation">
          <a className="active" href="#home"><span aria-hidden="true">⌂</span> Home</a>
          <a href="#clubs"><span aria-hidden="true">◇</span> My clubs</a>
          <a href="#features"><span aria-hidden="true">◎</span> Matches</a>
          <a href="#features"><span aria-hidden="true">▦</span> Tournaments</a>
          <a href="#features"><span aria-hidden="true">↗</span> Development</a>
          <a href="#admin"><span aria-hidden="true">⚙</span> Club admin</a>
        </nav>
        <div className="profile"><span>AS</span><div><strong>Alex Sullivan</strong><small>Player · Coach</small></div></div>
      </aside>

      <main className="platform-main" id="home">
        <header className="mobile-header"><BrandMark /><button aria-label="Open account menu">AS</button></header>
        <div className="welcome"><div><p className="eyebrow">Saturday, 3 October</p><h1>Good morning, Alex.</h1><p>Here’s what is happening across your table tennis clubs.</p></div><Button>Show check-in QR</Button></div>

        <section id="clubs">
          <SectionHeading eyebrow="One account · Multiple clubs" title="My clubs" />
          <div className="club-grid">
            {demoRelationships.map((relationship) => (
              <Card className={`club-card ${relationship.club.id === activeClubId ? "club-card--active" : ""}`} key={relationship.club.id}>
                <button onClick={() => setActiveClubId(relationship.club.id)} aria-pressed={relationship.club.id === activeClubId}>
                  <span className="club-monogram" style={{ background: relationship.club.branding.primary }}>{relationship.club.name.slice(0,2).toUpperCase()}</span>
                  <span className="club-card__copy"><strong>{relationship.club.name}</strong><small>{relationship.club.county} · {relationship.roles.join(" · ")}</small></span>
                  <Pill tone={toneFor(relationship.membershipStatus)}>{relationship.membershipStatus.replace("_", " ")}</Pill>
                </button>
                <div className="club-card__footer"><span>{relationship.membershipEndsOn ? `Until ${relationship.membershipEndsOn}` : "No end date"}</span><a href={relationship.club.websiteUrl}>Club website ↗</a></div>
              </Card>
            ))}
          </div>
          <p className="context-note"><span style={{ background: active.club.branding.primary }} /> Active context: <strong>{active.club.name}</strong>. Permissions and data are isolated to this club.</p>
        </section>

        <section className="activity-section">
          <SectionHeading eyebrow="Your week" title="Coming up" action={<a href="#features">View calendar →</a>} />
          <div className="activity-grid">
            <Card className="next-session"><Pill tone="good">Next session</Pill><div><time><strong>06</strong><span>Oct</span></time><div><h3>Open practice</h3><p>Tuesday · 19:00–21:00</p><small>{active.club.name}</small></div></div><Button>Book place</Button></Card>
            <Card className="match-review"><Pill tone="warn">Action needed</Pill><h3>Review a match result</h3><p>Jamie Murphy submitted a 3–1 result. Review before it is automatically approved.</p><div><span>4 days remaining</span><a href="#features">Review result →</a></div></Card>
          </div>
        </section>

        <section id="admin">
          <SectionHeading eyebrow="Coach & admin preview" title="Club snapshot" action={<Pill>Demo data</Pill>} />
          <div className="metric-grid">{dashboardMetrics.map((metric) => <Card key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></Card>)}</div>
        </section>

        <section className="features" id="features">
          <SectionHeading eyebrow="OpenSpec roadmap" title="Everything in one club context" />
          <div className="feature-grid">{platformFeatures.map((feature, index) => <Card key={feature.capability}><span className="feature-number">0{index + 1}</span><Pill tone={feature.status === "foundation" ? "good" : "neutral"}>{feature.status}</Pill><h3>{feature.title}</h3><p>{feature.description}</p><code>{feature.capability}</code></Card>)}</div>
        </section>
      </main>
    </div>
  );
}
