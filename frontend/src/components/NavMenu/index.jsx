import { Link } from 'react-router';
import style from './style.module.css';
import { userStore } from '../../stores/userStore';
import authApi from '../../api/authApi.js';
import { useNavigate } from 'react-router';

export default function NavMenu() {
    const { user } = userStore();
    const navigate = useNavigate();
    const isLoggedIn = user !== null;
    const isAdmin = user?.role === 'admin';

    const logout = async () => {
        const response = await authApi.logout();
        if (response.message) {
            userStore.setState({ user: null });
            navigate('/');
        }
        else {
            console.error(response.error);
        }
    }

    return (
        <nav className={style["nav"]}>
            {/* <Link to="/" className={style["link"]}>Home</Link> */}
            {isLoggedIn ? (
                <>
                    <Link to="/draw" className={style["link"]} >Draw</Link>
                    <Link to="/profile" className={style["link"]}>{user.username}</Link>
                    {isAdmin ? (
                        <Link to="/admin" className={style["link"]}>Admin</Link>
                    ) : null}
                    <button className={style["link"]} onClick={() => logout()}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/" className={style["link"]}>Login</Link>
                    <Link to="/register" className={style["link"]}>Register</Link>
                </>
            )}
        </nav>
    );
}