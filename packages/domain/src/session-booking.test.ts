import { describe, it, expect } from 'vitest';
import { bookingUpdate, initialTables, occupiesPlace, upcomingPracticeSessions } from './session-booking';
import type { BookingActor, BookingBoard, PracticeSession } from './session-booking';

const DAY = 86_400_000;
const HOUR = 3_600_000;
const session: PracticeSession = { id: 'mon', date: '2027-03-29', label: 'Monday', start: Date.parse('2027-03-29T18:00:00Z'), end: Date.parse('2027-03-29T20:00:00Z') };
const now = Date.parse('2027-03-20T12:00:00Z'); // nine days before the session
const parent: BookingActor = { id: 'parent', players: ['adult', 'child'], maintainer: false };
const other: BookingActor = { id: 'other', players: ['other'], maintainer: false };
const staff: BookingActor = { id: 'staff', players: [], maintainer: true };
const empty = (): BookingBoard => ({ tables: {}, requests: [] });
const act = (board: BookingBoard, actor: BookingActor, action: Parameters<typeof bookingUpdate>[3], at = now) =>
  bookingUpdate(board, session, actor, action, at);
const book = (board = empty(), actor = parent, playerId = 'adult', tableId = 7, place = 0, id = 'b1', partnerName: string | null = null) =>
  act(board, actor, { type: 'request', id, playerId, tableId, place, partnerName });
const seat = (board: BookingBoard, id: string) => board.requests.find((r) => r.id === id)!;

