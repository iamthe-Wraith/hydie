import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { IContributor } from '$lib/types/github';

function get_date_for_timeframe(timeframe: string): Date {
    const date = new Date();
    switch (timeframe) {
        case '1w':
            date.setDate(date.getDate() - 7);
            break;
        case '2w':
            date.setDate(date.getDate() - 14);
            break;
        case '1m':
            date.setMonth(date.getMonth() - 1);
            break;
        case '3m':
            date.setMonth(date.getMonth() - 3);
            break;
        case '6m':
        default:
            date.setMonth(date.getMonth() - 6);
            break;
    }
    return date;
}

export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const org_name = url.searchParams.get('org');
    const repo_name = url.searchParams.get('repo');
    const timeframe = url.searchParams.get('timeframe') || '6m';

    if (!org_name || !repo_name) {
        return new Response('Organization and repository names are required', { status: 400 });
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

    // Calculate start date based on timeframe
    const start_date = get_date_for_timeframe(timeframe);

    // First, get all contributors to have a list of usernames
    const contributors_response = await fetch(
        `https://api.github.com/repos/${org_name}/${repo_name}/contributors`,
        {
            headers: {
                'Authorization': `Bearer ${org_token.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );

    if (!contributors_response.ok) {
        console.error('GitHub API error:', contributors_response.status, contributors_response.statusText);
        return new Response('Failed to fetch contributors', { status: contributors_response.status });
    }

    const contributors: IContributor[] = await contributors_response.json();

    // For each contributor, fetch their pull requests
    const enhanced_contributors = await Promise.all(
        contributors.map(async (contributor) => {
            const prs_response = await fetch(
                `https://api.github.com/search/issues?q=type:pr+repo:${org_name}/${repo_name}+author:${contributor.login}+created:>=${start_date.toISOString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${org_token.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }
            );

            if (!prs_response.ok) {
                console.error(`Failed to fetch PRs for ${contributor.login}:`, prs_response.status, prs_response.statusText);
                return {
                    ...contributor,
                    pull_requests_count: 0
                };
            }

            const prs_data = await prs_response.json();
            return {
                ...contributor,
                pull_requests_count: prs_data.total_count
            };
        })
    );

    return json(enhanced_contributors);
}; 