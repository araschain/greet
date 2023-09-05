export function regex(regxp: RegExp, message: string) {
	return regxp.test(message);
}