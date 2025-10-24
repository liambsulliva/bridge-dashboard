<script lang="ts">
	import TextInput from './TextInput.svelte';
	import SignDisplay from './SignDisplay.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';

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
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcomeFallback} alt="Welcome" />
			</picture>
		</span>
	</h1>

	<!-- PROJ COMPONENTS -->
	<SignDisplay text={submittedText} />
	<TextInput onSubmit={handleTextSubmit} />
	<!-- --------------- -->
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
