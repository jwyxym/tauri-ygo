<template>
	<div class = 'loading'>
		<var-loading/>
		<span v-show = 'all > 0'>{{ Math.min((now / all) * 100, 99.99).toFixed(2) }}%</span>
	</div>
</template>
<script setup lang = 'ts'>
	defineProps(['now', 'all']);
</script>
<style scoped lang = 'scss'>
	.loading {
		color: white;
		position: fixed;
		right: 0;
		bottom: 0;
		transform: translate(-10px, -10px);
		min-width: calc(var(--vw) * 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100px;
		span {
			font-size: max(2.5vh, 12px);
		}
	}
</style>