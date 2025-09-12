<template>
	<div class = 'setting_body hover_ground'>
		<div class = 'button_list'>
			<Button @click = 'select.menu' icon_name = 'exit'></Button>
		</div>
		<div class = 'content'>
			<div class = 'expansion_list'>
				<div class = 'head'>
					<var-menu-select @select = 'download.popup.on'>
						<Button size = 'large' icon_name = 'download' :loading = 'download.downloading' :content = 'mainGame.get.text().setting.download.ex'></Button>
						<template #options>
							<var-menu-option :label = 'mainGame.get.text().setting.download.url'/>
							<var-menu-option :label = 'mainGame.get.text().setting.download.super_pre' />
						</template>
					</var-menu-select>
					<Button
						@click = 'expansion.reload'
						size = 'large'
						icon_name = 'refresh'
						:content = 'mainGame.get.text().setting.reload'
						:loading = 'download.downloading || expansion.loading'
					></Button>
				</div>
				<var-checkbox-group v-model = 'setting.load'>
					<var-list>
						<TransitionGroup
							name = 'opacity'
							tag = 'div'
						>
							<var-loading
								v-for = '(i, v) in setting.expansion'
								:loading = 'expansion.loading'
								:key = 'i'
								color = 'white'
							>
								<var-cell
									:title = 'i'
									:border = 'true'
								>
									<template #extra>
										<var-checkbox
											:checked-value = 'i'
											@change = 'expansion.change($event, v)'
										></var-checkbox>
									</template>
								</var-cell>
							</var-loading>
						</TransitionGroup>
					</var-list>
				</var-checkbox-group>
			</div>
		</div>
		<var-popup v-model:show = 'download.popup.url' position = 'center' :close-on-click-overlay = 'false'>
			<var-form>
				<Input
					:placeholder = 'mainGame.get.text().setting.download.url'
					v-model = 'download.url'
				/>
				<Button_List :loading = 'download.downloading' :confirm = 'download.custom.confirm' :cancel = 'download.custom.cancel'></Button_List>
			</var-form>
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, watch } from 'vue';
	import { join } from '@tauri-apps/api/path';
	
	import mainGame from '../script/game';
	import fs from '../script/fs';
	import toast from '../script/toast';
	import constant from '../script/constant';

	import Button_List from './varlet/button_list.vue';
	import Button from './varlet/button.vue';
	import Input from './varlet/input.vue';

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
			expansion.loading = true;
			download.downloading = true;
			toast.info(mainGame.get.text().toast.download.start);
			const path = await fs.write.ypk(url);
			if (path.length == 2) {
				mainGame.push.system(constant.str.system_conf.string.expansion, path[1]);
				const load = await mainGame.get.ypk();
				setting.expansion = load.files.map(i => i.name);
				if (!setting.load.includes(path[1]) && setting.expansion.includes(path[1]))
					setting.load.push(path[1]);
				await mainGame.load.ypk(path[0]);
				await fs.write.system();
				toast.info(mainGame.get.text().toast.download.complete);
			}
			download.downloading = false;
			expansion.loading = false;
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

	const expansion = reactive({
		loading : false,
		change : async (value : string | boolean, v : number) : Promise<void> => {
			expansion.loading = true;
			const load = await mainGame.get.ypk();
			setting.expansion = load.files.map(i => i.name);
			if (typeof value === 'string') {
				mainGame.push.system(constant.str.system_conf.string.expansion, value);
				await mainGame.load.ypk(await join(constant.str.dirs.expansions, value));
				await fs.write.system();
			} else {
				mainGame.remove.system(constant.str.system_conf.string.expansion, setting.expansion[v]);
				await fs.write.system();
				await mainGame.reload();
			}
			expansion.loading = false;
		},
		reload : async () : Promise<void> => {
			expansion.loading = true;
			await mainGame.reload();
			expansion.loading = false;
		}
	})

	defineProps(['select']);

	onBeforeMount(async () : Promise<void> => {
		const load = await mainGame.get.ypk();
		setting.expansion = load.files.map(i => i.name);
		setting.load = (mainGame.get.system(constant.str.system_conf.string.expansion) as Array<string> | undefined) ?? [];
	});

</script>
<style scoped lang = 'scss'>
	@use '../style/setting.scss';
	@use '../style/ground_glass.scss';
</style>