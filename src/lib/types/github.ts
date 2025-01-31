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

export interface IGithubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    private: boolean;
    owner: IGithubOrg;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    language: string | null;
} 