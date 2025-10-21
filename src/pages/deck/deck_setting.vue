<template>
	<div class = 'deck_setting' ref = 'dom'>
		<Input
			:placeholder = 'mainGame.get.text().deck.name'
			:rules = 'deck.name_rule'
			:variant = 'true'
			v-model = 'deck.name'
		/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onUnmounted, onMounted } from 'vue';
	import mainGame from '../../script/game';
	import Input from '../varlet/input.vue';

	const dom = ref<HTMLElement | null>(null);
	const props = defineProps(['deck', 'except', 'unshow']);

	const page = {
		click : (e : MouseEvent) => {
			if (dom.value && !dom.value.contains(e.target as HTMLElement)
				&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(e.target as HTMLElement)) === -1
				&& !(e.target as HTMLElement).classList.contains('var-icon-close-circle')
			)
				props.unshow();
		},
		keydown : (e : KeyboardEvent) => {
			if (e.key === 'Escape')
				props.unshow();
		}
	};

	defineExpose({
		dom
	});

	onMounted(() => {
		document.addEventListener('click', page.click);
		window.addEventListener('keydown', page.keydown);
	});

	onUnmounted(() => {
		document.removeEventListener('click', page.click);
		window.removeEventListener('keydown', page.keydown);
	});
</script>
<style lang = 'scss'>
	.deck_setting {
		position: fixed;
		right: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		width: 40vw;
		height: 80px;
		gap: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
		overflow-y: auto;
		border-radius: 10px;
		.var-input {
			transform: translate(10px, 15px);
			width: calc(90% - 10px);
		}
	}
</style>