const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  new Function('exports', 'require', js)(exports, name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  });
  return exports;
}

const session = load('src/lib/session.ts');
const id = '12345678-1234-1234-1234-123456789012';
function setup({ result = { data: { id }, error: null }, auditFails = false } = {}) {
  const calls = [];
  const query = {
    delete() { calls.push(['delete']); return this; },
    eq(key, value) { calls.push(['eq', key, value]); return this; },
    select(value) { calls.push(['select', value]); return this; },
    async maybeSingle() { return result; }
  };
  const route = load('src/app/api/admin/reports/[slug]/[id]/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/session': session,
    '@/lib/supabase/server': { createServiceClient: () => ({ from(table) { calls.push(['from', table]); return query; } }) },
    '@/data/dynamicForms/registry': { getFormSchema: slug => slug === 'y96' ? { table: 'y96_reports' } : undefined },
    '@/lib/request': { getClientIp: () => '127.0.0.1' },
    '@/lib/auditLog': { logAuditEvent: async (_, event) => { calls.push(['audit', event]); if (auditFails) throw new Error('Audit unavailable'); } }
  });
  return { calls, run: (token, { slug = 'y96', recordId = id, origin = 'https://app.example' } = {}) => route.DELETE({
    cookies: { get: name => name === session.ADMIN_COOKIE && token ? { value: token } : undefined },
    headers: new Headers({ origin }), nextUrl: new URL('https://app.example/api/admin/reports/y96/' + recordId)
  }, { params: Promise.resolve({ slug, id: recordId }) }) };
}

test('rejects missing, forged, and unit sessions before touching the database', async () => {
  for (const token of [undefined, 'forged', await session.createAccessToken('1111')]) {
    const { calls, run } = setup();
    assert.equal((await run(token)).status, 401);
    assert.deepEqual(calls, []);
  }
});
test('rejects foreign origins, unknown forms and invalid record identifiers', async () => {
  const token = await session.createAdminToken('admin@example.test');
  for (const [options, status] of [[{ origin: 'https://other.example' }, 403], [{ slug: 'arbitrary_table' }, 404], [{ recordId: 'invalid' }, 400]]) {
    const { calls, run } = setup();
    assert.equal((await run(token, options)).status, status);
    assert.deepEqual(calls, []);
  }
});
test('deletes only the requested record and audits its identifier', async () => {
  const { calls, run } = setup();
  assert.equal((await run(await session.createAdminToken('admin@example.test'))).status, 200);
  assert.deepEqual(calls.slice(0, 4), [['from', 'y96_reports'], ['delete'], ['eq', 'id', id], ['select', 'id']]);
  assert.equal(calls[4][1].action, 'delete_report');
  assert.equal(calls[4][1].resourceId, id);
});
test('reports missing records without recording a successful deletion', async () => {
  const { calls, run } = setup({ result: { data: null, error: null } });
  assert.equal((await run(await session.createAdminToken('admin@example.test'))).status, 404);
  assert.equal(calls.some(c => c[0] === 'audit'), false);
});
test('reports database failure and preserves successful result if only auditing fails', async () => {
  const token = await session.createAdminToken('admin@example.test');
  assert.equal((await setup({ result: { data: null, error: { code: 'TEST_FAILURE' } } }).run(token)).status, 500);
  assert.equal((await setup({ auditFails: true }).run(token)).status, 200);
});
