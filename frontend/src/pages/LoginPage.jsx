import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';

export const LoginPage = ({ onLoggedIn }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const id = identifier.trim();
            const body = id.includes('@')
                ? { email: id, password }
                : { username: id, password };
            const res = await loginUser(body);
            const user = res.data.user;
            onLoggedIn(user);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card">
                <div className="card-header card-header-center">
                    <div className="login-hero">
                        <div className="login-logo">Vy</div>
                        <div className="login-title">Welcome back to Vidy</div>
                        <div className="login-subtitle">
                            Sign in to access your creator dashboard.
                        </div>
                    </div>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label className="label">Email or username</label>
                        <input
                            className="input"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    {error && <div className="error-text">Error: {error}</div>}
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                    <p className="hint">
                        New here?{' '}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
