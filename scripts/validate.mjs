// Validates every directory entry. Runs in CI on PRs touching data/alumni.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const dir = path.join(process.cwd(), 'data', 'alumni');
const REQUIRED = ['name', 'github', 'field'];
const errs = [];
const seen = new Set();

for (const f of fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
  const id = f.replace(/\.ya?ml$/, '');
  let a;
  try {
    a = yaml.load(fs.readFileSync(path.join(dir, f), 'utf8'));
  } catch (e) {
    errs.push(`${f}: invalid YAML — ${e.message}`);
    continue;
  }
  if (!a || typeof a !== 'object') {
    errs.push(`${f}: not a mapping`);
    continue;
  }
  for (const k of REQUIRED) if (!a[k]) errs.push(`${f}: missing "${k}"`);
  if (a.github && a.github !== id) errs.push(`${f}: github "${a.github}" must match filename "${id}"`);
  if (seen.has(a.github)) errs.push(`${f}: duplicate github "${a.github}"`);
  seen.add(a.github);
  if (a.skills != null && !Array.isArray(a.skills)) errs.push(`${f}: skills must be a list`);
  if (a.open_to != null && !Array.isArray(a.open_to)) errs.push(`${f}: open_to must be a list`);
}

if (errs.length) {
  console.error(errs.join('\n'));
  process.exit(1);
}
console.log(`ok — ${seen.size} alumni`);
