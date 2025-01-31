import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals, url }) => {
    console.log('locals', locals);

    if (!locals.user) {
        console.error('No user found in locals');
        return new Response('Unauthorized', { status: 401 });
    }

    const org_name = url.searchParams.get('org');
    if (!org_name) {
        return new Response('Organization name is required', { status: 400 });
    }

    // Get the organization's access token
    const org_token = await prisma.accessToken.findFirst({
        where: {
            user_id: locals.user.id,
            token_type: 'ORGANIZATION',
            org_name: org_name
        }
    });

    if (!org_token) {
        return new Response('Organization access token not found', { status: 400 });
    }

    // Fetch repositories from GitHub API
    const response = await fetch(`https://api.github.com/orgs/${org_name}/repos`, {
        headers: {
            'Authorization': `Bearer ${org_token.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        console.error('GitHub API error:', response.status, response.statusText);
        return new Response('Failed to fetch repositories', { status: response.status });
    }

    const repositories = await response.json();
    return json(repositories);
}; 