<template>
	<div class = 'card_list' ref = 'dom'>
		<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
			<div v-for = 'i in cards' :key = 'i'>
				<img :src = 'mainGame.get.card(i).pic'/>
			</div>
		</TransitionGroup>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, TransitionGroup } from 'vue';
	import mainGame from '../../script/game';
	const dom = ref<HTMLElement | null>(null);

	const props = defineProps(['cards']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	.card_list {	
		position: fixed;
		right: 0;
		top: 0;
		width: 7vw;
		min-width: 50px;
		height: 100vh;
		.list {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			gap: 10px;
			background-color: rgba(0, 0, 0, 0.5);
			border: 1px white solid;
			color: white;
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