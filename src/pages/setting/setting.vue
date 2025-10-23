<template>
	<var-popup v-model:show = 'page.show'>
		<var-loading
			:loading = 'page.loading'
			color = 'white'
			class = 'setting'
		>
			<var-tabs v-model:active = "page.select">
				<var-tab>{{ mainGame.get.text(I18N_KEYS.SETTING_EX_CARDS) }}</var-tab>
				<var-tab>{{ mainGame.get.text(I18N_KEYS.SETTING_ITEMS) }}</var-tab>
				<var-tab>{{ mainGame.get.text(I18N_KEYS.SETTING_PICS) }}</var-tab>
			</var-tabs>
			<transition name = 'opacity'>
				<div class = 'expansions' v-if = 'page.select === 0'>
					<div class = 'button_list'>
						<var-menu-select @select = 'download.popup.on'>
							<Button :content = 'mainGame.get.text(I18N_KEYS.SETTING_EX_CARDS)'></Button>
							<template #options>
								<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_CUSTOM)'/>
								<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.SETTING_DOWNLOAD_SUPER_PRE)' />
							</template>
						</var-menu-select>
						<Button
							@click = 'expansion.reload'
							:content = 'mainGame.get.text(I18N_KEYS.SETTING_RELOAD)'
						></Button>
						<Button
							@click = 'expansion.resert'
							:content = 'mainGame.get.text(I18N_KEYS.SETTING_RESERT)'
						></Button>
						<Button
							@click = 'expansion.chk_version'
							:content = 'mainGame.get.text(I18N_KEYS.SETTING_VERSION)'
						></Button>
					</div>
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
				</div>
			</transition>
			<transition name = 'opacity'>
				<div class = 'items' v-if = 'page.select === 1'>
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
				</div>
			</transition>
		</var-loading>
	</var-popup>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted, watch, TransitionGroup } from 'vue';
	import slider from 'vue3-slider';
	
	import mainGame from '../../script/game';
	import { I18N_KEYS } from '../../script/language/i18n';
	import * as CONSTANT from '../../script/constant';
	import fs from '../../script/fs';

	import toast from '../../script/toast';
	import Button from '../varlet/button.vue';
	import Dialog from '../varlet/dialog';

	const page = reactive({
		show : false,
		select : 0,
		loading : false
	});

	const setting = reactive({
		load : [] as Array<string>,
		expansion : [] as Array<string>,
		items_true : [] as Array<[keyof typeof I18N_KEYS, string]>,
		items : [] as Array<[keyof typeof I18N_KEYS, string]>,
		sound : 0
	})

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
			page.loading = true;
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
			page.loading = false;
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
			page.loading = true;
			const load = await mainGame.get.expansions();
			setting.expansion = load.ypk.map(i => i.name);
			if (typeof value === 'string') {
				mainGame.push.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, value);
				await mainGame.load.ypk(await fs.join(CONSTANT.DIRS.EXPANSION, value));
				await fs.write.system();
			} else {
				mainGame.remove.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, setting.expansion[v]);
				await fs.write.system();
				await mainGame.reload();
			}
			page.loading = false;
		},
		reload : async () : Promise<void> => {
			page.loading = true;
			await mainGame.reload();
			page.loading = false;
		},
		resert : async (chk : boolean = false) : Promise<void> => {
			page.loading = true;
			if (await fs.init(true, chk))
				await mainGame.reload();
			page.loading = false;
		},
		chk_version : async () : Promise<void> => {
			page.loading = true;
			const chk = await mainGame.chk.version()
			if (!chk)
				Dialog({
					title : mainGame.get.text(I18N_KEYS.SETTING_UPDATE),
					onConfirm : async () : Promise<void> => {
						await expansion.resert(true);
					}
				});
			page.loading = false;
		},
	};

	const items = {
		change : async (value : Array<string> | boolean, i : string) : Promise<void> => {
			mainGame.push.system(i, typeof value !== 'boolean');
			await fs.write.system();
		},
		sound_change : async (value : number) : Promise<void> => {
			mainGame.push.system(CONSTANT.KEYS.SETTING_VOICE_BACK_BGM, value.toFixed(2));
		},
		sound_change_over : async () : Promise<void> => {
			page.loading = true;
			await fs.write.system();
			page.loading = false;
		}
	};

	onBeforeMount(async () : Promise<void> => {
		const load = await mainGame.get.expansions();
		setting.expansion = load.ypk.map(i => i.name);
		setting.load = (mainGame.get.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION) as Array<string> | undefined) ?? [];
		const items = Object.entries(CONSTANT.KEYS).filter(i => i[0].startsWith('SETTING_CHK'));
		setting.items = items as Array<[keyof typeof I18N_KEYS, string]>;
		setting.items_true = setting.items.filter(i => mainGame.get.system(i[1]));
		setting.sound = mainGame.get.system(CONSTANT.KEYS.SETTING_VOICE_BACK_BGM) as number;
		console.log(setting)
	});

	onMounted(() => {
		page.show = true;
	})

	watch(() => { return setting.sound; }, async (n) => {
		await items.sound_change(n);
	});

	watch(() => { return page.show; }, (n) => {
		if (!n)
			setTimeout(props.select.menu, 200);
	});
	
	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './setting.scss';
</style>