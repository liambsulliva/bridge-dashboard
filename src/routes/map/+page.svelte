<script lang="ts">
	import { signLibrary, type Sign } from '$lib/stores/signLibrary';
	import { onMount } from 'svelte';

	let canvas: HTMLDivElement;
	let isPanning = $state(false);
	let startX = $state(0);
	let startY = $state(0);
	let translateX = $state(0);
	let translateY = $state(0);
	let scale = $state(1);

	//! MAX WORDS FOR GAMIFICATION METER
	const MAX_WORDS = 100;

	let unlockedWordsCount = $derived.by(() => {
		const library = $signLibrary;
		return Object.values(library).filter((sign) => sign.type === 'word').length;
	});

	let unlockedPercentage = $derived(Math.min((unlockedWordsCount / MAX_WORDS) * 100, 100));

	// Semantic clustering of word signs with connections
	const semanticGroups = {
		greetings: { words: ['hello', 'goodbye', 'welcome'], color: '#FF6B6B', name: 'Greetings' },
		politeness: {
			words: ['please', 'thank-you', 'thanks', 'sorry'],
			color: '#4ECDC4',
			name: 'Politeness'
		},
		social: { words: ['friend', 'family', 'love'], color: '#95E1D3', name: 'Social' },
		emotions: {
			words: ['happy', 'sad', 'good', 'bad', 'nice'],
			color: '#FFE66D',
			name: 'Emotions'
		},
		pronouns: { words: ['you', 'me', 'we'], color: '#A8E6CF', name: 'Pronouns' },
		actions: { words: ['meet', 'help'], color: '#C7CEEA', name: 'Actions' },
		responses: { words: ['yes', 'no'], color: '#FFDFD3', name: 'Responses' }
	};

	// Define which categories connect to each other
	const connections = [
		['greetings', 'politeness'],
		['greetings', 'social'],
		['politeness', 'social'],
		['social', 'emotions'],
		['emotions', 'pronouns'],
		['pronouns', 'actions'],
		['actions', 'social'],
		['responses', 'politeness'],
		['responses', 'actions']
	];

	interface SignNode extends Sign {
		x: number;
		y: number;
		color: string;
		category: string;
	}

	let signNodes = $derived.by(() => {
		const library = $signLibrary;
		const wordSigns = Object.values(library).filter((sign) => sign.type === 'word');

		const nodes: SignNode[] = [];
		const groupKeys = Object.keys(semanticGroups);
		const centerX = 0;
		const centerY = 0;
		const clusterRadius = 350;
		const signSpacing = 120;

		groupKeys.forEach((key, clusterIndex) => {
			const group = semanticGroups[key as keyof typeof semanticGroups];
			const signs = wordSigns.filter((sign) => group.words.includes(sign.char));

			if (signs.length === 0) return;

			const clusterAngle = (clusterIndex / groupKeys.length) * 2 * Math.PI;
			const clusterX = centerX + clusterRadius * Math.cos(clusterAngle);
			const clusterY = centerY + clusterRadius * Math.sin(clusterAngle);

			signs.forEach((sign, signIndex) => {
				const angle = (signIndex / signs.length) * 2 * Math.PI;
				const x = clusterX + signSpacing * Math.cos(angle);
				const y = clusterY + signSpacing * Math.sin(angle);

				nodes.push({
					...sign,
					x,
					y,
					color: group.color,
					category: key
				});
			});
		});

		return nodes;
	});

	let nodeConnections = $derived.by(() => {
		const conns: Array<{ from: SignNode; to: SignNode; color: string }> = [];

		connections.forEach(([cat1, cat2]) => {
			const nodes1 = signNodes.filter((n) => n.category === cat1);
			const nodes2 = signNodes.filter((n) => n.category === cat2);

			if (nodes1.length > 0 && nodes2.length > 0) {
				conns.push({
					from: nodes1[0],
					to: nodes2[0],
					color: nodes1[0].color
				});
			}
		});

		return conns;
	});

	function handleMouseDown(e: MouseEvent) {
		isPanning = true;
		startX = e.clientX - translateX;
		startY = e.clientY - translateY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isPanning) return;
		translateX = e.clientX - startX;
		translateY = e.clientY - startY;
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY * -0.001;
		const newScale = Math.min(Math.max(0.5, scale + delta), 3);
		scale = newScale;
	}

	onMount(() => {
		if (canvas) {
			const rect = canvas.getBoundingClientRect();
			translateX = rect.width / 2;
			translateY = rect.height / 2;
		}
	});
</script>

<svelte:head>
	<title>ASL Sign Map</title>
	<meta name="description" content="Semantic map of ASL word signs" />
</svelte:head>

