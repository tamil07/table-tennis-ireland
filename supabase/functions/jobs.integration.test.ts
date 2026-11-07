import { demoClub } from '../../packages/domain/src/operations-demo.ts';
function assert(value: unknown, message: string) { if (!value) throw new Error(message); }
Deno.test('scheduler leaves unconfigured mail pending, enforces job authentication and caps provider attempts', async () => {
  const initial = demoClub(); const recipientId = '10000000-0000-4000-8000-000000000001';
  let state = JSON.parse(JSON.stringify(initial).replaceAll('demo-player', recipientId)) as typeof initial;
  state.notices = [0,1].map(i => ({ id: `mail-${i}`, key: `mail-${i}`, to: recipientId, kind: 'payment_acknowledgement', subject: 'Informal acknowledgement', entity: 'demo-membership', created: new Date().toISOString(), email: 'pending' as const, attempts: 0 }));
  let reserved = 0, delivered = 0;
  const originalFetch = globalThis.fetch;
  const fake = Deno.serve({ hostname: '127.0.0.1', port: 0, onListen() {} }, async request => {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/auth/v1/admin/users/')) return Response.json({ id: recipientId, email: `${recipientId}@example.invalid`, email_confirmed_at: new Date().toISOString() });
    if (url.pathname === '/rest/v1/club_runtime') return Response.json(url.searchParams.get('select') === 'club_id' ? [{ club_id: state.club }] : { state });
    if (url.pathname === '/rest/v1/rpc/commit_club_runtime') { const input = await request.json(); if (input.expected_revision !== state.version) return Response.json({ code: '40001', message: 'Conflict' }, { status: 409 }); state = input.next_state; return Response.json(state.version); }
    if (url.pathname === '/rest/v1/rpc/reserve_club_email') return Response.json(++reserved <= 1);
    return new Response('Not found', { status: 404 });
  });
  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.hostname === 'api.resend.com') { delivered++; const body = JSON.parse(String(init?.body)); assert(body.to[0] === `${recipientId}@example.invalid`, 'Unexpected email recipient'); assert(body.text.includes('not a tax receipt'), 'Informal acknowledgement missing'); assert(new Headers(init?.headers).get('idempotency-key')?.length === 64, 'Stable provider idempotency key missing'); return Response.json({ id: 'fake-mail-id' }); }
    assert(url.hostname === '127.0.0.1', 'An integration test attempted an external connection'); return originalFetch(input, init);
  };
  Deno.env.set('SUPABASE_URL', `http://127.0.0.1:${fake.addr.port}`); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key'); Deno.env.set('TTI_FUNCTION_PORT', '0'); Deno.env.set('CLUB_JOB_TOKEN', 'test-job-token'); Deno.env.delete('RESEND_API_KEY'); Deno.env.delete('EMAIL_FROM');
  const { server } = await import('./club-jobs/index.ts'); const endpoint = `http://127.0.0.1:${server.addr.port}`;
  const run = async (token: string) => { const response = await fetch(endpoint, { method: 'POST', headers: { 'x-club-job-token': token } }); const body = await response.text(); return { status: response.status, body }; };
  try {
    assert((await run('wrong')).status === 401, 'Job accepted an invalid credential');
    assert((await run('test-job-token')).status === 200, 'Unconfigured scheduler failed'); assert(delivered === 0 && state.notices.every(n => n.email === 'pending'), 'Unconfigured mail was marked sent');
    Deno.env.set('RESEND_API_KEY', 'test-email-key'); Deno.env.set('EMAIL_FROM', 'test@example.invalid'); Deno.env.set('APP_URL', 'https://app.example.invalid');
    const result = await run('test-job-token'); assert(result.body.includes('budgetReached'), 'Daily budget was not surfaced'); assert(delivered === 1, 'Budget allowed too many email attempts'); assert(state.notices.filter(n => n.email === 'sent').length === 1 && state.notices.filter(n => n.email === 'pending').length === 1, 'Delivery state is inaccurate');
  } finally { globalThis.fetch = originalFetch; await server.shutdown(); await fake.shutdown(); }
});
