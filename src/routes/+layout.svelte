<script lang="ts">
    import '../styles.css';
    import { goto } from '$app/navigation';
    import type { Snippet } from 'svelte';
    import type { IAuthSession } from '$lib/types/auth';
    import Header from '$lib/components/Header.svelte';
	import { auth } from '$lib/state/auth.svelte';

    let {
        children,
        data
    }: {
        children: Snippet;
        data: {
            session: IAuthSession;
            redirect_to?: string;
        };
    } = $props();

    $effect(() => {
        if (data.redirect_to) {
            goto(data.redirect_to);
        }
    });
</script>

<svelte:head>
    <link rel="canonical" href="https://hydie.wraithcode.io" />

    <title>Hydie</title>
    
    <meta name="description" content="Hydie is a tool that helps you understand your development team's productivity and experience." />
    
    <meta property="og:title" content="Hydie" />
    <meta property="og:description" content="Hydie is a tool that helps you understand your development team's productivity and experience." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://hydie.wraithcode.io" />
    <meta property="og:site_name" content="Hydie" />
    <meta name="image" property="og:image" content="" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Hydie" />
    <meta name="twitter:description" content="Hydie is a tool that helps you understand your development team's productivity and experience." />
    <meta name="twitter:url" content="https://hydie.wraithcode.io" />
    <meta name="twitter:image" content="" />
</svelte:head>

<div class="app">
    {#if !data.redirect_to}
        <Header user={data.session.user} />
        <main class="main">
            {@render children()}
        </main>
    {/if}
</div>

<style lang="postcss">
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .main {
        flex: 1;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }
</style>
