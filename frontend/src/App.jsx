import React, { useEffect, useState } from 'react';
import {
    BrowserRouter,
    Route,
    Routes,
    NavLink,
    Navigate,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { VideosPage } from './pages/VideosPage.jsx';
import { ExplorePage } from './pages/ExplorePage.jsx';
import { PublicVideoPage } from './pages/PublicVideoPage.jsx';
import { VideoDetailPage } from './pages/VideoDetailPage.jsx';
import { SocialPage } from './pages/SocialPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { HealthPage } from './pages/HealthPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { WatchHistoryPage } from './pages/WatchHistoryPage.jsx';
import { ChannelPage } from './pages/ChannelPage.jsx';
import { getCurrentUser, logoutUser } from './api/users.js';

const RoutedApp = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            try {
                const res = await getCurrentUser();
                setCurrentUser(res.data);
            } catch {
                setCurrentUser(null);
            } finally {
                setAuthChecked(true);
            }
        };
        check();
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logoutUser();
            setCurrentUser(null);
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            setLoggingOut(false);
        }
    };

    if (!authChecked) {
        return (
            <div className="app-shell">
                <main className="main-layout">
                    <section className="content">
                        <p className="hint">Checking your session…</p>
                    </section>
                </main>
            </div>
        );
    }

    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

    const homeElement = currentUser ? (
        <Navigate to="/dashboard" replace />
    ) : (
        <Navigate to="/login" replace />
    );

    const requireAuth = (element) =>
        currentUser ? element : <Navigate to="/login" replace />;

    if (isAuthRoute) {
        return (
            <div className="auth-shell">
                <header className="auth-header">
                    <div className="auth-header-title">VIDY</div>
                </header>
                <main className="auth-main">
                    <div className="auth-card-wrapper">
                        <Routes>
                            <Route path="/" element={homeElement} />
                            <Route
                                path="/login"
                                element={
                                    currentUser ? (
                                        <Navigate to="/dashboard" replace />
                                    ) : (
                                        <LoginPage onLoggedIn={setCurrentUser} />
                                    )
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    currentUser ? (
                                        <Navigate to="/dashboard" replace />
                                    ) : (
                                        <RegisterPage />
                                    )
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">Vy</div>
                    <div className="sidebar-title">
                        <span className="sidebar-title-main">Vidy Studio</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <div className="sidebar-section-label">Home</div>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `nav-link ${isActive || location.pathname.startsWith('/videos/') ? 'active' : ''}`
                            }
                        >
                            <span>Dashboard</span>
                        </NavLink>
                    </div>

                    <div className="nav-group">
                        <div className="sidebar-section-label">Social</div>
                        <NavLink to="/social" className="nav-link">
                            <span>Tweets</span>
                        </NavLink>
                    </div>

                    <div className="nav-group">
                        <div className="sidebar-section-label">Library</div>
                        <NavLink to="/history" className="nav-link">
                            <span>Watch History</span>
                        </NavLink>
                        <NavLink
                            to="/videos"
                            className={({ isActive }) =>
                                `nav-link ${isActive && location.pathname === '/videos' ? 'active' : ''}`
                            }
                        >
                            <span>Videos</span>
                        </NavLink>
                    </div>

                    <div className="nav-group">
                        <div className="sidebar-section-label">Account</div>
                        <NavLink to="/settings" className="nav-link">
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div style={{ fontWeight: '600', opacity: 0.8 }}>Vidy</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>© 2026</div>
                </div>
            </aside>

            <main className="main-layout">
                <header className="topbar">
                    <div className="topbar-title">
                        {location.pathname === '/social' && 'Vidy Social'}
                        {location.pathname === '/dashboard' && 'Vidy Creator Dashboard'}
                        {location.pathname === '/videos' && 'Explore Videos'}
                        {location.pathname.startsWith('/videos/') && 'Video Details'}
                        {location.pathname.startsWith('/watch/') && 'Watch Video'}
                        {location.pathname === '/upload' && 'Upload Video'}
                        {location.pathname === '/settings' && 'Settings'}
                        {location.pathname === '/history' && 'Watch History'}
                        {location.pathname.startsWith('/channel/') && 'Channel'}
                    </div>
                    <div className="topbar-meta">
                        <span className="status-dot" data-status="up" />
                        {currentUser ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <NavLink
                                    to={`/channel/${currentUser.username}`}
                                    className="nav-link"
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '2rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.username}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '1px solid rgba(139, 92, 246, 0.5)'
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingRight: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: '1' }}>{currentUser.fullName}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1', marginTop: '2px' }}>@{currentUser.username}</span>
                                    </div>
                                </NavLink>
                                <button
                                    className="btn-secondary btn btn-logout"
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                    {loggingOut ? '...' : 'Logout'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </header>
                <section className="content">
                    <Routes>
                        <Route path="/" element={homeElement} />
                        <Route
                            path="/login"
                            element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
                        />
                        <Route
                            path="/register"
                            element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
                        />
                        <Route path="/videos" element={requireAuth(<ExplorePage />)} />
                        <Route path="/watch/:videoId" element={requireAuth(<PublicVideoPage />)} />
                        <Route path="/upload" element={requireAuth(<VideosPage />)} />
                        <Route path="/videos/:videoId" element={requireAuth(<VideoDetailPage currentUser={currentUser} />)} />
                        <Route path="/social" element={requireAuth(<SocialPage />)} />
                        <Route
                            path="/settings"
                            element={requireAuth(<SettingsPage currentUser={currentUser} onUserUpdated={setCurrentUser} />)}
                        />
                        <Route
                            path="/history"
                            element={requireAuth(<WatchHistoryPage />)}
                        />
                        <Route
                            path="/channel/:username"
                            element={requireAuth(<ChannelPage currentUser={currentUser} />)}
                        />
                        <Route
                            path="/dashboard"
                            element={requireAuth(<DashboardPage currentUser={currentUser} />)}
                        />
                        <Route path="/health" element={<HealthPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </section>
            </main>
        </div>
    );
};

export const App = () => {
    return (
        <BrowserRouter>
            <RoutedApp />
        </BrowserRouter>
    );
};

export default App;
