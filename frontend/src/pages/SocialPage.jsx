import React, { useEffect, useState } from 'react';
import { createTweet, getAllTweets, getUserTweets, updateTweet, deleteTweet } from '../api/tweets.js';
import { toggleTweetLike, toggleCommentLike } from '../api/likes.js';
import { getTweetComments, addTweetComment, updateComment, deleteComment } from '../api/comments.js';
import { getCurrentUser } from '../api/users.js';
import { extractErrorMessage } from '../api/http.js';
import { formatDate } from '../utils/date.js';

export const SocialPage = () => {
    const [activeTab, setActiveTab] = useState('feed');
    const [feedTweets, setFeedTweets] = useState([]);
    const [myTweets, setMyTweets] = useState([]);
    const [newTweetContent, setNewTweetContent] = useState('');
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [expandedCommentsId, setExpandedCommentsId] = useState(null);
    const [tweetComments, setTweetComments] = useState({});
    const [newCommentContent, setNewCommentContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [commentLikes, setCommentLikes] = useState({});
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [localLikes, setLocalLikes] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await getCurrentUser();
                setUserId(userRes.data._id);
                await loadFeedTweets();
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const handleClick = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [openMenuId]);

    const loadFeedTweets = async () => {
        try {
            const res = await getAllTweets();
            const tweets = res.data ?? [];
            setFeedTweets(tweets);
            const likesState = {};
            tweets.forEach((t) => {
                likesState[t._id] = { count: t.likesCount ?? 0, isLiked: t.isLiked ?? false };
            });
            setLocalLikes(likesState);
        } catch (err) {
            console.error('Failed to load feed:', err);
        }
    };

    const loadMyTweets = async () => {
        if (!userId) return;
        try {
            const res = await getUserTweets(userId);
            const tweets = res.data ?? [];
            setMyTweets(tweets);
            tweets.forEach((t) => {
                setLocalLikes(prev => ({
                    ...prev,
                    [t._id]: { count: t.likesCount ?? 0, isLiked: t.isLiked ?? false }
                }));
            });
        } catch (err) {
            setError(extractErrorMessage(err));
        }
    };

    const loadComments = async (tweetId) => {
        try {
            const res = await getTweetComments(tweetId);
            setTweetComments(prev => ({ ...prev, [tweetId]: res.data ?? [] }));
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        setError(null);
        setSuccess(null);
        setOpenMenuId(null);
        setExpandedCommentsId(null);

        if (tab === 'my-tweets' && userId) {
            await loadMyTweets();
        }
    };

    const handleCreateTweet = async (e) => {
        e.preventDefault();
        if (!newTweetContent.trim() || !userId) return;

        setActionLoading('create');
        setError(null);
        setSuccess(null);
        try {
            await createTweet({ content: newTweetContent.trim() });
            setNewTweetContent('');
            setSuccess('Tweet posted!');
            await loadFeedTweets();
            setTimeout(() => {
                setSuccess(null);
                setActiveTab('feed');
            }, 1500);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateTweet = async (tweetId) => {
        if (!editContent.trim() || !userId) return;

        setActionLoading(`update-${tweetId}`);
        setError(null);
        try {
            await updateTweet(tweetId, { content: editContent.trim() });
            setEditingTweetId(null);
            setEditContent('');
            await loadMyTweets();
            await loadFeedTweets();
            setSuccess('Tweet updated!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteTweet = async (tweetId) => {
        if (!confirm('Delete this tweet?') || !userId) return;

        setActionLoading(`delete-${tweetId}`);
        setOpenMenuId(null);
        setError(null);
        try {
            await deleteTweet(tweetId);
            await loadMyTweets();
            await loadFeedTweets();
            setSuccess('Tweet deleted.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleLikeTweet = async (tweetId) => {
        setActionLoading(`like-${tweetId}`);
        try {
            const res = await toggleTweetLike(tweetId);
            const liked = res.data?.liked;
            setLocalLikes(prev => ({
                ...prev,
                [tweetId]: {
                    count: (prev[tweetId]?.count ?? 0) + (liked ? 1 : -1),
                    isLiked: liked
                }
            }));
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleComments = async (tweetId) => {
        if (expandedCommentsId === tweetId) {
            setExpandedCommentsId(null);
        } else {
            setExpandedCommentsId(tweetId);
            if (!tweetComments[tweetId]) {
                await loadComments(tweetId);
            }
        }
        setNewCommentContent('');
        setEditingCommentId(null);
    };

    const handleAddComment = async (tweetId) => {
        if (!newCommentContent.trim()) return;

        setActionLoading(`comment-${tweetId}`);
        setSuccess(null);
        try {
            const res = await addTweetComment(tweetId, newCommentContent.trim());
            setTweetComments(prev => ({
                ...prev,
                [tweetId]: [res.data, ...(prev[tweetId] ?? [])]
            }));
            setNewCommentContent('');
            setSuccess('Comment posted!');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleLikeComment = async (commentId) => {
        setActionLoading(`like-comment-${commentId}`);
        try {
            const res = await toggleCommentLike(commentId);
            setCommentLikes(prev => ({
                ...prev,
                [commentId]: res.data?.liked ?? !prev[commentId]
            }));
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateComment = async (commentId, tweetId) => {
        if (!editCommentContent.trim()) return;

        setActionLoading(`update-comment-${commentId}`);
        try {
            await updateComment(commentId, editCommentContent.trim());
            setEditingCommentId(null);
            setEditCommentContent('');
            await loadComments(tweetId);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteComment = async (commentId, tweetId) => {
        if (!confirm('Delete this comment?')) return;

        setActionLoading(`delete-comment-${commentId}`);
        setOpenMenuId(null);
        try {
            await deleteComment(commentId);
            setTweetComments(prev => ({
                ...prev,
                [tweetId]: (prev[tweetId] ?? []).filter(c => c._id !== commentId)
            }));
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (tweet) => {
        setEditingTweetId(tweet._id);
        setEditContent(tweet.content);
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingTweetId(null);
        setEditContent('');
    };

    const startEditingComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
        setOpenMenuId(null);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditCommentContent('');
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };



    const renderComment = (comment, tweetId) => {
        const isOwn = comment.owner?._id === userId;
        const isLiked = commentLikes[comment._id] ?? false;
        const isEditing = editingCommentId === comment._id;

        return (
            <div key={comment._id} className="tweet-comment">
                <div className="comment-avatar">
                    {comment.owner?.avatar ? (
                        <img src={comment.owner.avatar} alt="" />
                    ) : (
                        <span>{(comment.owner?.fullName || 'U').charAt(0)}</span>
                    )}
                </div>
                <div className="comment-body">
                    <div className="comment-header">
                        <span className="comment-author">{comment.owner?.fullName || 'User'}</span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>

                        {isOwn && !isEditing && (
                            <div className="comment-menu-wrapper">
                                <button
                                    className="comment-menu-btn"
                                    onClick={(e) => toggleMenu(e, `comment-${comment._id}`)}
                                    aria-label="Comment options"
                                >
                                    ⋮
                                </button>
                                {openMenuId === `comment-${comment._id}` && (
                                    <div className="comment-dropdown">
                                        <button
                                            className="comment-dropdown-item"
                                            onClick={() => startEditingComment(comment)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="comment-dropdown-item comment-dropdown-danger"
                                            onClick={() => handleDeleteComment(comment._id, tweetId)}
                                            disabled={actionLoading === `delete-comment-${comment._id}`}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="comment-edit">
                            <input
                                type="text"
                                className="input"
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                            />
                            <div className="comment-edit-actions">
                                <button
                                    className="btn btn-small"
                                    onClick={() => handleUpdateComment(comment._id, tweetId)}
                                    disabled={actionLoading === `update-comment-${comment._id}`}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn-secondary btn btn-small"
                                    onClick={cancelEditingComment}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="comment-content">{comment.content}</div>
                            <div className="comment-actions">
                                <button
                                    className={`comment-like-btn ${isLiked ? 'liked' : ''}`}
                                    onClick={() => handleLikeComment(comment._id)}
                                    disabled={actionLoading === `like-comment-${comment._id}`}
                                >
                                    {isLiked ? '❤️' : '🤍'} Like
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderTweet = (tweet, isOwn = false) => {
        const likeState = localLikes[tweet._id] ?? { count: tweet.likesCount ?? 0, isLiked: tweet.isLiked ?? false };
        const comments = tweetComments[tweet._id] ?? [];
        const commentsCount = tweet.commentsCount ?? 0;
        const isCommentsExpanded = expandedCommentsId === tweet._id;

        return (
            <div key={tweet._id} className="tweet-item">
                {editingTweetId === tweet._id ? (
                    <div className="tweet-edit">
                        <textarea
                            className="textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={280}
                        />
                        <div className="tweet-edit-actions">
                            <button
                                className="btn"
                                type="button"
                                onClick={() => handleUpdateTweet(tweet._id)}
                                disabled={actionLoading === `update-${tweet._id}`}
                            >
                                {actionLoading === `update-${tweet._id}` ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                className="btn-secondary btn"
                                type="button"
                                onClick={cancelEditing}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="tweet-header">
                            {tweet.owner?.avatar ? (
                                <img
                                    src={tweet.owner.avatar}
                                    alt={tweet.owner.fullName || 'User'}
                                    className="tweet-avatar"
                                />
                            ) : (
                                <div className="tweet-avatar tweet-avatar-placeholder">
                                    {(tweet.owner?.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="tweet-author">
                                <span className="tweet-author-name">
                                    @{tweet.owner?.username || 'user'}
                                </span>
                                <div className="tweet-author-meta">
                                    <span className="tweet-author-handle">
                                        {tweet.owner?.fullName || 'Unknown User'}
                                    </span>
                                    <span className="tweet-time-dot">·</span>
                                    <span className="tweet-time">{formatDate(tweet.createdAt)}</span>
                                </div>
                            </div>

                            {isOwn && (
                                <div className="tweet-menu-wrapper">
                                    <button
                                        className="tweet-menu-btn"
                                        onClick={(e) => toggleMenu(e, tweet._id)}
                                        aria-label="Tweet options"
                                    >
                                        ⋮
                                    </button>
                                    {openMenuId === tweet._id && (
                                        <div className="tweet-dropdown">
                                            <button
                                                className="tweet-dropdown-item"
                                                onClick={() => startEditing(tweet)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="tweet-dropdown-item tweet-dropdown-danger"
                                                onClick={() => handleDeleteTweet(tweet._id)}
                                                disabled={actionLoading === `delete-${tweet._id}`}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="tweet-content">{tweet.content}</div>

                        <div className="tweet-actions-bar">
                            <button
                                className={`tweet-action-btn ${likeState.isLiked ? 'liked' : ''}`}
                                onClick={() => handleLikeTweet(tweet._id)}
                                disabled={actionLoading === `like-${tweet._id}`}
                            >
                                <span className="action-icon">{likeState.isLiked ? '❤️' : '🤍'}</span>
                                <span className="action-label">{likeState.count > 0 ? likeState.count : ''} Like{likeState.count !== 1 ? 's' : ''}</span>
                            </button>
                            <button
                                className={`tweet-action-btn ${isCommentsExpanded ? 'active' : ''}`}
                                onClick={() => handleToggleComments(tweet._id)}
                            >
                                <span className="action-icon">💬</span>
                                <span className="action-label">{commentsCount > 0 ? commentsCount : ''} Comment{commentsCount !== 1 ? 's' : ''}</span>
                            </button>
                        </div>

                        {isCommentsExpanded && (
                            <div className="tweet-comments-section">
                                {comments.length > 0 ? (
                                    <div className="tweet-comments-list">
                                        {comments.map((comment) => renderComment(comment, tweet._id))}
                                    </div>
                                ) : (
                                    <p className="hint" style={{ marginBottom: '0.75rem' }}>No comments yet. Be the first!</p>
                                )}

                                <div className="tweet-comment-input">
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Write a comment..."
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(tweet._id)}
                                    />
                                    <button
                                        className="btn btn-small"
                                        onClick={() => handleAddComment(tweet._id)}
                                        disabled={!newCommentContent.trim() || actionLoading === `comment-${tweet._id}`}
                                    >
                                        {actionLoading === `comment-${tweet._id}` ? '...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="tweets-page">
            <div className="tweets-content">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">
                            {activeTab === 'feed' && 'Tweets'}
                            {activeTab === 'compose' && 'New Tweet'}
                            {activeTab === 'my-tweets' && 'My Tweets'}
                        </h2>
                        <p className="section-description">
                            {activeTab === 'feed' && 'See what\'s happening'}
                            {activeTab === 'compose' && 'Share your thoughts'}
                            {activeTab === 'my-tweets' && 'Manage your posts'}
                        </p>
                    </div>
                </div>

                {error && <div className="error-text" style={{ marginBottom: '1rem' }}>Error: {error}</div>}
                {success && <div className="success-text" style={{ marginBottom: '1rem' }}>{success}</div>}

                {activeTab === 'feed' && (
                    <div className="tweets-feed">
                        {loading ? (
                            <p className="hint">Loading tweets...</p>
                        ) : feedTweets.length === 0 ? (
                            <div className="tweets-empty">
                                <p>No tweets yet. Be the first to share something!</p>
                                <button className="btn" onClick={() => setActiveTab('compose')}>
                                    Post a Tweet
                                </button>
                            </div>
                        ) : (
                            <div className="tweet-list">
                                {feedTweets.map((tweet) => renderTweet(tweet, tweet.owner?._id === userId))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'compose' && (
                    <div className="tweets-compose">
                        <form onSubmit={handleCreateTweet}>
                            <div className="form-row">
                                <textarea
                                    className="textarea compose-textarea"
                                    value={newTweetContent}
                                    onChange={(e) => setNewTweetContent(e.target.value)}
                                    placeholder="What's happening?"
                                    rows={4}
                                    maxLength={280}
                                    autoFocus
                                />
                            </div>
                            <div className="compose-footer">
                                <span className="hint">{newTweetContent.length}/280</span>
                                <button
                                    className="btn"
                                    type="submit"
                                    disabled={actionLoading === 'create' || !newTweetContent.trim()}
                                >
                                    {actionLoading === 'create' ? 'Posting...' : 'Post Tweet'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'my-tweets' && (
                    <div className="tweets-mine">
                        {myTweets.length === 0 ? (
                            <div className="tweets-empty">
                                <p>You haven't posted any tweets yet.</p>
                                <button className="btn" onClick={() => setActiveTab('compose')}>
                                    Post your first Tweet
                                </button>
                            </div>
                        ) : (
                            <div className="tweet-list">
                                {myTweets.map((tweet) => renderTweet(tweet, true))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="tweets-bottom-nav">
                <button
                    className={`tweets-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => handleTabChange('feed')}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Feed</span>
                </button>
                <button
                    className={`tweets-nav-btn ${activeTab === 'compose' ? 'active' : ''}`}
                    onClick={() => handleTabChange('compose')}
                >
                    <span className="nav-icon">✏️</span>
                    <span className="nav-label">Tweet</span>
                </button>
                <button
                    className={`tweets-nav-btn ${activeTab === 'my-tweets' ? 'active' : ''}`}
                    onClick={() => handleTabChange('my-tweets')}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">My Tweets</span>
                </button>
            </div>
        </div>
    );
};
