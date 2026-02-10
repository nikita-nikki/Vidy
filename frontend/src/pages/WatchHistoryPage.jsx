import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWatchHistory } from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';

export const WatchHistoryPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getWatchHistory();
                setVideos(res.data ?? []);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Watch History</h2>
                    <p className="section-description">
                        Videos you've watched recently on Vidy.
                    </p>
                </div>
            </div>

            {error && <div className="error-text">Error: {error}</div>}
            {loading && <p className="hint">Loading your watch history…</p>}

            {!loading && videos.length === 0 && (
                <div className="card">
                    <div className="card-body">
                        <p className="hint">
                            You haven't watched any videos yet. Go to{' '}
                            <Link to="/videos">Videos</Link> to start watching!
                        </p>
                    </div>
                </div>
            )}

            {!loading && videos.length > 0 && (
                <div className="video-grid">
                    {videos.map((video) => (
                        <Link to={`/watch/${video._id}`} key={video._id} className="video-card">
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
                                {video.owner?.avatar && (
                                    <img
                                        src={video.owner.avatar}
                                        alt={video.owner.fullName}
                                        className="video-owner-avatar"
                                    />
                                )}
                                <div className="video-meta">
                                    <div className="video-title">{video.title}</div>
                                    {video.owner && (
                                        <div className="video-owner-name">{video.owner.fullName}</div>
                                    )}
                                    <div className="video-stats">
                                        {video.views ?? 0} views
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
