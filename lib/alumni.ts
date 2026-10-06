import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type Alumni = {
  name: string;
  github: string;
  field: string;
  company?: string;
  location?: string;
  skills?: string[];
  open_to?: string[];
};

const dir = path.join(process.cwd(), 'data', 'alumni');

export function getAlumni(): Alumni[] {
  return fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => yaml.load(fs.readFileSync(path.join(dir, f), 'utf8')) as Alumni)
    .sort((a, b) => a.name.localeCompare(b.name));
}
