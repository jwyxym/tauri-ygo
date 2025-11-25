<template>
	<div class = 'select_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			{{ page.title }}
			<var-switch v-model = 'page.show'/>
		</div>
		<var-checkbox-group v-model = 'page.selects'>
			<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
				<div v-for = 'i in plaids' :key = 'i.plaid.name' class = 'plaids'>
					<div class = 'plaid' @click = 'page.select(i)'>
						<div>
							<img
								:src = "(i.pos & POS.FACEUP) > 0 ? mainGame.get.card(i.card).pic : (mainGame.get.textures(FILES.TEXTURE_COVER) as string | undefined) ?? ''"
								:class = "{ 'defence' : (i.pos & POS.DEFENSE) > 0 }"
							/>
						</div>
						<span>{{ i.plaid.name }}</span>
					</div>
					<var-checkbox :checked-value = 'i'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<Button_List :confirm = 'page.confirm' :cancel = 'page.cancel' class = 'button_list'/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup, onBeforeMount } from 'vue';
	import mainGame from '../../script/game';
	import { FILES } from '../../script/constant';
	import { POS } from './post/network';
	import Plaid from './post/plaid';

	import Button_List from '../varlet/button_list.vue';

	const page = reactive({
		title : '',
		ct : 0,
		selects : [] as Array<Plaid>,
		show : true,
		confirm : () => {
			props.confirm();
		},
		cancel : () => {
			props.cancel();
		},
		select : (v : Plaid) => {
			page.selects.includes(v) ? (() => {
				const ct = page.selects.findIndex(i => i === v);
				if (ct > -1) {
					page.selects.splice(ct, 1)
					v.select.off();
				}
			})() : (() => {
				page.selects.push(v);
				v.select.on();
			})();
		}
	});

	const dom = ref<HTMLElement | null>(null);

	onBeforeMount(() => {
		page.title = props.title;
		page.ct = props.ct;
	});

	const props = defineProps(['plaids', 'title', 'ct', 'confirm', 'cancel']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	@use './select_list.scss';
</style>