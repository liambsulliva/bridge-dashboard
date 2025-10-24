<script lang="ts">
	let text = $state('');
	let { onSubmit } = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (onSubmit) {
			onSubmit(text);
		}
	}
</script>

<form onsubmit={handleSubmit} class="flex w-full gap-2.5">
	<input
		type="text"
		bind:value={text}
		placeholder="Type text to convert to ASL..."
		class="flex-1 rounded border-2 border-gray-300 p-3 text-base focus:border-orange-500 focus:outline-none"
	/>
	<button
		type="submit"
		class="cursor-pointer rounded border-none bg-orange-500 px-6 py-3 text-base text-white transition-colors hover:bg-orange-600"
		>Convert to ASL</button
	>
</form>
