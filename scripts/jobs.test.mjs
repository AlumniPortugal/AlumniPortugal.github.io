import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const githubSource = await readFile(new URL('../lib/github.ts', import.meta.url), 'utf8');
const githubOutput = ts.transpileModule(githubSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const githubModuleUrl = `data:text/javascript;base64,${Buffer.from(githubOutput).toString('base64')}`;
const { githubRequest } = await import(githubModuleUrl);

const source = await readFile(new URL('../app/jobs/jobs.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const jobsOutput = outputText.replace('@/lib/github', githubModuleUrl);
const { getJobs, getJobDetails, getJob } = await import(`data:text/javascript;base64,${Buffer.from(jobsOutput).toString('base64')}`);
const issue = { number: 1, title: 'Engineer', created_at: '2026-10-22T10:00:00Z', user: { login: 'alumni' }, body: null };

test('fetches all pages with both labels and excludes pull requests', async (t) => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    urls.push(new URL(url));
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(urls.length === 1
      ? Array.from({ length: 100 }, (_, i) => ({ ...issue, number: i + 1 }))
      : [{ ...issue, number: 101, pull_request: {} }, { ...issue, number: 102 }]);
  });
  const jobs = await getJobs(new AbortController().signal);
  assert.equal(jobs.length, 101);
  assert.equal(jobs.at(-1).number, 102);
  assert.equal(jobs[0].user.login, 'alumni');
  assert.deepEqual(urls.map((url) => url.searchParams.get('page')), ['1', '2']);
  for (const url of urls) {
    assert.equal(url.searchParams.get('labels'), 'job,approved');
    assert.equal(url.searchParams.get('state'), 'open');
  }
});

test('handles an empty list', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([]));
  assert.deepEqual(await getJobs(new AbortController().signal), []);
});

test('reports rate limits, API failures and malformed responses', async (t) => {
  for (const status of [403, 429, 500]) {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status }));
    await assert.rejects(getJobs(new AbortController().signal), status === 500 ? /Could not load/ : /limiting requests/);
    t.mock.restoreAll();
  }
  for (const body of [{ message: 'bad' }, [{ ...issue, number: -1 }], [{ ...issue, created_at: 'bad' }], [{ ...issue, user: { login: 42 } }]]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    await assert.rejects(getJobs(new AbortController().signal), /unexpected response/);
    t.mock.restoreAll();
  }
});

test('passes cancellation through to the request', async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => signal.throwIfAborted());
  await assert.rejects(getJobs(controller.signal), { name: 'AbortError' });
  await assert.rejects(getJob('1', controller.signal), { name: 'AbortError' });
});

