// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { PrismaClient } from '@prisma/client';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				github_id: string;
				username: string;
				email?: string | null;
				avatar_url?: string | null;
				name?: string | null;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	const prisma: PrismaClient;
}

export {};
