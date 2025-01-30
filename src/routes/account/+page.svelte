{#if auth.user}
<div class="container">
    <h1>Account Settings</h1>
    
    <section class="tokens-section">
        <h2>GitHub Access Tokens</h2>
        
        <!-- Personal Access Token Form -->
        <div class="token-form">
            <h3>Personal Access Token</h3>
            <p>Add your GitHub personal access token to enable organization access.</p>
            
            <form onsubmit={handle_personal_token_submit}>
                <div class="form-group">
                    <label for="personal_token">Personal Access Token</label>
                    <input 
                        type="password"
                        id="personal_token"
                        bind:value={personal_token}
                        placeholder="ghp_************************************"
                    />
                </div>
                <button type="submit" class="primary">Save Personal Token</button>
            </form>
        </div>

        <!-- Organization Tokens List -->
        {#if personal_access_token}
            <div class="org-tokens">
                <h3>Organization Access Tokens</h3>
                {#if organizations.length > 0}
                    <ul>
                        {#each organizations as org}
                            <li>
                                <div class="org-info">
                                    <img src={org.avatar_url} alt={org.login} />
                                    <span>{org.login}</span>
                                </div>
                                <div class="token-input">
                                    <input 
                                        type="password"
                                        placeholder="Organization token"
                                        bind:value={org_tokens[org.id]}
                                    />
                                    <button 
                                        onclick={() => save_org_token(org.id, org.login)}
                                        class="secondary"
                                    >
                                        Save
                                    </button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p>No organizations found.</p>
                {/if}
            </div>
        {/if}
    </section>
</div>
{:else}
<div class="container">
    <p>Please log in to access account settings.</p>
</div>
{/if}

<script lang="ts">
    import { auth } from '$lib/state/auth.svelte';
    import { onMount } from 'svelte';
    import type { IGithubOrg } from '$lib/types/github';
    
    let personal_token = '';
    let organizations: IGithubOrg[] = [];
    let org_tokens: Record<string, string> = {};
    let personal_access_token: string | null = null;

    onMount(async () => {
        // Fetch existing personal access token
        const token_response = await fetch('/api/account/tokens/personal');
        if (token_response.ok) {
            const data = await token_response.json();
            personal_access_token = data.token;
            
            // If we have a personal token, fetch organizations
            if (personal_access_token) {
                await fetch_organizations();
            }
        }
    });

    async function fetch_organizations() {
        const response = await fetch('/api/github/organizations');
        if (response.ok) {
            organizations = await response.json();
        }
    }

    async function handle_personal_token_submit(event: Event) {
        event.preventDefault();
        
        const response = await fetch('/api/account/tokens/personal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: personal_token })
        });

        if (response.ok) {
            personal_access_token = personal_token;
            personal_token = ''; // Clear the input
            await fetch_organizations();
        }
    }

    async function save_org_token(org_id: string, org_name: string) {
        const token = org_tokens[org_id];
        if (!token) return;

        const response = await fetch('/api/account/tokens/organization', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                org_id,
                org_name
            })
        });

        if (response.ok) {
            org_tokens[org_id] = ''; // Clear the input
        }
    }
</script>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .tokens-section {
        margin-top: 2rem;
    }

    .token-form {
        background: var(--surface-2);
        padding: 1.5rem;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-1);
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--surface-3);
        border-radius: 4px;
        background: var(--surface-1);
        color: var(--text-1);
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button.primary {
        background: var(--brand);
        color: white;
    }

    button.secondary {
        background: var(--surface-3);
        color: var(--text-1);
    }

    .org-tokens {
        margin-top: 2rem;
    }

    .org-tokens ul {
        list-style: none;
        padding: 0;
    }

    .org-tokens li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: var(--surface-2);
        margin-bottom: 0.5rem;
        border-radius: 4px;
    }

    .org-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .org-info img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .token-input {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .token-input input {
        width: 300px;
    }
</style> 
