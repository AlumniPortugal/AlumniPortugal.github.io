import { getAlumni } from '@/lib/alumni';
import DirectoryList from './DirectoryList';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

export const metadata = { title: 'Alumni Directory' };

export default function Directory() {
  const people = getAlumni();
  return (
    <main>
      <a href="/">← Home</a>
      <h1>Alumni Directory</h1>
      <p className="muted">
        <a href={`${REPO}/blob/main/.github/PULL_REQUEST_TEMPLATE/new-entry.md`}> Add or update your entry </a>
      </p>
      <DirectoryList people={people} />
    </main>
  );
}
