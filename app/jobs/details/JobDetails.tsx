'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getJob, type Job } from '../getJobs';
import JobContent from '../JobContent';

function JobRequest({ issueNumber }: { issueNumber: string | null }) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    void getJob(issueNumber, AbortSignal.any([
      controller.signal, AbortSignal.timeout(15_000),
    ])).then((nextJob) => {
      if (!controller.signal.aborted) setJob(nextJob);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error && cause.name !== 'TimeoutError'
          ? cause.message : 'Could not reach GitHub. Please try again.');
      }
    });
    return () => controller.abort();
  }, [issueNumber, attempt]);

  if (error) return (
    <>
      <p role="alert">{error}</p>
      <button className="job-retry" type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
    </>
  );
  if (!job) return <p className="muted" role="status">Loading job…</p>;
  return <JobContent job={job} />;
}

export default function JobDetails() {
  const params = useSearchParams();
  const issueNumber = params.get('issue');
  return <JobRequest key={issueNumber} issueNumber={issueNumber} />;
}
