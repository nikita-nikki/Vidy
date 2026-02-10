import React, { useState } from 'react';
import { uploadVideo } from '../api/videos.js';
import { extractErrorMessage } from '../api/http.js';
import { useNavigate } from 'react-router-dom';

export const VideosPage = () => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [uploadState, setUploadState] = useState({
        title: '',
        description: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile) {
            setError('Video file and thumbnail are required');
            return;
        }
        setUploading(true);
        setError(null);
        setSuccess(null);
        try {
            await uploadVideo({
                title: uploadState.title,
                description: uploadState.description,
                videoFile,
                thumbnail: thumbnailFile,
            });
            setUploadState({ title: '', description: '' });
            setVideoFile(null);
            setThumbnailFile(null);
            setSuccess('Video uploaded successfully! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <button className="btn btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="section-header">
                <div>
                    <h2 className="section-title">Videos</h2>
                    <p className="section-description">
                        Browse and upload videos to your channel.
                    </p>
                </div>
            </div>

            <div className="card-grid" style={{ marginBottom: '1rem' }}>
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Upload video</div>
                            <div className="card-subtitle">Share a new video on your channel</div>
                        </div>
                    </div>
                    <form className="card-body" onSubmit={handleUpload}>
                        <div className="form-row">
                            <label className="label">Title</label>
                            <input
                                className="input"
                                value={uploadState.title}
                                onChange={(e) =>
                                    setUploadState((s) => ({ ...s, title: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Description</label>
                            <textarea
                                className="textarea"
                                value={uploadState.description}
                                onChange={(e) =>
                                    setUploadState((s) => ({ ...s, description: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Video file</label>
                            <input
                                className="input"
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label className="label">Thumbnail image</label>
                            <input
                                className="input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                                required
                            />
                        </div>
                        <button className="btn" type="submit" disabled={uploading}>
                            {uploading ? 'Uploading…' : 'Upload video'}
                        </button>
                    </form>
                </div>
            </div>

            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}
        </div>
    );
};
