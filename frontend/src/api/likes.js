import { http } from './http.js';

export async function toggleVideoLike(videoId) {
    const res = await http.post(`/likes/toggle/v/${videoId}`);
    return res.data;
}

export async function toggleCommentLike(commentId) {
    const res = await http.post(`/likes/toggle/c/${commentId}`);
    return res.data;
}

export async function toggleTweetLike(tweetId) {
    const res = await http.post(`/likes/toggle/t/${tweetId}`);
    return res.data;
}

export async function getLikedVideos() {
    const res = await http.get('/likes/videos');
    return res.data;
}
