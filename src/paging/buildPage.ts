import {plainToClass} from "class-transformer";
import Page from "./Page.js";
import type PageMeta from "./PageMeta.js";

export default function buildPage<T>({
	items,
	totalItemsCount,
	skip,
	take,
}: {
	items: readonly T[];
	totalItemsCount: number;
	skip: number;
	take: number;
}): Page<T> {
	const pageMeta: Readonly<PageMeta> = {
		totalItemsCount,
		pageItemsCount: items.length,
		skip,
		take,
	};

	const page: Page<T> = plainToClass(Page, {
		meta: pageMeta,
		items,
	}) as Page<T>;

	return page;
}
