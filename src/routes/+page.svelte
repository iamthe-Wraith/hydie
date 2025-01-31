<script lang="ts">
    import type { IPageData } from './+page.server';
    import { auth } from '$lib/state/auth.svelte';
    
    export let data: { data: IPageData };
</script>

<div class="content">
    <h1>{data.data.title}</h1>
    <p>{data.data.description}</p>

    {#if auth.is_authenticated && data.data.repositories.length > 0}
        <div class="repositories">
            {#each data.data.repositories as repo}
                <a href="/repo/{data.data.org_name}/{repo.name}" class="repo-card">
                    <h2>{repo.name}</h2>
                    {#if repo.description}
                        <p class="description">{repo.description}</p>
                    {/if}
                    <div class="repo-meta">
                        {#if repo.language}
                            <span class="language">{repo.language}</span>
                        {/if}
                        <span class="updated">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--color-text);
    }

    p {
        color: var(--color-text-2);
        margin-bottom: 2rem;
    }

    .repositories {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        width: 100%;
    }

    .repo-card {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        background-color: var(--color-surface-1);
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
    }

    .repo-card:hover {
        transform: translateY(-2px);
        border-color: var(--color-border-hover);
        background-color: var(--color-surface-2);
    }

    .repo-card h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 0.5rem;
    }

    .description {
        color: var(--color-text-2);
        font-size: 0.875rem;
        margin-bottom: 1rem;
        flex-grow: 1;
    }

    .repo-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.75rem;
    }

    .language {
        color: var(--color-text-2);
    }

    .updated {
        color: var(--color-text-3);
    }
</style>
