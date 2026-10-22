const API = 'https://api.github.com';

const GITHUB_ERRORS = {
  rateLimit: 'GitHub is limiting requests. Please try again in a few minutes.',
  requestFailed: 'Could not load data from GitHub. Please try again.',
} as const;

export type GitHubParams = {
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
};

export async function githubRequest(
  path: string,
  { signal, params, notFoundMessage }: {
    signal: AbortSignal;
    params?: GitHubParams;
    notFoundMessage?: string;
  },
): Promise<unknown> {
  const url = new URL(`${API}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key === 'perPage' ? 'per_page' : key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const response = await fetch(url.toString(), {
    signal, cache: 'no-store', headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404 && notFoundMessage) throw new Error(notFoundMessage);
  if (!response.ok) {
    throw new Error(response.status === 403 || response.status === 429
      ? GITHUB_ERRORS.rateLimit
      : GITHUB_ERRORS.requestFailed);
  }
  return response.json();
}
