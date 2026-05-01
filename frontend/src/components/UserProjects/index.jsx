import { userStore } from '../../stores/userStore';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import projectsApi from "../../api/projectsApi.js";

export default function UserProjects() {
    const [projectRenameName, setProjectRenameName] = useState('');
    const [isProjectRenaming, setIsProjectRenaming] = useState(false);
    const [renamedProjectId, setRenamedProjectId] = useState(null);

    const { saveProjectsToStore } = userStore();
    const [projects, setProjects] = useState([]);

    const getUserProjects = async () => {
        const response = await projectsApi.getUserProjects();
        if (response.error) {
            console.error(response.error);
        }
        setProjects(response.projects);
        saveProjectsToStore(response.projects);
    }

    const createProject = async () => {
        const response = await projectsApi.createProject('New Project');
        if (response.error) {
            console.error(response.error);
        }
        saveProjectsToStore([...projects, response.project]);
        getUserProjects();
    }

    const handleRenameProject = async (projectId) => {
        const response = await projectsApi.renameProject(projectId, projectRenameName);
        if (response.error) {
            console.error(response.error);
        }
        saveProjectsToStore(projects.map(project => project.id === projectId ? response.project : project));
        getUserProjects();
        setIsProjectRenaming(false);
        setRenamedProjectId(null);
        setProjectRenameName('');
    }

    const handleDeleteProject = async (projectId) => {
        const response = await projectsApi.deleteProject(projectId);
        if (response.error) {
            console.error(response.error);
        }
        saveProjectsToStore(projects.filter(project => project.id !== projectId));
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
                        <li key={project.id}>
                            {isProjectRenaming && renamedProjectId === project.id ? (
                                <>
                                    <input type="text" value={projectRenameName} onChange={(e) => setProjectRenameName(e.target.value)} />
                                    <button type="button" onClick={() => handleRenameProject(project.id)}>Save</button>
                                </>
                            ) : (
                                <>
                                    <Link to={`/draw?projectId=${project.id}`}>{project.name}</Link>
                                    <button type="button" onClick={() => {
                                        setIsProjectRenaming(true);
                                        setRenamedProjectId(project.id);
                                        setProjectRenameName(project.name);
                                    }}>Rename</button>
                                </>
                            )}
                            <button type="button" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>У вас пока нет проектов. Создайте свой первый проект!</p>
            )}
            <button onClick={() => createProject()}>Create Project</button>
        </div>
    )
}