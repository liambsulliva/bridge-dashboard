import { json } from '@sveltejs/kit';
import fs from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY || ''
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { word } = await request.json();

		if (!word || typeof word !== 'string') {
			console.log('Invalid word parameter:', word);
			return json({ error: 'Invalid word parameter' }, { status: 400 });
		}

		const sanitizedWord = word.toLowerCase().replace(/[^a-z-]/g, '');
		if (!sanitizedWord) {
			console.log('Sanitized word empty for input:', word);
			return json({ error: 'Invalid word format' }, { status: 400 });
		}

		console.log('[STEP] Generating ASL sign image for:', sanitizedWord);

		// Compose the prompt dynamically based on the word
		const prompt = `
American Sign Language (ASL) sign for the word "${word}", in a black and white illustrative style with a clear hand gesture on a white background. Do not display any text in the final result.
`;

		console.log('[STEP] Prompt sent to OpenAI:', prompt);

		const result = await openai.images.generate({
			model: 'gpt-image-1',
			prompt,
			size: '1024x1024',
			n: 1
		});

		console.log('[STEP] Raw OpenAI image result:', !!result && result.data && result.data[0]);

		const image_base64 = result.data?.[0]?.b64_json;
		if (!image_base64) {
			console.log('No image base64 returned.');
			return json({ error: 'No image base64 returned from OpenAI' }, { status: 500 });
		}

		// Transform base64 into Buffer
		const image_bytes = Buffer.from(image_base64, 'base64');
		console.log('[STEP] Image bytes length:', image_bytes.length);

		// Save to src/lib/images/signs/${sanitizedWord}.png
		const imagePath = join(process.cwd(), 'src', 'lib', 'images', 'signs', `${sanitizedWord}.png`);
		fs.writeFileSync(imagePath, image_bytes);

		console.log(`[STEP] Successfully saved image to: ${imagePath}`);

		return json({
			success: true,
			word: sanitizedWord,
			path: `/src/lib/images/signs/${sanitizedWord}.png`
		});
	} catch (error) {
		console.error('Error generating sign:', error);
		return json(
			{
				error: 'Failed to generate sign image',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
