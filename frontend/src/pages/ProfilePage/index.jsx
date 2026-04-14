import NavMenu from '../../components/NavMenu'
import styles from './style.module.css'
import UserInfo from '../../components/UserInfo';
import UserProjects from '../../components/UserProjects';
import { userStore } from '../../stores/userStore';
import { Navigate } from 'react-router';
export default function ProfilePage() {
    const {user} = userStore();
    if (!user) {
        return <Navigate to="/" />
    }
    return (
        <>
            <NavMenu/>
            <div className={styles.mainContainer}>
                <h1>Profile Page</h1>
                <UserInfo/>
                <UserProjects/>
            </div>
        </>
    )
}