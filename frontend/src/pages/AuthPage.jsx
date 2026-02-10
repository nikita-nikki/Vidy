import React, { useState } from 'react';
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getWatchHistory,
    updateAccountDetails,
    changePassword,
    updateAvatar,
    updateCoverImage,
} from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';

export const AuthPage = () => {
    const [registerState, setRegisterState] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const [loginState, setLoginState] = useState({
        identifier: '',
        password: '',
    });

    const [accountState, setAccountState] = useState({
        fullName: '',
        email: '',
    });

    const [passwordState, setPasswordState] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const [currentUser, setCurrentUser] = useState(null);
    const [watchHistory, setWatchHistory] = useState([]);

    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const [lastResponse, setLastResponse] = useState(null);

    const wrap = async (label, fn) => {
        setLoading(label);
        setError(null);
        try {
            const result = await fn();
            setLastResponse(result);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            setError('Avatar file is required');
            return;
        }
        await wrap('register', async () => {
            const res = await registerUser({
                ...registerState,
                avatar: avatarFile,
                coverImage: coverFile,
            });
            return res;
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        await wrap('login', async () => {
            const identifier = loginState.identifier.trim();
            const body =
                identifier.includes('@')
                    ? { email: identifier, password: loginState.password }
                    : { username: identifier, password: loginState.password };
            const res = await loginUser(body);
            const user = res.data.user;
            setCurrentUser(user);
            setAccountState({ fullName: user.fullName, email: user.email });
            return res;
        });
    };

    const handleLogout = async () => {
        await wrap('logout', async () => {
            const res = await logoutUser();
            setCurrentUser(null);
            setWatchHistory([]);
            return res;
        });
    };

    const handleFetchMe = async () => {
        await wrap('me', async () => {
            const res = await getCurrentUser();
            setCurrentUser(res.data);
            setAccountState({ fullName: res.data.fullName, email: res.data.email });
            return res;
        });
    };

    const handleWatchHistory = async () => {
        await wrap('history', async () => {
            const res = await getWatchHistory();
            const data = res.data ?? [];
            setWatchHistory(Array.isArray(data) ? data : []);
            return res;
        });
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        await wrap('update-account', async () => {
            const res = await updateAccountDetails(accountState);
            return res;
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        await wrap('change-password', async () => {
            const res = await changePassword(passwordState);
            return res;
        });
    };

    const handleAvatarUpdate = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            setError('Select an avatar file first');
            return;
        }
        await wrap('avatar', async () => {
            const res = await updateAvatar(avatarFile);
            return res;
        });
    };

    const handleCoverUpdate = async (e) => {
        e.preventDefault();
        if (!coverFile) {
            setError('Select a cover image file first');
            return;
        }
        await wrap('cover', async () => {
            const res = await updateCoverImage(coverFile);
            return res;
        });
    };

    return (
        <div>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Authentication & Profile</h2>
                    <p className="section-description">
                        Register, log in, manage account details, and see watch history. This page wires all
                        `/users` endpoints.
                    </p>
                </div>
                <div className="stack-horizontal">
                    {currentUser && (
                        <span className="chip">
                            Signed in as <strong>{currentUser.username}</strong>
                        </span>
                    )}
                </div>
            </div>

            <div className="card-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Register</div>
                            <div className="card-subtitle">`POST /api/v1/users/register`</div>
                        </div>
                    </div>
                    <form className="card-body" onSubmit={handleRegister}>
                        <div className="form-row">
                            <label className="label">Full name</label>
                            <input
                                className="input"
                                value={registerState.fullName}
                                onChange={(e) =>
                                    setRegisterState((s) => ({ ...s, fullName: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={registerState.email}
                                onChange={(e) => setRegisterState((s) => ({ ...s, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Username</label>
                            <input
                                className="input"
                                value={registerState.username}
                                onChange={(e) =>
                                    setRegisterState((s) => ({ ...s, username: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Password</label>
                            <input
                                className="input"
                                type="password"
                                value={registerState.password}
                                onChange={(e) =>
                                    setRegisterState((s) => ({ ...s, password: e.target.value }))
                                }
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
                        <button className="btn" type="submit" disabled={loading === 'register'}>
                            {loading === 'register' ? 'Registering…' : 'Register'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Login / Logout</div>
                            <div className="card-subtitle">
                                `POST /users/login`, `POST /users/logout`, `GET /users/current-user`
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleLogin}>
                            <div className="form-row">
                                <label className="label">Email or username</label>
                                <input
                                    className="input"
                                    value={loginState.identifier}
                                    onChange={(e) =>
                                        setLoginState((s) => ({ ...s, identifier: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label className="label">Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={loginState.password}
                                    onChange={(e) =>
                                        setLoginState((s) => ({ ...s, password: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="stack-horizontal">
                                <button className="btn" type="submit" disabled={loading === 'login'}>
                                    {loading === 'login' ? 'Logging in…' : 'Login'}
                                </button>
                                <button
                                    className="btn-secondary btn"
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loading === 'logout'}
                                >
                                    Logout
                                </button>
                                <button
                                    className="btn-secondary btn"
                                    type="button"
                                    onClick={handleFetchMe}
                                    disabled={loading === 'me'}
                                >
                                    Refresh current user
                                </button>
                            </div>
                        </form>
                        <button
                            className="btn-secondary btn"
                            type="button"
                            onClick={handleWatchHistory}
                            disabled={loading === 'history'}
                        >
                            Load watch history
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Account & Password</div>
                            <div className="card-subtitle">
                                `PATCH /users/update-account`, `POST /users/change-password`
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleUpdateAccount}>
                            <div className="form-row">
                                <label className="label">Full name</label>
                                <input
                                    className="input"
                                    value={accountState.fullName}
                                    onChange={(e) =>
                                        setAccountState((s) => ({ ...s, fullName: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label className="label">Email</label>
                                <input
                                    className="input"
                                    type="email"
                                    value={accountState.email}
                                    onChange={(e) =>
                                        setAccountState((s) => ({ ...s, email: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <button className="btn" type="submit" disabled={loading === 'update-account'}>
                                Save account
                            </button>
                        </form>

                        <form onSubmit={handleChangePassword}>
                            <div className="form-row">
                                <label className="label">Old password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={passwordState.oldPassword}
                                    onChange={(e) =>
                                        setPasswordState((s) => ({ ...s, oldPassword: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label className="label">New password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={passwordState.newPassword}
                                    onChange={(e) =>
                                        setPasswordState((s) => ({ ...s, newPassword: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <button className="btn-secondary btn" type="submit" disabled={loading === 'change-password'}>
                                Change password
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Avatar & Cover</div>
                            <div className="card-subtitle">
                                `PATCH /users/avatar`, `PATCH /users/cover-image`, `GET /users/history`
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAvatarUpdate}>
                            <div className="form-row">
                                <label className="label">Avatar</label>
                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <button className="btn" type="submit" disabled={loading === 'avatar'}>
                                Update avatar
                            </button>
                        </form>

                        <form onSubmit={handleCoverUpdate}>
                            <div className="form-row">
                                <label className="label">Cover image</label>
                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <button className="btn-secondary btn" type="submit" disabled={loading === 'cover'}>
                                Update cover
                            </button>
                        </form>

                        <div className="form-row">
                            <span className="label">Watch history (last fetch)</span>
                            <div className="json-viewer">
                                <pre>{JSON.stringify(watchHistory, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="error-text">Error: {error}</div>}
            {lastResponse && (
                <div style={{ marginTop: '1rem' }}>
                    <div className="label">Last API response</div>
                    <div className="json-viewer">
                        <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};
