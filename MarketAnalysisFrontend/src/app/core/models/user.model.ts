export interface UserInfo {
    id: number;
    username: string;
    displayName: string;
    email: string;
    walletAddress?: string;
    authType: string;
    bio?: string;
    website?: string;
    birthday?: string;
    createdAt: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    data?: UserInfo;
    message?: string;
}