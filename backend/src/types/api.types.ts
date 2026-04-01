type AuthenticatedRequest = Request & {
    user?: {
        userId: number;
    };
};