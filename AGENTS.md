# Alumni Portugal agent guide

Keep changes small, static, reviewable, and easy for volunteers to maintain.
Repository-specific instructions below override general preferences.

## Product invariants

- This is a static Next.js App Router site exported to `out/` and hosted on
  GitHub Pages.
- Git-tracked YAML is the database. Do not add a runtime database, API route,
  Server Action, authentication system, or server-only deployment dependency.
- If a feature truly needs a backend, explain the boundary and propose a
  separate service or repository instead of weakening the static architecture.
- Alumni data is voluntary and public. Do not add private or inferred personal
  data.

## Architecture

- `app/`: routes, layout, styles, and UI. Components are Server Components by
  default; add `'use client'` only to the smallest interactive leaf.
- `data/alumni/`: one `<intra_username>.yml` file per alumnus; source of truth.
- `lib/alumni.ts`: typed build-time loading and ordering of alumni data.
- `scripts/`: deterministic validation and trusted automation helpers.
- `.github/workflows/`: validation, verification, maintenance, and Pages deploy.

Keep data loading at build time. Preserve `output: 'export'`, trailing-slash
routing, and compatibility with GitHub Pages.

## Implementation rules

- Prefer the simplest change that satisfies the request; reuse existing
  patterns before adding abstractions or dependencies.
- Keep TypeScript strict. Do not use `any` when a small explicit type works.
- Derive values during render; use effects only to synchronize with an external
  system. Never mutate props or state.
- Keep client state local. Pass only data the client component actually needs.
- Preserve semantic HTML, keyboard access, visible focus, labels, and useful
  link text. Check narrow and wide layouts for UI changes.
- Avoid speculative memoization and micro-optimizations. Optimize measured hot
  paths; use `Set` or `Map` for genuinely repeated lookups.
- Do not commit `node_modules/`, `.next/`, `out/`, secrets, or generated noise.

## Alumni data changes

- The filename and `intra_username` must match exactly.
- Required fields: `intra_username`, `name`, `github`, and `field`.
- Optional fields: `company`, `location`, `skills`, and `open_to`.
- `open_to` values are `mentoring`, `collaboration`, and `job_opportunities`.
- When the schema changes, update the type, validator, example, documentation,
  and rendering in the same pull request.
- Modify another person's entry only with clear authorization.

## Actions and security

- Treat workflow permissions and repository secrets as security boundaries.
- A `pull_request_target` workflow must use trusted base-branch code and must
  never checkout or execute untrusted pull-request code with secrets available.
- Pin actions to a deliberate major version or immutable commit and grant the
  minimum `permissions` required.
- Never print credentials or full sensitive API responses to logs.

## Workflow

1. Inspect the relevant files and current Git state; preserve unrelated work.
2. Make one focused change with the smallest useful diff.
3. Run checks proportional to the change:
   - Always: `npm run validate`
   - Application, dependency, or configuration changes: `npm run build`
   - UI changes: manually check interaction, keyboard use, and responsive layout
4. Report anything not run and why.
5. Never push directly to `main`. Push a focused branch and open a pull request.
   Do not merge it unless the user explicitly asks.

## Git and commits

- Branches: `<type>/<short-kebab-description>`, such as
  `feat/directory-skill-filter` or `docs/contribution-guide`.
- Commits: `<type>(optional-scope): <imperative summary>`.
- Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, and `chore`.
- Keep the summary lowercase, specific, and at most 72 characters. Use the body
  for motivation or non-obvious trade-offs, not a file-by-file narration.
- Each commit should be coherent and leave the repository valid. Do not rewrite
  published history without explicit authorization.

## Pull requests

- Title the PR like a commit.
- Describe why the change is needed, what changed, exact verification performed,
  and risks or follow-ups. Add screenshots for visible UI changes.
- State `Not run` explicitly for omitted checks; never imply verification that
  did not happen.
- Keep the PR focused. Link related work and use `Closes #<number>` only when the
  PR fully resolves that issue.

## Done

A task is complete when the requested behavior works, relevant checks pass, the
diff contains no unrelated changes, documentation matches behavior, and the PR
gives a reviewer enough evidence to decide without reconstructing the work.
