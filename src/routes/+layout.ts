import type { LayoutLoad } from './$types';
import { auth } from '$lib/state/auth.svelte';

export const load: LayoutLoad = async ({ data }) => {
    if (data?.user) {
        auth.set_user(data.user);
    }
    return data;
}; 