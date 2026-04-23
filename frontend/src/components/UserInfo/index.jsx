import { userStore } from '../../stores/userStore';
import { useState, useEffect } from 'react';
import userApi from '../../api/userApi';
import { useNavigate } from 'react-router';
import setAllStoresToStart from '../../utils/setAllStoresToStart';

export default function UserInfo() {
    const { user, setUser } = userStore();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [changingField, setChangingField] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setCreatedAt(user.createdAt);
        setErrors({});
    }, [user]);

    const handleChangeUsername = async () => {
        const response = await userApi.changeUsername(username);
        if (response.error) {
            console.error(response.error);
        }

        setUser(response.user);
        setChangingField(null);
    }

    const handleChangeEmail = async () => {
        const response = await userApi.changeEmail(email);
        if (response.error) {
            console.error(response.error);
        }
        setUser(response.user);
        setChangingField(null);
    }

    const handleChangePassword = async () => {
        setErrors({ password: null });
        if (newPassword !== confirmNewPassword) {
            setErrors({ password: 'New password and confirm new password do not match' });
            return;
        }
        if (newPassword.length < 4) {
            setErrors({ password: 'New password must be at least 8 characters long' });
            return;
        }

        const response = await userApi.changePassword(currentPassword, newPassword);
        if (response.error) {
            console.error(response.error);
            setErrors({ password: response.error });
        }
        console.log(response.message);
        setChangingField(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setErrors({})
    }
    const handleDeleteAccount = async () => {
        const response = await userApi.deleteAccount();
        if (response.error) {
            console.error(response.error);
        }
        setChangingField(null);
        setAllStoresToStart();
        navigate('/');
    }
    return (
        <div>
            {
                changingField === 'username' ? (
                    <>
                        <p>Username: {<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />}</p>
                        <button onClick={handleChangeUsername}>Save</button>
                    </>
                )
                    : (
                        <>
                            <p>Username: {user.username}</p>
                            <button onClick={() => setChangingField('username')}>Change Username</button>
                        </>
                    )
            }
            {
                changingField === 'email' ? (
                    <>
                        <p>Email: {<input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />}</p>
                        <button onClick={handleChangeEmail}>Save</button>
                    </>
                )
                    : (
                        <>
                            <p>Email: {user.email}</p>
                            <button onClick={() => setChangingField('email')}>Change Email</button>
                        </>
                    )
            }

            <p>Role: {user.role}</p>
            <p>Created At: {user.createdAt}</p>
            {changingField === 'password' ? (
                <>
                    <p>Current Password: 
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </p>
                    <p>New Password:
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </p>
                    <p>Confirm New Password:
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </p>
                    {errors.password && <p>{errors.password}</p>}
                    <button onClick={handleChangePassword}>Save</button>
                </>
            ) : (
                <>
                    <button onClick={() => setChangingField('password')}>Change Password</button>
                </>
            )
            }
            <button onClick={handleDeleteAccount}>Delete Account</button>
        </div>
    )
}