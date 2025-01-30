import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const token = await prisma.accessToken.findFirst({
        where: {
            user_id: locals.user.id,
            token_type: 'PERSONAL'
        }
    });

    return json({ token: token?.token || null });
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
        return new Response('Token is required', { status: 400 });
    }

    // Delete any existing personal tokens for this user
    await prisma.accessToken.deleteMany({
        where: {
            user_id: locals.user.id,
            token_type: 'PERSONAL'
        }
    });

    // Create new personal token
    const access_token = await prisma.accessToken.create({
        data: {
            token,
            token_type: 'PERSONAL',
            user_id: locals.user.id
        }
    });

    return json({ success: true, token: access_token.token });
}; 