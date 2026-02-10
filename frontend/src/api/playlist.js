import { http } from './http.js';

export async function createPlaylist(payload) {
    const res = await http.post('/playlist', payload);
    return res.data;
}

export async function updatePlaylist(playlistId, payload) {
    const res = await http.patch(`/playlist/${playlistId}`, payload);
    return res.data;
}

export async function deletePlaylist(playlistId) {
    const res = await http.delete(`/playlist/${playlistId}`);
    return res.data;
}

export async function addVideoToPlaylist(playlistId, videoId) {
    const res = await http.patch(`/playlist/add/${videoId}/${playlistId}`);
    return res.data;
}

export async function removeVideoFromPlaylist(playlistId, videoId) {
    const res = await http.patch(`/playlist/remove/${videoId}/${playlistId}`);
    return res.data;
}

export async function getUserPlaylists(userId) {
    const res = await http.get(`/playlist/user/${userId}`);
    return res.data;
}

export async function getPlaylistById(playlistId) {
    const res = await http.get(`/playlist/${playlistId}`);
    return res.data;
}
