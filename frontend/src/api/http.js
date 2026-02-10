import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const http = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export function extractErrorMessage(err) {
    if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 401) return 'Please login to continue';
        if (status === 403) return 'You do not have permission to perform this action';
        if (status === 404) return 'The requested resource was not found';
        if (status === 400) {
            return data?.message ?? data?.error ?? 'Invalid request. Please check your input.';
        }
        if (status === 409) {
            return data?.message ?? data?.error ?? 'This resource already exists or is in use.';
        }
        if (status && status >= 500) return 'Something went wrong. Please try again later.';

        return data?.message ?? data?.error ?? 'Something went wrong. Please try again.';
    }

    if (err instanceof Error) return 'Something went wrong. Please try again.';
    return 'Unexpected error';
}
