import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { Card } from '@tti/ui';

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY && !env.VITE_SUPABASE_URL.includes('YOUR_PROJECT'));
const backend = configured ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY) : null;
type Context = { club: string; session: string; expires_at: string; participants: { id: string; name: string }[] };
const fragment = new URLSearchParams(location.hash.slice(1));
const initialToken = fragment.get('venue');
// Keep the bearer challenge out of query strings, referrers and persistent storage.
if (initialToken) history.replaceState(null, '', location.pathname);

async function rpc<T>(name: string, args = {}): Promise<T> {
  if (!backend) throw new Error('Connect Supabase before using live attendance.');
  const { data, error } = await backend.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function Attendance() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!backend);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token] = useState(initialToken ?? '');
  const [context, setContext] = useState<Context | null>(null);
  const [person, setPerson] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [occurrence, setOccurrence] = useState('');
  const [display, setDisplay] = useState<{ image: string; expiry: string } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [demo, setDemo] = useState(false);
  const [demoChecked, setDemoChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!backend) return;
    let alive = true;
    backend.auth.getSession().then(({ data, error }) => {
      if (alive) { setSession(data.session); setAuthReady(true); if (error) setMessage(error.message); }
    });
    const { data } = backend.auth.onAuthStateChange((_event, next) => { setSession(next); setAuthReady(true); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { setContext(null); setPerson(''); setDisplay(null); setSessions([]); }, [session?.user.id]);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function loadChallenge(value: string) {
    const result = await rpc<Context>('venue_qr_context', { token: value });
    setContext(result); setPerson(result.participants[0]?.id ?? '');
  }
  useEffect(() => {
    if (session && token) void run(() => loadChallenge(token));
    // Reload only when identity or scanned challenge changes.
  }, [session?.user.id, token]);
  useEffect(() => {
    if (!session || !occurrence) return;
    let alive = true;
    async function refresh() {
      try {
        const value = await rpc<{ token: string; expires_at: string }>('issue_venue_qr', { occurrence });
        const image = await QRCode.toDataURL(`${location.origin}/#venue=${encodeURIComponent(value.token)}`, { width: 360, margin: 2 });
        if (alive) setDisplay({ image, expiry: value.expires_at });
      } catch (error) { if (alive) { setDisplay(null); setMessage(error instanceof Error ? error.message : 'Unable to refresh venue QR.'); } }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    return () => { alive = false; clearInterval(timer); };
  }, [session?.user.id, occurrence]);

  const expired = Boolean(context && Date.parse(context.expires_at) <= now);
  return <section id="attendance" className="attendance-section">
    <h2>Club QR check-in</h2>
    <p>Scan the attendance QR displayed inside the club with your phone camera, sign in, and confirm who is attending. Children can still use their physical card or ask a coach.</p>
    {!backend ? <Card><strong>Local preview · no attendance is saved to the backend</strong><p>Try the confirmation flow with synthetic players. Live QR display and sign-in become available after Supabase is configured.</p><button onClick={() => {
      setDemo(true); setContext({ club: 'Leeside Table Tennis Club', session: 'Demo open practice', expires_at: new Date(Date.now() + 90000).toISOString(), participants: [{ id: 'demo-player', name: 'Alex Sullivan (demo)' }, { id: 'demo-child', name: 'Sam Sullivan (linked child, demo)' }] }); setPerson('demo-player'); setMessage('');
    }}>Preview a scanned venue QR</button></Card> : !authReady ? <p>Loading sign-in…</p> : !session ? <Card>
      <h3>Sign in to confirm attendance</h3><p>If the QR expires while signing in, scan the current display again.</p>
      <form onSubmit={event => { event.preventDefault(); void run(async () => {
        const { error } = await backend.auth.signInWithPassword({ email, password });
        if (error) throw error; setPassword('');
      }); }}>
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
        <button disabled={busy}>Sign in</button>
      </form>
    </Card> : <>
      <p>Signed in as {session.user.email} <button disabled={busy} onClick={() => void run(async () => { const { error } = await backend.auth.signOut(); if (error) throw error; })}>Sign out</button></p>
      {!token && <p>Scan the venue display to open your attendance confirmation here.</p>}
    </>}
    {context && (session || demo) && <Card>
      <h3>{context.club} · {context.session}</h3>
      <p>{expired ? 'This code has expired. Scan the current club display.' : `Confirm within ${Math.max(0, Math.ceil((Date.parse(context.expires_at) - now) / 1000))} seconds.`}</p>
      <label>Who is attending?<select value={person} onChange={event => setPerson(event.target.value)}>{context.participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      {!context.participants.length && <p>No eligible player or linked child was found. Ask a club admin for help.</p>}
      <p>Confirming records the selected player's identity, club, session, check-in time, and membership classification for authorized club staff. No location or contacts permission is needed. Confirm only someone physically present.</p>
      <button disabled={busy || expired || !person} onClick={() => void run(async () => {
        if (demo) { setMessage(demoChecked.includes(person) ? 'Demo: already checked in.' : 'Demo: checked in successfully. No backend record created.'); setDemoChecked(previous => [...previous, person]); return; }
        const result = await rpc<{ status: string; needs_membership_follow_up?: boolean }>('check_in_venue_qr', { token, participant: person });
        setMessage(result.status === 'already_checked_in' ? 'Already checked in for this session.' : result.needs_membership_follow_up ? 'Checked in. Club admins will follow up about membership.' : 'Checked in successfully.');
      })}>Confirm check-in</button>
    </Card>}
    {backend && session && <details><summary>Staff: display a rotating venue QR</summary>
      <p>Staff only. Choose an open session and keep this screen awake. The QR refreshes every minute; each code lasts up to 90 seconds.</p>
      <button disabled={busy} onClick={() => void run(async () => { setSessions(await rpc('venue_qr_sessions')); })}>Load open sessions</button>
      <label>Session<select value={occurrence} onChange={event => { setOccurrence(event.target.value); setDisplay(null); }}><option value="">Select session</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <button disabled={busy || !occurrence} onClick={() => void run(async () => {
        const value = await rpc<{ token: string; expires_at: string }>('issue_venue_qr', { occurrence });
        const url = `${location.origin}/#venue=${encodeURIComponent(value.token)}`;
        setDisplay({ image: await QRCode.toDataURL(url, { width: 360, margin: 2 }), expiry: value.expires_at });
      })}>Generate / refresh venue QR</button>
      {display && (Date.parse(display.expiry) > now ? <div><img src={display.image} alt="Scan to confirm attendance for the selected club session" /><p>Expires in {Math.ceil((Date.parse(display.expiry) - now) / 1000)} seconds</p></div> : <p>Display code expired. Generate a fresh QR.</p>)}
    </details>}
    <p role="status" aria-live="polite">{busy ? 'Working…' : message}</p>
  </section>;
}
