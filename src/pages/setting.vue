<template>
	<div class = 'setting_body'>
		<div class = 'button_list'>
			<Button @click = 'select.menu' icon_name = 'exit'></Button>
		</div>
		<div class = 'content'>
			<div class = 'expansion_list'>
				<div class = 'head'>
					<var-menu-select @select = 'download.popup.on'>
						<Button size = 'large' :loading = 'setting.loading' :content = 'mainGame.get.text(I18N_KEYS.SETTING_EX_CARDS)'></Button>
						<template #options>
							<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_CUSTOM)'/>
							<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_SUPER_PRE)' />
						</template>
					</var-menu-select>
					<Button
						@click = 'expansion.reload'
						size = 'large'
						:content = 'mainGame.get.text(I18N_KEYS.SETTING_RELOAD)'
						:loading = 'setting.loading'
					></Button>
					<Button
						@click = 'expansion.resert'
						size = 'large'
						:content = 'mainGame.get.text(I18N_KEYS.SETTING_RESERT)'
						:loading = 'setting.loading'
					></Button>
					<Button
						@click = 'expansion.chk_version'
						size = 'large'
						:content = 'mainGame.get.text(I18N_KEYS.SETTING_VERSION)'
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
				<var-cell
					:border = 'true'
				>
					<template #default>
						<div>
							{{ `${mainGame.get.text(I18N_KEYS.SETTING_VOICE_BACK_BGM)} : ${setting.sound.toFixed(2)}` }}
							<var-slider
								v-if = 'mainGame.is_android()'
								v-model = 'setting.sound'
								label-visible = 'never'
								:step = '0.01'
								:max = '1'
								:min = '0'
								@end = 'items.sound_change_over'
							/>
							<slider
								v-if = '!mainGame.is_android()'
								v-model = 'setting.sound'
								color = '#397bfe'
								track-color = 'white'
								:step = '0.01'
								:max = '1'
								:min = '0'
								@drag-end = 'items.sound_change_over'
							/>
						</div>
					</template>
				</var-cell>
				<var-checkbox-group v-model = 'setting.items_true'>
					<var-list>
						<var-cell
							v-for = 'i in setting.items'
							:key = 'i'
							:title = 'mainGame.get.text(I18N_KEYS[i[0]])'
							:border = 'true'
						>
							<template #extra>
								<var-checkbox
									:checked-value = 'i'
									@change = 'items.change($event, i[1])'
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
					:placeholder = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_CUSTOM)'
					v-model = 'download.url'
				/>
				<Input
					:placeholder = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_NAME)'
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
	import * as CONSTANT from '../script/constant';
	import { I18N_KEYS } from '../script/language/i18n';

	import Button_List from './varlet/button_list.vue';
	import Button from './varlet/button.vue';
	import Input from './varlet/input.vue';
	import Dialog from './varlet/dialog';

	const download = reactive({
		url : '',
		name : '',
		name_rule : (name : string | undefined) : string | boolean => {
			if (name !== undefined && name.length > 0 && name.match(CONSTANT.REG.NAME))
				return mainGame.get.text(I18N_KEYS.SETTING_RULE_NAME_UNLAWFUL);
			return true;
		},
		popup : {
			url : false,
			on : async (value : string) : Promise<void> => {
				switch (value) {
					case mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_CUSTOM):
						download.popup.url = true;
						break;
					case mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_SUPER_PRE):
						await download.on(CONSTANT.URL.SUPER_PRE);
						break;
				}
			}
		},
		on : async (url : string, name : string = '') : Promise<void> => {
			if (!url) {
				toast.error(mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_LEN));
				return;
			}
			setting.loading = true;
			toast.info(mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_START));
			const path = await fs.write.ypk(url, name);
			if (path.length == 2) {
				mainGame.push.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, path[1]);
				const load = await mainGame.get.expansions();
				setting.expansion = load.ypk.map(i => i.name);
				if (!setting.load.includes(path[1]) && setting.expansion.includes(path[1]))
					setting.load.push(path[1]);
				await mainGame.load.ypk(path[0]);
				await fs.write.system();
				toast.info(mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_COMPELETE));
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
		items : [] as Array<[string, string]>,
		sound : 0,
		loading : false,
	})

	const expansion = {
		delete : (v : number) : void => {
			Dialog({
				title : mainGame.get.text(I18N_KEYS.SETTING_DELETE_YPK),
				onConfirm : async () : Promise<void> => {
					if (await fs.delete.ypk(setting.expansion[v])) {
						const load = await mainGame.get.expansions();
						setting.expansion = load.ypk.map(i => i.name);
						toast.info(mainGame.get.text(I18N_KEYS.SETTING_DELETE_YPK))
					}
				}
			}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_DELETE_YPK));
		},
		change : async (value : string | boolean, v : number) : Promise<void> => {
			setting.loading = true;
			const load = await mainGame.get.expansions();
			setting.expansion = load.ypk.map(i => i.name);
			if (typeof value === 'string') {
				mainGame.push.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, value);
				await mainGame.load.ypk(await join(CONSTANT.DIRS.EXPANSION, value));
				await fs.write.system();
			} else {
				mainGame.remove.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, setting.expansion[v]);
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
		resert : async (chk : boolean = false) : Promise<void> => {
			setting.loading = true;
			if (await fs.init(true, chk))
				await mainGame.reload();
			setting.loading = false;
		},
		chk_version : async () : Promise<void> => {
			setting.loading = true;
			const chk = await mainGame.chk.version()
			if (!chk)
				Dialog({
					title : mainGame.get.text(I18N_KEYS.SETTING_UPDATE),
					onConfirm : async () : Promise<void> => {
						await expansion.resert(true);
					}
				});
			setting.loading = false;
		},
	};

	const items = {
		change : async (value : string | boolean, i : string) : Promise<void> => {
			mainGame.push.system(i, typeof value === 'string');
			await fs.write.system();
		},
		sound_change : async (value : number, i : string) : Promise<void> => {
			mainGame.push.system(i, value.toString());
		},
		sound_change_over : async () : Promise<void> => {
			await fs.write.system();
		}
	}

	defineProps(['select']);

	onBeforeMount(async () : Promise<void> => {
		const load = await mainGame.get.expansions();
		setting.expansion = load.ypk.map(i => i.name);
		setting.load = (mainGame.get.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION) as Array<string> | undefined) ?? [];
		const items = Object.entries(CONSTANT.KEYS).filter(i => i[0].startsWith('SETTING_CHK'));
		setting.items = items;
		setting.items_true = setting.items.map(i => i[1]).filter(i => mainGame.get.system(i));
		setting.sound = mainGame.get.system(CONSTANT.KEYS.SETTING_VOICE_BACK_BGM) as number;
	});

	watch(() => { return setting.sound; }, async (n) => {
		for (const [i, v] of Object.entries(n)) {
			await items.sound_change(v, i);
		}
	}, { deep : true });

