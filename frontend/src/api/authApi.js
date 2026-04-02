const BASE_URL = 'http://localhost:3000/api/auth';

const authApi = {
    register: async (email, password) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });


        if (!response.ok) {
            return {error: (await response.json()).message};
        }
        return await response.json();
    },

    login: async (email, password) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            return {error: (await response.json()).message};
        }
        return await response.json();
    },

    logout: async () => {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
        return response.data;
    },
    
    refreshToken: async () => {
        const response = await fetch(`${BASE_URL}/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        return response.data;
    },
}

export default authApi;