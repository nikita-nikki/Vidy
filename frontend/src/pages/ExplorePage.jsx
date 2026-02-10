import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from '../api/videos.js';
import { extractErrorMessage } from '../api/http.js';

export const ExplorePage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const res = await getAllVideos();
                setVideos(res.data ?? []);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        loadVideos();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="explore-page">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Explore Videos</h2>
                    <p className="section-description">
                        Discover videos from creators around the world
                    </p>
                </div>
            </div>

            {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

            {loading && <p className="hint">Loading videos...</p>}

            {!loading && videos.length === 0 && (
                <div className="explore-empty">
                    <p className="hint">No videos available yet. Be the first to upload!</p>
                    <Link to="/dashboard" className="btn">Go to Dashboard</Link>
                </div>
            )}

            {!loading && videos.length > 0 && (
                <div className="explore-grid">
                    {videos.map((video) => (
                        <div key={video._id} className="explore-card">
                            <Link
                                to={`/watch/${video._id}`}
                                className="explore-thumbnail-wrapper"
                            >
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="explore-thumbnail"
                                    />
                                ) : (
                                    <div className="explore-thumbnail explore-thumbnail-placeholder">
                                        <span>No Thumbnail</span>
                                    </div>
                                )}
                                <span className="explore-duration">{formatDuration(video.duration)}</span>
                                <div className="explore-play-overlay">
                                    <span className="explore-play-icon">▶</span>
                                </div>
                            </Link>
                            <div className="explore-info">
                                {video.owner?.avatar && (
                                    <Link to={`/channel/${video.owner.username}`}>
                                        <img
                                            src={video.owner.avatar}
                                            alt={video.owner.username}
                                            className="explore-owner-avatar"
                                        />
                                    </Link>
                                )}
                                <div className="explore-meta">
                                    <Link to={`/watch/${video._id}`} className="explore-title">
                                        {video.title}
                                    </Link>
                                    <div className="explore-stats">
                                        {video.owner && (
                                            <Link
                                                to={`/channel/${video.owner.username}`}
                                                className="explore-owner"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                @{video.owner.username}
                                            </Link>
                                        )}
                                        <span className="explore-views">{video.views ?? 0} views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
