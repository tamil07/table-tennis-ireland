import { demoClub } from '../../packages/domain/src/operations-demo.ts';
function assert(value: unknown, message: string) { if (!value) throw new Error(message); }
Deno.test('public content and feeds exclude members, private notes and requester identities', async () => {
  const state = demoClub(); state.notes.push({ id: 'secret', player: 'demo-junior', author: 'demo-coach', body: 'PRIVATE-COACHING-BODY' }); state.pages.push({ id: 'news', title: 'Club news', body: '<script>Plain text, never executable</script>', kind: 'news', published: true, event: '' });
  const fake = Deno.serve({ hostname: '127.0.0.1', port: 0, onListen() {} }, request => { const url = new URL(request.url); if (url.pathname === '/rest/v1/club_runtime') return Response.json({ state }); if (url.pathname === '/rest/v1/rpc/club_for_join') return Response.json({ id: state.club, name: state.name }); return new Response('Not found', { status: 404 }); });
  Deno.env.set('SUPABASE_URL', `http://127.0.0.1:${fake.addr.port}`); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key'); Deno.env.set('TTI_FUNCTION_PORT', '0');
  const { server } = await import('./club-public/index.ts'); const endpoint = `http://127.0.0.1:${server.addr.port}`;
  try {
    for (const format of ['', '&format=rss', '&format=ics']) { const response = await fetch(`${endpoint}?club=${state.club}${format}`); const body = await response.text(); assert(response.ok, 'Public projection failed'); assert(!body.includes('PRIVATE-COACHING-BODY') && !body.includes('@example.invalid') && !body.includes('demo-junior'), 'Private data leaked through public projection'); if (format.includes('rss')) assert(!body.includes('<script>') && body.includes('&lt;script&gt;'), 'RSS did not escape plain text'); }
    const join = await fetch(`${endpoint}?join=LEESIDE`); assert((await join.json()).id === state.club, 'Join lookup missing');
    const invalid = await fetch(endpoint, { method: 'POST' }); assert(invalid.status === 405, 'Public endpoint accepted writes'); await invalid.text();
  } finally { await server.shutdown(); await fake.shutdown(); }
});
