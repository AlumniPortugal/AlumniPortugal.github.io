import './globals.css';
import SiteNav from './SiteNav';

export const metadata = { title: 'Alumni Portugal' };

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';
const NEW_ENTRY = `${REPO}/blob/main/.github/PULL_REQUEST_TEMPLATE/new-entry.md`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <header className="site-header">
          <div>
            <a className="wordmark" href="/">
              Alumni Portugal
            </a>
            <SiteNav />
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <span>Community-run, not affiliated with 42.</span>
            <nav aria-label="Footer">
              <a href={REPO}>GitHub</a>
              <a href={NEW_ENTRY}>Add or update your entry</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
