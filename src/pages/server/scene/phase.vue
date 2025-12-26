<template>
	<transition name = 'move_in'>
		<div
			class = 'phase font-title'
			:class = "{ 'oppo' : page.player === 0, 'self' : page.player === 1 }"
			v-if = 'page.show'
		>
			{{ page.text }}
		</div>
	</transition>
</template>
<script setup lang = 'ts'>
	import { onBeforeMount, reactive } from 'vue';
	import mainGame from '../../../script/game';
	import { PHASE } from '../post/network';
	import { I18N_KEYS } from '../../../script/language/i18n';

	const page = reactive({
		player : 0,
		text : '',
		show : false
	});

	const phase = {
		map : new Map([
			[PHASE.NONE, mainGame.get.text(I18N_KEYS.DUEL_PHASE_NEW)],
			[PHASE.DRAW, mainGame.get.text(I18N_KEYS.DUEL_PHASE_DRAW)],
			[PHASE.STANDBY, mainGame.get.text(I18N_KEYS.DUEL_PHASE_STANDBY)],
			[PHASE.MAIN1, mainGame.get.text(I18N_KEYS.DUEL_PHASE_MAIN1)],
			[PHASE.BATTLE_START, mainGame.get.text(I18N_KEYS.DUEL_PHASE_BATTLE)],
			[PHASE.MAIN2, mainGame.get.text(I18N_KEYS.DUEL_PHASE_MAIN2)],
			[PHASE.END, mainGame.get.text(I18N_KEYS.DUEL_PHASE_END)],
		]),
		on : async (tp : number, text : number) : Promise<void> => {
			page.player = tp;
			page.text = phase.map.get(text) ?? '';
			page.show = true;
			await mainGame.sleep(400);
			page.show = false;
		}
	};

	onBeforeMount(() => {
		emit('update:phase', phase);
	});

	const emit = defineEmits(['update:phase']);

</script>
<style scoped lang = 'scss'>
	.phase {
		width: var(--vw);
		color: white;
		position: fixed;
		left: 50%;
		top: 50%;
		font-size: min(20vh, 102px);
		transform: translate(-50%, -50%);
		z-index: 10;
		display: grid;
		justify-content: center;
		justify-items: center;
		align-content: center;
		align-items: center;
	}

	.self {
		background: linear-gradient(to right, red, transparent);
	}

	.oppo {
		background: linear-gradient(to right, blue, transparent);
	}

	.move_in {
		&-enter-active,
		&-leave-active {
			transition: transform 0.2s ease;
		}

		&-enter-from {
			transform: translate(-200vw, -50%);
		}

		&-leave-to {
			transform: translate(200vw, -50%);
		}

		&-enter-to,
		&-leave-from {
			transform: translate(-50%, -50%);
		}
	}
</style>