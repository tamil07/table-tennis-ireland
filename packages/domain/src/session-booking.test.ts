import { describe, expect, it } from 'vitest';
import { bookingUpdate, initialTables, occupiesPlace, upcomingPracticeSessions } from './session-booking';
import type { BookingActor, BookingBoard, PracticeSession } from './session-booking';

const now = Date.parse('2026-11-09T12:00:00Z');
const session: PracticeSession = { id: '2026-11-09', date: '2026-11-09', label: 'Monday', start: now + 6 * 3600000, end: now + 8 * 3600000 };
const parent: BookingActor = { id: 'parent', players: ['adult', 'child1', 'child2'], maintainer: false };
const staff: BookingActor = { id: 'staff', players: [], maintainer: true };
const empty = (): BookingBoard => ({ tables: {}, requests: [] });
const request = (board = empty(), playerId = 'adult', tableId = 7, place = 0, id = 'r1') => bookingUpdate(board, session, parent, { type: 'request', playerId, tableId, place, id }, now);

describe('session player places', () => {
  it('allows four distinct player places and rejects a fifth index', () => {
    let board = empty();
    for (let i = 0; i < 4; i++) board = bookingUpdate(board, session, { id: `a${i}`, players: [`p${i}`], maintainer: false }, { type: 'request', id: `r${i}`, playerId: `p${i}`, tableId: 7, place: i }, now);
    expect(board.requests.filter(r => occupiesPlace(r, now))).toHaveLength(4);
    expect(() => request(board, 'adult', 7, 4, 'extra')).toThrow('reservable player place');
  });
  it('blocks duplicate player bookings even at another table', () => {
    expect(() => request(request(), 'adult', 8, 1, 'r2')).toThrow('already has');
  });
  it('allows a parent separate requests for each linked child', () => {
    const board = request(request(request(), 'child1', 7, 1, 'r2'), 'child2', 7, 2, 'r3');
    expect(board.requests).toHaveLength(3);
  });
  it('rejects unlinked participant requests', () => { expect(() => request(empty(), 'unrelated')).toThrow('linked child'); });
  it('does not allow a competing request to overwrite a held place', () => { expect(() => request(request(), 'child1', 7, 0, 'r2')).toThrow('no longer available'); });
  it('only allows staff to approve, and confirmation retains the same place', () => {
    const board = request();
    expect(() => bookingUpdate(board, session, parent, { type: 'approve', id: 'r1' }, now)).toThrow('Maintainer');
    const approved = bookingUpdate(board, session, staff, { type: 'approve', id: 'r1' }, now);
    expect(approved.requests[0].status).toBe('confirmed');
    expect(approved.requests[0].place).toBe(0);
  });
  it('expires pending holds and rejects stale approval', () => {
    const board = request(); const later = now + 31 * 60000;
    expect(occupiesPlace(board.requests[0], later)).toBe(false);
    expect(() => bookingUpdate(board, session, staff, { type: 'approve', id: 'r1' }, later)).toThrow('no longer');
  });
  it('rejection releases inventory for another player', () => {
    const rejected = bookingUpdate(request(), session, staff, { type: 'reject', id: 'r1' }, now);
    expect(request(rejected, 'child1', 7, 0, 'r2').requests[1].status).toBe('pending');
  });
  it('prevents changing table allocation while places are occupied', () => { expect(() => bookingUpdate(request(), session, staff, { type: 'table', tableId: 7, use: 'coaching' }, now)).toThrow('Release or move'); });
  it('allows staff to open a coaching table and then accept a place', () => {
    const board = bookingUpdate(empty(), session, staff, { type: 'table', tableId: 1, use: 'reservable' }, now);
    expect(request(board, 'adult', 1).requests).toHaveLength(1);
  });
  it('does not reserve walk-in/coaching/closed tables online', () => { expect(() => request(empty(), 'adult', 1)).toThrow('reservable'); });
  it('preserves the original place when a move conflicts', () => {
    const board = request(request(), 'child1', 7, 1, 'r2');
    expect(() => bookingUpdate(board, session, staff, { type: 'move', id: 'r1', tableId: 7, place: 1 }, now)).toThrow('no longer');
    expect(board.requests[0].place).toBe(0);
  });
  it('applies confirmed cancellation cutoff but lets pending requests withdraw', () => {
    const pending = request();
    const confirmed = bookingUpdate(pending, session, staff, { type: 'approve', id: 'r1' }, now);
    expect(() => bookingUpdate(confirmed, session, parent, { type: 'cancel', id: 'r1' }, session.start - 3600000)).toThrow('two hours');
    expect(bookingUpdate(pending, session, parent, { type: 'cancel', id: 'r1' }, now).requests[0].status).toBe('cancelled');
  });
  it('lets a guardian release a confirmed child place during play', () => {
    const confirmed = bookingUpdate(request(empty(), 'child1'), session, staff, { type: 'approve', id: 'r1' }, now);
    expect(bookingUpdate(confirmed, session, parent, { type: 'release', id: 'r1' }, session.start + 60000).requests[0].status).toBe('released');
  });
  it('refuses requests once the session starts', () => { expect(() => bookingUpdate(empty(), session, parent, { type: 'request', id: 'late', playerId: 'adult', tableId: 7, place: 0 }, session.start)).toThrow('closed'); });
  it('does not allow cross-session decisions', () => { expect(() => bookingUpdate(request(), { ...session, id: 'other' }, staff, { type: 'approve', id: 'r1' }, now)).toThrow('not found'); });
  it('uses Ireland local times across daylight-saving changes', () => {
    const sunday = upcomingPracticeSessions(Date.parse('2027-03-27T12:00:00Z')).find(s => s.date === '2027-03-28');
    expect(new Date(sunday!.start).toISOString()).toBe('2027-03-28T11:45:00.000Z');
    expect(initialTables().filter(t => t.use === 'reservable')).toHaveLength(6);
  });
});
