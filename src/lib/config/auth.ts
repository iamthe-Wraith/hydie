import { PUBLIC_BASE_URL } from "$env/static/public";

export const AUTH_REDIRECT_URI = `${PUBLIC_BASE_URL}/auth/callback`;

export const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize`;
export const GITHUB_TOKEN_URL = `https://github.com/login/oauth/access_token`;
export const GITHUB_USER_URL = `https://api.github.com/user`; 