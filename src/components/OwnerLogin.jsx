import { useId, useState } from 'react';

/* Owner sign-in. Anyone can see this form, but only the owner account in Supabase will get through. */
const OwnerLogin = ({ onSignIn, onDone }) => {
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await onSignIn(String(form.get('email')).trim(), String(form.get('password')));
      onDone();
    } catch (failure) {
      setBusy(false);
      // Supabase answers 400 for a wrong email/password; anything else means we could not reach it
      setError(
        failure?.status === 400
          ? 'Those details did not work. Check the email and password and try again.'
          : 'Could not reach the server. Check your connection and try again.',
      );
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label" htmlFor={`${uid}-email`}>
          Email
        </label>
        <input id={`${uid}-email`} className="field-input" type="email" name="email" autoComplete="username" required />
      </div>

      <div className="field">
        <label className="field-label" htmlFor={`${uid}-password`}>
          Password
        </label>
        <input
          id={`${uid}-password`}
          className="field-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};

export default OwnerLogin;
