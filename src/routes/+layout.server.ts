import type { LayoutServerLoad } from './$types';
import type { IAuthSession } from '$lib/types/auth';

export const load: LayoutServerLoad = async ({ cookies, url, locals }) => {
    const session_cookie = cookies.get('session');
    let session: IAuthSession = {
        user: null,
        is_authenticated: false
    };

    if (session_cookie) {
        try {
            session = JSON.parse(session_cookie);
        } catch {
            cookies.delete('session', { path: '/' });
        }
    }

    // Redirect to login if not authenticated and not already on login page
    if (!session.is_authenticated && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/auth')) {
        return {
            session,
            redirect_to: '/login'
        };
    }

    // Redirect to home if authenticated and on login page
    if (session.is_authenticated && url.pathname.startsWith('/login')) {
        return {
            session,
            redirect_to: '/'
        };
    }

    return {
        session,
        user: locals.user
    };
}; 
