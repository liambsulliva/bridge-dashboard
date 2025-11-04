<script lang="ts">
	import TextInput from './TextInput.svelte';
	import SignDisplay from './SignDisplay.svelte';

	let submittedText = $state('');

	function handleTextSubmit(text: string) {
		submittedText = text;
	}
</script>

<svelte:head>
	<title>ASL Demo</title>
	<meta name="description" content="BRIDGE Project Dashboard - Built for FACETLab" />
</svelte:head>

<section>
	<SignDisplay text={submittedText} />
	<TextInput onSubmit={handleTextSubmit} />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
