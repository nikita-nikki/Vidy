import { http } from './http.js';

export async function toggleSubscription(channelId) {
    const res = await http.post(`/subscriptions/c/${channelId}`);
    return res.data;
}

export async function getChannelSubscribers(channelId) {
    const res = await http.get(`/subscriptions/c/${channelId}`);
    return res.data;
}

export async function getSubscribedChannels(subscriberId) {
    const res = await http.get(`/subscriptions/u/${subscriberId}`);
    return res.data;
}
