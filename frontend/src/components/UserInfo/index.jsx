import { userStore } from '../../stores/userStore';
import { useState, useEffect } from 'react';
import userApi from '../../api/userApi';

export default function UserInfo() {
    const {user} = userStore();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [changingField, setChangingField] = useState(null);
    
    useEffect(() => {
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setCreatedAt(user.createdAt);
    }, [user]);

    const handleChangeUsername = async () => {
        const response = await userApi.changeUsername(username);
        if (response.error) {
            console.error(response.error);
        }
        setUsername(response.username);
        setChangingField(null);
    }

    const handleChangeEmail = async () => {
        const response = await userApi.changeEmail(email);
        if (response.error) {
            console.error(response.error);
        }
        setEmail(response.email);
        setChangingField(null);

    }
    const handleChangePassword = async () => {
        const response = await userApi.changePassword(password);
        if (response.error) {
            console.error(response.error);
        }
        setChangingField(null);
    }
    const handleDeleteAccount = async () => {
        const response = await userApi.deleteAccount();
        if (response.error) {
            console.error(response.error);
        }
        setChangingField(null);
        navigate('/login');
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

            <button onClick={handleChangePassword}>Change Password</button>
            <button onClick={handleDeleteAccount}>Delete Account</button>   
        </div>
    )
}