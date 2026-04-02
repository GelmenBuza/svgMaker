

type User = {
    id: number;
    email: string;
    username?: string;
    role: string;
    password: string;
    refresh_token?: string;
    createdAt: Date;
};