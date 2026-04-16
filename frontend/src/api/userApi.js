const BASE_URL = 'http://localhost:3000/api/user';

const userApi = {
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
            body: JSON.stringify({ id: projectId }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
}

export default userApi;