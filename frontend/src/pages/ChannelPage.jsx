import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { Link } from 'react-router-dom';
import { getChannelProfile } from '../api/users.js';
import { toggleSubscription } from '../api/subscriptions.js';
import { getAllVideos } from '../api/videos.js';
import { extractErrorMessage } from '../api/http.js';
import { formatDate } from '../utils/date.js';

export const ChannelPage = ({ currentUser }) => {
    const { username } = useParams();
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);
    const [error, setError] = useState(null);

    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);

    const loadChannel = async () => {
        if (!username) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getChannelProfile(username);
            setChannel(res.data);

            // Load channel videos
            if (res.data?._id) {
                setVideosLoading(true);
                try {
                    const videoRes = await getAllVideos({ userId: res.data._id });
                    setVideos(videoRes.data ?? []);
                } catch (vErr) {
                    console.error("Failed to load videos", vErr);
                } finally {
                    setVideosLoading(false);
                }
            }
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChannel();
    }, [username]);

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleSubscribe = async () => {
        if (!channel) return;
        setSubLoading(true);
        try {
            await toggleSubscription(channel._id);
            await loadChannel();
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSubLoading(false);
        }
    };

    const isOwnChannel = currentUser?._id === channel?._id || currentUser?.username === username;

    return (
        <div>
            <BackButton />
            <div className="section-header">
                <div>
                    <h2 className="section-title">Channel</h2>

                </div>
            </div>

            {error && <div className="error-text">Error: {error}</div>}
            {loading && <p className="hint">Loading channel…</p>}

            {!loading && !channel && (
                <div className="card">
                    <div className="card-body">
                        <p className="hint">Channel not found.</p>
                    </div>
                </div>
            )}

            {!loading && channel && (
                <>
                    <div className="channel-profile">
                        {/* Cover Image */}
                        <div
                            className="channel-cover"
                            style={{
                                backgroundImage: channel.coverImage
                                    ? `linear-gradient(to bottom, rgba(15,23,42,0.3), rgba(15,23,42,0.95)), url(${channel.coverImage})`
                                    : 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(15,23,42,0.95))',
                            }}
                        />

                        {/* Profile Info */}
                        <div className="channel-info">
                            <div className="channel-avatar-wrapper">
                                {channel.avatar ? (
                                    <img
                                        src={channel.avatar}
                                        alt={channel.fullName}
                                        className="channel-avatar"
                                    />
                                ) : (
                                    <div className="channel-avatar channel-avatar-placeholder">
                                        {channel.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="channel-details">
                                <h2 className="channel-name">{channel.fullName}</h2>
                                <p className="channel-username">@{channel.username}</p>
                                <div className="channel-stats">
                                    <span className="channel-stat">
                                        <strong>{channel.subscribersCount ?? 0}</strong> subscribers
                                    </span>
                                    {isOwnChannel && (
                                        <span className="channel-stat">
                                            <strong>{channel.channelsSubscribedToCount ?? 0}</strong> subscriptions
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="channel-actions">
                                {!isOwnChannel && (
                                    <button
                                        className={`btn ${channel.isSubscribed ? 'btn-secondary' : ''}`}
                                        onClick={handleToggleSubscribe}
                                        disabled={subLoading}
                                    >
                                        {subLoading
                                            ? 'Loading…'
                                            : channel.isSubscribed
                                                ? 'Unsubscribe'
                                                : 'Subscribe'}
                                    </button>
                                )}
                                {isOwnChannel && (
                                    <span className="badge">My channel</span>
                                )}
                            </div>
                        </div>

                    </div>


                    {/* Channel Videos */}
                    <div className="channel-videos-box">
                        <div className="channel-content">
                            <h3 className="section-title">
                                {isOwnChannel ? 'My Videos' : 'Videos'}
                            </h3>

                            {videosLoading && <p className="hint">Loading videos...</p>}

                            {!videosLoading && videos.length === 0 && (
                                <p className="hint">No videos uploaded yet.</p>
                            )}

                            {!videosLoading && videos.length > 0 && (
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
                                                <div className="explore-meta">
                                                    <Link to={`/watch/${video._id}`} className="explore-title">
                                                        {video.title}
                                                    </Link>
                                                    <div className="explore-stats">
                                                        <span className="explore-views">{video.views ?? 0} views</span>
                                                        <span>•</span>
                                                        <span>{formatDate(video.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )
            }
        </div>
    );
};
