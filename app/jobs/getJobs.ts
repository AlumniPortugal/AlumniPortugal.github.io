const API = 'https://api.github.com/repos/AlumniPortugal/AlumniPortugal.github.io/issues';

export type Job = {
  number: number;
  title: string;
  created_at: string;
  body: string | null;
  user: { login: string } | null;
};

function isIssue(value: unknown): value is Job & { pull_request?: unknown } {
  if (!value || typeof value !== 'object') return false;
  return 'number' in value && Number.isSafeInteger(value.number) && Number(value.number) > 0
    && 'title' in value && typeof value.title === 'string'
    && 'created_at' in value && typeof value.created_at === 'string'
    && Number.isFinite(Date.parse(value.created_at))
    && 'body' in value && (value.body === null || typeof value.body === 'string')
    && 'user' in value && (value.user === null || (
      typeof value.user === 'object' && 'login' in value.user
      && typeof value.user.login === 'string' && value.user.login.length > 0
    ));
}

export async function getJobs(signal: AbortSignal): Promise<Job[]> {
  const jobs: Job[] = [];
  for (let page = 1; ; page++) {
    const response = await fetch(
      `${API}?state=open&labels=job,approved&sort=created&direction=desc&per_page=100&page=${page}`,
      { signal, cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!response.ok) {
      throw new Error(response.status === 403 || response.status === 429
        ? 'GitHub is limiting requests. We will retry automatically in a few minutes.'
        : 'Could not load jobs from GitHub. We will retry automatically.');
    }
    const issues: unknown = await response.json();
    if (!Array.isArray(issues) || !issues.every(isIssue)) {
      throw new Error('GitHub returned an unexpected response. We will retry automatically.');
    }
    jobs.push(...issues.filter((issue) => !('pull_request' in issue)));
    if (issues.length < 100) return jobs;
  }
}

export function getJobDetails(body: string | null) {
  const sections = (body ?? '').split(/^###[ \t]+([^\r\n]+)\r?$/m);
  const fields = new Map<string, string>();
  for (let i = 1; i < sections.length; i += 2) {
    const name = sections[i].trim().toLowerCase();
    const value = sections[i + 1].trim();
    if (value && value !== '_No response_' && !fields.has(name)) fields.set(name, value);
  }
  const field = (name: string) => fields.get(name)?.replace(/\s+/g, ' ');
  return {
    role: field('role title'),
    company: field('company'),
    type: field('type'),
    location: field('location'),
    referral: /^- \[x\] I can refer candidates\s*$/im.test(fields.get('referral') ?? ''),
  };
}

export async function getJob(issueNumber: string | null, signal: AbortSignal): Promise<Job> {
  if (!issueNumber || !/^[1-9]\d*$/.test(issueNumber) || !Number.isSafeInteger(Number(issueNumber))) {
    throw new Error('Invalid job link. Choose a job from the jobs page.');
  }
  const response = await fetch(`${API}/${issueNumber}`, {
    signal, cache: 'no-store', headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404) throw new Error('This job is no longer available.');
  if (!response.ok) {
    throw new Error(response.status === 403 || response.status === 429
      ? 'GitHub is limiting requests. Please try again in a few minutes.'
      : 'Could not load this job. Please try again.');
  }
  const issue: unknown = await response.json();
  if (!isIssue(issue) || !('labels' in issue) || !Array.isArray(issue.labels)
    || !('state' in issue) || (issue.state !== 'open' && issue.state !== 'closed')) {
    throw new Error('GitHub returned an unexpected response. Please try again.');
  }
  const labels = issue.labels.map((label: unknown) => (
    label && typeof label === 'object' && 'name' in label ? label.name : label
  ));
  if ('pull_request' in issue || !labels.includes('job') || !labels.includes('approved')) {
    throw new Error('This job is no longer available.');
  }
  if (issue.state === 'closed') throw new Error('This job has closed and is no longer accepting applications.');
  return issue;
}
