import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Job } from './jobs';

export default function JobContent({ job }: { job: Job }) {
  return (
    <article>
      <h1>{job.title.replace(/^\[job\]\s*/i, '')}</h1>
      {job.user ? (
        <p className="muted">
          Posted by <a href={`https://github.com/${encodeURIComponent(job.user.login)}`}>@{job.user.login}</a>
        </p>
      ) : null}
      <div className="job-description">
        {job.body?.trim() ? (
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
            {job.body}
          </Markdown>
        ) : <p>No additional details provided.</p>}
      </div>
    </article>
  );
}
