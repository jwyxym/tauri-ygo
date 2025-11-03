<template>
	<div class = 'card_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			{{ title }}
			<var-switch v-model = 'page.show'/>
		</div>
		<var-checkbox-group v-model = 'page.selects'>
			<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
				<div v-for = '(i, v) in cards' :key = 'i' class = 'pics'>
					<img :src = 'mainGame.get.card(i).pic' @click = 'page.select(v)'/>
					<var-checkbox :checked-value = 'v'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<Button_List :confirm = 'page.confirm' :cancel = 'page.cancel' class = 'button_list'/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup } from 'vue';
	import mainGame from '../../script/game';

	import Button_List from '../varlet/button_list.vue';

	const page = reactive({
		selects : [] as Array<number>,
		show : true,
		confirm : () => {

		},
		cancel : () => {

		},
		select : (v : number) => {
			page.selects.includes(v) ? (() => {
				const ct = page.selects.findIndex(i => i === v);
				if (ct > -1)
					page.selects.splice(ct, 1)
			})() : page.selects.push(v);
		}
	});

	const dom = ref<HTMLElement | null>(null);

	const props = defineProps(['cards', 'title']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	.card_list {
		--height: min(250px, 50vh);
		--width: 50vw;
		position: fixed;
		left: 0;
		bottom: 5px;
		margin-left: 25vw;
		width:  var(--width);
		height: var(--height);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		z-index: 10;
		color: white;
		transition: all 0.15s ease;
		.title {
			width:  var(--width);
			height: 20px;
			display: flex;
			gap: 5px;
		}
		.list {
			width:  var(--width);
			height: calc(var(--height) - min(32px, 8vh) - 35px);
			display: flex;
			overflow-x: auto;
			overflow-y: hidden;
			gap: 2vh;
			flex-wrap: nowrap;
			background-color: rgba(0, 0, 0, 0.5);
			border: 1px white solid;
			.pics {
				height: 100%;
				aspect-ratio: 1 / 1.45;
				position: relative;
				img {
					position: absolute;
					margin-top: 5%;
					height: 100%;
					&:hover {
						cursor: pointer;
					}
				}
			}
			&::-webkit-scrollbar {
				opacity: 0;
				height: 10px;
			}
			&::-webkit-scrollbar-thumb {
				background: #c1c1c1;
				border: 2px solid white;
				border-radius: 8px;
			}
		}
		.button_list {
			width: 25%;
		}
	}
	.unshow {
		transform: translateY(calc(100% - 20px));
	}
</style>