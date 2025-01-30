import type { IGithubUser } from '$lib/types/github';

class AuthState {
    user: IGithubUser | null = $state(null);

    set_user(new_user: IGithubUser | null) {
        this.user = new_user;
    }

    clear_user() {
        this.user = null;
    }

    get is_authenticated() {
        return this.user !== null;
    }
}

export const auth = new AuthState(); 
