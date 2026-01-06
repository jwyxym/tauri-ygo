<template>
	<div class = 'main' @contextmenu = 'page.contextmenu'>
		<starry-sky :stars-count = '1500' :distance = '800' id = 'back'/>
		<Voice v-if = 'page.show.voice'></Voice>
		<div>
			<transition name = 'opacity'>
				<Deck
					v-if = 'page.show.deck'
					:select = 'page.select'
				/>
			</transition>
			<transition name = 'opacity'>
				<Server
					v-if = 'page.show.server'
					:select = 'page.select'
				/>
			</transition>
			<Setting
				v-if = 'page.show.setting'
				:select = 'page.select'
			/>
			<transition name = 'opacity'>
				<YGOMenu
					v-if = 'page.show.menu'
					:select = 'page.select'
				/>
			</transition>
			<transition name = 'opacity'>
				<Loading
					v-if = 'page.show.loading'
					:now = 'page.loading.progress'
					:all = 'page.loading.start'
				/>
			</transition>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted } from "vue";

	import YGOMenu from './pages/menu/menu.vue';
	import Deck from './pages/deck/list.vue';
	import Server from './pages/server/server.vue';
	import Setting from './pages/setting/setting.vue';
	import Loading from './pages/loading/loading.vue';
	import Voice from './pages/voice/voice.vue';

	import mainGame from './script/game';
	import fs from './script/fs';
	import { I18N_KEYS } from './script/language/i18n';
	import Dialog from './pages/ui/dialog';
	import listen from './script/post/listen';

	const page = reactive({
		show : {
			readme : false,
			loading : false,
			voice : false,
			dialog : false,
			menu : false,
			server : false,
			deck : false,
			setting : false
		},
		select : {
			menu : () : void => {
				page.show.server = false;
				page.show.deck = false;
				page.show.setting = false;
				if (!page.show.menu)
					setTimeout(() => {
						page.show.menu = true;
					}, 600);
			},
			server : () : void => {
				page.show.menu = false;
				setTimeout(() => {
					page.show.server = true;
				}, 600);
			},
			deck : () : void => {
				page.show.menu = false;
				setTimeout(() => {
					page.show.deck = true;
				}, 600);
			},
			setting : () : void => {
				page.show.setting = true;
			}
		},
		loading : {
			progress : 0,
			start : 0
		},
		contextmenu : (event : MouseEvent) : void => {
			if (!import.meta.env.DEV) event.preventDefault();
		}
	});

	onBeforeMount(async () : Promise<void> => {
		const on = async (chk : boolean = true) : Promise<void> => {
			page.show.loading = true;
			const start = await listen.unzip.start((i : number) => {
				page.loading.start = i - 1;
			});
			const progress = await listen.unzip.progress((i : number) => {
				page.loading.progress = i;
			});
			await mainGame.init(chk);
			start();
			progress();
			page.show.loading = false;
			setTimeout(() => {
				page.loading.start = 0;
				page.loading.progress = 0;
			}, 500);
			page.show.menu = true;
			page.show.voice = true;
		}
		const download = async () : Promise<void> => {
			page.show.readme = true;
			page.show.loading = true;
			const start = await listen.download.start((i : number) => {
				page.loading.start = i;
			});
			const progress = await listen.download.progress((i : number) => {
				page.loading.progress += i;
			});
			if (await fs.init()) {
				start();
				progress();
				page.loading.start = 0;
				page.loading.progress = 0;
				await on(false);
			} else {
				page.show.loading = false;
				await dialog();
			}
		}
		const dialog = async () : Promise<void> => {
			await Dialog({
				title : mainGame.get.text(I18N_KEYS.START_TITLE),
				message : mainGame.get.text(I18N_KEYS.START_MESSAGE),
				onConfirm : download,
				onCancel : mainGame.exit,
				closeOnClickOverlay : false
			}, true)
		};
		await mainGame.chk.file() ? await on() : await dialog();
	});

	onMounted(async () => {
	});

</script>
<style scoped lang = 'scss'> 
	.main {
		position: relative;
		> div:last-child {
			overflow: hidden;
			height: calc(var(--vh) * 0.98);
			width: calc(var(--vw) * 0.98);
			display: flex;
			gap: 10%;
			justify-content: flex-start;
		}
		#back {
			background: linear-gradient(#1c1a2e, #2f2434);
		}
	}
</style>
<style lang = 'scss'>
	@use './style/toast.scss';
	@use './style/transition.scss';
	.var-icon {
		&:hover {
			cursor: pointer;
		}
	}
	.dialog, .var-menu-option {
		color: white !important;
		border: 1px solid white;
	}
	.var-divider {
		color: white !important;
	}
	.var-back-top {
		background: none !important;
		button {
			background: none !important;
		}
	}
	.var-card {
		background-color: transparent !important;
	}
	.var-button {
		height: 32px !important;
		max-height: 8vh !important;
		overflow: hidden;
		svg {
			width: calc(8vh - 2px);
			height: calc(8vh - 2px);
			max-width: 30px;
			max-height: 30px;
		}
		span {
			font-size: min(4vh, var(--font-size-md)) !important;
		}
	}
	.var-menu-select--scrollable, .var-select__scroller, .ConversationBlock {
		&::-webkit-scrollbar {
			display: none;
		}
	}
	.readonly {
		--checkbox-unchecked-color: #555 !important;
		color: #555 !important;
	}
	.font-title {
		font-family: 'title' !important;
	}
	.font-menu {
		font-family: 'menu' !important;
	}

	.var-picker__picked {
		border: 1px solid white !important;
	}

	:root {
		--picker-mask-background-image: transparent !important;
		--picker-background: transparent !important;
		--result-background: transparent !important;
		--card-background: transparent !important;
		--dialog-background: transparent !important;
		--popup-content-background-color: transparent !important;
		--tabs-background: transparent !important;
		--select-scroller-background: rgba(0, 0, 0, 0.5) !important;
		--menu-select-menu-background-color: rgba(0, 0, 0, 0.5) !important;
		--dialog-message-color: white !important;
		--dialog-title-color: white !important;
		--list-loading-color: white !important;
		--list-finished-color: white !important;
		--list-error-color: white !important;
		--checkbox-text-color: white !important;
		--menu-option-text-color: white !important;
		--option-text-color: white !important;
		--cell-color: white !important;
		--divider-color: white !important;
		--checkbox-unchecked-color: white !important;
		--cell-border-color: white !important;
		--card-title-color: white !important;
		--card-outline-color: white !important;
		--card-subtitle-color: white !important;
		--card-description-color: white !important;
		--picker-option-text-color: white !important;
		--picker-title-text-color: white !important;
		--picker-cancel-button-text-color: white !important;
		--picker-picked-border:	5px solid white;
		--cell-padding: 1vh 20px !important;
		--field-decorator-line-size: 0.5px !important;
		--card-title-font-size: max(2.5vh, 10px) !important;
		--card-subtitle-font-size: max(1.5vh, 6px) !important;
		user-select: none;
	}
</style>