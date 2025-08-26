<template>
	<div class = 'menu'>
		<div class = 'content'>
			<AnimatePresence :initial = 'false'>
				<motion.span
					:initial="{ opacity: 0 }"
					:animate="{ opacity: 1 }"
					:exit="{ opacity: 0 }"
					class = 'version'
					v-if = 'show'
				>
					{{ constant.str.version }}
				</motion.span>
			</AnimatePresence>
			<div class = 'titles'>
				<AnimatePresence :initial = 'false' v-for = 'i in constant.str.menu'>
					<motion.span
						:whileHover="{ scale: 1.1 }"
						:whilePress="{ scale: 0.8 }"
						:initial = "{ opacity: 0 }"
						:animate = "{ opacity: 1 }"
						:exit = "{ opacity: 0 }"
						class = 'title'
						v-if = 'show'
					>
						{{ i }}
					</motion.span>
				</AnimatePresence>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { defineProps } from "vue";
	import {motion, AnimatePresence} from "motion-v";

	import constant from "../script/constant";

	defineProps(['show']);
</script>
<style scoped lang = 'scss'>
	@use '../style/menu.scss';
</style>