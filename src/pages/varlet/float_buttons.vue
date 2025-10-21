<template>
	<div ref = 'dom' class = 'float_button_list'>
		<transition name = 'scale' v-for = 'i in list'>
			<Button
				@click = 'i.click'
				:icon_name = 'i.icon'
				v-show = 'i.show'
			></Button>
		</transition>
	</div>
</template>
<script setup lang = 'ts'>
	import { Ref, ref } from 'vue';
	import Button from'./button.vue';

	const dom : Ref<HTMLElement | null> = ref(null);

	defineExpose({
		dom
	});
	defineProps(['list']);
</script>
<style scoped lang = 'scss'>
	.float_button_list {
		position: absolute;
		display: flex;
		flex-direction: row-reverse;
		gap: 10px;
		right: 20px;
		bottom: 20px;
		z-index: 1;
	}
</style>