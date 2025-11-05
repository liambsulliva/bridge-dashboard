<script lang="ts">
	//import { reloadWordSign } from '$lib/stores/signLibrary';

	let {
		isOpen = false,
		missingWord = '',
		queuePosition = 1,
		queueTotal = 1,
		onYes,
		onNo
	} = $props();

	function handleYes() {
		if (onYes) {
			onYes(missingWord);
		}
	}

	function handleNo() {
		if (onNo) {
			onNo();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleNo();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleNo();
		}
	}
</script>

{#if isOpen && missingWord}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6">
			<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 class="text-xl font-bold text-gray-800 sm:text-2xl">Generate ASL Sign</h2>
				{#if queueTotal > 1}
					<span
						class="w-fit rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700"
					>
						{queuePosition} of {queueTotal}
					</span>
				{/if}
			</div>

			<p class="mb-6 text-sm text-gray-600 sm:text-base">
				The word "<span class="font-bold text-yellow-600">{missingWord}</span>" doesn't have an
				image yet. Would you like to generate an image using ChatGPT?
			</p>

			<div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<button
					onclick={handleNo}
					class="w-full rounded border-2 border-gray-300 bg-white px-6 py-2 text-base font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-50 sm:w-auto"
				>
					No
				</button>
				<button
					onclick={handleYes}
					class="w-full rounded border-none bg-yellow-400 px-6 py-2 text-base font-medium text-white transition-colors hover:cursor-pointer hover:bg-yellow-500 sm:w-auto"
				>
					Yes, Generate
				</button>
			</div>
		</div>
	</div>
{/if}
