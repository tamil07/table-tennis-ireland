// Table-practice booking rules (board decisions, November 2026). Pure functions: the server applies these
// inside the club command store, which also enforces revision and uniqueness checks.
//
// Rules:
// - Each reservable table has two places. A booking is made by one member, who may add a partner for the other place.
// - One active place per player per session.
// - Bookings open 14 days before the session. Booking is instant when a place is free.
// - When a booked place is cancelled, the next waiting player is offered it. The offer lasts until the earlier of
//   60 minutes or the session start; the player accepts or declines.
// - Players check in. Staff release a booked place that is not checked in 10 minutes after the start; the place then
//   goes to the next waiting player, or to walk-ins on the night (first come, first served).
// - A player may cancel up to two hours before the session. After that only staff can cancel.
// - The club is closed on public holidays: those dates have no sessions.

export type TableUse = 'reservable' | 'coaching' | 'walk_in' | 'closed';
// 'offered' holds a place for a waiting player until holdUntil (the offer expiry). 'waiting' has no place yet.
export type PlaceStatus = 'confirmed' | 'offered' | 'waiting' | 'cancelled' | 'released' | 'expired' | 'declined';
export interface PracticeSession { id: string; date: string; label: string; start: number; end: number }
export interface PracticeTable { id: number; use: TableUse }
export interface PlaceRequest {
  id: string; // one record per seat; the seats of one booking share a groupId
  groupId: string;
  sessionId: string;
  playerId: string; // partner seats use a synthetic id: partner:<groupId>
  partnerName: string | null; // name of the partner, on the partner seat
  requesterId: string;
  tableId: number | null;
  place: number | null; // 0 or 1
  status: PlaceStatus;
  holdUntil: number; // offer expiry while status is 'offered'; 0 otherwise
  checkedInAt: number | null;
  walkIn: boolean;
  createdAt: number;
}
export interface BookingBoard { tables: Record<string, PracticeTable[]>; requests: PlaceRequest[] }
export interface BookingActor { id: string; players: string[]; maintainer: boolean }
export type BookingAction =
  | { type: 'request'; id: string; playerId: string; tableId: number; place: number; partnerName?: string | null; walkIn?: boolean }
  | { type: 'wait'; id: string; playerId: string }
  | { type: 'accept' | 'decline'; id: string }
  | { type: 'checkin'; id: string }
  | { type: 'release' | 'cancel'; id: string }
  | { type: 'table'; tableId: number; use: TableUse }
  | { type: 'move'; id: string; tableId: number; place: number }
  | { type: 'expire' };

export const OFFER_MINUTES = 60;
export const OPEN_DAYS_AHEAD = 14;
export const CHECK_IN_GRACE_MINUTES = 10;
export const CANCEL_HOURS = 2;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Seats that are held or taken right now. */
export const occupiesPlace = (request: PlaceRequest, now: number) =>
  request.status === 'confirmed' || (request.status === 'offered' && request.holdUntil > now);
/** Records that count as an active place for the player: confirmed, offered or waiting. */
const isActive = (request: PlaceRequest, now: number) => occupiesPlace(request, now) || request.status === 'waiting';

export function initialTables(): PracticeTable[] {
  return Array.from({ length: 12 }, (_, i) => ({ id: i + 1, use: i < 6 ? 'coaching' : 'reservable' }));
}

