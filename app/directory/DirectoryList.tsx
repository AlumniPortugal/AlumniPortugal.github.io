'use client';

import { useMemo, useState } from 'react';
import type { Alumni } from '@/lib/alumni';

export default function DirectoryList({ people }: { people: Alumni[] }) {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [openTo, setOpenTo] = useState('');

  const locations = useMemo(
    () =>
      [...new Set(people.map((p) => p.location).filter((l): l is string => Boolean(l)))].sort(),
    [people],
  );
  const skills = useMemo(() => [...new Set(people.flatMap((p) => p.skills ?? []))].sort(), [people]);
  const openToOptions = useMemo(
    () => [...new Set(people.flatMap((p) => p.open_to ?? []))].sort(),
    [people],
  );

  const query = q.trim().toLowerCase();
  const filtered = people.filter((p) => {
    if (location && p.location !== location) return false;
    if (skill && !p.skills?.includes(skill)) return false;
    if (openTo && !p.open_to?.includes(openTo)) return false;
    if (!query) return true;
    return [p.name, p.intra_username, p.github, p.field, p.company, p.location, ...(p.skills ?? []), ...(p.open_to ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <>
      <div className="filters">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, company, skill…"
          aria-label="Search alumni"
        />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Filter by location"
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          aria-label="Filter by skill"
        >
          <option value="">All skills</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={openTo}
          onChange={(e) => setOpenTo(e.target.value)}
          aria-label="Filter by open to"
        >
          <option value="">Open to anything</option>
          {openToOptions.map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <p className="muted">
        {filtered.length} of {people.length} alumni.
      </p>
      <ul className="people">
        {filtered.map((a) => (
          <li key={a.intra_username}>
            <strong>{a.name}</strong> — {a.field}
            {a.company ? ` @ ${a.company}` : ''}
            {a.location ? ` · ${a.location}` : ''}
            <br />
            <a
              className="muted"
              href={`https://profile-v3.intra.42.fr/users/${a.intra_username}`}
            >
              @{a.intra_username}
            </a>{' '}
            · <a href={`https://github.com/${a.github}`}>@{a.github}</a>
            {a.skills?.length ? <span className="muted"> · {a.skills.join(', ')}</span> : null}
            {a.open_to?.length ? (
              <>
                <br />
                <span className="muted">
                  open to: {a.open_to.map((o) => o.replace(/_/g, ' ')).join(', ')}
                </span>
              </>
            ) : null}
          </li>
        ))}
        {filtered.length === 0 ? <li className="muted">No matches.</li> : null}
      </ul>
    </>
  );
}
