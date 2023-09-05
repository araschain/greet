export function currentDate() {
	const dateNow = new Date();

	return {
		dateTime: dateNow.toLocaleDateString(),
		timeDate: dateNow.toLocaleTimeString(),
	};
}