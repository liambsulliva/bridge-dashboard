<script lang="ts">
	import { reloadWordSign } from '$lib/stores/signLibrary';

	let { onUploadSuccess } = $props<{
		onUploadSuccess?: (word: string) => void;
	}>();

	let isDragging = $state(false);
	let isUploading = $state(false);
	let errorMessage = $state('');
	let fileInput: HTMLInputElement;

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) {
			errorMessage = 'Please upload an image file (PNG, JPG, JPEG, or WEBP)';
			return;
		}

		errorMessage = '';
		isUploading = true;

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('/api/recognize-sign', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to recognize sign');
			}

			console.log('Successfully recognized sign:', data.word);

			// Reload the word sign in the library
			await reloadWordSign(data.word);

			// Notify parent component
			if (onUploadSuccess) {
				onUploadSuccess(data.word);
			}

			errorMessage = '';
		} catch (error) {
			console.error('Error uploading sign:', error);
			errorMessage =
				error instanceof Error ? error.message : 'Failed to upload and recognize the sign';
		} finally {
			isUploading = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function openFileDialog() {
		fileInput?.click();
	}
</script>

<div class="upload-container">
	<div
		class="upload-zone"
		class:dragging={isDragging}
		class:uploading={isUploading}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		onclick={openFileDialog}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
	>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/png,image/jpeg,image/jpg,image/webp"
			onchange={handleFileInput}
			style="display: none;"
		/>

		{#if isUploading}
			<div class="upload-content">
				<svg class="spinner" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
						fill="none"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				<p class="upload-text">Recognizing sign...</p>
			</div>
		{:else}
			<div class="upload-content">
				<svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				<p class="upload-text">
					<span class="upload-text-primary">Drop an ASL sign image here</span>
					<span class="upload-text-secondary">or click to browse</span>
				</p>
				<p class="upload-hint">PNG, JPG, JPEG, or WEBP</p>
			</div>
		{/if}
	</div>

	{#if errorMessage}
		<div class="error-message">
			{errorMessage}
		</div>
	{/if}
</div>

<style>
	.upload-container {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.upload-zone {
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background-color: #f9fafb;
	}

	.upload-zone:hover {
		border-color: #fbbf24;
		background-color: #fffbeb;
	}

	.upload-zone.dragging {
		border-color: #fbbf24;
		background-color: #fef3c7;
		transform: scale(1.02);
	}

	.upload-zone.uploading {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.upload-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.upload-icon {
		width: 3rem;
		height: 3rem;
		color: #9ca3af;
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		color: #fbbf24;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.upload-text {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.upload-text-primary {
		font-size: 1rem;
		font-weight: 500;
		color: #374151;
	}

	.upload-text-secondary {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.upload-hint {
		margin: 0;
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.error-message {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.375rem;
		color: #dc2626;
		font-size: 0.875rem;
		text-align: center;
	}

	@media (max-width: 640px) {
		.upload-zone {
			padding: 1.5rem;
		}

		.upload-icon,
		.spinner {
			width: 2.5rem;
			height: 2.5rem;
		}

		.upload-text-primary {
			font-size: 0.875rem;
		}

		.upload-text-secondary {
			font-size: 0.8125rem;
		}
	}
</style>
