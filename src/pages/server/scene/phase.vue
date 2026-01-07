<template>
	<div
		class = 'phase font-title'
		:class = "{
			'oppo' : page.player === 0,
			'self' : page.player === 1,
			'show' : page.show
		}"
	>
		{{ page.text }}
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch } from 'vue';
	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	import { PHASE } from '@/pages/server/post/network';

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
			await mainGame.sleep(250);
			page.show = false;
		}
	};

	const props = defineProps(['phase']);

	watch(() => { return props.phase.phase; }, async () => {
		if (props.phase.player > -1 && props.phase.phase > -1)
			await phase.on(props.phase.player, props.phase.phase);
	});

</script>
<style scoped lang = 'scss'>
	.phase {
		width: 0;
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
		overflow-x: hidden;
		transition: all 0.15s ease;
	}
	.show {
		width: var(--vw) !important;
	}

	.self {
		background: linear-gradient(to right, red, transparent);
	}

	.oppo {
		background: linear-gradient(to right, blue, transparent);
	}
</style>