export function bookingUpdate(
  board: BookingBoard,
  session: PracticeSession,
  actor: BookingActor,
  action: BookingAction,
  now: number,
  policy = { holdMinutes: OFFER_MINUTES, cancelHours: CANCEL_HOURS },
): BookingBoard {
  const tables = board.tables[session.id] ?? initialTables();
  // Offers that ran out pass to the next waiting player, and waiting players for a session that has started expire.
  // Offers past their hold expire; the seat then passes to the next waiting player. Seats are offered only when
  // they are freed (cancel, release, decline or expiry), never merely because they are empty.
  let requests = board.requests.map((r) => (r.sessionId === session.id && r.status === 'offered' && r.holdUntil <= now ? { ...r, status: 'expired' as const, holdUntil: 0 } : r));
  const someOfferExpired = requests.some((r, i) => r !== board.requests[i]);
  if (now >= session.start) requests = requests.map((r) => (r.sessionId === session.id && r.status === 'waiting' ? { ...r, status: 'expired' as const } : r));
  if (someOfferExpired) requests = offerFreedSeats(requests, tables, session, now, policy.holdMinutes);
  const current = { ...board, requests };
  if (action.type === 'expire') return current;

  const sessionRequests = () => requests.filter((r) => r.sessionId === session.id);
  const group = (groupId: string) => requests.filter((r) => r.sessionId === session.id && r.groupId === groupId);
  const target = (id: string) => {
    const request = requests.find((r) => r.id === id && r.sessionId === session.id);
    if (!request) throw new Error('Request not found for this session.');
    return request;
  };
  const staff = () => { if (!actor.maintainer) throw new Error('Maintainer permission is required.'); };
  const reservable = (tableId: number) => tables.some((t) => t.id === tableId && t.use === 'reservable');
  const seatFree = (tableId: number, place: number, except?: string) =>
    !requests.some((r) => r.id !== except && r.sessionId === session.id && r.tableId === tableId && r.place === place && occupiesPlace(r, now));
  const withChanges = (ids: string[], changes: Partial<PlaceRequest>) =>
    ({ ...current, requests: requests.map((r) => (ids.includes(r.id) ? { ...r, ...changes } : r)) });

  if (action.type === 'table') {
    staff();
    if (!['reservable', 'coaching', 'walk_in', 'closed'].includes(action.use)) throw new Error('Choose a supported table allocation.');
    if (!tables.some((t) => t.id === action.tableId)) throw new Error('Unknown table.');
    if (sessionRequests().some((r) => r.tableId === action.tableId && occupiesPlace(r, now))) throw new Error('Release or move existing places before changing this table.');
    return { ...current, tables: { ...board.tables, [session.id]: tables.map((t) => (t.id === action.tableId ? { ...t, use: action.use } : t)) } };
  }

  if (action.type === 'request') {
    const walkIn = action.walkIn === true;
    if (walkIn) {
      if (now < session.start || now >= session.end) throw new Error('Walk-ins are taken on the night, while the session is running.');
    } else {
      if (now >= session.start) throw new Error('Advance booking has closed. Walk-ins are taken on the night.');
      if (session.start - now > OPEN_DAYS_AHEAD * DAY) throw new Error(`Bookings open ${OPEN_DAYS_AHEAD} days before the session.`);
    }
    if (!actor.players.includes(action.playerId)) throw new Error('Select yourself or a linked child.');
    if (sessionRequests().some((r) => r.playerId === action.playerId && isActive(r, now))) throw new Error('This player already has a place in this session.');
    if (requests.some((r) => r.id === action.id)) throw new Error('This request has already been submitted.');
    if (!reservable(action.tableId) || !Number.isInteger(action.place) || action.place < 0 || action.place > 1) throw new Error('Choose a reservable table and place.');
    const partner = action.partnerName?.trim() || null;
    if (!seatFree(action.tableId, action.place)) throw new Error('That place is no longer available.');
    const other = 1 - action.place;
    if (partner && !seatFree(action.tableId, other)) throw new Error('The other place on this table is taken, so the partner cannot be added.');
    const groupId = action.id;
    const base = { groupId, sessionId: session.id, requesterId: actor.id, status: 'confirmed' as const, holdUntil: 0, checkedInAt: null, walkIn, createdAt: now };
    const seats: PlaceRequest[] = [
      { ...base, id: action.id, playerId: action.playerId, partnerName: null, tableId: action.tableId, place: action.place },
    ];
    if (partner) seats.push({ ...base, id: `${action.id}-partner`, playerId: `partner:${groupId}`, partnerName: partner, tableId: action.tableId, place: other });
    return { ...current, requests: [...requests, ...seats] };
  }

  if (action.type === 'wait') {
    if (now >= session.start) throw new Error('Waiting list closes when the session starts.');
    if (session.start - now > OPEN_DAYS_AHEAD * DAY) throw new Error(`Bookings open ${OPEN_DAYS_AHEAD} days before the session.`);
    if (!actor.players.includes(action.playerId)) throw new Error('Select yourself or a linked child.');
    if (sessionRequests().some((r) => r.playerId === action.playerId && isActive(r, now))) throw new Error('This player already has a place in this session.');
    if (requests.some((r) => r.id === action.id)) throw new Error('This request has already been submitted.');
    const entry: PlaceRequest = { id: action.id, groupId: action.id, sessionId: session.id, playerId: action.playerId, partnerName: null, requesterId: actor.id, tableId: null, place: null, status: 'waiting', holdUntil: 0, checkedInAt: null, walkIn: false, createdAt: now };
    return { ...current, requests: [...requests, entry] };
  }

  const request = target(action.id);
  const members = group(request.groupId);

  if (action.type === 'accept' || action.type === 'decline') {
    if (request.status !== 'offered' || request.holdUntil <= now) throw new Error('This offer is no longer open.');
    if (!actor.players.includes(request.playerId) && request.requesterId !== actor.id) throw new Error('Only the player offered the place can answer.');
    if (action.type === 'decline') return { ...current, requests: offerFreedSeats(requests.map((r) => (r.id === request.id ? { ...r, status: 'declined' as const, holdUntil: 0 } : r)), tables, session, now, policy.holdMinutes) };
    if (now >= session.start) throw new Error('This offer has expired.');
    return withChanges([request.id], { status: 'confirmed', holdUntil: 0 });
  }

  if (action.type === 'checkin') {
    if (!['confirmed'].includes(request.status)) throw new Error('Only a confirmed place can be checked in.');
    if (now < session.start - 60 * MINUTE || now > session.end) throw new Error('Check-in opens an hour before the session and closes at its end.');
    if (!actor.maintainer && request.requesterId !== actor.id && !actor.players.includes(request.playerId)) throw new Error('Only the player or the booker can check in.');
    return withChanges(members.map((m) => m.id), { checkedInAt: now });
  }

  if (action.type === 'release') {
    staff();
    if (request.status !== 'confirmed') throw new Error('This place is not booked.');
    if (now < session.start + CHECK_IN_GRACE_MINUTES * MINUTE) throw new Error(`Places can be released ${CHECK_IN_GRACE_MINUTES} minutes after the session starts.`);
    if (request.checkedInAt) throw new Error('This player has checked in.');
    const released = requests.map((r) => (members.some((m) => m.id === r.id) ? { ...r, status: 'released' as const } : r));
    return { ...current, requests: offerFreedSeats(released, tables, session, now, policy.holdMinutes) };
  }

  if (action.type === 'cancel') {
    if (!isActive(request, now)) throw new Error('This place has already ended.');
    if (!actor.maintainer) {
      if (request.requesterId !== actor.id && !actor.players.includes(request.playerId)) throw new Error('You cannot cancel this booking.');
      if (request.status === 'confirmed' && now > session.start - policy.cancelHours * HOUR) throw new Error(`Within ${policy.cancelHours === 2 ? 'two' : policy.cancelHours} hours of the session, ask a maintainer to cancel.`);
    }
    const ids = members.filter((m) => isActive(m, now)).map((m) => m.id);
    const changed = requests.map((r) => (ids.includes(r.id) ? { ...r, status: 'cancelled' as const, holdUntil: 0 } : r));
    return { ...current, requests: offerFreedSeats(changed, tables, session, now, policy.holdMinutes) };
  }

  if (action.type === 'move') {
    staff();
    if (request.status !== 'confirmed' || now >= session.end) throw new Error('This place cannot be moved.');
    if (!reservable(action.tableId) || action.place < 0 || action.place > 1) throw new Error('Choose a reservable table and place.');
    if (!seatFree(action.tableId, action.place, request.id)) throw new Error('That place is no longer available.');
    return withChanges([request.id], { tableId: action.tableId, place: action.place });
  }

  throw new Error('Unknown booking action.');
}

