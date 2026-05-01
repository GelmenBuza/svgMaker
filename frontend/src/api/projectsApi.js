const BASE_URL = 'http://localhost:3000/api/projects';

const projectsApi = {
    // Проекты пользователя
    getUserProjects: async () => {
        const response = await fetch(`${BASE_URL}/getProjects`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    getProjectSnapshot: async (projectId, version) => {
        const response = await fetch(`${BASE_URL}/snapshot/${projectId}/${version}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    getProjectVersions: async (projectId) => {
        const response = await fetch(`${BASE_URL}/versions/${projectId}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    createProject: async (name) => {
        const response = await fetch(`${BASE_URL}/createProject`, {
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
        const response = await fetch(`${BASE_URL}/rename`, {
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
    updateProject: async (projectId, name, snapshot, type) => {
        const response = await fetch(`${BASE_URL}/updateProject`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: projectId, name: name, snapshot: snapshot, type: type }),
        });
        if (!response.ok) {
            return { error: (await response.json()).message };
        }
        return await response.json();
    },
    deleteProject: async (projectId) => {
        const response = await fetch(`${BASE_URL}/deleteProject`, {
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

export default projectsApi;