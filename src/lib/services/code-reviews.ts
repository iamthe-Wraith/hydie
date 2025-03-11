import fs from 'fs';
import { Octokit } from '@octokit/rest';
import { Logger } from './logger';
import { GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN } from '$env/static/private';
import { ApiError } from '$lib/utils/api-error';

type Status = 'not-synced' | 'synced' | 'syncing' | 'error' | null;

interface ICodeReviewsData {
    last_synced: string | null;
    status: Status;
    data: Record<string, Record<string, number>>;
}

export class CodeReviewsService {
    private file_name = 'data.json';
    private numberOfDays = 14;
    private octokit: Octokit;

    constructor() {
        if (!GITHUB_OWNER) {
            throw new ApiError('env::GITHUB_OWNER is not set', 500);
        }

        if (!GITHUB_REPO) {
            throw new ApiError('env::GITHUB_REPO is not set', 500);
        }
        
        if (!GITHUB_TOKEN) {
            throw new ApiError('env::GITHUB_TOKEN is not set', 500);
        }

        this.octokit = new Octokit({
            auth: GITHUB_TOKEN
        });
    }

    public async get_synced_data(): Promise<ICodeReviewsData> {
        try {
            if (fs.existsSync(this.file_name)) {
                return JSON.parse(fs.readFileSync(this.file_name, 'utf8'));
            } else {
                fs.writeFileSync(this.file_name, JSON.stringify({
                    last_synced: null,
                    status: 'not-synced',
                    data: {}
                }));
    
                return {
                    data: {},
                    status: 'not-synced',
                    last_synced: null
                };
            }
        } catch (error: unknown) {
            Logger.error(error);
            throw error;
        }
    }

    public async sync() {
        try {
            const file_data = await this.get_synced_data();

            if (file_data.status === 'syncing') {
                return file_data;
            }

            const code_reviews = await this.get_code_reviews();

            const data = {
                last_synced: new Date().toISOString(),
                status: 'synced',
                data: code_reviews
            }

            fs.writeFileSync(this.file_name, JSON.stringify(data));

            return data;
        } catch (error) {
            Logger.error(error);
            throw error;
        }
    }

    private format_date_for_query(date: string) {
        return `${date}T00:00:00Z`;
    }

    private get_all_reviews = async (startDate: string) => {
        try {
            // First, get all pull requests
            const pullRequests = await this.octokit.paginate(
                'GET /repos/{owner}/{repo}/pulls',
                {
                    owner: GITHUB_OWNER,
                    repo: GITHUB_REPO,
                    state: 'all',
                    sort: 'updated',
                    direction: 'desc',
                    per_page: 100
                }
            );
    
            // Filter PRs updated after our start date
            const recentPRs = pullRequests.filter(pr => 
                new Date(pr.updated_at) >= new Date(startDate)
            );
    
            // Get reviews for each PR
            const allReviews = [];
            for (const pr of recentPRs) {
                const reviews = await this.octokit.paginate(
                    'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
                    {
                        owner: GITHUB_OWNER,
                        repo: GITHUB_REPO,
                        pull_number: pr.number,
                        per_page: 100
                    }
                );
                allReviews.push(...reviews);
            }
    
            // Filter reviews by date
            return allReviews.filter(review => {
                const reviewDate = new Date(review.submitted_at!);
                return reviewDate >= new Date(startDate);
            });
        } catch (error: unknown) {
            if (error instanceof Error && 'status' in error && error.status === 404) {
                throw new Error('Repository not found. Please check if the organization and repository names are correct.');
            }
            if (error instanceof Error && 'status' in error && error.status === 403) {
                throw new Error('API rate limit exceeded or insufficient permissions. Please check your token has the necessary permissions.');
            }
            throw error;
        }
    }
    

    private get_code_reviews = async (): Promise<Record<string, Record<string, number>>> => {
        // First verify we have access to the repository
        await this.verify_repository_access();

        const dates = this.get_date_range();
        const startDate = this.format_date_for_query(dates[0]);
        
        console.log('Fetching PR reviews... This may take a moment...');
        
        // Get all PR reviews within the date range
        const reviews = await this.get_all_reviews(startDate);

        // Process reviews by user and date
        const userStats: Record<string, Record<string, number>> = {};
        
        reviews.forEach(review => {
            const reviewDate = review.submitted_at!.split('T')[0];
            if (reviewDate >= dates[0] && reviewDate <= dates[this.numberOfDays - 1]) {
                const username: string = review.user!.login;
                if (!userStats[username]) {
                    userStats[username] = {};
                    dates.forEach(date => userStats[username][date] = 0);
                }
                userStats[username][reviewDate]++;
            }
        });

        return userStats;
    }

    private get_date_range() {
        const dates = [];
        for (let i = 0; i < this.numberOfDays; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.unshift(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    private verify_repository_access = async () => {
        try {
            await this.octokit.rest.repos.get({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
            });
        } catch (error: unknown) {
            if (error instanceof Error && 'status' in error && error.status === 404) {
                throw new Error('Repository not found. Please check if the organization and repository names are correct.');
            }
            if (error instanceof Error && 'status' in error && error.status === 403) {
                throw new Error('Access denied. Please ensure your token has access to the organization repository.');
            }
            throw error;
        }
    }
}