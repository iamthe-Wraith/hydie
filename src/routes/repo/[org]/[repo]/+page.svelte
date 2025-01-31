<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="content">
    <h1>{$page.params.org}/{$page.params.repo}</h1>
    <p>Repository details coming soon!</p>
    <a href="/" class="back-link">← Back to repositories</a>
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

    .back-link {
        color: var(--color-text-2);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.2s ease-in-out;
    }

    .back-link:hover {
        color: var(--color-text);
    }
</style> 