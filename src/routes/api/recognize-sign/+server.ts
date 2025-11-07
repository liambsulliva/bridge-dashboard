import { json } from '@sveltejs/kit';
import fs from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import sharp from 'sharp';

const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY || ''
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get('image') as File;

		if (!imageFile || !imageFile.type.startsWith('image/')) {
			return json({ error: 'Invalid image file' }, { status: 400 });
		}

		console.log('[STEP] Processing uploaded image:', imageFile.name);

		// Convert the file to a buffer
		const arrayBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Convert image to base64 for OpenAI Vision API
		const base64Image = buffer.toString('base64');
		const mimeType = imageFile.type;

		console.log('[STEP] Analyzing image with OpenAI Vision API...');

		// Use OpenAI Vision API to recognize the ASL sign
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: 'What word or letter does this American Sign Language (ASL) sign represent? Respond with only the word or letter in lowercase, nothing else. If it shows multiple letters spelling a word, return the word. If you cannot identify it with confidence, respond with "unknown".'
						},
						{
							type: 'image_url',
							image_url: {
								url: `data:${mimeType};base64,${base64Image}`
							}
						}
					]
				}
			],
			max_tokens: 50
		});

		const recognizedText = response.choices[0]?.message?.content?.trim().toLowerCase();

		if (!recognizedText || recognizedText === 'unknown') {
			console.log('[STEP] Could not recognize ASL sign from image');
			return json({ error: 'Could not recognize the ASL sign from the image' }, { status: 400 });
		}

		// Sanitize the recognized word/letter
		const sanitizedWord = recognizedText.replace(/[^a-z-]/g, '');
		if (!sanitizedWord) {
			console.log('[STEP] Invalid word format after sanitization:', recognizedText);
			return json({ error: 'Invalid word format recognized' }, { status: 400 });
		}

		console.log('[STEP] Recognized ASL sign as:', sanitizedWord);

		// Convert image to PNG and save to signs folder
		const imagePath = join(process.cwd(), 'src', 'lib', 'images', 'signs', `${sanitizedWord}.png`);

		// Use sharp to convert and optimize the image
		await sharp(buffer)
			.png()
			.resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
			.toFile(imagePath);

		console.log(`[STEP] Successfully saved image to: ${imagePath}`);

		return json({
			success: true,
			word: sanitizedWord,
			path: `/src/lib/images/signs/${sanitizedWord}.png`
		});
	} catch (error) {
		console.error('Error recognizing sign:', error);
		return json(
			{
				error: 'Failed to recognize sign image',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
