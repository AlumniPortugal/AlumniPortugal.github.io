'use client';

import { useEffect, useState } from 'react';
import { getJobs, getJobDetails, JOB_ERRORS, type Job } from './jobs';
import { formatPostedAgo } from './formatPostedAgo';
import Link from 'next/link';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let pending = false;

    async function refresh() {
      if (controller.signal.aborted || pending) return;
      clearTimeout(timer);
      if (document.hidden) return;
      pending = true;
      let delay = 60_000;
      try {
        const nextJobs = await getJobs(AbortSignal.any([
          controller.signal, AbortSignal.timeout(15_000),
        ]));
        if (!controller.signal.aborted) {
          setJobs(nextJobs);
          setError('');
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error && cause.name !== 'TimeoutError'
            ? cause.message : JOB_ERRORS.listUnreachable);
        }
        delay = 300_000;
      } finally {
        pending = false;
        if (!controller.signal.aborted) timer = setTimeout(refresh, delay);
      }
    }

    void refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    if (jobs === null) return;
    try {
      const position = sessionStorage.getItem('jobs-scroll');
      sessionStorage.removeItem('jobs-scroll');
      if (position !== null && Number.isFinite(Number(position))) window.scrollTo(0, Number(position));
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
  }, [jobs]);

  return (
    <>
      {jobs === null && !error ? <p className="muted" role="status">Loading jobs…</p> : null}
      {error ? (
        <p role="alert">
          {error} {jobs !== null ? 'Showing the last successfully loaded listings. ' : null}
          <a href={`${REPO}/issues?q=is%3Aopen+label%3Ajob+label%3Aapproved`}>View jobs on GitHub</a>.
        </p>
      ) : null}
      <ul className="people jobs">
        {jobs?.map((job) => {
          const details = getJobDetails(job.body);
          return (
            <li key={job.number} className="job-card">
              <Link
                href={`/jobs/details/?issue=${job.number}`}
                className="job-card-open"
                prefetch={false}
                aria-label={`View job details: ${details.role ?? job.title.replace(/^\[job\]\s*/i, '')}`}
                onClick={(event) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  try {
                    sessionStorage.setItem('jobs-scroll', String(window.scrollY));
                  } catch {
                    // Keep the link usable when browser storage is unavailable.
                  }
                }}
              />
              <div className="job-main">
                <div className="job-meta">
                  {details.company ? <span className="job-company">{details.company}</span> : null}
                  <span className="muted">{[details.location, details.type].filter(Boolean).join(' · ')}</span>
                  {details.referral ? <span className="tag">direct referral</span> : null}
                </div>
                <p className="job-title">{details.role ?? job.title.replace(/^\[job\]\s*/i, '')}</p>
                {job.user ? (
                  <p className="posted-by">
                    Posted by{' '}
                    <a href={`https://github.com/${encodeURIComponent(job.user.login)}`}>
                      @{job.user.login}
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="job-side">
                <time className="muted" dateTime={job.created_at} title={new Date(job.created_at).toLocaleString()}>
                  {formatPostedAgo(job.created_at)}
                </time>
                <span className="view-details" aria-hidden="true">
                  View details
                </span>
              </div>
            </li>
          );
        })}
        {jobs?.length === 0 ? <li className="muted">No approved open roles right now.</li> : null}
      </ul>
    </>
  );
}
