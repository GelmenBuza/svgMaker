import style from './style.module.css';
import { useState, useEffect } from 'react';
import projectsApi from "../../api/projectsApi.js";

const getProjectVersions = async (projectId) => {
    const response = await projectsApi.getProjectVersions(projectId);
    if (response.error) {
        return { error: response.error };
    }

    const normalizedProjectVersions = response.versions.map(version => {
        const date = new Date(version.createdAt);
        const formattedDate = date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return {
            id: version.id,
            createdAt: formattedDate,
        }
    });
    return normalizedProjectVersions;
}


export default function History({ projectId }) {
    const [projectVersions, setProjectVersions] = useState([])
    useEffect(() => {
        const fetchProjectVersions = async () => {
            const versions = await getProjectVersions(projectId);
            setProjectVersions(versions);
        }
        fetchProjectVersions();
    }, [projectId]);

    return (
        <div className={style.history}>
            <h3>History</h3>
            <ul className={style.historyList}>
                {projectVersions.map(version => (
                    <li key={version.id}>
                        <span>{version.createdAt}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}