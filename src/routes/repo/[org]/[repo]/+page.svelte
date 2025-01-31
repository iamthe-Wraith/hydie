<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { IContributor } from '$lib/types/github';

    let contributors: IContributor[] = [];
    let loading = true;
    let error: string | null = null;
    let selected_timeframe = '2w';

    const timeframe_options = [
        { value: '1w', label: 'Past week' },
        { value: '2w', label: 'Past 2 weeks' },
        { value: '1m', label: 'Past month' },
        { value: '3m', label: 'Past 3 months' },
        { value: '6m', label: 'Past 6 months' }
    ];

    async function fetch_contributors(timeframe: string) {
        loading = true;
        error = null;
        try {
            const response = await fetch(
                `/api/github/contributors?org=${$page.params.org}&repo=${$page.params.repo}&timeframe=${timeframe}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch contributors');
            }
            const data = await response.json();
            contributors = data
                .filter((c: IContributor) => c.pull_requests_count > 0)
                .sort((a: IContributor, b: IContributor) => b.pull_requests_count - a.pull_requests_count);
        } catch (e) {
            error = e instanceof Error ? e.message : 'An error occurred';
        } finally {
            loading = false;
        }
    }

    function handle_timeframe_change() {
        fetch_contributors(selected_timeframe);
    }

    onMount(() => {
        fetch_contributors(selected_timeframe);
    });
</script>

<div class="container">
    <h1>{$page.params.org}/{$page.params.repo}</h1>

    <div class="timeframe-selector">
        <select 
            bind:value={selected_timeframe}
            on:change={handle_timeframe_change}
            class="select"
        >
            {#each timeframe_options as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    </div>

    <div class="content">
        <div class="contributors-section">
            <h2>Pull Request Contributors</h2>
            {#if loading}
                <p class="status-message">Loading contributors...</p>
            {:else if error}
                <p class="status-message error">{error}</p>
            {:else if contributors.length === 0}
                <p class="status-message">No pull request contributors found in the selected time period.</p>
            {:else}
                <div class="contributors-grid">
                    {#each contributors as contributor}
                        <a href={contributor.html_url} target="_blank" rel="noopener noreferrer" class="contributor-card">
                            <img src={contributor.avatar_url} alt={contributor.login} class="avatar" />
                            <div class="contributor-info">
                                <span class="username">{contributor.login}</span>
                                <span class="contributions">{contributor.pull_requests_count} pull requests</span>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="metrics-section">
            <h2>Pull Request Metrics</h2>
            {#if loading}
                <p class="status-message">Loading metrics...</p>
            {:else if error}
                <p class="status-message error">{error}</p>
            {:else if contributors.length === 0}
                <p class="status-message">No data available for the selected time period.</p>
            {:else}
                <div class="metrics-grid">
                    {#each contributors as contributor}
                        <div class="metric-card">
                            <div class="metric-header">
                                <img src={contributor.avatar_url} alt={contributor.login} class="metric-avatar" />
                                <span class="metric-username">{contributor.login}</span>
                            </div>
                            <div class="metric-stats">
                                <div class="metric-stat">
                                    <span class="metric-value">{contributor.average_changes.toLocaleString()}</span>
                                    <span class="metric-label">avg. changes per PR</span>
                                </div>
                                <div class="metric-stat">
                                    <span class="metric-value">{contributor.average_review_comments}</span>
                                    <span class="metric-label">avg. review comments per PR</span>
                                </div>
                            </div>
                            {#if contributor.largest_pr.changes > 0}
                                <div class="largest-pr">
                                    <a href={contributor.largest_pr.html_url} target="_blank" rel="noopener noreferrer" class="pr-link">
                                        <span class="pr-label">Largest PR:</span>
                                        <span class="pr-changes">{contributor.largest_pr.changes.toLocaleString()} changes</span>
                                        <span class="pr-arrow">→</span>
                                    </a>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <a href="/" class="back-link">← Back to repositories</a>
</div>

<style lang="postcss">
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .timeframe-selector {
        width: 100%;
        margin: 1rem 0 2rem;
    }

    .select {
        background-color: var(--color-bg-2);
        color: var(--color-text);
        border: 1px solid var(--neutral-300);
        border-radius: 6px;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }

    .select:hover {
        background-color: var(--color-bg-3);
        border-color: var(--neutral-400);
    }

    .select:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-alpha);
    }

    .content {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2rem;
        width: 100%;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--color-text);
    }

    h2 {
        font-size: 1.5rem;
        margin: 0;
        color: var(--color-text);
    }

    .contributors-section {
        width: 100%;
    }

    .status-message {
        text-align: center;
        color: var(--color-text-2);
        margin: 2rem 0;
    }

    .status-message.error {
        color: var(--color-error);
    }

    .contributors-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-top: 1rem;
    }

    .contributor-card {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background: var(--color-bg-2);
        border-radius: 8px;
        border: 1px solid var(--neutral-300);
        text-decoration: none;
        transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }

    .contributor-card:hover {
        transform: translateY(-2px);
        background: var(--color-bg-3);
    }

    .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 1rem;
    }

    .contributor-info {
        display: flex;
        flex-direction: column;
    }

    .username {
        color: var(--color-text);
        font-weight: 500;
        margin-bottom: 0.25rem;
    }

    .contributions {
        color: var(--color-text-2);
        font-size: 0.875rem;
    }

    .back-link {
        color: var(--color-text-2);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.2s ease-in-out;
        margin-top: 2rem;
    }

    .back-link:hover {
        color: var(--color-text);
    }

    .metrics-section {
        width: 100%;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .metric-card {
        background: var(--color-bg-2);
        border: 1px solid var(--neutral-300);
        border-radius: 8px;
        padding: 1rem;
    }

    .metric-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }

    .metric-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 0.5rem;
    }

    .metric-username {
        color: var(--color-text);
        font-weight: 500;
    }

    .metric-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .metric-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .metric-value {
        color: var(--color-text);
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .metric-label {
        color: var(--color-text-2);
        font-size: 0.75rem;
        line-height: 1.2;
    }

    .largest-pr {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--neutral-300);
    }

    .pr-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text-2);
        font-size: 0.875rem;
        text-decoration: none;
        transition: color 0.2s ease-in-out;
    }

    .pr-link:hover {
        color: var(--color-text);
    }

    .pr-label {
        color: var(--color-text-2);
    }

    .pr-changes {
        color: var(--color-text);
        font-weight: 500;
    }

    .pr-arrow {
        margin-left: auto;
        font-size: 1rem;
    }
</style> 