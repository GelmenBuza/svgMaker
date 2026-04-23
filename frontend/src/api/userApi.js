const BASE_URL = 'http://localhost:3000/api/user';

const userApi = {

    // Пользователь
    changeUsername: async (username) => {
        const response = await fetch(`${BASE_URL}/user/change-username`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    changeEmail: async (email) => {
        const response = await fetch(`${BASE_URL}/user/change-email`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    changePassword: async (currentPassword, newPassword) => {
        const response = await fetch(`${BASE_URL}/user/change-password`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    deleteAccount: async () => {
        const response = await fetch(`${BASE_URL}/user/delete-account`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            return { error: (await response.json()).error };
        }
        return await response.json();
    },


    // Проекты пользователя
    getUserProjects: async () => {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    getProjectSnapshot: async (projectId, version) => {
        const response = await fetch(`${BASE_URL}/projects/snapshot/${projectId}/${version}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    createProject: async (name) => {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    renameProject: async (projectId, name) => {
        const response = await fetch(`${BASE_URL}/projects/rename`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: projectId, name: name }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    updateProject: async (projectId, name, snapshot) => {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: projectId, name: name, snapshot: snapshot }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    deleteProject: async (projectId) => {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: projectId }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    }
}

export default userApi;