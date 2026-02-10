import { http } from './http.js';

export async function registerUser(payload) {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('username', payload.username);
    formData.append('password', payload.password);
    formData.append('avatar', payload.avatar);
    if (payload.coverImage) {
        formData.append('coverImage', payload.coverImage);
    }

    const res = await http.post('/users/register', formData);
    return res.data;
}

export async function loginUser(payload) {
    const res = await http.post('/users/login', payload);
    return res.data;
}

export async function logoutUser() {
    const res = await http.post('/users/logout');
    return res.data;
}

export async function refreshAccessToken(body) {
    const res = await http.post('/users/refresh-token', body ?? {});
    return res.data;
}

export async function changePassword(payload) {
    const res = await http.post('/users/change-password', payload);
    return res.data;
}

export async function getCurrentUser() {
    const res = await http.get('/users/current-user');
    return res.data;
}

export async function updateAccountDetails(payload) {
    const res = await http.patch('/users/update-account', payload);
    return res.data;
}

export async function updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await http.patch('/users/avatar', formData);
    return res.data;
}

export async function updateCoverImage(file) {
    const formData = new FormData();
    formData.append('coverImage', file);
    const res = await http.patch('/users/cover-image', formData);
    return res.data;
}

export async function getChannelProfile(username) {
    const res = await http.get(`/users/c/${encodeURIComponent(username)}`);
    return res.data;
}

export async function getWatchHistory() {
    const res = await http.get('/users/history');
    return res.data;
}
