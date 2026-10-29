// Validates every directory entry. Runs in CI on PRs touching data/alumni.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const dir = path.join(process.cwd(), 'data', 'alumni');
const REQUIRED = ['name', 'intra_username', 'github', 'field'];
// Allowed `open_to` values. Keep in sync with the comment in README / the example entry.
const OPEN_TO = ['mentoring', 'collaboration', 'job_opportunities'];
const GUIDE =
  'https://github.com/AlumniPortugal/AlumniPortugal.github.io/blob/main/.github/PULL_REQUEST_TEMPLATE/new-entry.md';

const errors = [];
const fail = (file, message) => errors.push({ file: `data/alumni/${file}`, message });
const seen = new Set();

for (const f of fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
  const id = f.replace(/\.ya?ml$/, '');
  let a;
  try {
    a = yaml.load(fs.readFileSync(path.join(dir, f), 'utf8'));
  } catch (e) {
    fail(f, `invalid YAML — ${e.message}`);
    continue;
  }
  if (!a || typeof a !== 'object') {
    fail(f, 'not a mapping');
    continue;
  }
  for (const k of REQUIRED) if (!a[k]) fail(f, `missing "${k}"`);
  if (a.intra_username && a.intra_username !== id)
    fail(f, `intra_username "${a.intra_username}" must match filename "${id}"`);
  if (a.github) {
    if (seen.has(a.github)) fail(f, `duplicate github "${a.github}"`);
    seen.add(a.github);
  }
  if (a.skills != null && !Array.isArray(a.skills)) fail(f, 'skills must be a list');
  if (a.open_to != null) {
    if (!Array.isArray(a.open_to)) fail(f, 'open_to must be a list');
    else
      for (const o of a.open_to)
        if (!OPEN_TO.includes(o)) fail(f, `open_to "${o}" not allowed (use: ${OPEN_TO.join(', ')})`);
  }
}

const inActions = process.env.GITHUB_ACTIONS === 'true';

if (errors.length) {
  for (const { file, message } of errors) console.error(`${file}: ${message}`);

  if (inActions) {
    // Surfaces each problem inline on the Files-changed tab.
    for (const { file, message } of errors) {
      console.log(`::error file=${file},title=Directory entry::${message}`);
    }
    const summary = process.env.GITHUB_STEP_SUMMARY;
    if (summary) {
      fs.appendFileSync(
        summary,
        [
          `## Directory validation failed`,
          '',
          `${errors.length} problem${errors.length === 1 ? '' : 's'} in \`data/alumni/\`:`,
          '',
          ...errors.map(({ file, message }) => `- \`${path.basename(file)}\` — ${message}`),
          '',
          `Fix them in the same pull request, then run \`bun run validate\` locally.`,
          `Field reference: [how to add an entry](${GUIDE}).`,
          '',
        ].join('\n'),
      );
    }
  }

  process.exit(1);
}

console.log(`ok — ${seen.size} alumni`);

if (inActions && process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Directory validation passed\n\n${seen.size} ${
      seen.size === 1 ? 'entry' : 'entries'
    } checked in \`data/alumni/\`.\n`,
  );
}
