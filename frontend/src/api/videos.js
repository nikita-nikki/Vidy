import { http } from './http.js';

export async function getAllVideos(params) {
    const res = await http.get('/videos', { params });
    return res.data;
}

export async function getVideoById(videoId) {
    const res = await http.get(`/videos/${videoId}`);
    return res.data;
}

export async function uploadVideo(payload) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('videoFile', payload.videoFile);
    formData.append('thumbnail', payload.thumbnail);

    const res = await http.post('/videos', formData);
    return res.data;
}

export async function updateVideoDetails(videoId, payload) {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail);

    const res = await http.patch(`/videos/${videoId}`, formData);
    return res.data;
}

export async function deleteVideo(videoId) {
    const res = await http.delete(`/videos/${videoId}`);
    return res.data;
}

export async function togglePublish(videoId) {
    const res = await http.patch(`/videos/toggle/publish/${videoId}`);
    return res.data;
}
