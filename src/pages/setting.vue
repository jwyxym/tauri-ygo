<template>
	<div class = 'setting_body hover_ground'>
		<div class = 'button_list'>
			<Button @click = 'select.menu' icon_name = 'exit'></Button>
			<var-menu-select @select = 'download.popup.on'>
				<Button icon_name = 'download' :loading = 'download.downloading'></Button>
				<template #options>
					<var-menu-option :label = 'mainGame.get.text().setting.download.url'/>
					<var-menu-option :label = 'mainGame.get.text().setting.download.super_pre' />
				</template>
			</var-menu-select>
		</div>
		<!-- <var-tabs v-model:active = 'page.select' inactive-color = 'white'>
			<var-tab>{{ mainGame.get.text().setting.ex_cards }}</var-tab>
			<var-tab>{{ mainGame.get.text().setting.system_setting }}</var-tab>
		</var-tabs> -->
		<var-popup v-model:show = 'download.popup.url' position = 'center' :close-on-click-overlay = 'false'>
			<var-form>
				<Input
					:placeholder = 'mainGame.get.text().setting.download.url'
					v-model = 'download.url'
				/>
				<div class = 'button_list'>
					<Button @click = 'download.custom.confirm' icon_name = 'confirm' :loading = 'download.downloading'></Button>
					<Button @click = 'download.custom.cancel' icon_name = 'cancel' :loading = 'download.downloading'></Button>
				</div>
			</var-form>
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive } from 'vue';
	
	import mainGame from '../script/game';
	import fs from '../script/fs';
	import toast from '../script/toast';
	import constant from '../script/constant';

	import Button from './varlet/button.vue';
	import Input from './varlet/input.vue';

	defineProps(['select']);

	const download = reactive({
		url : '',
		downloading : false,
		popup : {
			url : false,
			on : async (value : string) : Promise<void> => {
				switch (value) {
					case mainGame.get.text().setting.download.url:
						download.popup.url = true;
						break;
					case mainGame.get.text().setting.download.super_pre:
						await download.on(constant.str.url.super_pre);
						break;
				}
			}
		},
		on : async (url : string) : Promise<void> => {
			if (!url) {
				toast.error(mainGame.get.text().toast.error.setting.download);
				return;
			}
			download.downloading = true;
			toast.info(mainGame.get.text().toast.download.start);
			const path = await fs.write.ypk(url);
			if (path.length == 2) {
				mainGame.system.set(constant.str.system_conf.string.expansion, path[1]);
				if (!setting.load.includes(path[1]))
					setting.load.push(path[1]);
				mainGame.load.ypk(path[0]);
				toast.info(mainGame.get.text().toast.download.complete);
			}
			download.downloading = false;
		},
		custom : {
			confirm : async () : Promise<void> => {
				await download.on(download.url);
				download.custom.exit();
			},
			cancel : () : void => {
				download.custom.exit();
			},
			exit : () : void => {
				download.popup.url = false;
				download.url = '';
			}
		}
	});

	const setting = reactive({
		load : [] as Array<string>,
		expansion : [] as Array<string>
	})

	const page = reactive({
		select : 0
	});
</script>
<style scoped lang = 'scss'>
	@use '../style/setting.scss';
	@use '../style/ground_glass.scss';
</style>