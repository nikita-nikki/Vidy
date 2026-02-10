import { http } from './http.js';

export async function getVideoComments(videoId, params) {
    const res = await http.get(`/comments/${videoId}`, { params });
    return res.data;
}

export async function addComment(videoId, content) {
    const res = await http.post(`/comments/${videoId}`, { content });
    return res.data;
}

export async function updateComment(commentId, content) {
    const res = await http.patch(`/comments/c/${commentId}`, { content });
    return res.data;
}

export async function deleteComment(commentId) {
    const res = await http.delete(`/comments/c/${commentId}`);
    return res.data;
}

// Tweet comments
export async function getTweetComments(tweetId) {
    const res = await http.get(`/comments/t/${tweetId}`);
    return res.data;
}

export async function addTweetComment(tweetId, content) {
    const res = await http.post(`/comments/t/${tweetId}`, { content });
    return res.data;
}