describe('table booking rules', () => {
  it('books a place instantly and each table takes two players', () => {
    const b = book();
    expect(seat(b, 'b1').status).toBe('confirmed');
    expect(() => book(b, other, 'other', 7, 0, 'b2')).toThrow('no longer available');
    expect(book(b, other, 'other', 7, 1, 'b2').requests.filter((r) => r.tableId === 7 && r.status === 'confirmed')).toHaveLength(2);
  });

  it('adds a partner to the other place of the same table in one booking', () => {
    const b = book(empty(), parent, 'adult', 8, 0, 'b1', 'Sam');
    const seats = b.requests.filter((r) => r.groupId === 'b1');
    expect(seats.map((r) => [r.place, r.partnerName])).toEqual([[0, null], [1, 'Sam']]);
    expect(() => book(b, other, 'other', 8, 1, 'b2', 'Alex')).toThrow('no longer available');
  });

  it('allows one active place per player in a session', () => {
    expect(() => book(book(), parent, 'adult', 9, 0, 'b2')).toThrow('already has a place');
  });

  it('opens bookings fourteen days ahead and not before', () => {
    const early = Date.parse(session.start - 15 * DAY + '') ? session.start - 15 * DAY : 0;
    expect(() => act(empty(), parent, { type: 'request', id: 'x', playerId: 'adult', tableId: 7, place: 0 }, early)).toThrow('open 14 days');
    expect(seat(act(empty(), parent, { type: 'request', id: 'x', playerId: 'adult', tableId: 7, place: 0 }, session.start - 14 * DAY), 'x').status).toBe('confirmed');
  });

  it('refuses advance booking once the session has started and takes walk-ins on the night', () => {
    expect(() => act(empty(), parent, { type: 'request', id: 'x', playerId: 'adult', tableId: 7, place: 0 }, session.start + 1)).toThrow('closed');
    expect(() => book()).not.toThrow();
    expect(() => act(empty(), parent, { type: 'request', id: 'w', playerId: 'adult', tableId: 7, place: 0, walkIn: true }, session.start - 1)).toThrow('on the night');
    expect(seat(act(empty(), parent, { type: 'request', id: 'w', playerId: 'adult', tableId: 7, place: 0, walkIn: true }, session.start + HOUR), 'w').walkIn).toBe(true);
  });

  it('offers a cancelled place to the next waiting player, who must accept it', () => {
    let b = book();
    b = act(b, other, { type: 'wait', id: 'w1', playerId: 'other' });
    b = act(b, parent, { type: 'cancel', id: 'b1' }, now + HOUR);
    expect(seat(b, 'w1').status).toBe('offered');
    expect(seat(b, 'w1').holdUntil).toBeLessThanOrEqual(session.start);
    b = act(b, other, { type: 'accept', id: 'w1' }, now + HOUR + 30 * 60_000);
    expect(seat(b, 'w1').status).toBe('confirmed');
  });

  it('passes the offer on when the player declines or lets it expire', () => {
    let b = book(); // parent holds table 7 place 0
    b = act(b, other, { type: 'wait', id: 'w1', playerId: 'other' });
    const third: BookingActor = { id: 'third', players: ['third'], maintainer: false };
    b = act(b, third, { type: 'wait', id: 'w2', playerId: 'third' }, now + 1); // second waiting player
    b = act(b, parent, { type: 'cancel', id: 'b1' }, now + HOUR);
    expect(seat(b, 'w1').status).toBe('offered');
    b = act(b, other, { type: 'decline', id: 'w1' }, now + HOUR + 30 * 60_000);
    expect(seat(b, 'w1').status).toBe('declined');
    expect(seat(b, 'w2').status).toBe('offered');
    const expired = act(b, staff, { type: 'expire' }, session.start - 1 * 60_000);
    expect(seat(expired, 'w2').status).toBe('expired');
  });

  it('checks players in, and staff release only a place that is not checked in after the grace period', () => {
    let b = book();
    b = act(b, parent, { type: 'checkin', id: 'b1' }, session.start - 30 * 60_000);
    expect(seat(b, 'b1').checkedInAt).not.toBeNull();
    expect(() => act(book(), staff, { type: 'release', id: 'b1' }, session.start + 5 * 60_000)).toThrow('10 minutes');
    const released = act(book(), staff, { type: 'release', id: 'b1' }, session.start + 11 * 60_000);
    expect(seat(released, 'b1').status).toBe('released');
    expect(() => act(b, staff, { type: 'release', id: 'b1' }, session.start + 11 * 60_000)).toThrow('checked in');
  });

  it('after the session starts, a released place is free for walk-ins, not the waiting list', () => {
    let b = book();
    b = act(b, other, { type: 'wait', id: 'w1', playerId: 'other' }); // refused below: list closes at start
    expect(() => act(b, other, { type: 'wait', id: 'w2', playerId: 'other' }, session.start + 1)).toThrow('closes');
    b = act(b, staff, { type: 'release', id: 'b1' }, session.start + 11 * 60_000);
    expect(seat(b, 'b1').status).toBe('released');
    expect(seat(act(b, other, { type: 'request', id: 'walk', playerId: 'other', tableId: 7, place: 0, walkIn: true }, session.start + 12 * 60_000), 'walk').status).toBe('confirmed');
  });

  it('lets a player cancel until two hours before, and only staff after that', () => {
    expect(() => act(book(), parent, { type: 'cancel', id: 'b1' }, session.start - 1 * HOUR)).toThrow('two hours');
    expect(seat(act(book(), parent, { type: 'cancel', id: 'b1' }, session.start - 3 * HOUR), 'b1').status).toBe('cancelled');
    expect(seat(act(book(), staff, { type: 'cancel', id: 'b1' }, session.start - 1 * HOUR), 'b1').status).toBe('cancelled');
  });

  it('cancels both seats of a booking that has a partner', () => {
    const b = act(book(empty(), parent, 'adult', 8, 0, 'b1', 'Sam'), parent, { type: 'cancel', id: 'b1' }, now);
    expect(b.requests.filter((r) => r.groupId === 'b1').every((r) => r.status === 'cancelled')).toBe(true);
  });

  it('keeps the place occupied only while confirmed or the offer is open', () => {
    const b = book();
    expect(occupiesPlace(seat(b, 'b1'), now)).toBe(true);
  });
});

describe('sessions and holidays', () => {
  it('uses the regular timetable and skips closed public holidays', () => {
    const all = upcomingPracticeSessions(Date.parse('2027-03-20T12:00:00Z'));
    const closed = upcomingPracticeSessions(Date.parse('2027-03-20T12:00:00Z'), new Set(['2027-03-22']));
    expect(all.some((s) => s.date === '2027-03-22')).toBe(true);
    expect(closed.some((s) => s.date === '2027-03-22')).toBe(false);
    expect(initialTables().filter((t) => t.use === 'reservable')).toHaveLength(6);
  });
});
