import { useEffect, useState } from 'react';
import { spendingService } from '../services/spendingService';
import { formatMoney, formatStatementDate } from '../utils/format';

/** "Tshifhiwa Makherana" → "TM" */
const initialsOf = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function CustomerProfile() {
  const [state, setState] = useState({ status: 'loading' });

  // The profile doesn't depend on the selected period, so it loads once.
  useEffect(() => {
    let cancelled = false;
    spendingService
      .getCustomerProfile()
      .then((profile) => {
        if (!cancelled) setState({ status: 'ready', profile });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="card profile" aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="profile-title">
        Customer profile
      </h2>

      {state.status === 'loading' && <p className="muted">Loading profile…</p>}
      {state.status === 'error' && (
        <p className="status-error" role="alert">
          Your profile could not be loaded.
        </p>
      )}
      {state.status === 'ready' && <ProfileDetails profile={state.profile} />}
    </section>
  );
}

function ProfileDetails({ profile }) {
  return (
    <div className="profile-body">
      <div className="profile-identity">
        <span className="avatar" aria-hidden="true">
          {initialsOf(profile.name)}
        </span>
        <div>
          <p className="profile-name">{profile.name}</p>
          <p className="profile-email">{profile.email}</p>
        </div>
      </div>

      <dl className="profile-details">
        <div>
          <dt>Customer ID</dt>
          <dd>{profile.id}</dd>
        </div>
        <div>
          <dt>Account type</dt>
          <dd>{profile.accountType}</dd>
        </div>
        <div>
          <dt>Join date</dt>
          <dd>{formatStatementDate(profile.joinDate)}</dd>
        </div>
        <div>
          <dt>Total spent</dt>
          <dd>
            <span className="money-out">−{formatMoney(profile.totalSpent)}</span>
            <span className="profile-note">since {formatStatementDate(profile.spentSince)}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}