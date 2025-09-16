<template>
	<div class = 'setting_body over_ground'>
		<div class = 'button_list'>
			<Button @click = 'select.menu' icon_name = 'exit'></Button>
		</div>
		<div class = 'content'>
			<div class = 'expansion_list'>
				<div class = 'head'>
					<var-menu-select @select = 'download.popup.on'>
						<Button size = 'large' :loading = 'setting.loading' :content = 'mainGame.get.text().setting.download.ex'></Button>
						<template #options>
							<var-menu-option :label = 'mainGame.get.text().setting.download.url'/>
							<var-menu-option :label = 'mainGame.get.text().setting.download.super_pre' />
						</template>
					</var-menu-select>
					<Button
						@click = 'expansion.reload'
						size = 'large'
						:content = 'mainGame.get.text().setting.reload'
						:loading = 'setting.loading'
					></Button>
					<Button
						@click = 'expansion.resert'
						size = 'large'
						:content = 'mainGame.get.text().setting.resert'
						:loading = 'setting.loading'
					></Button>
				</div>
				<var-loading
					:loading = 'setting.loading'
					color = 'white'
				>
					<var-checkbox-group v-model = 'setting.load'>
						<var-list>
							<TransitionGroup
								name = 'opacity'
								tag = 'div'
							>
								<var-cell
									v-for = '(i, v) in setting.expansion'
									:key = 'i'
									:title = 'i'
									:border = 'true'
									@dblclick = 'expansion.delete(v)'
								>
									<template #extra>
										<var-checkbox
											:checked-value = 'i'
											@change = 'expansion.change($event, v)'
										></var-checkbox>
									</template>
								</var-cell>
							</TransitionGroup>
						</var-list>
					</var-checkbox-group>
				</var-loading>
			</div>
			<var-loading
				:loading = 'setting.loading'
				color = 'white'
				class = 'items'
			>
				<var-list>
					<var-cell
						v-for = '(i, v) in Object.entries(constant.str.system_conf.sound).map(i => i[1])'
						:key = 'i'
						:border = 'true'
					>
						<template #default>
							<div>
								{{ `${mainGame.get.text().setting.setting_items.get(i)} : ${setting.sound[i] ? setting.sound[i].toFixed(2) : 0}` }}
								<var-slider
									v-if = 'mainGame.is_android()'
									v-model = 'setting.sound[i]'
									label-visible = 'never'
									:step = '0.01'
									:max = '1'
									:min = '0'
								/>
								<slider
									v-if = '!mainGame.is_android()'
									v-model = 'setting.sound[i]'
									color = '#397bfe'
									track-color = 'white'
									:step = '0.01'
									:max = '1'
									:min = '0'
								/>
							</div>
						</template>
					</var-cell>
				</var-list>
				<var-checkbox-group v-model = 'setting.items_true'>
					<var-list>
						<var-cell
							v-for = 'i in Object.entries(constant.str.system_conf.chk).map(i => i[1])'
							:key = 'i'
							:title = 'mainGame.get.text().setting.setting_items.get(i)'
							:border = 'true'
						>
							<template #extra>
								<var-checkbox
									:checked-value = 'i'
									@change = 'items.change($event, i)'
								></var-checkbox>
							</template>
						</var-cell>
					</var-list>
				</var-checkbox-group>
			</var-loading>
		</div>
		<var-popup :close-on-key-escape = 'false' v-model:show = 'download.popup.url' position = 'center' :close-on-click-overlay = 'false'>
			<var-form>
				<Input
					:placeholder = 'mainGame.get.text().setting.download.url'
					v-model = 'download.url'
				/>
				<Input
					:placeholder = 'mainGame.get.text().setting.download.name'
					:rules = 'download.name_rule'
					v-model = 'download.name'
				/>
				<Button_List :loading = 'setting.loading' :confirm = 'download.custom.confirm' :cancel = 'download.custom.cancel'></Button_List>
			</var-form>
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, watch } from 'vue';
	import { join } from '@tauri-apps/api/path';
	import slider from "vue3-slider"
	
	import mainGame from '../script/game';
	import fs from '../script/fs';
	import toast from '../script/toast';
	import constant from '../script/constant';

	import Button_List from './varlet/button_list.vue';
	import Button from './varlet/button.vue';
	import Input from './varlet/input.vue';
	import Dialog from './varlet/dialog';

	const download = reactive({
		url : '',
		name : '',
		name_rule : (name : string | undefined) : string | boolean => {
			if (name !== undefined && name.length > 0 && name.match(constant.reg.name))
				return mainGame.get.text().rule.name.unlawful;
			return true;
		},
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
		on : async (url : string, name : string = '') : Promise<void> => {
			if (!url) {
				toast.error(mainGame.get.text().toast.error.setting.download);
				return;
			}
			setting.loading = true;
			toast.info(mainGame.get.text().toast.download.start);
			const path = await fs.write.ypk(url, name);
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
			setting.loading = false;
		},
		custom : {
			confirm : async () : Promise<void> => {
				await download.on(download.url, download.name ?? '');
				download.custom.exit();
			},
			cancel : () : void => {
				download.custom.exit();
			},
			exit : () : void => {
				download.popup.url = false;
				download.url = '';
				download.name = '';
			}
		}
	});

	const setting = reactive({
		load : [] as Array<string>,
		expansion : [] as Array<string>,
		items_true : [] as Array<string>,
		items : [] as Array<string>,
		sound : {} as { [key: string]: number },
		loading : false
	})

	const expansion = {
		delete : (v : number) : void => {
			Dialog({
				title : mainGame.get.text().setting.delete,
				onConfirm : async () : Promise<void> => {
					if (await fs.delete.ypk(setting.expansion[v])) {
						const load = await mainGame.get.ypk();
						setting.expansion = load.files.map(i => i.name);
						toast.info(mainGame.get.text().toast.delete)
					}
				}
			}, mainGame.get.system(constant.str.system_conf.chk.ypk_delete));
		},
		change : async (value : string | boolean, v : number) : Promise<void> => {
			setting.loading = true;
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
			setting.loading = false;
		},
		reload : async () : Promise<void> => {
			setting.loading = true;
			await mainGame.reload();
			setting.loading = false;
		},
		resert : async () : Promise<void> => {
			setting.loading = true;
			if (await fs.init(true))
				await mainGame.reload();
			setting.loading = false;
		}
	};

	const items = {
		change : async (value : string | boolean, i : string) : Promise<void> => {
			mainGame.push.system(i, typeof value === 'string');
			await fs.write.system();
		},
		sound_change : async (value : number, i : string) : Promise<void> => {
			mainGame.push.system(i, value.toString());
			await fs.write.system();
		}
	}

	defineProps(['select']);

	onBeforeMount(async () : Promise<void> => {
		const load = await mainGame.get.ypk();
		setting.expansion = load.files.map(i => i.name);
		setting.load = (mainGame.get.system(constant.str.system_conf.string.expansion) as Array<string> | undefined) ?? [];
		const items = Object.entries(constant.str.system_conf.chk);
		setting.items = items.map(i => i[1]);
		setting.items_true = setting.items.filter(i => mainGame.get.system(i));
		Object.entries(constant.str.system_conf.sound).forEach(i => setting.sound[i[1]] = mainGame.get.system(i[1]) as number);
	});

	watch(() => { return setting.sound; }, async (n) => {
		for (const [i, v] of Object.entries(n)) {
			await items.sound_change(v, i);
		}
	}, { deep : true });

</script>
<style scoped lang = 'scss'>
	@use '../style/setting.scss';
</style>