<template>
	<div class = 'main'>
		<starry-sky :stars-count = '1500' :distance = '800' id = 'back'/>
		<div class = 'body'>
			<AnimatePresence :initial = 'false'>
				<Menu
					:initial = '{ opacity: 0 }'
					:animate = '{ opacity: 1 }'
					:exit = '{ opacity: 0 }'
					v-if = 'page.show.menu'
				>
				</Menu>
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
	import { ref, reactive, onMounted, onUnmounted, Ref, watch } from "vue";
	import { AnimatePresence } from "motion-v";

	import Menu from './pages/menu.vue';
	import Animation from './pages/animation.vue';

	let page = reactive({
		show : {
			menu : false
		}
	});

	onMounted(async () => {
		await (new Promise(resolve => setTimeout(resolve, 500)));
		page.show.menu = true;
	});

</script>
<style scoped lang = 'scss'> 
	.main {
		overflow: hidden;
		.body {
			height: 97vh;
			width: 100vw;
			display: flex;
		}
		#back {
			background: linear-gradient(#1c1a2e, #2f2434);
		}
	}

</style>