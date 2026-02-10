import React, { useState, useEffect } from 'react';
import {
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    changePassword,
} from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';
import { BackButton } from '../components/BackButton';

export const SettingsPage = ({ currentUser, onUserUpdated }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Form states
    const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
    const [email, setEmail] = useState(currentUser?.email ?? '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.fullName || '');
            setEmail(currentUser.email || '');
        }
    }, [currentUser]);

    const wrap = async (label, fn) => {
        setLoading(label);
        setError(null);
        setSuccess(null);
        try {
            await fn();
            setSuccess(`${label} updated successfully!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateFullName = async (e) => {
        e.preventDefault();
        const safeFullName = fullName?.trim() || "";

        console.log("Updating Full Name:", safeFullName);

        if (safeFullName === currentUser?.fullName) {
            console.log("No changes to name detected");
            return setSuccess("No changes to name");
        }

        await wrap('Full Name', async () => {
            console.log("Sending fullName update request...");
            const res = await updateAccountDetails({ fullName: safeFullName });
            console.log("FullName Update Response:", res);
            if (res.data) {
                onUserUpdated(res.data);
            }
        });
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        const safeEmail = email?.trim() || "";

        console.log("Updating Email:", safeEmail);

        if (safeEmail === currentUser?.email) {
            console.log("No changes to email detected");
            return setSuccess("No changes to email");
        }

        await wrap('Email', async () => {
            console.log("Sending email update request...");
            const res = await updateAccountDetails({ email: safeEmail });
            console.log("Email Update Response:", res);
            if (res.data) {
                onUserUpdated(res.data);
            }
        });
    };

    const handleUpdateAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) return setError('Please select an avatar file');
        await wrap('Avatar', async () => {
            const res = await updateAvatar(avatarFile);
            if (res.data) {
                onUserUpdated(res.data);
                setAvatarFile(null);
            }
        });
    };

    const handleUpdateCover = async (e) => {
        e.preventDefault();
        if (!coverFile) return setError('Please select a cover image');
        await wrap('Cover image', async () => {
            const res = await updateCoverImage(coverFile);
            if (res.data) {
                onUserUpdated(res.data);
                setCoverFile(null);
            }
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return setError('Please fill in both password fields');
        await wrap('Password', async () => {
            await changePassword({ oldPassword, newPassword });
            setOldPassword('');
            setNewPassword('');
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Public Profile</div>
                                <div className="card-subtitle">How others see you</div>
                            </div>
                        </div>
                        <div className="card-body">
                            {currentUser ? (
                                <div className="profile-preview">
                                    <div
                                        className="profile-cover"
                                        style={{
                                            backgroundImage: currentUser.coverImage
                                                ? `url(${currentUser.coverImage})`
                                                : 'linear-gradient(to bottom, #4f46e5, #0f172a)',
                                            height: '140px',
                                            borderRadius: '0.75rem',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                    />
                                    <div className="profile-info" style={{ marginTop: '-2.5rem', paddingLeft: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                        <img
                                            src={currentUser.avatar || 'https://via.placeholder.com/100'}
                                            alt={currentUser.fullName}
                                            className="profile-avatar"
                                            style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #0f172a', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                        />
                                        <div style={{ paddingBottom: '0.5rem' }}>
                                            <div className="profile-name" style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.2' }}>{currentUser.fullName}</div>
                                            <div className="hint" style={{ fontSize: '0.9rem' }}>@{currentUser.username}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                        <p className="hint">This is how your profile appears to other users.</p>
                                    </div>
                                </div>
                            ) : <p className="hint">Not logged in</p>}
                        </div>
                    </div>
                );
            case 'update-avatar':
                return (
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Update Avatar</div>
                                <div className="card-subtitle">Change your profile picture</div>
                            </div>
                        </div>
                        <form className="card-body" onSubmit={handleUpdateAvatar}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                                <img
                                    src={currentUser?.avatar || 'https://via.placeholder.com/100'}
                                    alt="Current Avatar"
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(129, 140, 248, 0.3)' }}
                                />
                                <div>
                                    <div className="label" style={{ marginBottom: '0.25rem' }}>Current Avatar</div>
                                    <div className="hint">Recommended size: 400x400px</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <label className="label">Select New Image</label>
                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn" type="submit" disabled={loading === 'Avatar' || !avatarFile}>
                                    {loading === 'Avatar' ? 'Uploading...' : 'Update Avatar'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'update-cover':
                return (
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Update Cover Image</div>
                                <div className="card-subtitle">Change your channel banner</div>
                            </div>
                        </div>
                        <form className="card-body" onSubmit={handleUpdateCover}>
                            {currentUser?.coverImage && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div className="label" style={{ marginBottom: '0.5rem' }}>Current Cover</div>
                                    <div style={{
                                        height: '100px',
                                        borderRadius: '0.5rem',
                                        backgroundImage: `url(${currentUser.coverImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: '1px solid rgba(129, 140, 248, 0.2)'
                                    }} />
                                </div>
                            )}
                            <div className="form-row">
                                <label className="label">Select New Cover Image</label>
                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                                />
                                <p className="hint" style={{ marginTop: '0.5rem' }}>Recommended size: 1200x300px</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn" type="submit" disabled={loading === 'Cover image' || !coverFile}>
                                    {loading === 'Cover image' ? 'Uploading...' : 'Update Cover'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'account':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Personal Information</div>
                                    <div className="card-subtitle">Update your full name</div>
                                </div>
                            </div>
                            <form className="card-body" onSubmit={handleUpdateFullName}>
                                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Name</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{currentUser?.fullName}</div>
                                </div>
                                <div className="form-row">
                                    <label className="label">New Full Name</label>
                                    <input
                                        className="input"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your new full name"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button className="btn" type="submit" disabled={loading === 'Full Name'}>
                                        {loading === 'Full Name' ? 'Saving...' : 'Save Name'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Email Address</div>
                                    <div className="card-subtitle">Update your email address</div>
                                </div>
                            </div>
                            <form className="card-body" onSubmit={handleUpdateEmail}>
                                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Email</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{currentUser?.email}</div>
                                </div>
                                <div className="form-row">
                                    <label className="label">New Email Address</label>
                                    <input
                                        className="input"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your new email"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button className="btn" type="submit" disabled={loading === 'Email'}>
                                        {loading === 'Email' ? 'Saving...' : 'Save Email'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Security</div>
                                <div className="card-subtitle">Manage your password</div>
                            </div>
                        </div>
                        <form className="card-body" onSubmit={handleChangePassword}>
                            <div className="form-row">
                                <label className="label">Current Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="form-row">
                                <label className="label">New Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-danger" type="submit" disabled={loading === 'Password'}>
                                    {loading === 'Password' ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-page">
            <BackButton />

            <div className="section-header">
                <div>
                    <h2 className="section-title">Settings</h2>
                    <p className="section-description">Manage your account preferences</p>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)', // --danger-soft
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5', // Lighter red for text on dark bg
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#fca5a5' }}>Error</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
                    </div>
                </div>
            )}
            {success && (
                <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)', // --success-soft
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7', // Lighter green
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{success}</span>
                    </div>
                </div>
            )}

            <div className="settings-layout">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile Preview
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'update-avatar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('update-avatar')}
                    >
                        🖼️ Update Avatar
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'update-cover' ? 'active' : ''}`}
                        onClick={() => setActiveTab('update-cover')}
                    >
                        🌄 Update Cover Image
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        ⚙️ Account Details
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        🔒 Security
                    </button>
                </div>

                {/* Content Area */}
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
