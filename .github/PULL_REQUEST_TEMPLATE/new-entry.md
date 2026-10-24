## New alumni entry

<!--
Thanks for joining the directory. This template only covers adding or updating
your own entry; delete it if your PR is about something else.

To load it into your PR body once your branch exists, append
?template=PULL_REQUEST_TEMPLATE/new-entry.md&quick_pull=1 to
https://github.com/AlumniPortugal/AlumniPortugal.github.io/compare/main...your-branch
or paste the contents below manually.
-->

I am adding **my own** profile to `data/alumni/`.

### Entry

```yaml
intra_username: your42login
name: Your Name
github: yourhandle
field: Backend
company: 42Portugal
location: Porto
skills: [Go, K8s]
open_to: [mentoring] # optional; one or more of: mentoring | collaboration | job_opportunities
```

- File path: `data/alumni/<your42login>.yml`

### Checklist

- [ ] The filename matches `intra_username` exactly (for example `pedgonca.yml`).
- [ ] Required fields are present: `intra_username`, `name`, `github`, `field`.
- [ ] `github` is your GitHub handle only, not a full URL.
- [ ] `open_to` uses only `mentoring`, `collaboration`, or `job_opportunities`.
- [ ] The data is accurate, voluntary, and safe to publish — nothing private or inferred.
- [ ] `npm run validate` passes locally.

CI validates the entry and checks your 42 intra username. A community board member
reviews and merges; the site rebuilds on its own after that.

Schema details and the full contribution flow: [README](README.md#join-the-directory).
