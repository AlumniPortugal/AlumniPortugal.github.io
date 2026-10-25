import { getAlumni } from '@/lib/alumni';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

const products = [
  {
    title: 'Alumni Directory',
    blurb: "Who's doing what — a voluntary directory of 42 Portugal alumni.",
    href: '/directory/',
    cta: 'Browse the directory',
    icon: 'directory',
    tone: 'primary',
  },
  {
    title: 'Certification Calculator',
    blurb: 'Map your 42 projects to certifications worth taking.',
    href: null,
    cta: null,
    icon: 'calculator',
    tone: 'secondary',
  },
  {
    title: 'Jobs & Referrals',
    blurb: 'Open roles posted by alumni, with referrals.',
    href: '/jobs/',
    cta: 'See open roles',
    icon: 'jobs',
    tone: 'primary',
  },
];

// Material Symbols (Apache-2.0) paths, viewBox 0 -960 960 960.
const ICONS: Record<string, string> = {
  directory:
    'M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z',
  calculator:
    'm344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z',
  jobs:
    'M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z',
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 -960 960 960" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d={ICONS[name]} />
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
                <a href={p.href}>
                  <span>{p.cta}</span>
                  <span aria-hidden="true">→</span>
                </a>
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
