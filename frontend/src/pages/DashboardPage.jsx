import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChannelStats, getChannelVideos } from '../api/dashboard.js';
import { extractErrorMessage } from '../api/http.js';

export const DashboardPage = ({ currentUser }) => {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, videosRes] = await Promise.all([
                    getChannelStats(),
                    getChannelVideos(),
                ]);
                setStats(statsRes.data ?? null);
                setVideos(videosRes.data ?? []);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentUser) {
        return (
            <div className="dashboard-empty">
                <p className="hint">Please sign in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Hero Cover Image */}
            <div
                className="dashboard-cover"
                style={{
                    backgroundImage: currentUser.coverImage
                        ? `url(${currentUser.coverImage})`
                        : 'linear-gradient(135deg, #6366f1, #a855f7, #8b5cf6)',
                }}
            />

            {/* Profile Section */}
            <div className="dashboard-profile">
                <div className="dashboard-avatar-wrapper">
                    {currentUser.avatar ? (
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.fullName}
                            className="dashboard-avatar"
                        />
                    ) : (
                        <div className="dashboard-avatar dashboard-avatar-placeholder">
                            {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="dashboard-user-info">
                    <h1 className="dashboard-username">{currentUser.fullName}</h1>
                    <p className="dashboard-handle">@{currentUser.username}</p>
                </div>
            </div>

            {error && <div className="error-text" style={{ margin: '1rem 0' }}>Error: {error}</div>}

            {/* Stats Cards */}
            {loading ? (
                <p className="hint" style={{ marginTop: '1rem' }}>Loading your stats...</p>
            ) : stats && (
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalVideos ?? 0}</div>
                        <div className="stat-label">Videos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalViews ?? 0}</div>
                        <div className="stat-label">Views</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalSubscribers ?? 0}</div>
                        <div className="stat-label">Subscribers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalLikes ?? 0}</div>
                        <div className="stat-label">Likes</div>
                    </div>
                </div>
            )}

            {/* Recent Videos */}
            {!loading && videos.length > 0 && (
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">My Videos</h2>
                        <Link to="/upload" className="btn">+ Upload Video</Link>
                    </div>
                    <div className="video-grid">
                        {videos.slice(0, 6).map((video) => (
                            <Link to={`/videos/${video._id}`} key={video._id} className="video-card">
                                <div className="video-thumbnail-wrapper">
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="video-thumbnail"
                                        />
                                    ) : (
                                        <div className="video-thumbnail video-thumbnail-placeholder">
                                            <span>No Thumbnail</span>
                                        </div>
                                    )}
                                    <span className="video-duration">{formatDuration(video.duration)}</span>
                                </div>
                                <div className="video-info">
                                    <div className="video-meta">
                                        <div className="video-title">{video.title}</div>
                                        <div className="video-stats">{video.views ?? 0} views</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {videos.length > 6 && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Link to="/videos" className="btn">View all videos</Link>
                        </div>
                    )}
                </div>
            )}

            {!loading && videos.length === 0 && (
                <div className="dashboard-section">
                    <div className="dashboard-empty-videos">
                        <p>You haven't uploaded any videos yet.</p>
                        <Link to="/upload" className="btn">Upload your first video</Link>
                    </div>
                </div>
            )}
        </div>
    );
};
