import { userStore } from '../../stores/userStore';

export default function UserInfo() {
    const {user} = userStore();

    return (
        <div>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Created At: {user.createdAt}</p>
        </div>
    )
}