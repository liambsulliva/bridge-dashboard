<script lang="ts">
	import { getSigns } from '$lib/stores/signLibrary';
	import type { Sign } from '$lib/stores/signLibrary';

	let { text = '' } = $props();

	// Convert input string to arr of signs w/ store fn
	let signs = $derived<Sign[]>(text ? getSigns(text) : []);

	// Group signs into words (separated by spaces)
	let wordGroups = $derived.by<Sign[][]>(() => {
		const groups: Sign[][] = [];
		let currentGroup: Sign[] = [];

		for (const sign of signs) {
			if (sign.char === ' ') {
				if (currentGroup.length > 0) {
					groups.push(currentGroup);
					currentGroup = [];
				}
			} else {
				currentGroup.push(sign);
			}
		}

		// Push the last group if it exists
		if (currentGroup.length > 0) {
			groups.push(currentGroup);
		}

		return groups;
	});
</script>

<div class="mb-8 sm:mb-12">
	{#if signs.length > 0}
		<div
			class="flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
		>
			{#each wordGroups as group, groupIdx (groupIdx)}
				<div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
					{#each group as sign, i (sign.char + i + groupIdx)}
						{#if sign.type === 'word'}
							<!-- Word-level sign (larger, distinct styling, may be AI generated) -->
							<div class="flex flex-col items-center gap-1">
								<img
									src={sign.path}
									alt={sign.alt || `ASL sign for ${sign.char}`}
									class="h-24 w-24 rounded bg-gray-100 object-contain p-2 shadow-md ring-2 ring-yellow-400 sm:h-28 sm:w-28"
								/>
								<span class="text-sm font-bold text-yellow-700 sm:text-base"
									>{sign.char.toUpperCase()}</span
								>
							</div>
						{:else}
							<!-- Letter-level sign (fingerspelling) -->
							<div class="flex flex-col items-center gap-1">
								<img
									src={sign.path}
									alt={sign.alt || `ASL sign for ${sign.char}`}
									class="h-16 w-16 rounded bg-white object-contain p-1 shadow-sm sm:h-20 sm:w-20"
								/>
								<span class="text-xs font-bold text-gray-800 sm:text-sm"
									>{sign.char.toUpperCase()}</span
								>
							</div>
						{/if}
					{/each}
				</div>
				{#if groupIdx < wordGroups.length - 1}
					<div class="h-px w-full bg-gray-300 sm:mx-2 sm:h-auto sm:w-px sm:self-stretch"></div>
				{/if}
			{/each}
		</div>
	{:else}
		<p class="text-center text-2xl max-sm:mx-2 sm:text-4xl">
			What would you like to translate today?
		</p>
	{/if}
</div>
