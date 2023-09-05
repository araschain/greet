import { currentDate } from '@/utils/time.ts';
import colors from 'ansi-colors';

const date = currentDate();

export class Logger {
	private title: string;

	constructor(title: string) {
		this.title = title;
	}

	public info(...message: unknown[]) {
		console.log(`${colors.cyan(`[${date.dateTime}] [${date.timeDate}]`)} (${this.title}) ${colors.gray('(Info)')} - ${message}`);
	}

	public warn(...message: unknown[]) {
		console.log(`${colors.cyan(`[${date.dateTime}] [${date.timeDate}]`)} (${this.title}) ${colors.redBright('(Warn)')}  - ${message}`);
	}

	public print(...message: unknown[]) {
		console.log(`${colors.cyan(`[${date.dateTime}] [${date.timeDate}]`)} (${this.title}) - ${message}`);
	}

	public json(message: object) {
		console.log(message);
	}
}