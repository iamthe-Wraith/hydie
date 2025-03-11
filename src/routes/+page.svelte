<script lang="ts">
    import type { PageData } from "./$types";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import Spinner from "$lib/components/Spinner.svelte";

    let { data }: { data: PageData } = $props();

    let sync_status = $state(data.status ?? '');
    let error = $state('');

	$effect(() => {
		console.log(data);
	});

    const refresh_code_reviews = async () => {
        window.location.reload();
    };

    const sync_code_reviews = async () => {
        try {
            sync_status = 'syncing';
            const response = await fetch('/api/github/code-reviews/sync', {
                method: 'POST'
            });
            const data = await response.json();
            sync_status = data.status;

            console.log('sync data: ', data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unknown error occurred';
            }
        }
    };
</script>

{#if error}
    <p class="error">{error}</p>
{/if}

{#if sync_status === 'syncing'}
    <div class="syncing-container">
        <div>
            <Spinner size="large" type="tertiary">
                Syncing
            </Spinner>
        </div>

        <Button
            onclick={refresh_code_reviews}
            kind="neutral-text"
        >
            Refresh
        </Button>
    </div>
{:else if sync_status === 'not-synced'}
    <div class="not-synced-container">
        <p>Code reviews have not been synced yet.</p>

        <Button
            onclick={sync_code_reviews}
        >
            Sync Code Reviews
        </Button>
    </div>
{:else}
    <div class="synced-container">
        <p>Code reviews synced</p>
    </div>
{/if}

<style>
    .syncing-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 3rem;
        height: 50vh;
        min-height: 18rem;
    }

    .not-synced-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 10vh;
    }
</style>
