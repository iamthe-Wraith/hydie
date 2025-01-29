<script lang="ts">
    import GitHubLoginButton from '$lib/components/GitHubLoginButton.svelte';
</script>

<div class="login-container">
    <div class="login-card">
        <h1>Welcome to Hydie</h1>
        <p>Sign in to continue</p>
        <div class="login-options">
            <GitHubLoginButton />
        </div>
    </div>
</div>

<style lang="postcss">
    .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1rem;
        background-color: var(--color-background);
    }

    .login-card {
        background-color: var(--color-surface-1);
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        padding: 2rem;
        width: 100%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    h1 {
        color: var(--color-text);
        font-size: 1.875rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    p {
        color: var(--color-text-2);
        margin-bottom: 2rem;
    }

    .login-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style> 