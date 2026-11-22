import { useEffect, useMemo, useReducer, useState } from 'react';
import { bookingUpdate, initialTables, occupiesPlace, upcomingPracticeSessions } from '@tti/domain';
import type { BookingAction, BookingActor, BookingBoard, PlaceRequest, PracticeSession, TableUse } from '@tti/domain';

const STORAGE = 'tti-session-places-demo-v1';
const people = [{ id: 'alex', name: 'Alex Sullivan', child: false }, { id: 'sam', name: 'Sam Sullivan', child: true }, { id: 'casey', name: 'Casey Sullivan', child: true }, { id: 'jamie', name: 'Jamie Murphy', child: false }, { id: 'guest', name: 'Guest player', child: false }];
const accounts: Record<string, BookingActor & { label: string }> = {
  family: { id: 'family', players: ['alex', 'sam', 'casey'], maintainer: false, label: 'Parent / player' },
  player: { id: 'player', players: ['jamie'], maintainer: false, label: 'Another player' },
  guest: { id: 'guest-account', players: ['guest'], maintainer: false, label: 'Guest' },
  staff: { id: 'staff', players: [], maintainer: true, label: 'Club maintainer' },
};
const modes: { value: TableUse; label: string }[] = [{ value: 'reservable', label: 'Reservable' }, { value: 'coaching', label: 'Coaching reserve' }, { value: 'walk_in', label: 'Walk-ins only' }, { value: 'closed', label: 'Unavailable' }];
const nameFor = (id: string) => people.find(p => p.id === id)?.name ?? 'Demo player';
type PreviewState = { board: BookingBoard; message: string; activity: string[] };
type PreviewAction = { session: PracticeSession; actor: BookingActor; action: BookingAction; now: number } | { reset: true };
function initialize(): PreviewState {
  let board: BookingBoard = { tables: {}, requests: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null');
    if (saved && saved.tables && typeof saved.tables === 'object' && Array.isArray(saved.requests)) board = saved;
  } catch { /* Storage may be blocked; memory-only preview remains usable. */ }
  return { board, message: '', activity: [] };
}
function reduce(state: PreviewState, input: PreviewAction): PreviewState {
  if ('reset' in input) return { board: { tables: {}, requests: [] }, message: 'Synthetic preview reset.', activity: [] };
  try {
    const board = bookingUpdate(state.board, input.session, input.actor, input.action, input.now);
    if (input.action.type === 'expire') return board.requests.some((r, i) => r.status !== state.board.requests[i]?.status) ? { ...state, board } : state;
    const messages: Record<BookingAction['type'], string> = { request: 'Place booked. You can add a partner for the other place.', wait: 'You are on the waiting list. You will be offered the next free place.', accept: 'Offer accepted. The place is yours.', decline: 'Offer declined. The next waiting player has been offered it.', checkin: 'Checked in.', release: 'Place released as a no-show. It is offered to the waiting list, then to walk-ins.', cancel: 'Booking cancelled. The next waiting player has been offered the place.', table: 'Table allocation updated.', move: 'Player moved to the selected free place.', expire: '' };
    const message = messages[input.action.type];
    return { board, message, activity: [message, ...state.activity].slice(0, 8) };
  } catch (error) { return { ...state, message: error instanceof Error ? error.message : 'Please try again.' }; }
}

