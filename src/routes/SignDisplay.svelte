<script lang="ts">
	import { getSigns } from '$lib/stores/signLibrary';
	import type { Sign } from '$lib/stores/signLibrary';

	let { text = '' } = $props();

	// Convert input string to arr of signs w/ store fn
	let signs = $derived<Sign[]>(text ? getSigns(text) : []);
</script>

<div class="mb-5 min-h-[150px] rounded-lg bg-gray-100 p-5">
	{#if signs.length > 0}
		<div class="flex flex-wrap justify-center gap-4">
			{#each signs as sign, i (sign.char + i)}
				{#if sign.char === ' '}
					<div class="mx-2 w-px self-stretch bg-gray-300"></div>
				{:else if sign.type === 'word'}
					<!-- Word-level sign (larger, distinct styling, may be AI generated) -->
					<div class="flex flex-col items-center gap-1">
						<img
							src={sign.path}
							alt={sign.alt || `ASL sign for ${sign.char}`}
							class="h-28 w-28 rounded bg-gradient-to-br from-yellow-50 to-yellow-100 object-contain p-2 shadow-md ring-2 ring-yellow-400"
						/>
						<span class="text-base font-bold text-yellow-700">{sign.char.toUpperCase()}</span>
					</div>
				{:else}
					<!-- Letter-level sign (fingerspelling) -->
					<div class="flex flex-col items-center gap-1">
						<img
							src={sign.path}
							alt={sign.alt || `ASL sign for ${sign.char}`}
							class="h-20 w-20 rounded bg-white object-contain p-1 shadow-sm"
						/>
						<span class="text-sm font-bold text-gray-800">{sign.char.toUpperCase()}</span>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<p class="my-12 text-center text-gray-500 italic">Enter text below to see ASL signs</p>
	{/if}
</div>
