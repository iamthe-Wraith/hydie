import { CodeReviewsService } from "$lib/services/code-reviews";
import { ApiError } from "$lib/utils/api-error";
import { ApiResponse } from "$lib/utils/api-response";
import { fail, json } from "@sveltejs/kit";

export const POST = async () => {
    try {
        const code_review_service = new CodeReviewsService();
        const data = await code_review_service.sync();

        return json(data);
    } catch (err: unknown) {
        const response = new ApiResponse({ errors: ApiError.parse(err) });
        return fail(response.status_code, { errors: response.errors });
    }
};