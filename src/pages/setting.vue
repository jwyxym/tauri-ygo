<template>
	<div class = 'setting_body hover_ground'>
		<div class = 'button_list'>
			<Button @click = 'select.menu' icon_name = 'exit'></Button>
		</div>
		<var-tabs v-model:active = 'page.select' inactive-color = 'white'>
			<var-tab>{{ mainGame.get.text().setting.ex_cards }}</var-tab>
			<var-tab>{{ mainGame.get.text().setting.system_setting }}</var-tab>
		</var-tabs>
		<div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive } from 'vue';
	import mainGame from '../script/game';

	import Button from './varlet/button.vue';

	defineProps(['select']);

	const page = reactive({
		select : 0
	});
</script>
<style scoped lang = 'scss'>
	@use '../style/setting.scss';
	@use '../style/ground_glass.scss';
</style>