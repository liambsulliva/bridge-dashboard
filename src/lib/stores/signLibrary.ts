import { writable } from 'svelte/store';

export interface Sign {
	char: string;
	path: string;
	alt?: string;
}

export interface SignLibrary {
	[key: string]: Sign;
}

// Grab all signs and import w/ vite glob
const signImages = import.meta.glob('$lib/images/signs/*.png', {
	eager: true,
	import: 'default'
});

// Generate signage library w/ function
function createInitialLibrary(): SignLibrary {
	const library: SignLibrary = {};

	// For loop iterates from a => z
	for (let i = 0; i < 26; i++) {
		const char = String.fromCharCode(97 + i); // UTF-16
		const imagePath = signImages[`/src/lib/images/signs/${char}.png`];

		library[char] = {
			char,
			path: (imagePath as string) || `/signs/${char}.png`,
			alt: `ASL sign for ${char.toUpperCase()}`
		};
	}

	return library;
}

export const signLibrary = writable<SignLibrary>(createInitialLibrary());

// Convert char => sign
export function getSign(char: string): Sign | null {
	let library: SignLibrary = {};
	signLibrary.subscribe((value) => (library = value))();

	const normalizedChar = char.toLowerCase();
	return library[normalizedChar] || null;
}

// Convert string => signs with functional transforms
export function getSigns(text: string): Sign[] {
	let library: SignLibrary;
	signLibrary.subscribe((value) => (library = value))();

	return text
		.toLowerCase()
		.split('')
		.filter((char) => /[a-z]/.test(char))
		.map((char) => library[char])
		.filter((sign) => sign !== undefined);
}
