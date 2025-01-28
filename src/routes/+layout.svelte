<script lang="ts">
    import '../styles.css';
	import type { Snippet } from 'svelte';

    let {
        children
    }: {
        children: Snippet;
    } = $props();
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

{@render children()}
