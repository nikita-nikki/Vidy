import { http } from './http.js';

export async function createTweet(payload) {
    const res = await http.post('/tweets', payload);
    return res.data;
}

export async function getAllTweets() {
    const res = await http.get('/tweets/feed');
    return res.data;
}

export async function getUserTweets(userId) {
    const res = await http.get(`/tweets/user/${userId}`);
    return res.data;
}

export async function updateTweet(tweetId, payload) {
    const res = await http.patch(`/tweets/${tweetId}`, payload);
    return res.data;
}

export async function deleteTweet(tweetId) {
    const res = await http.delete(`/tweets/${tweetId}`);
    return res.data;
}
