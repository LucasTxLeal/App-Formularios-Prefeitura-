const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const result = {};
  new Function('exports', 'require', ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}
  }).outputText)(result, name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  });
  return result;
}
const { FORM_SCHEMAS } = load('src/data/dynamicForms/registry.ts');
const { createReportPdf } = load('src/lib/reportPdf.ts');
test('generates all nine forms with saved values, dates, lists and long observations', () => {
  for (const schema of Object.values(FORM_SCHEMAS)) {
    const values = {};
    for (const section of schema.sections) for (const field of section.fields) {
      values[field.key] = field.type === 'date' ? '2026-10-22' : field.type === 'checkbox-group' ? ['Opção A', 'Opção B'] : field.type === 'textarea' ? 'Observações: lesão, exposição e evolução. '.repeat(200) : 'João da Conceição';
    }
    const doc = createReportPdf(schema, { id: '12345678-1234-1234-1234-123456789012', created_at: '2026-10-22T15:00:00Z', unidade: 'UPA Junção', values });
    assert.ok(doc.getNumberOfPages() > 1);
    assert.ok(doc.output().startsWith('%PDF'));
    if (process.env.PDF_QA_DIR) {
      fs.mkdirSync(process.env.PDF_QA_DIR, {recursive: true});
      fs.writeFileSync(path.join(process.env.PDF_QA_DIR, schema.slug + '.pdf'), Buffer.from(doc.output('arraybuffer')));
    }
  }
});
test('receipt contains only persisted fields from the authenticated submission', async () => {
  let inserted;
  let failInsert = false;
  const schema = FORM_SCHEMAS.y96;
  const saved = { id: 'saved-id', created_at: '2026-10-22T15:00:00Z', nome_paciente: 'Persistido', access_code: '1111', secret_internal: 'never returned' };
  const db = { from(table) {
    if (table === 'access_codes') return { select: () => ({eq: () => ({maybeSingle: async () => ({data:{unidade_nome:'Teste'}})})}) };
    assert.equal(table, schema.table);
    return {insert: payload => {inserted=payload; return {select: () => ({single:async()=>failInsert ? ({data:null,error:{code:'TEST_FAILURE'}}) : ({data:saved,error:null})})};}};
  }};
  const {POST} = load('src/app/api/reports/[slug]/route.ts', {
    'next/server': {NextResponse:{json:(body, options)=>({body,status:options?.status??200,headers:options?.headers})}},
    '@/lib/supabase/server':{createServiceClient:()=>db},
    '@/lib/session':{ACCESS_COOKIE:'session',readAccessCode:async token=>token==='valid'?'1111':null},
    '@/data/dynamicForms':{getFormSchema:()=>schema,getSchemaMeta:()=>({requiredKeys:['nome_paciente'],dateKeys:[],timeKeys:[],numberKeys:[],arrayKeys:[]})},
    '@/lib/request':{getClientIp:()=>''},
    '@/lib/auditLog':{logAuditEvent:async()=>{}}
  });
  const params={params:Promise.resolve({slug:'y96'})};
  const request=token=>({cookies:{get:()=>({value:token})},json:async()=>({nome_paciente:'Enviado',access_code:'outra unidade'})});
  assert.equal((await POST(request('invalid'),params)).status,401);
  assert.equal(inserted,undefined);
  const response=await POST(request('valid'),params);
  assert.equal(inserted.access_code,'1111');
  assert.equal(response.body.receipt.values.nome_paciente,'Persistido');
  assert.equal(response.body.receipt.unidade,'Teste');
  assert.equal(response.body.receipt.values.secret_internal,undefined);
  assert.equal(response.headers['Cache-Control'],'no-store');
  failInsert = true;
  const failed = await POST(request('valid'), params);
  assert.equal(failed.status, 500);
  assert.equal(failed.body.receipt, undefined);
});
