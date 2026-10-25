import { getAlumni } from '@/lib/alumni';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

const products = [
  {
    title: 'Alumni Directory',
    blurb: "Who's doing what — a voluntary directory of 42 Portugal alumni.",
    href: '/directory/',
    cta: 'Browse the directory →',
    icon: 'people',
    tone: 'primary',
  },
  {
    title: 'Certification Calculator',
    blurb: 'Map your 42 projects to certifications worth taking.',
    href: null,
    cta: null,
    icon: 'target',
    tone: 'secondary',
  },
  {
    title: 'Jobs & Referrals',
    blurb: 'Open roles posted by alumni, with referrals.',
    href: '/jobs/',
    cta: 'See open roles →',
    icon: 'briefcase',
    tone: 'primary',
  },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    people:
      'M8 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 14c0-2.2 2.2-3.6 5-3.6s5 1.4 5 3.6M13 9.2a1.8 1.8 0 1 0 0-3.6',
    target: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm0-3.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z',
    briefcase: 'M2.5 6.2h11a1 1 0 0 1 1 1v5.3a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V7.2a1 1 0 0 1 1-1ZM6 6V4.6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6',
  };
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

/** Decorative "holy graph" orbit: six counter-rotating rings plus a slow ambient layer. */
function Orbit() {
  return (
    <div className="orbit-stage" aria-hidden="true">
      <div className="orbit-ambient">
        <span className="orbit-node is-ambient" style={{ top: '-3%', right: '22%', color: 'var(--primary-ctr)', animationDelay: '0s' }} />
        <span className="orbit-node is-ambient" style={{ top: '28%', left: '-2%', color: 'var(--accent-cyan)', animationDelay: '2.4s' }} />
        <span className="orbit-node is-ambient" style={{ bottom: '-2%', right: '30%', color: 'var(--secondary)', animationDelay: '4.1s' }} />
      </div>

      <div className="orbit-ring is-dashed" style={{ width: '100%', animation: 'spin-cw 42s linear infinite' }}>
        <span className="orbit-node" style={{ top: '-3px', left: '50%', color: 'var(--primary-ctr)' }} />
        <span className="orbit-node" style={{ bottom: '-3px', left: '33%', color: 'var(--secondary)' }} />
      </div>
      <div className="orbit-ring is-solid" style={{ width: '85%', animation: 'spin-ccw 34s linear infinite' }}>
        <span className="orbit-node" style={{ top: '50%', right: '-3px', color: 'var(--accent-cyan)' }} />
        <span className="orbit-node" style={{ top: '18%', left: '10%', color: 'var(--primary-ctr)' }} />
      </div>
      <div className="orbit-ring is-dashed" style={{ width: '70%', animation: 'spin-cw 26s linear infinite' }}>
        <span className="orbit-node" style={{ top: '-3px', left: '25%', color: 'var(--secondary)' }} />
        <span className="orbit-node" style={{ bottom: '12%', right: '12%', color: 'var(--primary-ctr)' }} />
      </div>
      <div className="orbit-ring is-solid" style={{ width: '55%', animation: 'spin-ccw 20s linear infinite' }}>
        <span className="orbit-node" style={{ bottom: '-3px', right: '25%', color: 'var(--primary-ctr)' }} />
        <span className="orbit-node" style={{ top: '12%', left: '14%', color: 'var(--accent-cyan)' }} />
      </div>
      <div className="orbit-ring is-dashed" style={{ width: '40%', animation: 'spin-cw 15s linear infinite' }}>
        <span className="orbit-node" style={{ top: '48%', left: '-4px', color: 'var(--secondary)' }} />
        <span className="orbit-node" style={{ top: '-3px', right: '18%', color: 'var(--primary-ctr)' }} />
      </div>
      <div className="orbit-ring is-soft" style={{ width: '25%', animation: 'spin-ccw 10s linear infinite' }}>
        <span className="orbit-node" style={{ top: '-3px', left: '50%', color: 'var(--accent-cyan)' }} />
      </div>
      <div className="orbit-core">libft</div>
    </div>
  );
}

export default function Home() {
  const alumni = getAlumni();
  const count = (values: (string | undefined)[]) => new Set(values.filter(Boolean)).size;

  const stats = [
    { value: `${alumni.length}`, label: alumni.length === 1 ? 'alumnus' : 'alumni' },
    { value: `${count(alumni.map((a) => a.location))}`, label: 'locations' },
    { value: `${count(alumni.map((a) => a.company))}`, label: 'companies' },
  ].filter((s) => s.value !== '0');

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="badge">Community Directory &amp; Network</p>
          <h1>The home of the Portugal Alumni Community.</h1>
          <p>
            A voluntary directory of who is doing what, plus jobs and referrals from the
            community. More features incoming.
          </p>
          <ul className="stats">
            {stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <Orbit />
      </section>

      <ul className="cards">
        {products.map((p) => (
          <li className="card" key={p.title}>
            <span className={`card-icon card-icon-${p.tone}`} aria-hidden="true">
              <Icon name={p.icon} />
            </span>
            <h2>{p.title}</h2>
            <p>{p.blurb}</p>
            {p.href && p.cta ? (
              <div className="card-footer">
                <a href={p.href}>{p.cta}</a>
              </div>
            ) : (
              <div className="card-footer">
                <span className="soon">Coming soon</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
