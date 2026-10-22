import { Suspense } from 'react';
import Link from 'next/link';
import JobDetails from './JobDetails';

export const metadata = { title: 'Job details' };

export default function JobDetailsPage() {
  return (
    <main>
      <Link href="/jobs/">← Jobs</Link>
      <Suspense fallback={<p className="muted" role="status">Loading job…</p>}>
        <JobDetails />
      </Suspense>
    </main>
  );
}
