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
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch, ref } from 'vue';

	interface VarCountdown extends HTMLElement {
		start : Function;
		pause : Function;
	}

	const countdown = ref<VarCountdown | null>(null);
	const page = reactive({
		lp : {
			from : 0,
			to : 0,
		},
		time : 0
	});
	defineExpose({ countdown });

	const props = defineProps(['src', 'name', 'lp', 'color', 'position', 'time', 'time_player', 'tp']);

	watch(() => { return props.lp; }, (n) => {
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
	}
	.avatar_self {
		bottom: 10px;
		left: 10px;
		background: linear-gradient(to right, red, transparent);
	}
	.avatar_oppo {
		top: 10px;
		right: 10px;
		background: linear-gradient(to left, blue, transparent);
		flex-direction: row-reverse;
		.text{
			display: flex;
			justify-content: right;
		}
	}
</style>