export interface IGithubOrg {
    id: string;
    login: string;
    avatar_url: string;
    description: string | null;
    name: string | null;
}

export interface IGithubUser {
    id: string;
    login?: string;
    avatar_url?: string | null;
    name?: string | null;
    email?: string | null;
    oauth_access_token?: string;
} 