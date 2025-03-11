import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { CodeReviewsService } from "$lib/services/code-reviews";
import { ApiError } from "$lib/utils/api-error";
import { ApiResponse } from "$lib/utils/api-response";

export const load: PageServerLoad = async () => {
    try {
        const code_review_service = new CodeReviewsService();
        const data = await code_review_service.get_synced_data();

        console.log('>>>>>> DATA: ', data);

        return data;
    } catch (err: unknown) {
        console.error('>>>>>> ERROR: ', err);
        const response = new ApiResponse({ errors: ApiError.parse(err) });
        return error(response.status_code, response.errors?.[0]?.message ?? 'An unknown error occurred');
    }
};