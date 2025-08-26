<template>
	<motion.div class = 'menu'>
		<div class = 'content'>
			<span class = 'title'>{{ constant.str.title }}</span>
			<div class = 'list'>
				<AnimatePresence :initial = 'false' v-for = 'i in constant.str.menu'>
					<motion.span
						:whileHover="{ scale: 1.1 }"
						:whilePress="{ scale: 0.8 }"
						class = 'item'
					>
						{{ i }}
					</motion.span>
				</AnimatePresence>
			</div>
		</div>
	</motion.div>
</template>
<script setup lang="ts">
	import { motion, AnimatePresence } from "motion-v";
	import constant from "../script/constant";
</script>
<style scoped lang = 'scss'>
	@use '../style/menu.scss';
</style>