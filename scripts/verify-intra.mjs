// Verifies each changed directory entry's intra_username against the 42 API and
// writes a reviewer-facing summary. Runs on pull_request_target: the workflow
// uses base-branch code + repo secrets, and reads PR data via the GitHub API,
// so no PR code is executed. Writes comment.md and the job summary; exits 1 if
// an intra_username cannot be found.
import fs from 'node:fs';
import yaml from 'js-yaml';

const API = 'https://api.intra.42.fr';
const { INTRA_UID, INTRA_SECRET, GH_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, HEAD_SHA } = process.env;

const gh = async (path) => {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'verify-intra',
    },
  });
  if (!r.ok) throw new Error(`GitHub ${path} -> ${r.status}`);
  return r.json();
};

const intraToken = async () => {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: INTRA_UID,
    client_secret: INTRA_SECRET,
  });
  const r = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!r.ok) throw new Error(`42 token -> ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
};

const intraUser = async (login, token) => {
  const r = await fetch(`${API}/v2/users?filter[login]=${encodeURIComponent(login)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`42 /v2/users?filter[login]=${login} -> ${r.status}`);
  const list = await r.json();
  return Array.isArray(list) ? (list[0] ?? null) : list;
};

const md = [];
let ok = true;

try {
  const files = (
    await gh(`/repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}/files?per_page=100`)
  )
    .filter((f) => f.status !== 'removed' && /^data\/alumni\/.+\.ya?ml$/.test(f.filename))
    .map((f) => f.filename);

  const entries = [];
  for (const file of files) {
    const c = await gh(`/repos/${GITHUB_REPOSITORY}/contents/${file}?ref=${HEAD_SHA}`);
    const a = yaml.load(Buffer.from(c.content, 'base64').toString('utf8')) || {};
    if (a.intra_username) entries.push({ login: String(a.intra_username), file });
  }

  md.push('### 42 intra verification', '');
  if (!entries.length) {
    md.push('_No directory entries with an `intra_username` in this PR._');
  } else {
    const token = await intraToken();
    md.push(
      '| intra_username | usual_full_name | location | alumni? | kind |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const { login, file } of entries) {
      let u = null;
      try {
        u = await intraUser(login, token);
      } catch {
        u = null;
      }
      if (!u) {
        ok = false;
        md.push(`| \`${login}\` | — | — | — | ❌ not found (${file}) |`);
        continue;
      }
      const is42 = u.kind === 'student' || u['alumni?'] === true || u['active?'] === true || u['staff?'] === true;
      md.push(
        `| [${u.login}](https://profile-v3.intra.42.fr/users/${u.login}) | ${u.usual_full_name ?? '—'} | ${u.location ?? '—'} | ${u['alumni?']} | ${u.kind ?? '—'}${is42 ? '' : ' ⚠️'} |`,
      );
    }
    md.push('', '<sub>Checked against `api.intra.42.fr`.</sub>');
  }
} catch (e) {
  ok = false;
  md.push('### 42 intra verification', '', `⚠️ Verification failed: ${e?.message ?? e}`);
}

const out = md.join('\n') + '\n';
fs.writeFileSync('comment.md', out);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
process.exit(ok ? 0 : 1);