test('refreshes every minute, pauses when hidden and cleans up on unmount', async () => {
  const { runInNewContext } = await import('node:vm');
  const component = await readFile(new URL('../app/jobs/JobsList.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(component, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  let cleanup, refresh, timer, lastSignal;
  let requests = 0;
  const document = {
    hidden: false,
    addEventListener: (_name, listener) => { refresh = listener; },
    removeEventListener: (_name, listener) => { assert.equal(listener, refresh); refresh = null; },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports, document, AbortController, AbortSignal, Date, Error,
    setTimeout: (callback, delay) => { timer = { callback, delay }; return 1; },
    clearTimeout: () => { timer = null; },
    require: (name) => {
      if (name === 'react') return {
        useState: (value) => [value, () => {}],
        useEffect: (effect, deps) => { if (deps.length === 0) cleanup = effect(); else effect(); },
      };
      if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
      if (name === 'next/link') return { default: () => null };
      if (name === './formatPostedAgo') return { formatPostedAgo: () => '1 minute ago' };
      if (name === './jobs') return { getJobs: async (signal) => {
        requests++;
        lastSignal = signal;
        return [];
      } };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  exports.default();
  await new Promise(setImmediate);
  assert.equal(requests, 1);
  assert.equal(timer.delay, 60_000);
  await timer.callback();
  assert.equal(requests, 2);
  document.hidden = true;
  await refresh();
  assert.equal(timer, null);
  assert.equal(requests, 2);
  document.hidden = false;
  await refresh();
  assert.equal(requests, 3);
  cleanup();
  assert.equal(lastSignal.aborted, true);
  assert.equal(timer, null);
  assert.equal(refresh, null);
});


test('formats elapsed time in minutes, hours, days, weeks and months', async () => {
  const source = await readFile(new URL('../app/jobs/formatPostedAgo.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const { formatPostedAgo } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const now = Date.parse('2026-10-22T08:00:00Z');
  for (const [minutes, expected] of [
    [0, '1 minute ago'], [1, '1 minute ago'], [59, '59 minutes ago'],
    [60, '1 hour ago'], [120, '2 hours ago'], [1440, '1 day ago'],
    [2880, '2 days ago'], [10080, '1 week ago'], [20160, '2 weeks ago'],
    [43200, '1 month ago'], [86400, '2 months ago'],
  ]) {
    assert.equal(formatPostedAgo(new Date(now - minutes * 60_000).toISOString(), now), expected);
  }
});


test('keeps jobs from deleted accounts without a profile link', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([{ ...issue, user: null }]));
  const jobs = await getJobs(new AbortController().signal);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].user, null);
});


test('reads job form fields, normalizes line endings and detects referrals', () => {
  const body = [
    '### Role title', 'Backend Engineer', '### Company', 'LTPLabs',
    '### Type', 'Hybrid', '### Location', 'Porto, Portugal',
    '### Referral', '- [x] I can refer candidates',
    '### Description', 'Long description that stays on GitHub.',
  ].join('\r\n\r\n');
  assert.deepEqual(getJobDetails(body), {
    role: 'Backend Engineer', company: 'LTPLabs', type: 'Hybrid',
    location: 'Porto, Portugal', referral: true,
  });
  assert.equal(getJobDetails(body.replace('[x]', '[ ]')).referral, false);
});

test('handles missing form fields and freeform issues', () => {
  for (const body of [null, '', 'A freeform job description', '### Company\n\n_No response_']) {
    assert.deepEqual(getJobDetails(body), {
      role: undefined, company: undefined, type: undefined, location: undefined, referral: false,
    });
  }
  assert.equal(getJobDetails('### Company\n\nExample\nCompany\n\n### Location\n\nLisbon').company, 'Example Company');
});

test('renders job details as Markdown without executing HTML or unsafe links', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const source = await readFile(new URL('../app/jobs/JobContent.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const resolved = outputText.replace(/from ["'](react(?:\/jsx-runtime)?|react-markdown|remark-gfm|remark-breaks|rehype-raw|rehype-sanitize)["']/g,
    (_match, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
  const { default: JobContent } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`);
  const html = renderToStaticMarkup(React.createElement(JobContent, {
    job: { ...issue, body: '### Description\n\n- Python\n- Docker\n\n[Apply](https://example.com/jobs)\n\n[Bad](javascript:alert(1))\n\n<script>alert(1)</script>' },
    onClose: () => {},
  }));
  assert.match(html, /<h1>Engineer<\/h1>/);
  assert.match(html, /<h3>Description<\/h3>/);
  assert.match(html, /<li>Python<\/li>/);
  assert.match(html, /href="https:\/\/example.com\/jobs"/);
  assert.doesNotMatch(html, /<script|javascript:/);
  const githubMarkdown = renderToStaticMarkup(React.createElement(JobContent, {
    job: { ...issue, body: [
      'Contact: pulgamecanica11@gmail.com', 'https://example.com/jobs', '',
      '| Company | Location |', '| --- | --- |', '| Example | Porto |', '',
      '- [x] Referral available', '- [ ] Another task', '',
      '~~Closed~~', '', '<details><summary>More</summary>Extra details</details>', '',
      '<img src="https://example.com/image.png" onerror="alert(1)">',
    ].join('\n') },
    onClose: () => {},
  }));
  assert.match(githubMarkdown, /href="mailto:pulgamecanica11@gmail.com"/);
  assert.match(githubMarkdown, /href="https:\/\/example.com\/jobs"/);
  assert.match(githubMarkdown, /<br\s*\/?>/);
  assert.match(githubMarkdown, /<table>/);
  assert.match(githubMarkdown, /type="checkbox"[^>]*checked/);
  assert.match(githubMarkdown, /<del>Closed<\/del>/);
  assert.match(githubMarkdown, /<details><summary>More<\/summary>/);
  assert.doesNotMatch(githubMarkdown, /onerror|javascript:|<script/);
  const empty = renderToStaticMarkup(React.createElement(JobContent, { job: issue, onClose: () => {} }));
  assert.match(empty, /No additional details provided/);
});

test('loads a shared job URL directly without fetching the list', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests++;
    assert.equal(url, 'https://api.github.com/repos/AlumniPortugal/AlumniPortugal.github.io/issues/8');
    assert.equal(options.cache, 'no-store');
    return Response.json({ ...issue, number: 8, state: 'open', labels: [{ name: 'job' }, { name: 'approved' }] });
  });
  const job = await getJob('8', new AbortController().signal);
  assert.equal(job.number, 8);
  assert.equal(requests, 1);
});

test('rejects invalid shared links without requesting GitHub', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('Must not request an invalid issue number'));
  for (const number of [null, '', '0', '-1', 'abc', '8/../9', '1.2', '9007199254740992']) {
    await assert.rejects(getJob(number, new AbortController().signal), /Invalid job link/);
  }
});

test('does not show pull requests, unapproved issues or closed jobs', async (t) => {
  const valid = { ...issue, state: 'open', labels: [{ name: 'job' }, { name: 'approved' }] };
  for (const body of [
    { ...valid, pull_request: {} }, { ...valid, labels: [{ name: 'job' }] },
    { ...valid, labels: [{ name: 'approved' }] }, { ...valid, state: 'closed' },
  ]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    await assert.rejects(getJob('1', new AbortController().signal), /no longer/);
    t.mock.restoreAll();
  }
});

test('reports missing jobs, API failures and invalid detail responses', async (t) => {
  for (const [status, message] of [[404, /no longer/], [403, /limiting/], [429, /limiting/], [500, /Could not load/]]) {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status }));
    await assert.rejects(getJob('1', new AbortController().signal), message);
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => Response.json(issue));
  await assert.rejects(getJob('1', new AbortController().signal), /unexpected response/);
});

test('cards link to shareable pages and preserve the list scroll position', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../app/jobs/JobsList.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const storage = new Map([['jobs-scroll', '320']]);
  const scrolls = [];
  let state = 0;
  const exports = {};
  runInNewContext(outputText, {
    exports,
    window: { scrollY: 480, scrollTo: (...args) => scrolls.push(args) },
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    require: (name) => {
      if (name === 'react') return {
        useState: () => [state++ === 0 ? [issue] : '', () => {}],
        useEffect: (effect, deps) => { if (deps.length) effect(); },
      };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name === 'next/link') return { default: () => null };
      if (name === './jobs') return { getJobDetails };
      if (name === './formatPostedAgo') return { formatPostedAgo: () => '1 minute ago' };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const view = exports.default();
  const card = view.props.children[2].props.children[0][0];
  const link = card.props.children[0];
  assert.equal(link.props.href, '/jobs/details/?issue=1');
  assert.deepEqual(scrolls, [[0, 320]]);
  assert.equal(storage.has('jobs-scroll'), false);
  link.props.onClick({ button: 0 });
  assert.equal(storage.get('jobs-scroll'), '480');
});


test('GitHub helper shares headers, disables caching and forwards the exact signal', async (t) => {
  const signal = new AbortController().signal;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.github.com/repos/example/project/issues');
    assert.equal(options.signal, signal);
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Accept, 'application/vnd.github+json');
    return Response.json({ ok: true });
  });
  assert.deepEqual(await githubRequest('/repos/example/project/issues', { signal }), { ok: true });
});

test('GitHub helper handles generic failures and optional domain-specific 404 messages', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }));
  const signal = new AbortController().signal;
  await assert.rejects(githubRequest('/missing', { signal }), /Could not load data from GitHub/);
  await assert.rejects(githubRequest('/missing', { signal, notFoundMessage: 'Job unavailable' }), /Job unavailable/);
});


test('GitHub helper serializes typed job filters as query parameters', async (t) => {
  const params = { labels: ['job', 'approved'], page: 2, perPage: 100, state: 'open', sort: 'created', direction: 'desc' };
  t.mock.method(globalThis, 'fetch', async (target) => {
    const url = new URL(target);
    assert.equal(url.searchParams.get('labels'), 'job,approved');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('per_page'), '100');
    assert.equal(url.searchParams.has('perPage'), false);
    assert.equal(url.searchParams.get('state'), 'open');
    assert.equal(url.searchParams.get('sort'), 'created');
    assert.equal(url.searchParams.get('direction'), 'desc');
    return Response.json([]);
  });
  await githubRequest('/repos/example/project/issues', { signal: new AbortController().signal, params });
  assert.deepEqual(params.labels, ['job', 'approved']);
});


test('GitHub helper omits undefined filters and encodes label names', async (t) => {
  t.mock.method(globalThis, 'fetch', async (target) => {
    const url = new URL(target);
    assert.equal(url.searchParams.has('state'), false);
    assert.equal(url.searchParams.has('direction'), false);
    assert.equal(url.searchParams.get('labels'), 'C++,React & Node.js');
    return Response.json([]);
  });
  await githubRequest('/repos/example/project/issues', {
    signal: new AbortController().signal,
    params: { state: undefined, direction: undefined, labels: ['C++', 'React & Node.js'] },
  });
});
