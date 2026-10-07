import { getAlumni } from '@/lib/alumni';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

export const metadata = { title: 'Alumni Directory' };

export default function Directory() {
  const people = getAlumni();
  return (
    <main>
      <h1>Alumni Directory</h1>
      <p className="muted">
        {people.length} alumni.{' '}
        <a href={`${REPO}/blob/main/.github/PULL_REQUEST_TEMPLATE.md`}>Add or update your entry</a>.
      </p>
      <ul className="people">
        {people.map((a) => (
          <li key={a.intra_username}>
            <strong>{a.name}</strong> — {a.field}
            {a.company ? ` @ ${a.company}` : ''}
            {a.location ? ` · ${a.location}` : ''}
            <br />
            <span className="muted">@{a.intra_username}</span> ·{' '}
            <a href={`https://github.com/${a.github}`}>@{a.github}</a>
            {a.skills?.length ? <span className="muted"> · {a.skills.join(', ')}</span> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
