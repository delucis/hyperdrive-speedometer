export const showDigits = (num: number, digits = 2) => num.toFixed(digits);

export const displayTime = (num: number) =>
	num > 850 ? `${showDigits(num / 1000, 2)}s` : `${showDigits(num, 0)}ms`;

export const displayDate = (timestamp: number) =>
	new Date(timestamp).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: '2-digit',
	});
