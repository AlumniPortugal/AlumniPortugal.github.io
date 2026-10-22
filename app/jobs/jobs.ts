import { githubRequest } from '@/lib/github';

const ISSUES = '/repos/AlumniPortugal/AlumniPortugal.github.io/issues';

export const JOB_ERRORS = {
  invalidLink: 'Invalid job link. Choose a job from the jobs page.',
  unavailable: 'This job is no longer available.',
  closed: 'This job has closed and is no longer accepting applications.',
  invalidListResponse: 'GitHub returned an unexpected response. We will retry automatically.',
  invalidDetailResponse: 'GitHub returned an unexpected response. Please try again.',
  listUnreachable: 'Could not reach GitHub. We will retry automatically.',
  detailUnreachable: 'Could not reach GitHub. Please try again.',
} as const;

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
    const issues = await githubRequest(ISSUES, {
      signal,
      params: {
        state: 'open',
        labels: ['job', 'approved'],
        sort: 'created',
        direction: 'desc',
        perPage: 100,
        page,
      },
    });
    if (!Array.isArray(issues) || !issues.every(isIssue)) {
      throw new Error(JOB_ERRORS.invalidListResponse);
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
    throw new Error(JOB_ERRORS.invalidLink);
  }
  const issue = await githubRequest(`${ISSUES}/${issueNumber}`, {
    signal, notFoundMessage: JOB_ERRORS.unavailable,
  });
  if (!isIssue(issue) || !('labels' in issue) || !Array.isArray(issue.labels)
    || !('state' in issue) || (issue.state !== 'open' && issue.state !== 'closed')) {
    throw new Error(JOB_ERRORS.invalidDetailResponse);
  }
  const labels = issue.labels.map((label: unknown) => (
    label && typeof label === 'object' && 'name' in label ? label.name : label
  ));
  if ('pull_request' in issue || !labels.includes('job') || !labels.includes('approved')) {
    throw new Error(JOB_ERRORS.unavailable);
  }
  if (issue.state === 'closed') throw new Error(JOB_ERRORS.closed);
  return issue;
}
