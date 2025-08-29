<template>
	<motion.div class = 'menu'>
		<div class = 'content'>
			<span class = 'title'>{{ constant.str.title }}</span>
			<div class = 'list'>
				<AnimatePresence :initial = 'false' v-for = '(i, v) in mainGame.getText().menu'>
					<motion.span
						:whileHover="{ scale: 1.1 }"
						:whilePress="{ scale: 0.8 }"
						class = 'item'
						@click = 'select(v)'
					>
						{{ i }}
					</motion.span>
				</AnimatePresence>
			</div>
		</div>
	</motion.div>
</template>
<script setup lang = 'ts'>
	import { motion, AnimatePresence } from 'motion-v';

	import constant from '../script/constant';
	import mainGame from '../script/game';

	const props = defineProps(['select']);
	const select = async (v : number) : Promise<void> => {
		switch (v) {
			case 2:
				props.select.deck();
				break;
			case 4:
				await mainGame.exit();
				break;
		}
	}

</script>
<style scoped lang = 'scss'>
	@use '../style/menu.scss';
</style>