import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { getVideoById } from '../api/videos.js';
import { toggleVideoLike, toggleCommentLike } from '../api/likes.js';
import { getVideoComments, addComment } from '../api/comments.js';
import { extractErrorMessage } from '../api/http.js';
import { formatDate } from '../utils/date.js';

export const PublicVideoPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [video, setVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Like state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);

    // Comment likes state - tracks likes for each comment
    const [commentLikes, setCommentLikes] = useState({});
    const [commentLikeLoading, setCommentLikeLoading] = useState(null);

    useEffect(() => {
        const loadVideo = async () => {
            if (!videoId) return;
            try {
                const res = await getVideoById(videoId);
                const v = res.data;
                setVideo(v);
                setIsLiked(v.isLiked ?? false);
                setLikesCount(v.likesCount ?? 0);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        loadVideo();
    }, [videoId]);

    useEffect(() => {
        const loadComments = async () => {
            if (!videoId) return;
            setCommentsLoading(true);
            try {
                const res = await getVideoComments(videoId);
                setComments(res.data ?? []);
            } catch (err) {
                console.error('Failed to load comments:', err);
            } finally {
                setCommentsLoading(false);
            }
        };
        loadComments();
    }, [videoId]);

    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleToggleLike = async () => {
        if (!videoId || likeLoading) return;
        setLikeLoading(true);
        try {
            await toggleVideoLike(videoId);
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        } catch (err) {
            console.error('Failed to toggle like:', err);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!videoId || !newComment.trim() || addingComment) return;
        setAddingComment(true);
        try {
            await addComment(videoId, newComment.trim());
            setNewComment('');
            // Reload comments
            const res = await getVideoComments(videoId);
            setComments(res.data ?? []);
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setAddingComment(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (commentLikeLoading === commentId) return;
        setCommentLikeLoading(commentId);
        try {
            const res = await toggleCommentLike(commentId);
            const liked = res.data?.liked;
            setCommentLikes(prev => ({
                ...prev,
                [commentId]: {
                    isLiked: liked,
                    count: (prev[commentId]?.count ?? 0) + (liked ? 1 : -1)
                }
            }));
        } catch (err) {
            console.error('Failed to like comment:', err);
        } finally {
            setCommentLikeLoading(null);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoId) {
        return <div className="error-text">No video ID provided.</div>;
    }

    return (
        <div className="public-video-page">
            <BackButton />

            {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}
            {loading && <p className="hint">Loading video...</p>}

            {video && (
                <div className="public-video-container">
                    {/* Video Player */}
                    <div className="public-video-player-wrapper">
                        {video.thumbnail && !isPlaying && (
                            <div className="public-video-thumbnail-overlay" onClick={handlePlay}>
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="public-video-thumbnail"
                                />
                                <div className="public-video-play-overlay">
                                    <span className="public-video-play-icon">▶</span>
                                </div>
                            </div>
                        )}

                        {video.videoFile && (
                            <video
                                ref={videoRef}
                                className="public-video-player"
                                src={video.videoFile}
                                controls
                                onPlay={() => setIsPlaying(true)}
                                onPause={handlePause}
                                onEnded={handlePause}
                                style={{ display: isPlaying || !video.thumbnail ? 'block' : 'none' }}
                            />
                        )}
                    </div>

                    {/* Video Info */}
                    <div className="public-video-info">
                        <h1 className="public-video-title">{video.title}</h1>

                        <div className="public-video-meta">
                            <span className="public-video-views">{video.views ?? 0} views</span>
                            {video.duration && (
                                <span className="public-video-duration">{formatDuration(video.duration)}</span>
                            )}
                        </div>

                        {/* Like Button */}
                        <div className="public-video-actions">
                            <button
                                className={`btn public-video-like-btn ${isLiked ? 'liked' : ''}`}
                                onClick={handleToggleLike}
                                disabled={likeLoading}
                            >
                                {isLiked ? '❤️' : '🤍'} {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                            </button>
                        </div>

                        <p className="public-video-description">{video.description}</p>

                        {/* Owner Info */}
                        {video.owner && (
                            <Link to={`/channel/${video.owner.username}`} className="public-video-owner">
                                {video.owner.avatar && (
                                    <img
                                        src={video.owner.avatar}
                                        alt={video.owner.username}
                                        className="public-video-owner-avatar"
                                    />
                                )}
                                <div className="public-video-owner-info">
                                    <span className="public-video-owner-name">{video.owner.fullName}</span>
                                    <span className="public-video-owner-handle">@{video.owner.username}</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="public-video-comments">
                        <h3 className="public-video-comments-title">
                            Comments ({comments.length})
                        </h3>

                        {/* Add Comment Form */}
                        <form className="public-video-comment-form" onSubmit={handleAddComment}>
                            <textarea
                                className="textarea"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                            />
                            <button
                                className="btn"
                                type="submit"
                                disabled={addingComment || !newComment.trim()}
                            >
                                {addingComment ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>

                        {/* Comments List */}
                        {commentsLoading && <p className="hint">Loading comments...</p>}

                        {!commentsLoading && comments.length === 0 && (
                            <p className="hint">No comments yet. Be the first to comment!</p>
                        )}

                        {!commentsLoading && comments.length > 0 && (
                            <div className="public-video-comments-list">
                                {comments.map((comment) => {
                                    const likeState = commentLikes[comment._id] ?? { isLiked: comment.isLiked ?? false, count: comment.likesCount ?? 0 };
                                    return (
                                        <div key={comment._id} className="public-video-comment">
                                            <div className="public-video-comment-header">
                                                {comment.owner?.avatar && (
                                                    <img
                                                        src={comment.owner.avatar}
                                                        alt={comment.owner.username}
                                                        className="public-video-comment-avatar"
                                                    />
                                                )}
                                                <div className="public-video-comment-meta">
                                                    <span className="public-video-comment-author">
                                                        {comment.owner?.fullName ?? 'Unknown'}
                                                    </span>
                                                    <span className="public-video-comment-handle">
                                                        @{comment.owner?.username ?? 'unknown'}
                                                    </span>
                                                </div>
                                                <span className="public-video-comment-time">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="public-video-comment-content">{comment.content}</p>
                                            <div className="public-video-comment-actions">
                                                <button
                                                    className={`comment-like-btn ${likeState.isLiked ? 'liked' : ''}`}
                                                    onClick={() => handleCommentLike(comment._id)}
                                                    disabled={commentLikeLoading === comment._id}
                                                >
                                                    {likeState.isLiked ? '❤️' : '🤍'} {likeState.count > 0 ? likeState.count : ''} Like{likeState.count !== 1 ? 's' : ''}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
