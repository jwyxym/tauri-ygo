<template>
	<div class = 'body'>
		<transition name = 'opacity'>
			<div class = 'deck_list' v-if = 'page.list'>
				<div class = 'list'>
					<div class = 'button_list'>
						<Button @click = 'select.menu' icon_name = 'exit'></Button>
						<var-menu-select @select = 'list.add'>
							<Button icon_name = 'add'></Button>
							<template #options>
								<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.DECK_NEW)'/>
								<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.DECK_FROM_CODE)' />
								<var-menu-option :label = 'mainGame.get.text(I18N_KEYS.DECK_FROM_URL)' />
							</template>
						</var-menu-select>
					</div>
					<var-list>
						<TransitionGroup
							name = 'opacity'
							tag = 'div'
						>
							<var-button
								v-for = '(i, v) in list.decks'
								:key = 'i'
								text outline block
								type = 'primary'
								text-color = 'white'
								:loading = 'list.loading.includes(v)'
								@click = 'list.selected(v)'
							>
								<span>{{ i.name }}</span>
							</var-button>
						</TransitionGroup>
					</var-list>
				</div>
				<div class = 'deck_show'>
					<transition name = 'opacity'>
						<div
							v-if = 'list.select > -1'
							class = 'deck'
						>
							<div class = 'deck_name font-title'>
								<span>{{ list.decks[list.select].name }}</span>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in list.decks[list.select].main'>
									<img :src = "list.get_pic(card)">
								</div>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in list.decks[list.select].extra'>
									<img :src = "list.get_pic(card)">
								</div>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in list.decks[list.select].side'>
									<img :src = "list.get_pic(card)">
								</div>
							</div>
						</div>
					</transition>
				</div>
				<transition name = 'opacity'>
					<div
						v-if = 'list.select > -1'
						class = 'deck_button'
					>
						<Button @click = 'list.copy' icon_name = 'share'></Button>
						<Button @click = 'list.delete' icon_name = 'delete'></Button>
						<Button @click = 'page.indeck(list.decks[list.select])' icon_name = 'deck'></Button>
					</div>
				</transition>
			</div>
		</transition>
		<transition name = 'opacity'>
			<DeckPage v-if = 'page.deck' :this_deck = 'page.this_deck' :offdeck = 'page.offdeck' :update = 'page.update'></DeckPage>
		</transition>
		<var-popup v-model:show = 'page.popup.code.show' position = 'center' :close-on-click-overlay = 'false'>
			<var-form>
				<Input
					:placeholder = 'mainGame.get.text(I18N_KEYS.DECK_FROM_CODE)'
					v-model = 'page.popup.code.input'
				/>
				<Button_List :confirm = 'page.popup.code.confirm' :cancel = 'page.popup.code.cancel'></Button_List>
			</var-form>
		</var-popup>
		<var-popup v-model:show = 'page.popup.url.show' position = 'center' :close-on-click-overlay = 'false'>
			<var-form>
				<Input
					:placeholder = 'mainGame.get.text(I18N_KEYS.DECK_FROM_URL)'
					v-model = 'page.popup.url.input'
				/>
				<Button_List :confirm = 'page.popup.url.confirm' :cancel = 'page.popup.url.cancel'></Button_List>
			</var-form>
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, TransitionGroup } from 'vue';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';

	import mainGame from '../../script/game';
	import { I18N_KEYS } from '../../script/language/i18n';
	import toast from '../../script/toast';
	import fs from '../../script/fs';

	import Button from '../varlet/button.vue';
	import DeckPage from './deck.vue';
	import Input from '../varlet/input.vue';
	import Button_List from '../varlet/button_list.vue';
	import Dialog from '../varlet/dialog';

	import Deck from './deck';
	
	const page = reactive({
		deck : false,
		list : true,
		this_deck : undefined as undefined | Deck,
		indeck : (deck : Deck) : void => {
			page.this_deck = deck;
			page.list = false;
			setTimeout(() => {
				list.select = -1;
				page.deck = true;
			}, 500)
		},
		offdeck : async () : Promise<void> => {
			page.deck = false;
			page.this_deck = undefined;
			await list.load();
			setTimeout(() => {
				page.list = true;
			}, 500)
		},
		update : (name : string) : void => {
			if (!page.this_deck) return;
			page.this_deck.is_not_new();
			page.this_deck.name = name;
		},
		popup : {
			code : {
				show : false,
				input : '',
				confirm : () : void => {
					const deck = Deck.fromYdkString(page.popup.code.input, true);
					deck.main = deck.main.filter(i => mainGame.cards.has(i));
					deck.extra = deck.extra.filter(i => mainGame.cards.has(i));
					deck.side = deck.side.filter(i => mainGame.cards.has(i));
					deck.is_new();
					page.indeck(deck);
					page.popup.code.exit();
				},
				cancel : () : void => {
					page.popup.code.exit();
				},
				exit : () : void => {
					page.popup.code.show = false;
					page.popup.code.input = '';
				}
			},
			url : {
				show : false,
				input : '',
				confirm : () : void => {
					const deck = Deck.fromYGOMobileDeckURL(page.popup.url.input);
					deck.main = deck.main.filter(i => mainGame.cards.has(i));
					deck.extra = deck.extra.filter(i => mainGame.cards.has(i));
					deck.side = deck.side.filter(i => mainGame.cards.has(i));
					deck.is_new();
					page.indeck(deck);
					page.popup.url.exit();
				},
				cancel : () : void => {
					page.popup.url.exit();
				},
				exit : () : void => {
					page.popup.url.show = false;
					page.popup.url.input = '';
				}
			}
		}
	})

	const list = reactive({
		select : -1,
		decks : [] as Array<Deck>,
		loading : [] as Array<number>,
		removing : undefined as { deck : Deck, count : number} | undefined,
		load : async () : Promise<void> => {
			const decks = await mainGame.load.deck();
			list.decks = decks;
		},
		selected : async (v : number) : Promise<void> => {
			if (list.select != v) {
				list.select = -1;
				list.loading.push(v);
				const deck = list.decks[v];
				await mainGame.load.pic([...deck.extra, ...deck.main, ...deck.side]);
				setTimeout(() => {
					list.select = v;
					list.loading.splice(list.loading.indexOf(v), 1);
				}, 500);
			} else
				list.select = -1;
		},
		get_pic : (card : number) : string => {
			const pic = mainGame.get.card(card).pic;
			return pic;
		},
		copy : async () : Promise<void> => {
			if (list.select <= -1) return;
			const text = list.decks[list.select].toYGOMobileDeckURL();
			await writeText(text);
			toast.info(mainGame.get.text(I18N_KEYS.DECK_COPY_COMPELETE));
		},
		delete : async () : Promise<void> => {
			if (list.select <= -1) return;
			const confirm = async () : Promise<void> => {
				if (await fs.delete.ydk(list.decks[list.select].name!)) {
					toast.info(mainGame.get.text(I18N_KEYS.DECK_DELETE_COMPELETE));
					list.decks.splice(list.select, 1);
					list.select = -1;
				}
			}
			Dialog({
				title : mainGame.get.text(I18N_KEYS.DECK_DELETE_TITLE),
				message : mainGame.get.text(I18N_KEYS.DECK_DELETE_MESSAGR, list.decks[list.select].name ?? ''),
				onConfirm : confirm
			});
		},
		add : (value : string) => {
			switch (value) {
				case mainGame.get.text(I18N_KEYS.DECK_NEW):
					const deck = new Deck({
						main : [],
						side : [],
						extra : [],
						name : ''
					});
					deck.is_new();
					page.indeck(deck);
					break;
				case mainGame.get.text(I18N_KEYS.DECK_FROM_CODE):
					page.popup.code.show = true;
					break;
				case mainGame.get.text(I18N_KEYS.DECK_FROM_URL):
					page.popup.url.show = true;
					break;
			}
		}
	});

	const props = defineProps(['select']);

	onBeforeMount(list.load)
</script>
<style scoped lang = 'scss'>
	@use './list.scss';
</style>