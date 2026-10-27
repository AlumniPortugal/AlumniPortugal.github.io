import JobsList from './JobsList';
import CtaBand from '../CtaBand';

const REPO = 'https://github.com/AlumniPortugal/AlumniPortugal.github.io';

export const metadata = { title: 'Jobs & Referrals' };

export default function Jobs() {
  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Jobs &amp; Referrals</h1>
          <p className="muted">
            Open roles posted by alumni, with referrals. Listings appear once approved by the
            community board.
          </p>
        </div>
        <a className="button" href={`${REPO}/issues/new?template=job.yml`}>
          Post a role or referral
        </a>
      </div>
      <JobsList />
      <CtaBand
        title="Are you an alumnus hiring or want to refer fellow peers?"
        text="Post an open role in your company or recommend a peer. Listings are reviewed before they appear."
        href={`${REPO}/issues/new?template=job.yml`}
        cta="Submit a role or referral"
      />
    </main>
  );
}
