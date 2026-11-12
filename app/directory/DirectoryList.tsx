'use client';

import { useMemo, useState } from 'react';
import type { Alumni } from '@/lib/alumni';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

// Keeps every card the same height; the rest stay available on the tooltip.
const MAX_SKILLS = 5;

export default function DirectoryList({ people }: { people: Alumni[] }) {
  const [q, setQ] = useState('');
  const [openSkills, setOpenSkills] = useState<Record<string, boolean>>({});
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

  const toggleSkills = (id: string) =>
    setOpenSkills((prev) => ({ ...prev, [id]: !prev[id] }));

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
              {label(o)}
            </option>
          ))}
        </select>
      </div>
      <p className="muted">
        Showing {filtered.length} of {people.length} alumni.
      </p>
      <ul className="people">
        {filtered.map((a) => (
          <li key={a.intra_username}>
            <span className="avatar" aria-hidden="true">
              {initials(a.name)}
            </span>
            <p className="name">{a.name}</p>
            <p className="role">
              {a.field}
              {a.company ? ` @ ${a.company}` : ''}
            </p>
            {a.location ? <p className="where"><span className="badge-soft">{a.location}</span></p> : null}
            {a.skills?.length ? (
              <ul className="chips" aria-label="Skills">
                {(openSkills[a.intra_username] ? a.skills : a.skills.slice(0, MAX_SKILLS)).map((s) => (
                  <li key={s}>{s}</li>
                ))}
                {a.skills.length > MAX_SKILLS ? (
                  <li>
                    <button
                      type="button"
                      className="chip-more"
                      onClick={() => toggleSkills(a.intra_username)}
                      aria-expanded={Boolean(openSkills[a.intra_username])}
                      aria-label={
                        openSkills[a.intra_username]
                          ? 'Show fewer skills'
                          : `Show ${a.skills.length - MAX_SKILLS} more skills`
                      }
                    >
                      <span aria-hidden="true">{openSkills[a.intra_username] ? '−' : '…'}</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : null}
            {a.open_to?.length ? (
              <ul className="pills" aria-label="Open to">
                {a.open_to.map((o) => (
                  <li key={o} className={`open-${o}`}>
                    {label(o)}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="profile-links">
              <a href={`https://profile-v3.intra.42.fr/users/${a.intra_username}`}>Profile →</a>
              <a href={`https://github.com/${a.github}`}>@{a.github}</a>
            </div>
          </li>
        ))}
        {filtered.length === 0 ? <li className="muted">No matches.</li> : null}
      </ul>
    </>
  );
}
