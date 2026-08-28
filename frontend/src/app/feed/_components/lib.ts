import {
	type SearchParams,
} from "@/schemas/schema";

export function buildSearchParams({ q, page, types, tags }: SearchParams) {
	const params = new URLSearchParams();
	if (q) params.set("q", q);
	if (page && page !== 1) params.set("page", String(page));
	if (types?.length) params.set("types", types.join(","));
	if (tags?.length) params.set("tags", tags.join(","));
	return params;
};