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
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, onBeforeMount } from "vue";
	import { AnimatePresence } from "motion-v";

	import Menu from './pages/menu.vue';
	import Animation from './pages/animation.vue';
	import mainGame from './script/game';

	let page = reactive({
		show : {
			menu : false
		}
	});

	onMounted(async () => {
		await mainGame.init();
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
<style lang = 'scss'>
	.Vue-Toastification__toast--default {
		background: rgba(255, 255, 255, 0.3) !important;
		border: 2px solid rgba($color: #1976d2, $alpha: 0.5) !important;
		backdrop-filter: blur(10px) !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
	.Vue-Toastification__toast--info {
		background: rgba(255, 255, 255, 0.3) !important;
		border: 2px solid rgba($color: #2196f3, $alpha: 0.5) !important;
		backdrop-filter: blur(10px) !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
	.Vue-Toastification__toast--success {
		background: rgba(255, 255, 255, 0.3) !important;
		border: 2px solid rgba($color: #4caf50, $alpha: 0.5) !important;
		backdrop-filter: blur(10px) !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
	.Vue-Toastification__toast--error {
		background: rgba(255, 255, 255, 0.3) !important;
		border: 2px solid rgba($color: #ff5252, $alpha: 0.5) !important;
		backdrop-filter: blur(10px) !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
	.Vue-Toastification__toast--warning {
		background: rgba(255, 255, 255, 0.3) !important;
		border: 2px solid rgba($color: #ffc107, $alpha: 0.5) !important;
		backdrop-filter: blur(10px) !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
	}
</style>