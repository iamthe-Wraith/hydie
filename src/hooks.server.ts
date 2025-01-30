import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');
    
    if (session) {
        try {
            const session_data = JSON.parse(session);
            event.locals.user = session_data.user;
        } catch {
            event.locals.user = null;
        }
    }

    return await resolve(event);
}; 