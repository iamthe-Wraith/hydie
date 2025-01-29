import type { ServerLoad } from '@sveltejs/kit';

export interface IPageData {
    title: string;
    description: string;
}

export const load: ServerLoad = async () => {
    // Simulate a delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        data: {
            title: 'Welcome to my app',
            description: 'This is just a test'
        } as IPageData
    };
};
