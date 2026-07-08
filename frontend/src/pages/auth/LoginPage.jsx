import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isManager, bootstrapping } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bootstrapping && isAuthenticated) {
      navigate(isManager ? '/manager' : '/member', { replace: true });
    }
  }, [bootstrapping, isAuthenticated, isManager, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await login(form);
      navigate(response.user.role === 'Manager' ? '/manager' : '/member', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card panel">
        <p className="eyebrow">Weekly report system</p>
        <h1>Login</h1>
        <p className="auth-copy">Use your account to access your report workspace or manager dashboard.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </label>

          {error ? <p className="error-banner">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          No account yet? <Link to="/register">Register here</Link>
        </p>
      </section>
    </div>
  );
}