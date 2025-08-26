<template>
	<motion.div class = 'body' ref = 'body'>
		<AnimatePresence>
			<motion.img
				ref = 'pic1'
				id = 'pic1'
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				:style = "{ '--y' : `${position.height * 0.1}px`, '--x' : `${position.width * 0}px` }"
				v-if = 'position.height > 0 && position.width > 0'
				:src = 'url'
			/>
		</AnimatePresence>
		<AnimatePresence>
			<motion.img
				ref = 'pic2'
				id = 'pic2'
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				:style = "{ '--y' : `${position.height * 0.3}px`, '--x' : `${position.width * -0.3}px` }"
				v-if = 'position.height > 0 && position.width > 0'
				:src = 'url'
			/>
		</AnimatePresence>
		
	</motion.div>
</template>
<script setup lang="ts">
	import { ref, onMounted, Ref, watch, Reactive, reactive } from "vue";
	import * as path from '@tauri-apps/api/path';

	import { motion, AnimatePresence } from "motion-v";

	import fs from "../script/fs";
	// import { pos, posLike, Compoute } from "../script/position";
	import pos, { posLike } from "../script/position";
	import gsap from '../script/gsap'

	const pic1 : Ref<HTMLElement | null> = ref(null);
	const pic2 : Ref<HTMLElement | null> = ref(null);
	const body : Ref<HTMLElement | null> = ref(null);

	let position : Reactive<posLike> = reactive({
		bottom : 0,
		height : 0,
		left : 0,
		right : 0,
		top : 0,
		width : 0,
		x : 0,
		y : 0
	});

	let url : Ref<string> = ref('');

	onMounted(async () : Promise<void> => {
		// await (new Promise(resolve => setTimeout(resolve, 500)));
		pos.reactive.get(position, body.value!);
		const file = await path.join('textures', 'card.jpg')
		if (await fs.exists(file))
			url.value = await fs.read.picture(file) ?? '';
	});



	const animation = async () : Promise<void> => {
		pos.reactive.get(position, body.value!);
		gsap.attack(30, { element : pic1.value!, selector : '#pic1' }, { element : pic2.value!, selector : '#pic2' })
	}

	watch(pic1, (n) : void => {
		if (n === null) return;
		animation();
	});

</script>
<style scoped lang = 'scss'>
	@use '../style/animation.scss';
</style>