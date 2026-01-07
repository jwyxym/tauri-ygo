<template>
	<div class = 'avator' :class = "{ 'avatar_oppo' : position === 'oppo', 'avatar_self' : position === 'self' }">
		<var-avatar :src = 'src' :bordered = 'true' :border-color = "position === 'oppo' ? 'red' : 'blue'"/>
		<div class = 'text'>
			<div class = 'name_lp'>
				<strong>{{ name }}</strong>
				<div class = 'lp'>
					<strong>LP</strong>
					<span>:</span>
					<var-count-to :from = 'page.lp.from' :to = 'page.lp.to' :duration = '300'/>
					<strong>Time</strong>
					<span>:</span>
					<var-countdown
						:auto-start = 'false'
						:time = 'page.time'
						format = 'ss'
						ref = 'countdown'
					/>
				</div>
			</div>
		</div>
		<strong :class = "{ 'damage_show' : page.lp.show, 'damage_move' : page.lp.move }">{{ page.lp.damage }}</strong>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch, ref } from 'vue';
	import mainGame from '@/script/game';

	interface VarCountdown extends HTMLElement {
		start : Function;
		pause : Function;
	}

	const countdown = ref<VarCountdown | null>(null);
	const page = reactive({
		lp : {
			from : 0,
			to : 0,
			damage : 0,
			show : false,
			move : false,
		},
		time : 0
	});
	defineExpose({ countdown });

	const props = defineProps(['src', 'name', 'lp', 'color', 'position', 'time', 'time_player', 'tp']);

	watch(() => { return props.lp; }, async (n) => {
		page.lp.damage = page.lp.to - n;
		page.lp.move = page.lp.damage > 0;
		if (page.lp.move) {
			await mainGame.sleep(150);
			page.lp.show = page.lp.move;
			await mainGame.sleep(150);
			page.lp.move = false;
			await mainGame.sleep(150);
			page.lp.show = false;
		}
		page.lp.damage = 0;
		page.lp.from = page.lp.to;
		page.lp.to = n;
	}, { immediate : true });

	watch(() => { return props.time; }, (n) => {
		page.time = n;
	}, { immediate : true });

	watch(() => { return props.time_player; }, (n) => {
		if (!countdown.value) return;
		props.tp === n ? countdown.value.start() : countdown.value.pause();
	}, { immediate : true });

</script>
<style scoped lang = 'scss'>
	.avator {
		pointer-events: none;
		position: fixed;
		display: flex;
		gap: 10px;
		width: 25vw;
		max-width: 250px;
		height: 60px;
		z-index: 10;
		.var-avatar {
			transform: translateY(5px);
			width: 50px;
			height: 50px;
		}
		.text {
			width: calc(20vw - 50px);
			white-space: nowrap;
			color: white;
			--count-to-text-color: white !important;
			--countdown-text-color: white !important;
			font-size: max(1.5vh, 12px);
			--count-to-text-font-size: max(1.5vh, 12px);
			--countdown-text-font-size: max(1.5vh, 12px);
			transform: translateY(5px);
			gap: 10px;
			width: calc(100% - 48px);
			.name_lp {
				display: flex;
				flex-direction: column;
				gap: 10px;
				.lp {
					display: flex;
					gap: 3px;
				}
			}
		}
		> strong {
			color: white;
			font-size: 16px;
			position: absolute;
			left: 0;
			top: 0;
			opacity: 0;
			transition: all 0.15s ease;
		}
	}
	.avatar_self {
		bottom: 10px;
		left: 10px;
		background: linear-gradient(to right, blue, transparent);
		> strong {
			transform: translate(60px, 30px);
		}
		.damage_move {
			transform: translate(60px, -30px) !important;
		}
	}
	.avatar_oppo {
		top: 10px;
		right: 10px;
		background: linear-gradient(to left, red, transparent);
		flex-direction: row-reverse;
		.text{
			display: flex;
			justify-content: right;
		}
		> strong {
			transform: translate(100px, 30px);
		}
		.damage_move {
			transform: translate(100px, 60px) !important;
		}
	}
	.damage_show {
		opacity: 1 !important;
	}
</style>