<script lang="ts">
    import type { IPageData } from './+page.server';
    
    export let data: { data: IPageData };
</script>

<div class="content">
    <h1>{data.data.title}</h1>
    <p>{data.data.description}</p>
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
    }
</style>
