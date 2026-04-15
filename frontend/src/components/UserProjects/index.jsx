import { userStore } from '../../stores/userStore';
import { useState, useEffect } from 'react';
import userApi from '../../api/userApi.js';
import { Link } from 'react-router';

export default function UserProjects() {
    const {saveProjectsToStore} = userStore();
    const [projects, setProjects] = useState([]);

    const getUserProjects = async () => {
        const response = await userApi.getUserProjects();
        if (response.error) {
            console.error(response.error);
        }
        setProjects(response.projects);
        saveProjectsToStore(response.projects);
    }

    const createProject = async () => {
        const response = await userApi.createProject('New Project');
        if (response.error) {
            console.error(response.error);
        }
        saveProjectsToStore([...projects, response.project]);
        getUserProjects();
    }

    useEffect(() => {
        getUserProjects();
    }, []);

    return (
        <div>
            <h1>User Projects</h1>
            {projects.length > 0 ? (
            <ul>
                {projects.map((project) => (
                    <li key={project.id}><Link to={`/draw?projectId=${project.id}`}>{project.name}</Link></li>
                ))}
            </ul>
            ) : (
                <p>У вас пока нет проектов. Создайте свой первый проект!</p>
            )}
            <button onClick={() => createProject()}>Create Project</button>
        </div>
    )
}