</script>
<style scoped lang = 'scss'>
	@use '../style/font.scss';
	.setting_body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		height: 100%;
		.button_list {
			display: flex;
			height: 30px;
			gap: 10px;
		}
		.content {
			width: 100%;
			height: 100%;
			display: flex;
			gap: 10%;
			.expansion_list {
				width: 40%;
				display: flex;
				height: calc(100% - 30px);
				flex-direction: column;
				gap: 10px;
				.head {
					width: 100%;
					display: flex;
					flex-wrap: wrap;
					align-content: center;
					align-items: center;
					gap: 10px;
					.var-button, .var-menu-select {
						width: 100px;
						.var-button {
							width: 100%;
						}
					}
				}
				.var-loading {
					height: 100%;
					overflow-y: auto;
					&::-webkit-scrollbar {
						display: none;
					}
				}
			}
			.items {
				width: 40%;
				height: calc(100% - 30px);
				overflow-y: auto;
				&::-webkit-scrollbar {
					display: none;
				}
			}
			.var-list {
				width: 100%;
				height: 100%;
				.var-cell {
					width: 100%;
					.var-slider {
						width: 100%;
					}
				}
			}
		}

	}

	.var-popup {
		.var-form {
			display: flex;
			flex-direction: column;
			gap: 10px;
			width: 25vw;
			height: 90%;
			overflow-y: auto;
			.var-select, .var-input {
				width: 100%;
			}
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>