<template>
	<div class = 'select_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			{{ page.title }}
			<var-switch v-model = 'page.show'/>
		</div>
		<var-checkbox-group v-model = 'page.selects' :max = 'page.max'>
			<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
				<div v-for = '(i, v) in cards' :key = 'i' class = 'pics'>
					<img :src = 'mainGame.get.card(i).pic' @click = 'page.select(v)'/>
					<var-checkbox :checked-value = 'v'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<Button_List :confirm = 'page.confirm' :cancel = 'page.cancel' class = 'button_list'/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup, onBeforeMount } from 'vue';
	import mainGame from '../../script/game';

	import Button_List from '../varlet/button_list.vue';

	const page = reactive({
		title : '',
		min : 0,
		max : 0,
		selects : [] as Array<number>,
		show : true,
		confirm : () => {
			props.confirm();
		},
		cancel : () => {
			props.cancel();
		},
		select : (v : number) => {
			page.selects.includes(v) ? (() => {
				const ct = page.selects.indexOf(v);
				if (ct > -1)
					page.selects.splice(ct, 1)
			})() :(() => {
				if (page.selects.length >= page.max)
					return;
				page.selects.push(v)
			});
		}
	});

	const dom = ref<HTMLElement | null>(null);

	onBeforeMount(() => {
		page.title = props.title;
		page.min = props.min;
		page.max = props.max;
	});

	const props = defineProps(['cards', 'title', 'min', 'max', 'confirm', 'cancel']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	@use './select_list.scss';
</style>