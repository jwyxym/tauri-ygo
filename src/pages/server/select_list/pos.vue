<template>
	<div class = 'select_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			<var-switch v-model = 'page.show'/>
			{{ page.title }}
		</div>
		<var-checkbox-group v-model = 'page.selects' :max = '1'>
			<TransitionGroup class = 'list pos_list'  tag = 'div' name = 'scale'>
				<div
					:key = 'POS.FACEUP_ATTACK'
					v-if = '(page.pos & POS.FACEUP_ATTACK) === POS.FACEUP_ATTACK'
					class = 'poss'
				>
					<div class = 'pos' @click = 'page.select(POS.FACEUP_ATTACK)'>
						<div>
							<img :src = 'mainGame.get.card(page.code).pic'/>
						</div>
					</div>
					<var-checkbox :checked-value = 'POS.FACEUP_ATTACK'></var-checkbox>
				</div>
				<div
					:key = 'POS.FACEUP_DEFENSE'
					v-if = '(page.pos & POS.FACEUP_DEFENSE) === POS.FACEUP_DEFENSE'
					class = 'poss'
				>
					<div class = 'pos' @click = 'page.select(POS.FACEUP_DEFENSE)'>
						<div>
							<img
								:src = 'mainGame.get.card(page.code).pic'
								class = 'defence'
							/>
						</div>
					</div>
					<var-checkbox :checked-value = 'POS.FACEUP_DEFENSE'></var-checkbox>
				</div>
				<div
					:key = 'POS.FACEDOWN_ATTACK'
					v-if = '(page.pos & POS.FACEDOWN_ATTACK) === POS.FACEDOWN_ATTACK'
					class = 'poss'
				>
					<div class = 'pos' @click = 'page.select(POS.FACEDOWN_ATTACK)'>
						<div>
							<img
								:src = "mainGame.get.textures(FILES.TEXTURE_COVER) as string | undefined ?? ''"
							/>
						</div>
					</div>
					<var-checkbox :checked-value = 'POS.FACEDOWN_ATTACK'></var-checkbox>
				</div>
				<div
					:key = 'POS.FACEDOWN_DEFENSE'
					v-if = '(page.pos & POS.FACEDOWN_DEFENSE) === POS.FACEDOWN_DEFENSE'
					class = 'poss'
				>
					<div class = 'pos' @click = 'page.select(POS.FACEDOWN_DEFENSE)'>
						<div>
							<img
								:src = "mainGame.get.textures(FILES.TEXTURE_COVER) as string | undefined ?? ''"
								class = 'defence'
							/>
						</div>
					</div>
					<var-checkbox :checked-value = 'POS.FACEDOWN_DEFENSE'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<div class = 'button_list confirm'>
			<Button @click = 'page.confirm' icon_name = 'confirm'></Button>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup, onBeforeMount } from 'vue';
	import mainGame from '@/script/game';
	import { FILES } from '@/script/constant';
	
	import Button from '@/pages/ui/button.vue';
    import { POS } from '@/pages/server/post/network';

	const page = reactive({
		title : '',
		pos : 0,
		code : 0,
		selects : [] as Array<number>,
		show : true,
		confirm : () => {
			if (page.selects.length > 0)
				props.confirm(page.selects[0]);
		},
		select : (v : number) => {
			const ct = page.selects.indexOf(v);
			if (ct > -1)
				page.selects.splice(ct, 1);
			else if (page.selects.length < 1)
				page.selects.push(v);
		}
	});

	const dom = ref<HTMLElement | null>(null);

	onBeforeMount(() => {
		page.title = props.title;
		page.pos = props.pos;
		page.code = props.code;
	});

	const props = defineProps(['pos', 'title', 'code', 'confirm']);
	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	@use './select_list.scss';
</style>