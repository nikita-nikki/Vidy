import { http } from './http.js';

export async function getChannelStats() {
    const res = await http.get('/dashboard/stats');
    return res.data;
}

export async function getChannelVideos() {
    const res = await http.get('/dashboard/videos');
    return res.data;
}
