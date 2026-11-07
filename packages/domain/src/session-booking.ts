// Pure prototype rules. Production requires equivalent transactional server checks.
export type TableUse = 'reservable' | 'coaching' | 'walk_in' | 'closed';
export type PlaceStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'released' | 'expired';
export interface PracticeSession { id: string; date: string; label: string; start: number; end: number }
export interface PracticeTable { id: number; use: TableUse }
export interface PlaceRequest { id: string; sessionId: string; playerId: string; requesterId: string; tableId: number; place: number; status: PlaceStatus; holdUntil: number }
export interface BookingBoard { tables: Record<string, PracticeTable[]>; requests: PlaceRequest[] }
export interface BookingActor { id: string; players: string[]; maintainer: boolean }
export type BookingAction =
  | { type: 'request'; id: string; playerId: string; tableId: number; place: number }
  | { type: 'approve' | 'reject' | 'cancel' | 'release'; id: string }
  | { type: 'table'; tableId: number; use: TableUse }
  | { type: 'move'; id: string; tableId: number; place: number }
  | { type: 'expire' };

export const occupiesPlace = (request: PlaceRequest, now: number) => request.status === 'confirmed' || (request.status === 'pending' && request.holdUntil > now);
export function initialTables(): PracticeTable[] {
  return Array.from({ length: 12 }, (_, i) => ({ id: i + 1, use: i < 6 ? 'coaching' : 'reservable' }));
}
export function bookingUpdate(board: BookingBoard, session: PracticeSession, actor: BookingActor, action: BookingAction, now: number, policy = { holdMinutes: 30, cancelHours: 2 }): BookingBoard {
  const tables = board.tables[session.id] ?? initialTables();
  const requests = board.requests.map(r => r.status === 'pending' && r.holdUntil <= now ? { ...r, status: 'expired' as const } : r);
  const current = { ...board, requests };
  const target = (id: string) => {
    const request = requests.find(r => r.id === id && r.sessionId === session.id);
    if (!request) throw new Error('Request not found for this session.');
    return request;
  };
  const staff = () => { if (!actor.maintainer) throw new Error('Maintainer permission is required.'); };
  const available = (tableId: number, place: number, except?: string) => {
    if (!Number.isInteger(place) || place < 0 || place >= 4 || !tables.some(t => t.id === tableId && t.use === 'reservable')) throw new Error('Choose a reservable player place.');
    if (requests.some(r => r.id !== except && r.sessionId === session.id && r.tableId === tableId && r.place === place && occupiesPlace(r, now))) throw new Error('That place is no longer available.');
  };
  const replace = (id: string, changes: Partial<PlaceRequest>) => ({ ...current, requests: requests.map(r => r.id === id ? { ...r, ...changes } : r) });
  if (action.type === 'expire') return current;
  if (action.type === 'request') {
    if (now >= session.start) throw new Error('Advance booking has closed. Ask a maintainer about walk-ins.');
    if (!actor.players.includes(action.playerId)) throw new Error('Select yourself or a linked child.');
    if (requests.some(r => r.sessionId === session.id && r.playerId === action.playerId && occupiesPlace(r, now))) throw new Error('This player already has a pending or confirmed place in this session.');
    if (requests.some(r => r.id === action.id)) throw new Error('This request has already been submitted.');
    available(action.tableId, action.place);
    return { ...current, requests: [...requests, { id: action.id, playerId: action.playerId, tableId: action.tableId, place: action.place, sessionId: session.id, requesterId: actor.id, status: 'pending', holdUntil: Math.min(now + policy.holdMinutes * 60_000, session.start) }] };
  }
  if (action.type === 'table') {
    staff();
    if (!['reservable', 'coaching', 'walk_in', 'closed'].includes(action.use)) throw new Error('Choose a supported table allocation.');
    if (!tables.some(t => t.id === action.tableId)) throw new Error('Unknown table.');
    if (requests.some(r => r.sessionId === session.id && r.tableId === action.tableId && occupiesPlace(r, now))) throw new Error('Release or move existing places before changing this table.');
    return { ...current, tables: { ...board.tables, [session.id]: tables.map(t => t.id === action.tableId ? { ...t, use: action.use } : t) } };
  }
  const request = target(action.id);
  if (action.type === 'approve' || action.type === 'reject') {
    staff();
    if (request.status !== 'pending' || now >= session.start) throw new Error('This request is no longer awaiting approval.');
    if (action.type === 'approve') available(request.tableId, request.place, request.id);
    return replace(request.id, { status: action.type === 'approve' ? 'confirmed' : 'rejected' });
  }
  if (action.type === 'move') {
    staff();
    if (!occupiesPlace(request, now) || now >= session.end) throw new Error('This place cannot be moved.');
    available(action.tableId, action.place, request.id);
    return replace(request.id, { tableId: action.tableId, place: action.place });
  }
  if (!occupiesPlace(request, now)) throw new Error('This place has already been released.');
  if (action.type === 'release') {
    if (!actor.maintainer && (!actor.players.includes(request.playerId) || request.requesterId !== actor.id || now < session.start)) throw new Error('Only staff or an attending player/guardian can release this place.');
    return replace(request.id, { status: 'released' });
  }
  if (!actor.maintainer && (request.requesterId !== actor.id || !actor.players.includes(request.playerId))) throw new Error('You cannot cancel this booking.');
  if (!actor.maintainer && request.status === 'confirmed' && now > session.start - policy.cancelHours * 60 * 60_000) throw new Error(`Within ${policy.cancelHours === 2 ? 'two' : policy.cancelHours} hours of the session, ask a maintainer to cancel.`);
  return replace(request.id, { status: 'cancelled' });
}

export function upcomingPracticeSessions(now = Date.now()): PracticeSession[] {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Dublin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const date = ['year','month','day'].map(type => parts.find(p => p.type === type)!.value).join('-');
  const [year, month, day] = date.split('-').map(Number);
  const timetable: Record<number, [string, string, string]> = { 0: ['Sunday', '12:45', '15:30'], 1: ['Monday', '18:00', '20:00'], 3: ['Wednesday', '20:15', '22:15'], 4: ['Thursday', '17:30', '19:30'], 5: ['Friday', '18:00', '20:00'] };
  const sessions: PracticeSession[] = [];
  for (let i = 0; i < 14; i++) {
    const noon = new Date(Date.UTC(year, month - 1, day + i, 12));
    const definition = timetable[noon.getUTCDay()];
    if (!definition) continue;
    const stamp = noon.toISOString().slice(0, 10);
    const zone = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Dublin', timeZoneName: 'shortOffset' }).formatToParts(noon).find(p => p.type === 'timeZoneName')?.value ?? 'GMT';
    const hours = Number(zone.replace('GMT', '') || 0);
    const time = (clock: string) => { const [h, m] = clock.split(':').map(Number); return Date.UTC(noon.getUTCFullYear(), noon.getUTCMonth(), noon.getUTCDate(), h - hours, m); };
    const start = time(definition[1]); const end = time(definition[2]);
    if (end > now) sessions.push({ id: stamp, date: stamp, label: `${definition[0]} · ${definition[1]}–${definition[2]}`, start, end });
  }
  return sessions;
}