export function SessionBookingDemo() {
  const [now, setNow] = useState(Date.now());
  const sessions = useMemo(() => upcomingPracticeSessions(now), [new Date(now).toISOString().slice(0, 10)]);
  const [selected, setSelected] = useState(sessions.find(s => s.start > now)?.id ?? sessions[0]?.id ?? '');
  const session = sessions.find(s => s.id === selected) ?? sessions[0];
  const [accountId, setAccountId] = useState('family');
  const actor = accounts[accountId];
  const [player, setPlayer] = useState('alex');
  const [state, dispatch] = useReducer(reduce, undefined, initialize);
  const [choice, setChoice] = useState<{ table: number; place: number } | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 10_000); return () => clearInterval(timer); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(state.board)); } catch { setStorageAvailable(false); } }, [state.board]);
  useEffect(() => { if (session) dispatch({ session, actor, action: { type: 'expire' }, now }); }, [now]);
  const tables = session ? state.board.tables[session.id] ?? initialTables() : [];
  const live = session ? state.board.requests.filter(r => r.sessionId === session.id && occupiesPlace(r, now)) : [];
  const free = tables.filter(t => t.use === 'reservable').length * 2 - live.length;
  const pending = state.board.requests.filter(r => r.sessionId === session?.id && (r.status === 'waiting' || (r.status === 'offered' && r.holdUntil > now)));
  const mine = session ? state.board.requests.filter(r => r.sessionId === session.id && r.requesterId === actor.id) : [];
  function act(action: BookingAction) { if (session) dispatch({ session, actor, action, now: Date.now() }); }
  function switchAccount(value: string) { setAccountId(value); setPlayer(accounts[value].players[0] ?? ''); setChoice(null); setMoving(null); }
  function requestLabel(request: PlaceRequest) { return request.status === 'offered' && request.holdUntil <= now ? 'expired' : request.status; }

  return <section className="booking-demo" id="booking" aria-labelledby="booking-title">
    <div className="booking-demo__intro"><div><p className="booking-demo__eyebrow">Leeside · Your place at the table</p><h2 id="booking-title">Find a session.<br />Make room for play.</h2><p>Two player places per table. One place per player, for the entire session. Bookings are confirmed instantly; staff release no-shows.</p></div><div className="booking-demo__stamp">SESSION<br /><strong>02</strong><span>places / table</span></div></div>
    <div className="booking-demo__notice"><strong>Interactive demo · synthetic players only.</strong> Preview roles are not real sign-in. Changes stay in this browser; there is no shared database or real email delivery. {storageAvailable ? 'Use the role selector to try both sides of a request.' : 'Storage is unavailable; changes will reset when the page closes.'}</div>
    <div className="booking-demo__toolbar"><label>Preview as<select value={accountId} onChange={e => switchAccount(e.target.value)}>{Object.entries(accounts).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}</select></label>
      {!actor.maintainer && <label>Who is playing?<select value={player} onChange={e => { setPlayer(e.target.value); setChoice(null); }}>{people.filter(p => actor.players.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}{p.child ? ' · linked child' : ' · self'}</option>)}</select></label>}
      <button className="booking-demo__quiet" onClick={() => { dispatch({ reset: true }); setChoice(null); setMoving(null); }}>Reset demo</button></div>
    <nav className="booking-demo__days" aria-label="Choose a practice session">{sessions.map(s => <button key={s.id} aria-pressed={s.id === session?.id} onClick={() => { setSelected(s.id); setChoice(null); setMoving(null); }}><strong>{new Date(s.date + 'T12:00Z').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Dublin' })}</strong><span>{s.label.split(' · ')[1]}</span></button>)}</nav>
    {!session ? <p>No sessions available.</p> : <>
      <div className="booking-demo__session"><div><p className="booking-demo__eyebrow">{session.date} · Europe/Dublin</p><h3>{session.label}</h3><p>James Kenneally Sports Hall · Synthetic availability; holiday closures are not configured in this preview.</p></div><div className="booking-demo__count"><strong>{free}</strong><span>player places free</span></div></div>
      <div className="booking-demo__legend"><span>○ Available</span><span>◷ Pending approval</span><span>● Confirmed</span><span>▧ Coaching / walk-in / closed</span></div>
      {moving && <p className="booking-demo__notice">Choose a free reservable place to move {nameFor(state.board.requests.find(r => r.id === moving)?.playerId ?? '')}. <button onClick={() => setMoving(null)}>Cancel move</button></p>}
      <div className="booking-demo__floor">{tables.map(table => <article className={`booking-demo__table booking-demo__table--${table.use}`} key={table.id}>
        <div className="booking-demo__table-heading"><h4>Table {String(table.id).padStart(2, '0')}</h4><span>{table.use === 'reservable' ? `${2 - live.filter(r => r.tableId === table.id).length} / 2 free` : modes.find(m => m.value === table.use)?.label}</span></div>
        <div className="booking-demo__court" aria-label={`Table ${table.id}, ${table.use}`}>{Array.from({ length: 2 }, (_, place) => {
          const request = live.find(r => r.tableId === table.id && r.place === place);
          return <button key={place} className={request ? `booking-demo__place--${request.status}` : ''} disabled={table.use !== 'reservable' || Boolean(request) || (!moving && (actor.maintainer || now >= session.start))} aria-label={`Table ${table.id}, player place ${place + 1}: ${request ? request.status : table.use === 'reservable' ? 'available' : table.use}`} onClick={() => {
            if (moving) { act({ type: 'move', id: moving, tableId: table.id, place }); setMoving(null); }
            else setChoice({ table: table.id, place });
          }}><span>{request ? request.status === 'offered' ? 'Offered' : 'Booked' : table.use === 'reservable' ? '+ Request' : table.use === 'coaching' ? 'Coaching' : table.use === 'walk_in' ? 'Walk-in' : 'Closed'}</span><small>Place {place + 1}</small></button>;
        })}</div>
        {actor.maintainer && <label className="booking-demo__allocation">Session allocation<select value={table.use} onChange={e => act({ type: 'table', tableId: table.id, use: e.target.value as TableUse })}>{modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>}
      </article>)}</div>
      {choice && <form className="booking-demo__confirm" onSubmit={event => { event.preventDefault(); act({ type: 'request', id: crypto.randomUUID(), playerId: player, tableId: choice.table, place: choice.place, partnerName: null }); setChoice(null); }} aria-label="Confirm player place request"><div><h3>Request Table {choice.table} · Place {choice.place + 1}</h3><p>{nameFor(player)} · {session.label} · {session.date}. This requests one player place, not the whole table, a coached lesson or attendance check-in.</p></div><button type="submit">Book this place</button><button type="button" className="booking-demo__quiet" onClick={() => setChoice(null)}>Go back</button></form>}
      <p className="booking-demo__feedback" role="status" aria-live="polite">{state.message}</p>
      <div className="booking-demo__panels"><section><h3>{actor.maintainer ? 'Maintainer request queue' : 'My session places'}</h3>
        {actor.maintainer ? <>{!pending.length && <p className="booking-demo__muted">No pending requests. Switch to a player or parent to submit one.</p>}{pending.map(r => <div className="booking-demo__row" key={r.id}><div><strong>{nameFor(r.playerId)}</strong><small>{r.status === 'offered' ? `Offered Table ${r.tableId} · Place ${(r.place ?? 0) + 1}` : 'Waiting list'}</small></div></div>)}
          <h4>Active allocations</h4>{live.map(r => <div className="booking-demo__row" key={r.id}><div><strong>{nameFor(r.playerId)}</strong><small>Table {r.tableId} · Place {(r.place ?? 0) + 1} · {r.status}</small></div><button className="booking-demo__quiet" onClick={() => setMoving(r.id)}>Move</button><button className="booking-demo__quiet" onClick={() => act({ type: 'release', id: r.id })}>Release</button></div>)}</> : <>{!mine.length && <p className="booking-demo__muted">Choose a player, session and free place to start. Parents can request one place for each linked child.</p>}{mine.map(r => <div className="booking-demo__row" key={r.id}><div><strong>{nameFor(r.playerId)}</strong><small>Table {r.tableId} · Place {(r.place ?? 0) + 1} · {requestLabel(r)}</small>{r.status === 'confirmed' && <small>Demo confirmation · email preview only</small>}</div>{occupiesPlace(r, now) && <button className="booking-demo__quiet" onClick={() => act({ type: now >= session.start ? 'release' : 'cancel', id: r.id })}>{now >= session.start ? 'Leave & release' : r.status === 'waiting' || r.status === 'offered' ? 'Withdraw' : 'Cancel'}</button>}</div>)}</>}
      </section><section><h3>How session places work</h3><ul><li>Two places per table; one active place per player per session.</li><li>Reserve for yourself or a linked child. Each child has a separate allowance.</li><li>Bookings are confirmed instantly. If you cancel, the next waiting player is offered your place.</li><li>No chosen partner or coaching is guaranteed.</li><li>Bookings open 14 days ahead. Offers last up to 60 minutes. Cancel at least two hours before the session.</li><li>Tell staff when leaving early. No-shows can be released by staff after a check, not automatically inferred from a missing scan.</li></ul><details><summary>Demo activity / notification previews</summary><p>No real email or push is sent.</p><ol>{state.activity.map((entry, i) => <li key={i}>{entry}</li>)}</ol></details></section></div>
    </>}
  </section>;
}
