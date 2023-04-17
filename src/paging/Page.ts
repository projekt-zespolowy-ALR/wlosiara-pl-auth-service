import PageMeta from "./PageMeta.js";

class Page<T> {
	public readonly data!: T[];

	public readonly meta!: PageMeta;
}

export default Page;
