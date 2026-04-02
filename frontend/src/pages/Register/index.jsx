import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import styles from './style.module.css';
import authApi from '../../api/authApi';
import { userStore } from '../../stores/userStore';

export default function Register() {
    const { setUser, getUser } = userStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!email || email.trim() === '') {
            newErrors.email = 'Email is required';
        }
        if (!password || password.trim() === '') {
            newErrors.password = 'Password is required';
        }
        if (!confirmPassword || confirmPassword.trim() === '') {
            newErrors.confirmPassword = 'Confirm Password is required';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            const response = await authApi.register(email, password);
            if (response.error) {
                newErrors.error = response.error;
                setErrors(newErrors);
                return;
            }
            setUser(response.user);
        } catch (error) {
            console.error("Error in register:", error);
            newErrors.error = error.message;
            setErrors(newErrors);
            return;
        }
        console.log("user", getUser());
        navigate('/draw');
    }

    return (
        <div className={styles.container}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
                {errors.email && <p>{errors.email}</p>}
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
                {errors.password && <p>{errors.password}</p>}
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={styles.input} />
                {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
                <button type="submit">Register</button>
                {errors.error && <p>{errors.error}</p>}
            </form>
            <Link to="/">Login</Link>
        </div>
    )
}