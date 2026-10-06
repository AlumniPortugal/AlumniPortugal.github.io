const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

const products = [
  {
    title: 'Alumni Directory',
    blurb: "Who's doing what — a voluntary directory of 42 Portugal alumni.",
    href: '/directory/',
    cta: 'Browse the directory',
  },
  {
    title: 'Certification Calculator',
    blurb: 'Map your 42 projects to certifications worth taking.',
    href: 'https://github.com/AlumniPortugal/cert-calculator',
    cta: 'Open the calculator',
  },
  {
    title: 'Jobs & Referrals',
    blurb: 'Open roles posted by alumni, with referrals.',
    href: `${REPO}/issues?q=is%3Aopen+label%3Ajob+label%3Aapproved`,
    cta: 'See open roles',
  },
];

export default function Home() {
  return (
    <main>
      <h1>42 Alumni Portugal</h1>
      <p className="muted">The home of the 42 Portugal alumni community.</p>
      <ul className="cards">
        {products.map((p) => (
          <li className="card" key={p.title}>
            <h2>{p.title}</h2>
            <p>{p.blurb}</p>
            <a href={p.href}>{p.cta} →</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
