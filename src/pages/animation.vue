<template>
	<div class = 'body' ref = 'body'>
		<AnimatePresence>
			<motion.img
				ref = 'picI'
				id = 'picI'
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				:style = "{ '--y' : `${position.height * 0.5}px`, '--x' : `${position.width * -0.3}px` }"
				v-if = 'position.height > 0 && position.width > 0 && animation.show'
				:src = 'url.I'
			/>
		</AnimatePresence>
		<AnimatePresence>
			<motion.img
				ref = 'picII'
				id = 'picII'
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				:style = "{ '--y' : `${position.height * 0.1}px`, '--x' : `${position.width * 0.1}px` }"
				v-if = 'position.height > 0 && position.width > 0 && animation.show'
				:src = 'url.II'
			/>
		</AnimatePresence>
	</div>
</template>
<script setup lang="ts">
	import { ref, onMounted, Ref, watch, Reactive, reactive } from "vue";
	import * as path from '@tauri-apps/api/path';

	import { motion, AnimatePresence } from "motion-v";

	import fs from "../script/fs";
	import pos, { posLike } from "../script/position";
	import gsap from '../script/gsap'

	const picI : Ref<HTMLElement | null> = ref(null);
	const picII : Ref<HTMLElement | null> = ref(null);
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

	let url = reactive({
		I : '',
		II : ''
	})

	let animation = reactive({
		on : async () : Promise<void> => {
			animation.count = animation.count > 0 ? 0 : 1;
			const kill = async () : Promise<void> => {
				animation.show = false;
				await (new Promise(resolve => setTimeout(resolve, 200)));
				tl.kill()
			}
			const tl = animation.count > 0 ? gsap.attack(100, { element : picI.value!, selector : '#picI', angle : 0 }, { element : picII.value!, selector : '#picII', angle : 180 }, kill) : gsap.attack(100, { element : picII.value!, selector : '#picII', angle : 180 }, { element : picI.value!, selector : '#picI', angle : 0 }, kill);
		},
		show : true,
		count : 0
	});

	onMounted(async () : Promise<void> => {
		pos.reactive.get(position, body.value!);
		const fileI = await path.join('textures', 'cardI.jpg')
		const fileII = await path.join('textures', 'cardII.jpg')
		if (await fs.exists(fileI))
			url.I = await fs.read.picture(fileI) ?? '';
		if (await fs.exists(fileII))
			url.II = await fs.read.picture(fileII) ?? '';
	});

	watch(picI, (n) : void => {
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