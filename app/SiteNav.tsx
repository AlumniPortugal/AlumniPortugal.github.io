'use client';

import { usePathname } from 'next/navigation';

const CERT_CALCULATOR = 'https://github.com/AlumniPortugal/cert-calculator';

const links = [
  { href: '/directory/', label: 'Directory' },
  { href: '/jobs/', label: 'Jobs' },
  // { href: CERT_CALCULATOR, label: 'Certifications' },
];

export default function SiteNav() {
  const path = usePathname();
  const isActive = (href: string) => href.startsWith('/') && (path === href || path.startsWith(href));

  return (
    <nav className="site-nav" aria-label="Main">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={isActive(link.href) ? 'is-active' : undefined}
          aria-current={isActive(link.href) ? 'page' : undefined}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
