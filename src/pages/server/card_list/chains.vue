<template>
	<div class = 'chain_list' ref = 'dom'>
		<TransitionGroup tag = 'div' name = 'move_up'>
			<div
				v-for = '(i, v) in cards' :key = 'i.code'
				:style = "{ '--color' : i.player ===  0 ? 'blue' : 'red' }"
			>
				{{ mainGame.get.text(I18N_KEYS.DUEL_CHAIN) }} : {{ v }}
				<img :src = 'mainGame.get.card(i.code).pic'/>
			</div>
		</TransitionGroup>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, TransitionGroup, reactive, watch } from 'vue';
	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	const dom = ref<HTMLElement | null>(null);
	
	const props = defineProps(['cards']);

	watch(() => { return props.cards; }, () => {
		if (dom.value)
			dom.value.children[0].scrollTop = dom.value.children[0].scrollHeight
	});

	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	.chain_list {	
		position: fixed;
		right: 0;
		top: 0;
		width: 7vw;
		min-width: 50px;
		height: var(--vh);
		> div {
			scroll-behavior: smooth;
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			gap: 10px;
			background-color: rgba(0, 0, 0, 0.5);
			border: 1px white solid;
			color: white;
			> div {
				transition: all 0.15s ease;
				width: 100%;
				margin-left: 10%;
				background: linear-gradient(to right, var(--color), transparent);
				img {
					width: 80%;
				}
			}
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}

	.move_up {
		&-enter-active,
		&-leave-active {
			transition: transform 0.2s ease;
		}

		&-enter-from,
		&-leave-to {
			transform: translateY(var(--vh));
		}

		&-enter-to,
		&-leave-from {
			transform: translateY(0%);
		}
	}
</style>