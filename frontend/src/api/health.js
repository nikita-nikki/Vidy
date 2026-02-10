import { http } from './http.js';

export async function getHealth() {
    const res = await http.get('/healthcheck');
    return res.data;
}
