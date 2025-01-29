export interface IUser {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    access_token: string;
}

export interface IGitHubUser {
    id: number;
    login: string;
    email: string;
    avatar_url: string;
    name: string;
}

export interface IAuthSession {
    user: IUser | null;
    is_authenticated: boolean;
} 