/**
 * Gives each freed reservable seat, in table order, to the first waiting player for the session.
 * Waiting players are offered a seat rather than booking it silently, so they must accept it.
 */
function offerFreedSeats(requests: PlaceRequest[], tables: PracticeTable[], session: PracticeSession, now: number, holdMinutes: number): PlaceRequest[] {
  if (now >= session.end) return requests;
  let out = requests;
  const freeSeats = tables
    .filter((t) => t.use === 'reservable')
    .flatMap((t) => [0, 1].map((place) => ({ tableId: t.id, place })))
    .filter(({ tableId, place }) => !out.some((r) => r.sessionId === session.id && r.tableId === tableId && r.place === place && occupiesPlace(r, now)));
  const offerUntil = Math.min(now + holdMinutes * MINUTE, session.start);
  for (const seat of freeSeats) {
    const next = out
      .filter((r) => r.sessionId === session.id && r.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!next) break;
    if (offerUntil <= now) break;
    out = out.map((r) => (r.id === next.id ? { ...r, status: 'offered' as const, tableId: seat.tableId, place: seat.place, holdUntil: offerUntil } : r));
  }
  return out;
}

/** Sessions for the next fourteen days, from the regular timetable, skipping public holidays (club closed). */
export function upcomingPracticeSessions(now = Date.now(), closedDates: ReadonlySet<string> = new Set()): PracticeSession[] {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Dublin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const date = ['year', 'month', 'day'].map((type) => parts.find((p) => p.type === type)!.value).join('-');
  const [year, month, day] = date.split('-').map(Number);
  const timetable: Record<number, [string, string, string]> = { 0: ['Sunday', '12:45', '15:30'], 1: ['Monday', '18:00', '20:00'], 3: ['Wednesday', '20:15', '22:15'], 4: ['Thursday', '17:30', '19:30'], 5: ['Friday', '18:00', '20:00'] };
  const sessions: PracticeSession[] = [];
  for (let i = 0; i < 14; i++) {
    const noon = new Date(Date.UTC(year, month - 1, day + i, 12));
    const definition = timetable[noon.getUTCDay()];
    if (!definition) continue;
    const stamp = noon.toISOString().slice(0, 10);
    if (closedDates.has(stamp)) continue;
    const zone = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Dublin', timeZoneName: 'shortOffset' }).formatToParts(noon).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
    const hours = Number(zone.replace('GMT', '') || 0);
    const time = (clock: string) => { const [h, m] = clock.split(':').map(Number); return Date.UTC(noon.getUTCFullYear(), noon.getUTCMonth(), noon.getUTCDate(), h - hours, m); };
    const start = time(definition[1]);
    const end = time(definition[2]);
    if (end > now) sessions.push({ id: stamp, date: stamp, label: `${definition[0]} · ${definition[1]}–${definition[2]}`, start, end });
  }
  return sessions;
}
