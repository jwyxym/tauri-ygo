<template>
	<div class = 'card_list' ref = 'dom'>
		<span>{{ title }}</span>
		<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
			<div v-for = 'i in cards' :key = 'i'>
				<img :src = 'mainGame.get.card(i).pic'/>
			</div>
		</TransitionGroup>
	</div>
</template>
<script setup lang = 'ts'>
	import { watch, reactive, ref, TransitionGroup } from 'vue';
	import mainGame from '@/script/game';
	const dom = ref<HTMLElement | null>(null);

	const page = reactive({
		cards : [] as Array<number>
	});

	const props = defineProps(['cards', 'title']);

	watch(() => { return props.cards; }, async (n : Array<number>) => {
		for (const i of n.filter(i => !page.cards.includes(i))) {
			page.cards.splice(0, i);
			await mainGame.sleep(200);
		}
	}, { immediate : true });

	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	.card_list {	
		position: fixed;
		right: 0;
		top: 0;
		width: 7vw;
		min-width: 50px;
		height: var(--vh);
		color: white;
		.list {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			gap: 10px;
			background-color: rgba(0, 0, 0, 0.5);
			border: 1px white solid;
			div {
				transition: all 0.15s ease;
				width: 100%;
				margin-left: 10%;
				img {
					width: 80%;
				}
			}
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>