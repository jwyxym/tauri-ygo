<template>
	<div class = 'title'>
		<AnimatePresence :initial = 'false'>

		</AnimatePresence>
	</div>
</template>
<script setup lang="ts">
	import { defineProps, reactive, onMounted } from "vue";
	import {motion, AnimatePresence} from "motion-v";

	defineProps(['show']);

</script>
<style scoped lang = 'scss'>
	@use '../style/title.scss';
</style>