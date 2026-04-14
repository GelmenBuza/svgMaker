import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import styles from './style.module.css';
import authApi from '../../api/authApi';
import { userStore } from '../../stores/userStore';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { setUser, getUser } = userStore();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            const response = await authApi.login(email, password);
            if (response.error) {
                newErrors.error = response.error;
                setErrors(newErrors);
                return;
            }
            setUser(response.user);
            console.log("user", getUser());
            navigate('/profile');
        } catch (error) {
            console.error("Error in login:", error);
            newErrors.error = error.message;
            setErrors(newErrors);
            return;
        }
    }
    return (
        <div className={styles.container}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
                {errors.email && <p>{errors.email}</p>}
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
                {errors.password && <p>{errors.password}</p>}
                <button type="submit">Login</button>
                {errors.error && <p>{errors.error}</p>}
            </form>
            <Link to="/register">Register</Link>
        </div>
    )
}