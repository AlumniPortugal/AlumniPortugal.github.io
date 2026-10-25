import { getAlumni } from '@/lib/alumni';
import DirectoryList from './DirectoryList';
import CtaBand from '../CtaBand';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';
const NEW_ENTRY = `${REPO}/blob/main/.github/PULL_REQUEST_TEMPLATE/new-entry.md`;

export const metadata = { title: 'Alumni Directory' };

export default function Directory() {
  const people = getAlumni();
  const count = (values: (string | undefined)[]) => new Set(values.filter(Boolean)).size;
  const companies = count(people.map((p) => p.company));
  const locations = count(people.map((p) => p.location));

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Alumni Directory</h1>
          <p className="muted">
            <a href={NEW_ENTRY}>Add or update your entry</a>
          </p>
        </div>
        <ul className="stats">
          <li>
            <strong>{people.length}</strong>
            <span>alumni</span>
          </li>
          {companies ? (
            <li>
              <strong>{companies}</strong>
              <span>companies</span>
            </li>
          ) : null}
          {locations ? (
            <li>
              <strong>{locations}</strong>
              <span>locations</span>
            </li>
          ) : null}
        </ul>
      </div>
      <DirectoryList people={people} />
      <CtaBand
        title="Are you a 42 Lisbon or 42 Porto alumnus?"
        text="Join the directory, list the skills you want to be found for, and help other alumni find you."
        href={NEW_ENTRY}
        cta="Add your profile"
      />
    </main>
  );
}
