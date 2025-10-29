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
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch } from 'vue';

	const page = reactive({
		lp : {
			from : 0,
			to : 0,
		}
	});

	const props = defineProps(['src', 'name', 'lp', 'color', 'position']);

	watch(() => { return props.lp; }, (n) => {
		page.lp.from = page.lp.to;
		page.lp.to = n;
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
			--count-to-text-font-size: max(1.5vh, 12px);
			font-size: max(1.5vh, 12px);
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