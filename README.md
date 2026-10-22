# 42 Alumni Portugal

Homepage + alumni directory + jobs board for the 42 Portugal alumni community.

## Products

| Product | Where |
|---|---|
| Homepage | `/` |
| Alumni Directory | `/directory/` |
| Jobs & Referrals | `/jobs/` |
| Certification Calculator | separate repo (needs a backend) |

## Join the directory

1. Add a file at `data/alumni/<your-intra-username>.yml` (filename **must** equal your 42 intra username):

   ```yaml
   intra_username: your42login
   name: Your Name
   github: yourhandle
   field: Backend
   company: Acme        # optional
   location: Porto      # optional
   skills: [Go, K8s]
   # one or more of: mentoring | collaboration | job_opportunities
   open_to: [mentoring, collaboration]
   ```

2. Open a PR. CI validates the entry and verifies your 42 intra username against the 42 API; a board member reviews and merges.
3. The site rebuilds and deploys automatically.

## Post a job

Open a [job issue](https://github.com/AlumniPortugal/AlumniPortugal.github.io/issues/new?template=job.yml).
A board member applies the `approved` label — that is what puts it on the board and on the site.
Quiet postings go stale after 45 days and close 7 days later.

## Develop

```sh
npm install
npm run dev        # http://localhost:3000
npm run validate   # check every directory entry
npm run build      # static export into out/
```

The jobs page fetches open issues with both `job` and `approved` labels directly
from GitHub in the browser, on opening and every minute while visible. It pauses
when hidden and refreshes on return. Failed requests retry after five minutes,
keeping the last successful results and a link to GitHub. No token or rebuild is
needed; GitHub's public API rate limits apply. Cards read the role, company, work
arrangement, location, and referral availability from the issue form. Missing
fields are omitted, and issues without the form use their original title.

Click a job card to open `/jobs/details/?issue=<number>` in the same tab, with
its full description and application contact. Links can be shared or opened in
a new tab. Details are fetched in the browser and only approved job issues are
shown; closed or unavailable jobs display a message. The Jobs link returns to
the list and restores its scroll position when browser storage is available.
Author profile links remain independently usable.

Job details support GitHub Flavored Markdown (email/URL autolinks, tables, task
lists, strikethrough), line breaks, and sanitized HTML such as collapsible
details. Plain email addresses open the mail app via `mailto:` links.
