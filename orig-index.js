require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const { table } = require('table');

// Initialize GitHub client
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

const numberOfDays = 14;

// Get date range for the last 14 days
function getDateRange() {
    const dates = [];
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.unshift(date.toISOString().split('T')[0]);
    }
    return dates;
}

// Format date for GitHub API query
function formatDateForQuery(date) {
    return `${date}T00:00:00Z`;
}

// Fetch all reviews using pagination
async function getAllReviews(startDate) {
    try {
        // First, get all pull requests
        const pullRequests = await octokit.paginate(
            'GET /repos/{owner}/{repo}/pulls',
            {
                owner,
                repo,
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
            const reviews = await octokit.paginate(
                'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
                {
                    owner,
                    repo,
                    pull_number: pr.number,
                    per_page: 100
                }
            );
            allReviews.push(...reviews);
        }

        // Filter reviews by date
        return allReviews.filter(review => {
            const reviewDate = new Date(review.submitted_at);
            return reviewDate >= new Date(startDate);
        });
    } catch (error) {
        if (error.status === 404) {
            throw new Error('Repository not found. Please check if the organization and repository names are correct.');
        }
        if (error.status === 403) {
            throw new Error('API rate limit exceeded or insufficient permissions. Please check your token has the necessary permissions.');
        }
        throw error;
    }
}

// Verify repository access
async function verifyRepositoryAccess() {
    try {
        await octokit.rest.repos.get({
            owner,
            repo
        });
    } catch (error) {
        if (error.status === 404) {
            throw new Error('Repository not found. Please check if the organization and repository names are correct.');
        }
        if (error.status === 403) {
            throw new Error('Access denied. Please ensure your token has access to the organization repository.');
        }
        throw error;
    }
}

async function getPRReviews() {
    try {
        // First verify we have access to the repository
        await verifyRepositoryAccess();

        const dates = getDateRange();
        const startDate = formatDateForQuery(dates[0]);
        
        console.log('Fetching PR reviews... This may take a moment...');
        
        // Get all PR reviews within the date range
        const reviews = await getAllReviews(startDate);

        // Process reviews by user and date
        const userStats = {};
        
        reviews.forEach(review => {
            const reviewDate = review.submitted_at.split('T')[0];
            if (reviewDate >= dates[0] && reviewDate <= dates[numberOfDays - 1]) {
                const username = review.user.login;
                if (!userStats[username]) {
                    userStats[username] = {};
                    dates.forEach(date => userStats[username][date] = 0);
                }
                userStats[username][reviewDate]++;
            }
        });

        // Prepare table data
        const tableData = [
            ['Reviewer', ...dates, 'Total']
        ];

        Object.entries(userStats)
            .sort(([a], [b]) => a.localeCompare(b)) // Sort reviewers alphabetically
            .forEach(([username, dateCounts]) => {
                const reviewerDailyCounts = dates.map(date => dateCounts[date] || 0);
                const reviewerTotal = reviewerDailyCounts.reduce((sum, count) => sum + count, 0);
                tableData.push([
                    username,
                    ...reviewerDailyCounts,
                    reviewerTotal
                ]);
            });

        // Add total row
        const dailyTotals = dates.map(date => 
            Object.values(userStats).reduce((sum, user) => sum + (user[date] || 0), 0)
        );
        const grandTotal = dailyTotals.reduce((sum, count) => sum + count, 0);
        tableData.push(['Total', ...dailyTotals, grandTotal]);

        // Display table
        console.log('\nPR Review Statistics for the Last 14 Days:');
        console.log(`Repository: ${owner}/${repo}`);
        console.log(table(tableData));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.status === 401) {
            console.error('Authentication failed. Please check your GitHub token.');
        }
        process.exit(1);
    }
}

// Check if required environment variables are set
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    console.error('Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in your .env file');
    process.exit(1);
}

// Run the application
getPRReviews(); 