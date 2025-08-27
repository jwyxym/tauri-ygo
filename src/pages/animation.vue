<template>
	<motion.div class = 'body' ref = 'body'>
		<AnimatePresence>
			<motion.img
				ref = 'pic1'
				id = 'pic1'
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				:style = "{ '--y' : `${position.height * 0.5}px`, '--x' : `${position.width * 0.1}px` }"
				v-if = 'position.height > 0 && position.width > 0 && animation.show'
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
				:style = "{ '--y' : `${position.height * 0.1}px`, '--x' : `${position.width * 0.3}px` }"
				v-if = 'position.height > 0 && position.width > 0 && animation.show'
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

	let animation = reactive({
		on : async () : Promise<void> => {
			pos.reactive.get(position, body.value!);
			animation.count = animation.count > 0 ? 0 : 1;
			const kill = () => {
				animation.show = false;
				tl.kill()
			}
			console.log(animation.count)
			const tl = animation.count > 0 ? gsap.attack(100, { element : pic1.value!, selector : '#pic1', angle : 0 }, { element : pic2.value!, selector : '#pic2', angle : 0 }, kill) : gsap.attack(100, { element : pic2.value!, selector : '#pic2', angle : 180 }, { element : pic1.value!, selector : '#pic1', angle : 0 }, kill);
		},
		show : true,
		count : 0
	});

	onMounted(async () : Promise<void> => {
		// await (new Promise(resolve => setTimeout(resolve, 500)));
		pos.reactive.get(position, body.value!);
		const file = await path.join('textures', 'card.jpg')
		if (await fs.exists(file))
			url.value = await fs.read.picture(file) ?? '';
	});

	watch(pic1, (n) : void => {
		if (n === null) return;
		animation.on();
	});

	watch(() => { return animation.show; }, async (n) : Promise<void> => {
		if (n) return;
		await (new Promise(resolve => setTimeout(resolve, 500)));
		animation.show = !n;
	});

</script>
<style scoped lang = 'scss'>
	@use '../style/animation.scss';
</style>