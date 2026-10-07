# 42 Alumni Portugal

Homepage + alumni directory + jobs board for the 42 Portugal alumni community.

## Products

| Product | Where |
|---|---|
| Homepage | `/` |
| Alumni Directory | `/directory/` |
| Jobs & Referrals | [issues with `job` + `approved`](https://github.com/AlumniPortugal/AlumniPortugal.github.io/issues?q=is%3Aopen+label%3Ajob+label%3Aapproved) |
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
   open_to: [mentoring, collaboration]
   ```

2. Open a PR. CI validates the entry; a board member reviews and merges.
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
