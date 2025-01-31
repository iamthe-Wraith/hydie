import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { IContributor } from '$lib/types/github';

interface IPullRequest {
    number: number;
}

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

async function fetch_pr_metrics(pr_number: number, org_name: string, repo_name: string, token: string) {
    // Fetch PR details including changes
    const pr_response = await fetch(
        `https://api.github.com/repos/${org_name}/${repo_name}/pulls/${pr_number}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );

    // Fetch PR review comments
    const review_comments_response = await fetch(
        `https://api.github.com/repos/${org_name}/${repo_name}/pulls/${pr_number}/comments`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );

    // Fetch PR reviews to get review body comments
    const reviews_response = await fetch(
        `https://api.github.com/repos/${org_name}/${repo_name}/pulls/${pr_number}/reviews`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );

    if (!pr_response.ok || !review_comments_response.ok || !reviews_response.ok) {
        return null;
    }

    const [pr_data, review_comments_data, reviews_data] = await Promise.all([
        pr_response.json(),
        review_comments_response.json(),
        reviews_response.json()
    ]);

    // Skip PRs targeting staging or master branches
    if (pr_data.base.ref === 'staging' || pr_data.base.ref === 'master') {
        return null;
    }

    // Count inline review comments
    const inline_comments_count = review_comments_data.length;

    // Count review body comments (excluding empty reviews)
    const review_body_comments = reviews_data
        .filter((review: { body: string | null }) => review.body && review.body.trim().length > 0)
        .length;

    // Total comments is the sum of inline comments and review body comments
    const total_comments = inline_comments_count + review_body_comments;

    const total_changes = pr_data.additions + pr_data.deletions;

    return {
        changes: total_changes,
        review_comments: total_comments,
        html_url: pr_data.html_url
    };
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

    // For each contributor, fetch their pull requests and metrics
    const enhanced_contributors = await Promise.all(
        contributors.map(async (contributor) => {
            // Fetch PRs for the contributor
            const prs_response = await fetch(
                `https://api.github.com/search/issues?q=type:pr+repo:${org_name}/${repo_name}+author:${contributor.login}+created:>=${start_date.toISOString()}+-base:staging+-base:master`,
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
                    pull_requests_count: 0,
                    average_changes: 0,
                    average_review_comments: 0,
                    largest_pr: {
                        number: 0,
                        changes: 0,
                        html_url: ''
                    }
                };
            }

            const prs_data = await prs_response.json();
            const pull_requests = prs_data.items;

            // Fetch metrics for each PR
            const pr_metrics = await Promise.all(
                pull_requests.map((pr: IPullRequest) => {
                    const pr_number = pr.number;
                    return fetch_pr_metrics(pr_number, org_name, repo_name, org_token.token);
                })
            );

            // Filter out null results and calculate averages
            const valid_metrics = pr_metrics.filter(metric => metric !== null);
            const total_changes = valid_metrics.reduce((sum, metric) => sum + metric.changes, 0);
            const total_review_comments = valid_metrics.reduce((sum, metric) => sum + metric.review_comments, 0);
            const valid_count = valid_metrics.length;

            // Find the PR with the most changes
            let largest_pr = {
                number: 0,
                changes: 0,
                html_url: ''
            };

            valid_metrics.forEach((metric, index) => {
                if (metric.changes > largest_pr.changes) {
                    largest_pr = {
                        number: pull_requests[index].number,
                        changes: metric.changes,
                        html_url: metric.html_url
                    };
                }
            });

            return {
                ...contributor,
                pull_requests_count: prs_data.total_count,
                average_changes: valid_count > 0 ? Math.round(total_changes / valid_count) : 0,
                average_review_comments: valid_count > 0 ? Math.round(total_review_comments / valid_count * 10) / 10 : 0,
                largest_pr
            };
        })
    );

    return json(enhanced_contributors);
}; 