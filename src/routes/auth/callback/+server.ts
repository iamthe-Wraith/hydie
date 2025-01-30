import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GITHUB_TOKEN_URL, GITHUB_USER_URL } from '$lib/config/auth';
import type { IGitHubUser } from '$lib/types/auth';
import { env } from '$env/dynamic/private';
import { PUBLIC_GITHUB_CLIENT_ID } from '$env/static/public';
import { GITHUB_CLIENT_SECRET } from '$env/static/private';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');

    if (!code) {
        throw error(400, 'No code provided');
    }

    if (!PUBLIC_GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        throw error(500, 'GitHub OAuth credentials not configured');
    }

    try {
        // Exchange code for access token
        const token_response = await fetch(GITHUB_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: PUBLIC_GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code
            })
        });

        const token_data = await token_response.json();

        if (!token_data.access_token) {
            throw error(400, 'Failed to get access token');
        }

        // Get user data
        const user_response = await fetch(GITHUB_USER_URL, {
            headers: {
                'Authorization': `Bearer ${token_data.access_token}`,
                'Accept': 'application/json'
            }
        });

        const github_user = await user_response.json() as IGitHubUser;

        // Create or update user in database
        const user = await prisma.user.upsert({
            where: { github_id: github_user.id.toString() },
            update: {
                username: github_user.login,
                email: github_user.email,
                avatar_url: github_user.avatar_url,
                name: github_user.name,
                oauth_access_token: token_data.access_token
            },
            create: {
                github_id: github_user.id.toString(),
                username: github_user.login,
                email: github_user.email,
                avatar_url: github_user.avatar_url,
                name: github_user.name,
                oauth_access_token: token_data.access_token
            }
        });

        // Set session cookie
        const user_data = {
            id: user.id,
            login: user.username,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            oauth_access_token: user.oauth_access_token
        };

        cookies.set('session', JSON.stringify({
            user: user_data,
            is_authenticated: true
        }), {
            path: '/',
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    } catch (err) {
        if (err instanceof Error) {
            throw error(500, err.message);
        }
        throw error(500, 'An unexpected error occurred');
    }

    throw redirect(303, '/');
}; 
