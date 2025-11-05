<script lang="ts">
	let text = $state('');
	let { onSubmit, isGenerating = false } = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (onSubmit && !isGenerating) {
			onSubmit(text);
		}
	}
</script>

<form onsubmit={handleSubmit} class="flex w-full gap-2.5">
	<input
		type="text"
		bind:value={text}
		placeholder="Type text to convert to ASL..."
		disabled={isGenerating}
		class="flex-1 rounded border-2 border-gray-300 p-3 text-base focus:border-yellow-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
	/>
	<div class="relative">
		<button
			type="submit"
			disabled={isGenerating}
			class="cursor-pointer rounded border-none bg-yellow-400 px-6 py-3 text-base text-white transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
			>Convert to ASL</button
		>
		{#if isGenerating}
			<div
				class="bg-opacity-90 absolute inset-0 flex items-center justify-center rounded bg-yellow-400"
			>
				<svg class="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24">
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
			</div>
		{/if}
	</div>
</form>
