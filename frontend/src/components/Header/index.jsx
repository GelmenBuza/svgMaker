import { Link } from 'react-router';
import style from './style.module.css';

export default function Header() {
    const { user } = userStore();
    const isLoggedIn = user !== null;
    const isAdmin = user?.role === 'admin';
    return (
        <header className={style["header"]}>
            <nav className={style["nav"]}>
                <Link to="/" className={style["link"]}>Home</Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/draw" className={style["link"]} >Draw</Link>
                        <Link to="/profile" className={style["link"]}>Profile</Link>
                        {isAdmin ? (
                            <Link to="/admin" className={style["link"]}>Admin</Link>
                        ) : null}
                        <Link to="/logout" className={style["link"]}>Logout</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={style["link"]}>Login</Link>
                        <Link to="/register" className={style["link"]}>Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}