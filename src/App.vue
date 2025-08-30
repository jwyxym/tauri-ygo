<template>
	<div class = 'main'>
		<starry-sky :stars-count = '1500' :distance = '800' id = 'back'/>
		<div class = 'body'>
			<AnimatePresence :initial = 'false'>
				<Deck
					:initial = '{ opacity: 0, scale: 0 }'
					:animate = '{ opacity: 1, scale: 1 }'
					:exit = '{ opacity: 0 }'
					v-if = 'page.show.deck'
					:select = 'page.select'
				></Deck>
			</AnimatePresence>
			<AnimatePresence :initial = 'false'>
				<Menu
					:initial = '{ opacity: 0, scale: 0 }'
					:animate = '{ opacity: 1, scale: 1 }'
					:exit = '{ opacity: 0 }'
					v-if = 'page.show.menu'
					:select = 'page.select'
				></Menu>
			</AnimatePresence>
			<AnimatePresence :initial = 'false'>
				<Animation
					:initial = '{ opacity: 0 }'
					:animate = '{ opacity: 1 }'
					:exit = '{ opacity: 0 }'
					v-if = 'page.show.menu'
				></Animation>
			</AnimatePresence>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, onBeforeMount } from "vue";
	import { AnimatePresence } from "motion-v";
	import { Dialog } from '@varlet/ui'

	import Menu from './pages/menu.vue';
	import Animation from './pages/animation.vue';
	import Deck from './pages/decklist.vue';

	import mainGame from './script/game';

	let page = reactive({
		show : {
			dialog : false,
			menu : false,
			deck : false
		},
		select : {
			menu : () : void => {
				page.show.deck = false;
				setTimeout(() => {
					page.show.menu = true;
				}, 400);
			},
			deck : () : void => {
				page.show.menu = false;
				setTimeout(() => {
					page.show.deck = true;
				}, 400);
			},
		}
	});

	onBeforeMount(async () => {
		await mainGame.init();
		page.show.menu = true;
		// page.show.dialog = !await mainGame.chk();
		// page.show.menu = !page.show.dialog;
		// if (page.show.dialog)
		// 	Dialog({
		// 		message : ,
		// 		dialogClass : 'ground_glass',
		// 		cancelButtonTextColor : 'white',
		// 		confirmButtonTextColor : 'white',
		// 		onConfirm : page.select.download,
		// 		onCancel : mainGame.exit
		// 	});
	});

</script>
<style scoped lang = 'scss'> 
	.main {
		overflow: hidden;
		.body {
			height: 97vh;
			width: 100vw;
			display: flex;
			justify-content: center;
		}
		#back {
			background: linear-gradient(#1c1a2e, #2f2434);
		}
	}

</style>
<style lang = 'scss'>
	@use './style/toast.scss';
    @use './style/ground_glass.scss';
	.var-icon {
		&:hover {
			cursor: pointer;
		}
	}
</style>