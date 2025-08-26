<template>
	<starry-sky :stars-count = '1200' :distance = '800' id = 'back'/>
	<div class = 'body'>
		<Menu :show = 'page.show.menu'></Menu>
		<Title :show = 'page.show.menu'></Title>
	</div>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, onUnmounted, Ref, watch } from "vue";

	import Menu from './pages/menu.vue';
	import Title from './pages/title.vue';

	let page = reactive({
		show : {
			menu : false
		}
	});

	onMounted(() => {
		page.show.menu = true;
	});

</script>
<style scoped lang = 'scss'> 
	#back {
		background: linear-gradient(#1c1a2e, #2f2434);
	}

	.body {
		height: 90vh;
		width: 100vw;
		display: flex;
	}
</style>