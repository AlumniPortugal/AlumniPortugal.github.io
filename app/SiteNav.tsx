'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const CERT_CALCULATOR = 'https://github.com/AlumniPortugal/cert-calculator';

const links = [
  { href: '/directory/', label: 'Directory' },
  { href: '/jobs/', label: 'Jobs' },
  // { href: CERT_CALCULATOR, label: 'Certifications' },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export default function SiteNav() {
  const path = usePathname();
  const isActive = (href: string) => href.startsWith('/') && (path === href || path.startsWith(href));
  const [dark, setDark] = useState(false);

  // Follow the system preference until the visitor picks a theme, then follow that choice.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem('theme');
      } catch {
        // Storage unavailable: fall back to the system preference.
      }
      const next = stored ? stored === 'dark' : query.matches;
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      setDark(next);
    };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  function setTheme(next: 'light' | 'dark') {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Theme still applies for this page view when storage is unavailable.
    }
    setDark(next === 'dark');
  }

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
      <div className="theme-switch" role="group" aria-label="Theme">
        <button
          type="button"
          className={dark ? undefined : 'is-on'}
          onClick={() => setTheme('light')}
          aria-pressed={!dark}
          aria-label="Light mode"
          title="Light mode"
        >
          <SunIcon />
        </button>
        <button
          type="button"
          className={dark ? 'is-on' : undefined}
          onClick={() => setTheme('dark')}
          aria-pressed={dark}
          aria-label="Dark mode"
          title="Dark mode"
        >
          <MoonIcon />
        </button>
      </div>
    </nav>
  );
}
