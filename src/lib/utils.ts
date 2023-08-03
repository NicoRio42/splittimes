import { z } from 'zod';

export function formatDateForDateInput(date: Date): string {
	return `${date.getFullYear().toString()}-${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export function getDateFromSearchParams(searchParams: URLSearchParams): string {
	const dateSearch = searchParams.get('date');
	const dateString = dateSearch ? dateSearch + 'T00:00:00Z' : new Date().toISOString();

	let datetime;
	try {
		datetime = z.string().datetime().parse(dateString);
	} catch (e) {
		return formatDateForDateInput(new Date());
	}

	return datetime.split('T')[0];
}

export const secondsToPrettyTime = (seconds: number) => {
	// Convert seconds in number format to string in HH:MM:SS string format
	let hours = Math.trunc(seconds / 3600);
	let remainingSeconds = seconds % 3600;
	let minutes = Math.trunc(remainingSeconds / 60);
	remainingSeconds = remainingSeconds % 60;
	if (hours === 0 && minutes === 0) {
		return String(remainingSeconds);
	} else if (hours === 0) {
		if (remainingSeconds < 10) {
			return String(minutes) + ':0' + String(remainingSeconds);
		} else {
			return String(minutes) + ':' + String(remainingSeconds);
		}
	} else if (minutes < 10) {
		return String(hours) + ':0' + String(minutes) + ':' + String(remainingSeconds);
	}
	return String(hours) + ':' + String(minutes) + ':' + String(remainingSeconds);
};

export const rankToCSSClass = (rank: number) => {
	if (rank === 1) {
		return 'first';
	} else if (rank === 2) {
		return 'second';
	} else if (rank === 3) {
		return 'third';
	}

	return '';
};

export function addAlpha(color: string, opacity: number) {
	if (!color.startsWith('#')) throw new Error('Hexadecimal color should start with #');
	if (color.length !== 7 && color.length !== 9)
		throw new Error('Hexadecimal color should be 7 or 9 characters long');

	const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
	return color.slice(0, 7) + _opacity.toString(16).toUpperCase();
}

export function addSearchParamsToURL(url: URL, name: string, value: string): string {
	const newURL = new URL(url);
	newURL.searchParams.set(name, value);
	return newURL.search;
}

export function deleteSearchParamsToURL(url: URL, name: string): string {
	const newURL = new URL(url);
	newURL.searchParams.delete(name);
	return newURL.search;
}