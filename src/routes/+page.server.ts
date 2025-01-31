import { prisma } from '$lib/server/prisma';
import type { IGithubRepo } from '$lib/types/github';
import type { PageServerLoad } from './$types';
import { PUBLIC_BASE_URL } from '$env/static/public';

export interface IPageData {
    title: string;
    description: string;
    repositories: IGithubRepo[];
    org_name: string | null;
}

export const load: PageServerLoad = async ({ locals, cookies }): Promise<{ data: IPageData }> => {
    if (!locals.user) {
        return {
            data: {
                title: 'Welcome to Hydie',
                description: 'Please sign in to view your repositories.',
                repositories: [],
                org_name: null
            }
        };
    }

    // Get the first organization token (we'll support multiple orgs later)
    const org_token = await prisma.accessToken.findFirst({
        where: {
            user_id: locals.user.id,
            token_type: 'ORGANIZATION'
        }
    });

    if (!org_token || !org_token.org_name) {
        return {
            data: {
                title: 'Welcome to Hydie',
                description: 'Please add an organization token to view repositories.',
                repositories: [],
                org_name: null
            }
        };
    }

    // Fetch repositories
    const response = await fetch(`${PUBLIC_BASE_URL}/api/github/repositories?org=${org_token.org_name}`, {
        headers: {
            cookie: `session=${cookies.get('session')}`
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch repositories', response.status, response.statusText);
        return {
            data: {
                title: 'Error',
                description: 'Failed to fetch repositories. Please try again later.',
                repositories: [],
                org_name: org_token.org_name
            }
        };
    }

    const repositories = await response.json();

    return {
        data: {
            title: `${org_token.org_name} Repositories`,
            description: `Viewing repositories for ${org_token.org_name}`,
            repositories,
            org_name: org_token.org_name
        }
    };
};
