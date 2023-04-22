import PageMeta from "./PageMeta.js";
import {plainToClass} from "class-transformer";

class Page<T> {
	public readonly items!: T[];

	public readonly meta!: PageMeta;

	public map<U>(mapper: (item: T) => U): Page<U> {
		return plainToClass(Page, {
			items: this.items.map(mapper),
			meta: this.meta,
		}) as Page<U>;
	}
}

export default Page;
