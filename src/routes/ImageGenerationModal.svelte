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
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-800">Generate ASL Sign</h2>
				{#if queueTotal > 1}
					<span class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
						{queuePosition} of {queueTotal}
					</span>
				{/if}
			</div>

			<p class="mb-6 text-gray-600">
				The word "<span class="font-bold text-yellow-600">{missingWord}</span>" doesn't have an
				image yet. Would you like to generate an image using ChatGPT?
			</p>

			<div class="flex justify-end gap-3">
				<button
					onclick={handleNo}
					class="rounded border-2 border-gray-300 bg-white px-6 py-2 text-base font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-50"
				>
					No
				</button>
				<button
					onclick={handleYes}
					class="rounded border-none bg-yellow-400 px-6 py-2 text-base font-medium text-white transition-colors hover:cursor-pointer hover:bg-yellow-500"
				>
					Yes, Generate
				</button>
			</div>
		</div>
	</div>
{/if}
