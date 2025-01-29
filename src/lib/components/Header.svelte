<script lang="ts">
    import type { IUser } from '$lib/types/auth';

    let {
        user
    }: {
        user: IUser | null;
    } = $props();

    const handle_logout = async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.redirected) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };
</script>

<header class="header">
    <div class="header-content">
        <a href="/" class="logo">
            Hydie
        </a>

        {#if user}
            <div class="user-section">
                <div class="user-info">
                    {#if user.avatar_url}
                        <img 
                            src={user.avatar_url} 
                            alt={user.username} 
                            class="avatar"
                        />
                    {/if}
                    <span class="username">{user.username}</span>
                </div>
                <button 
                    class="logout-button"
                    onclick={handle_logout}
                >
                    Sign Out
                </button>
            </div>
        {/if}
    </div>
</header>

<style lang="postcss">
    .header {
        width: 100%;
        background-color: var(--color-surface-1);
        border-bottom: 1px solid var(--color-border);
        padding: 1rem;
    }

    .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
        text-decoration: none;
    }

    .user-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
    }

    .username {
        color: var(--color-text);
        font-weight: 500;
    }

    .logout-button {
        padding: 0.5rem 1rem;
        background-color: var(--color-surface-2);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .logout-button:hover {
        background-color: var(--color-surface-3);
        border-color: var(--color-border-hover);
    }
</style> 
