import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { token, org_id, org_name } = await request.json();

    console.log(token, org_id, org_name);

    if (!token || !org_id || !org_name) {
        return new Response('Token, organization ID, and name are required', { status: 400 });
    }

    // Delete any existing token for this organization
    await prisma.accessToken.deleteMany({
        where: {
            user_id: locals.user.id,
            token_type: 'ORGANIZATION',
            org_id: org_id.toString()
        }
    });

    // Create new organization token
    const access_token = await prisma.accessToken.create({
        data: {
            token,
            token_type: 'ORGANIZATION',
            user_id: locals.user.id,
            org_id: org_id.toString(),
            org_name
        }
    });

    return json({ success: true, token: access_token.token });
}; 