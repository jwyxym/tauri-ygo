<template>
	<div class = 'button_list' :class = "mainGame.get.system(constant.str.system_conf.chk.button) ? 'reverse' : ''">
		<Button @click = 'confirm' icon_name = 'confirm' :loading = 'loading' id = 'confirm'></Button>
		<Button @click = 'cancel' icon_name = 'cancel' :loading = 'loading' id = 'cancel'></Button>
	</div>
</template>
<script setup lang = 'ts'>
	import Button from'./button.vue';
	import mainGame from '../../script/game';
	import constant from '../../script/constant';

	defineProps(['confirm', 'cancel', 'loading']);
</script>
<style scoped lang = 'scss'>
	.button_list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		justify-items: center;
		align-items: center;
	}
	.reverse {
		#cancel {
			order: -1;
		}
	}
</style>