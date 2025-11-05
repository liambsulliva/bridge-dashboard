<script lang="ts">
	import TextInput from './TextInput.svelte';
	import SignDisplay from './SignDisplay.svelte';
	import ImageGenerationModal from './ImageGenerationModal.svelte';
	import { findAllMissingWords, reloadWordSign } from '$lib/stores/signLibrary';

	let submittedText = $state('');
	let pendingText = $state('');
	let isModalOpen = $state(false);
	let missingWord = $state('');
	let isGenerating = $state(false);
	let wordQueue = $state<string[]>([]);
	let originalQueueLength = $state(0);

	function handleTextSubmit(text: string) {
		// Call helper fn to check for missing words
		const missing = findAllMissingWords(text);

		if (missing.length > 0) {
			// Store the pending text and queue up all missing words for UI
			pendingText = text;
			wordQueue = [...missing];
			originalQueueLength = missing.length;
			// Show modal for the first missing word
			showNextModal();
		} else {
			// No missing words, just display normally
			submittedText = text;
		}
	}

	function showNextModal() {
		if (wordQueue.length > 0) {
			missingWord = wordQueue[0];
			isModalOpen = true;
		} else {
			// Queue is empty, display the text
			submittedText = pendingText;
		}
	}

	// Calculate current position in queue (for UI display)
	function getQueuePosition(): number {
		return originalQueueLength - wordQueue.length + 1;
	}

	async function handleYes(word: string) {
		// Close modal and start loading state while server queries image-gen-1-mini
		isModalOpen = false;
		isGenerating = true;

		try {
			const response = await fetch('/api/generate-sign', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ word })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate sign');
			}

			// Reload word sign on separate call to avoid blocking UI
			await reloadWordSign(word);

			// Remove this word from the queue and show next modal
			wordQueue = wordQueue.slice(1);
			showNextModal();
		} catch (error) {
			console.error('Error generating sign:', error);
			alert(`Failed to generate sign for "${word}". Please try again.`);
			// Even on error, move to next word
			wordQueue = wordQueue.slice(1);
			showNextModal();
		} finally {
			isGenerating = false;
		}
	}

	function handleNo() {
		// Close modal and move to next word in queue if it exists (word will be fingerspelled)
		isModalOpen = false;
		wordQueue = wordQueue.slice(1);
		showNextModal();
	}
</script>

<svelte:head>
	<title>ASL Demo</title>
	<meta name="description" content="BRIDGE Project Dashboard - Built for FACETLab" />
</svelte:head>

<section>
	<SignDisplay text={submittedText} />
	<TextInput onSubmit={handleTextSubmit} {isGenerating} />
</section>

<ImageGenerationModal
	isOpen={isModalOpen}
	{missingWord}
	queuePosition={getQueuePosition()}
	queueTotal={originalQueueLength}
	onYes={handleYes}
	onNo={handleNo}
/>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
</style>
