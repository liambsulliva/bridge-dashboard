import { writable } from 'svelte/store';
import nlp from 'compromise';

export interface Sign {
	char: string;
	path: string;
	alt?: string;
	type: 'letter' | 'word';
}

export interface SignLibrary {
	[key: string]: Sign;
}

// Base dictionary of important words that should always have dedicated signs
// Mostly prepositions, pronouns, and common turns of phrase
const BASE_WORD_DICTIONARY = new Set([
	'hello',
	'goodbye',
	'please',
	'thank-you',
	'thanks',
	'yes',
	'no',
	'help',
	'sorry',
	'welcome',
	'love',
	'friend',
	'family',
	'good',
	'bad',
	'happy',
	'sad',
	'nice',
	'meet',
	'you',
	'me',
	'we'
]);

// Type declarations for 'compromise' library
interface CompromiseMatch {
	text(): string;
}

// Extract content words using NLP (compromise)
function extractContentWords(text: string): Set<string> {
	const doc = nlp(text);
	const contentWords = new Set<string>();
	const wordPattern = /^[a-z]+(?:-[a-z]+)?$/;

	doc.nouns().forEach((noun: CompromiseMatch) => {
		const word = noun.text().toLowerCase().trim();
		if (word && wordPattern?.test(word)) {
			contentWords.add(word);
			console.log('Extracted noun:', word);
		}
	});

	doc.verbs().forEach((verb: CompromiseMatch) => {
		const word = verb.text().toLowerCase().trim();
		if (word && wordPattern?.test(word)) {
			contentWords.add(word);
			console.log('Extracted verb:', word);
		}
	});

	doc.adjectives().forEach((adj: CompromiseMatch) => {
		const word = adj.text().toLowerCase().trim();
		if (word && wordPattern?.test(word)) {
			contentWords.add(word);
			console.log('Extracted adjective:', word);
		}
	});

	doc.adverbs().forEach((adv: CompromiseMatch) => {
		const word = adv.text().toLowerCase().trim();
		if (word && wordPattern?.test(word)) {
			contentWords.add(word);
			console.log('Extracted adverb:', word);
		}
	});

	return contentWords;
}

function getWordDictionary(text: string): Set<string> {
	const contentWords = extractContentWords(text);
	return new Set([...BASE_WORD_DICTIONARY, ...contentWords]);
}

// Grab all signs and import w/ vite glob
const signImages = import.meta.glob('$lib/images/signs/*.png', {
	eager: true,
	import: 'default'
});

// Generate signage library w/ function
function createInitialLibrary(): SignLibrary {
	const library: SignLibrary = {};

	// Load letter signs (a => z)
	for (let i = 0; i < 26; i++) {
		const char = String.fromCharCode(97 + i); // UTF-16
		const imagePath = signImages[`/src/lib/images/signs/${char}.png`];

		library[char] = {
			char,
			path: (imagePath as string) || `/signs/${char}.png`,
			alt: `ASL sign for ${char.toUpperCase()}`,
			type: 'letter'
		};
	}

	// Load word-level signs from the base dictionary
	BASE_WORD_DICTIONARY.forEach((word) => {
		const imagePath = signImages[`/src/lib/images/signs/${word}.png`];
		if (imagePath) {
			library[word] = {
				char: word,
				path: imagePath as string,
				alt: `ASL sign for ${word}`,
				type: 'word'
			};
		}
	});

	return library;
}

export const signLibrary = writable<SignLibrary>(createInitialLibrary());

// Reload a specific word sign from the filesystem (after generation or upload)
export async function reloadWordSign(word: string): Promise<void> {
	const normalizedWord = word.toLowerCase();

	// Dynamically import the new image
	try {
		const imagePath = await import(`$lib/images/signs/${normalizedWord}.png`);

		signLibrary.update((library) => {
			// Determine if this is a single letter or a word
			const isLetter = normalizedWord.length === 1 && /[a-z]/.test(normalizedWord);

			library[normalizedWord] = {
				char: normalizedWord,
				path: imagePath.default,
				alt: `ASL sign for ${normalizedWord}`,
				type: isLetter ? 'letter' : 'word'
			};
			return library;
		});
	} catch (error) {
		console.error(`Failed to reload sign for word: ${normalizedWord}`, error);
	}
}

// Check if a specific word is missing an image
// If text arg is provided, use NLP to determine if word is a content word (noun, verb, adjective, adverb)
export function isWordMissing(word: string, text?: string): boolean {
	let library: SignLibrary = {};
	signLibrary.subscribe((value) => (library = value))();

	const normalizedWord = word.toLowerCase();
	const wordDictionary = text ? getWordDictionary(text) : BASE_WORD_DICTIONARY;

	return wordDictionary.has(normalizedWord) && !library[normalizedWord];
}

// Find first missing word from input text
export function findMissingWord(text: string): string | null {
	let library: SignLibrary = {};
	signLibrary.subscribe((value) => (library = value))();

	const wordDictionary = getWordDictionary(text);
	const words = text.toLowerCase().match(/\b[a-z]+(?:-[a-z]+)?\b/g) || [];

	for (const word of words) {
		if (wordDictionary.has(word) && !library[word]) {
			return word;
		}
	}

	return null;
}

// Find all missing words from input text (unique, in order of appearance)
export function findAllMissingWords(text: string): string[] {
	let library: SignLibrary = {};
	signLibrary.subscribe((value) => (library = value))();

	const wordDictionary = getWordDictionary(text);
	const words = text.toLowerCase().match(/\b[a-z]+(?:-[a-z]+)?\b/g) || [];
	const missingWords: string[] = [];
	const seen = new Set<string>();

	for (const word of words) {
		if (wordDictionary.has(word) && !library[word] && !seen.has(word)) {
			missingWords.push(word);
			seen.add(word);
		}
	}

	return missingWords;
}

// Convert char => sign
export function getSign(char: string): Sign | null {
	let library: SignLibrary = {};
	signLibrary.subscribe((value) => (library = value))();

	const normalizedChar = char.toLowerCase();
	return library[normalizedChar] || null;
}

// Text => signs with functional transforms (word-based parsing)
export function getSigns(text: string): Sign[] {
	let library: SignLibrary;
	signLibrary.subscribe((value) => (library = value))();

	const signs: Sign[] = [];
	const words = text.toLowerCase().match(/\b[a-z]+(?:-[a-z]+)?\b/g) || [];

	words.forEach((word, wordIndex) => {
		// If word has dedicated sign we're gucci
		if (library[word] && library[word].type === 'word') {
			signs.push(library[word]);
		} else {
			// Otherwise, fingerspell on fallback :/
			const letters = word.split('').filter((char) => /[a-z]/.test(char));
			letters.forEach((char) => {
				if (library[char]) {
					signs.push(library[char]);
				}
			});
		}

		// Inject placeholder char for word separation
		if (wordIndex < words.length - 1) {
			signs.push({
				char: ' ',
				path: '',
				alt: 'Word separator',
				type: 'letter'
			});
		}
	});

	return signs.filter((sign) => sign !== undefined);
}
