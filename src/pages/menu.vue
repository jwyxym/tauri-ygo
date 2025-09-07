<template>
	<div class = 'menu'>
		<div class = 'content'>
			<span class = 'title' ref = 'title'>{{ constant.str.title }}</span>
			<div class = 'list'>
				<!-- <AnimatePresence :initial = 'false' v-for = '(i, v) in mainGame.get.text().menu'>
					<motion.span
						:whileHover = '{ scale: 1.1 }'
						:whilePress = '{ scale: 0.8 }'
						class = 'item'
						@click = 'select(v)'
					>
						{{ i }}
					</motion.span>
				</AnimatePresence> -->
				<span
					class = 'item'
					ref = 'item'
					v-for = '(i, v) in mainGame.get.text().menu'
					@click = 'select(v)'
				>
					{{ i }}
				</span>
			</div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, watch, reactive, onMounted } from "vue";
	import { motion, AnimatePresence } from 'motion-v';

	import constant from '../script/constant';
	import mainGame from '../script/game';
	import gsap from '../script/gsap';

	const props = defineProps(['select']);

	const title : Ref<HTMLElement | null> = ref(null);
	const item : Ref<Array<HTMLElement> | null> = ref(null);

	const select = async (v : number) : Promise<void> => {
		const array = [title.value!, ...item.value!]
		const leave = async () : Promise<void> => {
			switch (v) {
				case 2:
					props.select.deck();
					break;
				case 4:
					await mainGame.exit();
					break;
			}
		};
		v += 1;
		gsap.move_left({ selector : array[v] });
		for (let i = 1; i < array.length; i++) {
			let chk = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			if (array[v + i] != undefined) {
				gsap.move_left({ selector : array[v + i] });
				chk = true;
			}
			if (v - i >= 0 && array[v - i] != undefined) {
				gsap.move_left({ selector : array[v - i] });
				chk = true;
			}
			if (!chk)
				break;
		}
		await (new Promise(resolve => setTimeout(resolve, 200)));
		v -= 1;
		leave();
	}

	onMounted(async () : Promise<void>=> {
		const array = [title.value!, ...item.value!]
		const v = 0;
		for (let i = 0; i < array.length; i++) {
			await (new Promise(resolve => setTimeout(resolve, 200)));
			if (array[v + i] != undefined) {
				array[v + i]!.style.display = 'block';
				gsap.from_left({ selector : array[v + i]! });
			}
		}
	})

</script>
<style scoped lang = 'scss'>
	@use '../style/menu.scss';
</style>