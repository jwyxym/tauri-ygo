<template>
	<div class = 'deck_setting' ref = 'dom'>
		<Input
			:placeholder = 'mainGame.get.text(I18N_KEYS.DECK_NAME)'
			:rules = 'deck.name_rule'
			:variant = 'true'
			v-model = 'deck.name'
		/>
		<div class = 'btn'>
			<Button icon_name = 'save' @click = 'deck.save'></Button>
			<Button icon_name = 'share' @click = 'deck.copy'></Button>
			<Button icon_name = 'sort' @click = 'deck.sort'></Button>
			<Button icon_name = 'disrupt' @click = 'deck.disrupt'></Button>
			<Button icon_name = 'clear' @click = 'deck.clear'></Button>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onUnmounted, onMounted } from 'vue';
	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	import Input from '@/pages/ui/input.vue';
	import Button from '@/pages/ui/button.vue';

	const dom = ref<HTMLElement | null>(null);
	const props = defineProps(['deck', 'except', 'unshow']);

	const page = {
		click : (e : MouseEvent) => {
			if (dom.value && !dom.value.contains(e.target as HTMLElement)
				&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(e.target as HTMLElement)) === -1
				&& !(e.target as HTMLElement).classList.contains('var-icon-close-circle')
				&& !props.deck.show.setting.block
			)
				props.unshow();
		},
		keydown : (e : KeyboardEvent) => {
			if (e.key === 'Escape' && !props.deck.show.setting.block)
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
		right: 25vw;
		top: 25vh;
		width: 50vw;
		height: 50vh;
		display: flex;
		flex-direction: column;
		align-content: center;
		align-items: center;
		gap: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
		border-radius: 10px;
		.var-input {
			margin-top: 15px;
			width: 90%;
			height: 80px;
		}
		.btn {
			height: calc(100% - 115px);
			width: 90%;
			display: flex;
			gap: 10px;
			overflow-y: auto;
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>