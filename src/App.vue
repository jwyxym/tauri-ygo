<template>
	<div class = 'main' @contextmenu = 'page.contextmenu'>
		<starry-sky :stars-count = '1500' :distance = '800' id = 'back'/>
		<div class = 'body'>
			<transition name = 'opacity'>
				<Deck
					v-if = 'page.show.deck'
					:select = 'page.select'
				></Deck>
			</transition>
			<transition name = 'opacity'>
				<Setting
					v-if = 'page.show.setting'
					:select = 'page.select'
				></Setting>
			</transition>
			<transition name = 'opacity'>
				<Menu
					v-if = 'page.show.menu'
					:select = 'page.select'
				></Menu>
			</transition>
			<transition name = 'opacity'>
				<Animation
					v-if = 'page.show.menu'
				></Animation>
			</transition>
		</div>
		<Voice v-if = 'page.show.voice'></Voice>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted, watch } from "vue";
	import { LoadingBar } from '@varlet/ui';

	import Menu from './pages/menu.vue';
	import Animation from './pages/animation.vue';
	import Deck from './pages/deck/deck_list.vue';
	import Setting from './pages/setting.vue';
	import Voice from './pages/voice.vue';

	import mainGame from './script/game';
	import fs from './script/fs';

	import Dialog from "./pages/varlet/dialog";

	let page = reactive({
		show : {
			voice : false,
			dialog : false,
			menu : false,
			deck : false,
			setting : false,
		},
		select : {
			menu : () : void => {
				page.show.deck = false;
				page.show.setting = false;
				setTimeout(() => {
					page.show.menu = true;
				}, 500);
			},
			deck : () : void => {
				page.show.menu = false;
				setTimeout(() => {
					page.show.deck = true;
				}, 500);
			},
			setting : () : void => {
				page.show.menu = false;
				setTimeout(() => {
					page.show.setting = true;
				}, 500);
			}
		},
		contextmenu : (event : MouseEvent) : void => {
			if (!import.meta.env.DEV) event.preventDefault();
		}
	});

	onBeforeMount(async () : Promise<void> => {
		const on = async (chk : boolean = true) : Promise<void> => {
			await mainGame.init(chk);
			page.show.menu = true;
			page.show.voice = true;
		}
		const download = async () : Promise<void> => {
			LoadingBar.start();
			if (await fs.init())
				LoadingBar.finish();
			else
				LoadingBar.error();

			await on(false);
		}
		await mainGame.chk() ? await on() : await Dialog({
			title : mainGame.get.text().start.title,
			message : mainGame.get.text().start.message,
			onConfirm : download,
			onCancel : mainGame.exit,
			closeOnClickOverlay : false
		}, true);
	});

	onMounted(async () => {
	});

</script>
<style scoped lang = 'scss'> 
	.main {
		overflow: hidden;
		.body {
			height: 97vh;
			width: 100vw;

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
	@use './style/font.scss';
	@use './style/toast.scss';
    @use './style/ground.scss';
    @use './style/transition.scss';
    @use './style/card.scss';
	.var-icon {
		&:hover {
			cursor: pointer;
		}
	}
	.dialog, .var-menu-option {
		color: font.$text-color !important;
		border: 1px solid white;
	}
	.var-divider {
		color: font.$text-color !important;
	}
	.var-card {
		background-color: transparent;
	}
	.var-button {
		span {
			font-size: min(4vh, var(--font-size-md)) !important;
		}
	}
	:root {
		--card-background: transparent !important;
		--dialog-background: transparent !important;
		--popup-content-background-color: transparent !important;
		--tabs-background: transparent !important;
		--select-scroller-background: rgba(0, 0, 0, 0.8) !important;
		--menu-select-menu-background-color: rgba(0, 0, 0, 0.8) !important;
		--dialog-message-color: font.$text-color !important;
		--dialog-title-color: font.$text-color !important;
		--list-loading-color: font.$text-color !important;
		--list-finished-color: font.$text-color !important;
		--list-error-color: font.$text-color !important;
		--checkbox-text-color: font.$text-color !important;
		--menu-option-text-color: font.$text-color !important;
		--option-text-color: white !important;
		--cell-color: white !important;
		--divider-color: white !important;
		--checkbox-unchecked-color: white !important;
		--cell-border-color: white !important;
		--button-mini-padding: 4px 4px !important;
		--button-small-padding: 4px 4px !important;
		--button-normal-padding: 4px 4px !important;
		--button-large-padding: 4px 4px !important;
		--cell-min-height: 5vh !important;
		--cell-padding: 1vh 20px !important;
	}
</style>