<div class="map-container">
	<div class="controls">
		<div class="unlocked-meter">
			<div class="meter-header">
				<span class="meter-title">Unlocked Words</span>
				<span class="meter-count">{unlockedWordsCount}/{MAX_WORDS}</span>
			</div>
			<div class="meter-bar">
				<div class="meter-fill" style="width: {unlockedPercentage}%"></div>
			</div>
			<span class="meter-percentage">{unlockedPercentage.toFixed(1)}%</span>
		</div>
		<div class="control-buttons">
			<button
				class="icon-btn"
				onclick={() => (scale = Math.min(3, scale + 0.2))}
				aria-label="Zoom In"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<circle cx="10" cy="10" r="9" stroke="#505050" stroke-width="2" />
					<line
						x1="10"
						y1="6"
						x2="10"
						y2="14"
						stroke="#505050"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<line
						x1="6"
						y1="10"
						x2="14"
						y2="10"
						stroke="#505050"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
			<button
				class="icon-btn"
				onclick={() => (scale = Math.max(0.5, scale - 0.2))}
				aria-label="Zoom Out"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<circle cx="10" cy="10" r="9" stroke="#505050" stroke-width="2" />
					<line
						x1="6"
						y1="10"
						x2="14"
						y2="10"
						stroke="#505050"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="canvas"
		role="application"
		aria-label="Pannable and zoomable sign map"
		tabindex="0"
		bind:this={canvas}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		onwheel={handleWheel}
	>
		<div
			class="content"
			style="transform: translate({translateX}px, {translateY}px) scale({scale})"
		>
			<svg
				class="connections-svg"
				style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible;"
			>
				{#each nodeConnections as conn}
					<line
						x1={conn.from.x}
						y1={conn.from.y}
						x2={conn.to.x}
						y2={conn.to.y}
						stroke={conn.color}
						stroke-width="2"
						opacity="0.3"
					/>
				{/each}
			</svg>

			{#each signNodes as node}
				<div
					class="sign-card"
					style="left: {node.x}px; top: {node.y}px; border-color: {node.color};"
				>
					<img src={node.path} alt={node.alt} />
					<span class="sign-label">{node.char}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="legend">
		<h4>Categories</h4>
		<div class="legend-items">
			{#each Object.entries(semanticGroups) as [key, group]}
				<div class="legend-item">
					<div class="legend-color" style="background-color: {group.color}"></div>
					<span>{group.name}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.map-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		position: relative;
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem;
		flex-shrink: 0;
	}

	.unlocked-meter {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		min-width: 333px;
	}

	.meter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.meter-title {
		font-weight: 600;
		font-size: 0.9rem;
		color: #333;
	}

	.meter-count {
		font-size: 0.85rem;
		color: #666;
		font-weight: 500;
	}

	.meter-bar {
		width: 100%;
		height: 20px;
		background-color: #e0e0e0;
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.meter-fill {
		height: 100%;
		background: linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%);
		border-radius: 10px;
		transition: width 0.3s ease;
		box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
	}

	.meter-percentage {
		font-size: 0.75rem;
		color: #666;
		text-align: right;
		display: block;
	}

	.control-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.control-buttons button {
		padding: 0.5rem 1rem;
		background-color: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.control-buttons button:hover {
		background-color: #f0f0f0;
		border-color: #999;
	}

	.canvas {
		flex: 1;
		position: relative;
		overflow: hidden;
		cursor: grab;
	}

	.canvas:active {
		cursor: grabbing;
	}

	.content {
		position: absolute;
		transform-origin: 0 0;
		transition: transform 0.05s linear;
		width: 100%;
		height: 100%;
	}

	.connections-svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.sign-card {
		position: absolute;
		transform: translate(-50%, -50%);
		background: white;
		border-radius: 12px;
		padding: 0.75rem;
		border: 4px solid;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		min-width: 110px;
		transition: all 0.2s;
		cursor: pointer;
	}

	.sign-card:hover {
		transform: translate(-50%, -50%) scale(1.15);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
		z-index: 10;
	}

	.sign-card img {
		width: 80px;
		height: 80px;
		object-fit: contain;
		border-radius: 4px;
	}

	.sign-label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
		text-align: center;
	}

	.legend {
		position: absolute;
		bottom: 5rem;
		left: 1rem;
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 100;
	}

	.legend h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.legend-color {
		width: 20px;
		height: 20px;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.unlocked-meter {
			min-width: auto;
			width: 100%;
		}

		.legend {
			bottom: 0.5rem;
			left: 0.5rem;
			padding: 0.5rem;
			font-size: 0.8rem;
		}

		.sign-card img {
			width: 60px;
			height: 60px;
		}
	}
</style>
