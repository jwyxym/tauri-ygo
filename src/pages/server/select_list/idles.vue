<template>
	<div class = 'select_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			<var-switch v-model = 'page.show'/>
			{{ mainGame.get.strings.system(560) }}
		</div>
		<var-checkbox-group v-model = 'page.selects' :max = '1'>
			<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
				<div v-for = '(i, v) in page.list' class = 'pics'>
					<div class = 'pic' @click = 'page.select(i)'>
						<img :src = 'mainGame.get.card(i.code).pic'/>
						<span>[{{ i.seq ?? v }}]</span>
					</div>
					<var-checkbox :checked-value = 'i' @change = 'page.select(i, false)'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<Button_List :confirm = 'page.confirm' :cancel = 'page.cancel' class = 'button_list'/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup, onBeforeMount } from 'vue';
	import mainGame from '@/script/game';
	import { Idles_Cards, Idles_Card } from '@/pages/server/post/tcp';

	import Button_List from '@/pages/ui/button_list.vue';

	const page = reactive({
		list : [] as Idles_Cards,
		selects : [] as Idles_Cards,
		show : true,
		confirm : async () => {
			if (page.selects.length < 1)
				await props.cancel();
			else
				await props.confirm(page.selects[0]);
		},
		cancel : async () => {
			await props.cancel();
		},
		select : (i : Idles_Card, chk : boolean = true) => {
			const ct = page.selects.indexOf(i);
			if (ct > -1) {
				if (chk)
					page.selects.splice(ct, 1);
			}
			else if (page.selects.length < 1) {
				if (chk)
					page.selects.push(i);
			}
		}
	});

	const dom = ref<HTMLElement | null>(null);

	onBeforeMount(() => {
		page.list = props.cards;
	});

	const props = defineProps(['cards', 'confirm', 'cancel']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	@use './select_list.scss';
</style>