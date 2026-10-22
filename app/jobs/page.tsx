import JobsList from './JobsList';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

export const metadata = { title: 'Jobs & Referrals' };

export default function Jobs() {
  return (
    <main>
      <a href="/">← Home</a>
      <h1>Jobs &amp; Referrals</h1>
      <p className="muted">Open roles posted by alumni, with referrals.</p>
      <p className="muted">
        <a href={`${REPO}/issues/new?template=job.yml`}>Post a job or referral</a>.
        <br />
        Listings appear once approved by the community board.
      </p>
      <JobsList />
    </main>
  );
}
