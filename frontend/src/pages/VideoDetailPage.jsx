import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { getVideoById, togglePublish, deleteVideo, updateVideoDetails } from '../api/videos.js';
import { extractErrorMessage } from '../api/http.js';

export const VideoDetailPage = ({ currentUser }) => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [video, setVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({ title: '', description: '' });
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const load = async () => {
        if (!videoId) return;
        setLoading(true);
        setError(null);
        try {
            const vRes = await getVideoById(videoId);
            const v = vRes.data;
            setVideo(v);
            setEditState({ title: v.title, description: v.description });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const hasLoaded = React.useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        load();
    }, [videoId]);

    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleTogglePublish = async () => {
        if (!videoId) return;
        setActionLoading('publish');
        try {
            await togglePublish(videoId);
            await load();
            setSuccess(video?.isPublished ? 'Video unpublished!' : 'Video published!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!videoId) return;
        if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
        setActionLoading('delete');
        try {
            await deleteVideo(videoId);
            navigate('/dashboard');
        } catch (err) {
            setError(extractErrorMessage(err));
            setActionLoading(null);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!videoId) return;
        setActionLoading('update');
        try {
            await updateVideoDetails(videoId, {
                title: editState.title,
                description: editState.description,
                thumbnail: thumbnailFile,
            });
            setThumbnailFile(null);
            setIsEditing(false);
            await load();
            setSuccess('Video updated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        if (video) {
            setEditState({ title: video.title, description: video.description });
        }
        setThumbnailFile(null);
    };

    if (!videoId) {
        return <div className="error-text">No video id in URL.</div>;
    }

    return (
        <div className="video-detail-page">
            <BackButton />

            {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="success-text" style={{ marginBottom: '1rem' }}>{success}</div>}

            {loading && <div className="hint">Loading…</div>}

            {video && (
                <div className="video-detail-container">
                    {/* Video Player with Thumbnail Overlay */}
                    <div className="video-player-wrapper">
                        {/* Thumbnail - visible when not playing */}
                        {video.thumbnail && !isPlaying && (
                            <div className="video-thumbnail-overlay" onClick={handlePlay}>
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="video-player-thumbnail"
                                />
                                <div className="play-button-overlay">
                                    <span className="play-icon">▶</span>
                                </div>
                            </div>
                        )}

                        {/* Video - visible when playing or no thumbnail */}
                        {video.videoFile && (
                            <video
                                ref={videoRef}
                                className="video-player"
                                src={video.videoFile}
                                controls
                                onPlay={() => setIsPlaying(true)}
                                onPause={handlePause}
                                onEnded={handlePause}
                                style={{ display: isPlaying || !video.thumbnail ? 'block' : 'none' }}
                            />
                        )}
                    </div>

                    {/* Video Info Section */}
                    <div className="video-detail-info">
                        {!isEditing ? (
                            <>
                                <h1 className="video-detail-title">{video.title}</h1>
                                <div className="video-detail-meta">
                                    <span className={`video-status-badge ${video.isPublished ? 'published' : 'unpublished'}`}>
                                        {video.isPublished ? '● Published' : '○ Unpublished'}
                                    </span>
                                    <span className="video-views">{video.views ?? 0} views</span>
                                    {video.duration && (
                                        <span className="video-duration-info">
                                            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                                        </span>
                                    )}
                                </div>
                                <p className="video-detail-description">{video.description}</p>

                                {/* Action Buttons - Only for Owner */}
                                {currentUser && video.owner && (currentUser._id === video.owner._id || currentUser._id === video.owner) && (
                                    <div className="video-action-buttons">
                                        <button
                                            className="btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className={`btn ${video.isPublished ? 'btn-secondary' : 'btn-success'}`}
                                            onClick={handleTogglePublish}
                                            disabled={actionLoading === 'publish'}
                                        >
                                            {actionLoading === 'publish'
                                                ? 'Updating...'
                                                : video.isPublished
                                                    ? '📤 Unpublish'
                                                    : '📢 Publish'}
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                            disabled={actionLoading === 'delete'}
                                        >
                                            {actionLoading === 'delete' ? 'Deleting...' : '🗑️ Delete'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Edit Form */
                            <form className="video-edit-form" onSubmit={handleUpdate}>
                                <h2 className="edit-form-title">Edit Video</h2>
                                <div className="form-row">
                                    <label className="label">Title</label>
                                    <input
                                        className="input"
                                        value={editState.title}
                                        onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="label">Description</label>
                                    <textarea
                                        className="textarea"
                                        value={editState.description}
                                        onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="label">New Thumbnail (optional)</label>
                                    <input
                                        className="input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                                    />
                                </div>
                                <div className="video-edit-actions">
                                    <button
                                        className="btn"
                                        type="submit"
                                        disabled={actionLoading === 'update'}
                                    >
                                        {actionLoading === 'update' ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        type="button"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
