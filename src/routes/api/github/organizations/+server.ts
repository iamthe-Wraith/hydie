import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Get the user's personal access token
    const personal_token = await prisma.accessToken.findFirst({
        where: {
            user_id: locals.user.id,
            token_type: 'PERSONAL'
        }
    });

    if (!personal_token) {
        return new Response('Personal access token not found', { status: 400 });
    }

    // Fetch organizations from GitHub API
    const response = await fetch('https://api.github.com/user/orgs', {
        headers: {
            'Authorization': `Bearer ${personal_token.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        return new Response('Failed to fetch organizations', { status: response.status });
    }

    const organizations = await response.json();
    return json(organizations);
}; 