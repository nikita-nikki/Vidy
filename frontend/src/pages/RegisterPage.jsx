import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';

export const RegisterPage = () => {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            setError('Avatar file is required');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await registerUser({
                ...form,
                avatar: avatarFile,
                coverImage: coverFile,
            });
            navigate('/login', { replace: true });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Create your Vidy account</div>
                        <div className="card-subtitle">
                            Register as a creator to start uploading videos.
                        </div>
                    </div>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label className="label">Username</label>
                        <input
                            className="input"
                            value={form.username}
                            onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Full name</label>
                        <input
                            className="input"
                            value={form.fullName}
                            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Email</label>
                        <input
                            className="input"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Avatar (required)</label>
                        <input
                            className="input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Cover image (optional)</label>
                        <input
                            className="input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                        />
                    </div>
                    {error && <div className="error-text">Error: {error}</div>}
                    {success && <div className="chip">{success}</div>}
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                    <p className="hint">
                        Already have an account?{' '}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
