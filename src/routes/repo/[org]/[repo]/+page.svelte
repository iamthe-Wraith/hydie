<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { IContributor } from '$lib/types/github';

    let contributors: IContributor[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            const response = await fetch(`/api/github/contributors?org=${$page.params.org}&repo=${$page.params.repo}`);
            if (!response.ok) {
                throw new Error('Failed to fetch contributors');
            }
            const data = await response.json();
            // Filter out users with no PRs and sort by PR count
            contributors = data
                .filter((c: IContributor) => c.pull_requests_count > 0)
                .sort((a: IContributor, b: IContributor) => b.pull_requests_count - a.pull_requests_count);
        } catch (e) {
            error = e instanceof Error ? e.message : 'An error occurred';
        } finally {
            loading = false;
        }
    });
</script>

<div class="container">
    <h1>{$page.params.org}/{$page.params.repo}</h1>

    <div class="content">
        <div class="contributors-section">
            <h2>Pull Request Contributors (Last 6 Months)</h2>
            {#if loading}
                <p class="status-message">Loading contributors...</p>
            {:else if error}
                <p class="status-message error">{error}</p>
            {:else if contributors.length === 0}
                <p class="status-message">No pull request contributors found in the last 6 months.</p>
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

        <div class="stats-section">
            stats go here...
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

    .content {
        display: grid;
        grid-template-columns: 15rem 1fr;
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
        margin-right: 1rem;
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
</style> 