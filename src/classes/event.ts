import type { Categories, EventData } from '@/types.ts';

export class Event<Category extends Categories = Categories> {
	private eventData: EventData<Category>;

	constructor(commandData: EventData<Category>) {
		this.eventData = commandData;
	}

	public get category() {
		return this.eventData.category;
	}

	public get once() {
		return this.eventData.once ?? false;
	}

	public get disabled() {
		return this.eventData.disabled ?? false;
	}

	public get execute() {
		return this.eventData.execute;
	}
}