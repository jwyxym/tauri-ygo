<template>
	<div class = 'body'>
		<transition name = 'opacity'>
			<div class = 'deck_list hover_ground' v-if = 'page.list'>
				<div class = 'list'>
					<div class = 'button_list'>
						<Button @click = 'select.menu' :icon_name = "'home'"></Button>
						<var-menu-select class = 'ground_glass'>
							<var-icon
								color = 'white'
								name = 'plus-circle-outline'
								:size = '30'
							/>
							<template #options>
								<var-menu-option :label = 'mainGame.get_text().deck.new'/>
								<var-menu-option :label = 'mainGame.get_text().deck.fromcode' />
								<var-menu-option :label = 'mainGame.get_text().deck.fromurl' />
							</template>
						</var-menu-select>
					</div>
					<var-list>
						<transition
							name = 'opacity'
							v-for = '(i, v) in list.decks'
						>
							<div
								v-if = 'list.removing === undefined || list.removing?.deck !== i'
								:exit = '{ opacity: 0, scale: 0 }'
								@click = 'list.selected(v)'
							>
								<var-cell
									class = 'ground_glass'
								>
									<span>{{ i.name }}</span>
								</var-cell>
							</div>
						</transition>
					</var-list>
				</div>
				<div class = 'deck_show'>
					<transition name = 'opacity' v-for = '(i, v) in list.decks'>
						<div
							v-if = 'list.select == v'
							class = 'deck'
						>
							<div class = 'deck_name'>
								<span>{{ i.name }}</span>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in i.main'>
									<img :src = "list.get_pic(card)">
								</div>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in i.extra'>
									<img :src = "list.get_pic(card)">
								</div>
							</div>
							<div class = 'cards'>
								<div class = 'card' v-for = 'card in i.side'>
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
						<Button @click = 'list.copy' :icon_name = "'share'"></Button>
						<Button @click = 'list.delete' :icon_name = "'delete'"></Button>
						<Button @click = 'page.indeck' :icon_name = "'wrench'"></Button>
					</div>
				</transition>
			</div>
		</transition>
		<transition name = 'opacity'>
			<DeckPage v-if = 'page.deck' :this_deck = 'list.decks[list.select]'></DeckPage>
		</transition>
		<transition name = 'opacity'>
			<div class = 'deckpage_button' v-if = 'page.deck'>
				<Button @click = 'page.offdeck' :icon_name = "'home'"></Button>
			</div>
		</transition>
	</div>
</template>
<script setup lang='ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, onBeforeMount } from 'vue';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager'
	import { join } from '@tauri-apps/api/path';

	import mainGame from '../../script/game';
	import Deck from '../../script/deck';
	import constant from '../../script/constant';
	import toast from '../../script/toast';
	import fs from '../../script/fs';

	import Button from '../varlet/button.vue';
	import DeckPage from './deck.vue'

	let page = reactive({
		deck : false,
		list : true,
		indeck : () : void => {
			page.list = false;
			setTimeout(() => {
				page.deck = true;
			}, 400)
		},
		offdeck : async () : Promise<void> => {
			page.deck = false;
			await list.load();
			setTimeout(() => {
				page.list = true;
			}, 400)
		}
	})

	let list = reactive({
		card : mainGame.cards,
		select : -1,
		decks : [] as Array<Deck>,
		loading : false,
		removing : undefined as { deck : Deck, count : number} | undefined,
		load : async () : Promise<void> => {
			const decks = await mainGame.load_deck();
			decks.forEach(i => {
				if (list.decks.indexOf(i) === -1)
					list.decks.push(i)
			})
		},
		selected : async (v : number) : Promise<void> => {
			if (list.select != v) {
				list.select = -1;
				const deck = list.decks[v];
				await mainGame.load_pic([...deck.main, ...deck.side, ...deck.extra]);
				setTimeout(() => {
					list.select = v;
				}, 400);
			} else
				list.select = -1;
		},
		get_pic : (card : number) : string => {
			const pic = list.card.get(card)?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		},
		copy : async () : Promise<void> => {
			if (list.select <= -1) return;
			const text = list.decks[list.select].toYGOMobileDeckURL();
			await writeText(text);
			toast.info(mainGame.get_text().toast.copy)
		},
		delete : async () : Promise<void> => {
			if (list.select <= -1) return;
			if (await fs.delete(await join(constant.str.dirs.deck, `${list.decks[list.select].name!}.ydk`))) {
				toast.info(mainGame.get_text().toast.delete);
				list.removing = { deck : list.decks[list.select], count : list.select};
				list.select = -1;
				setTimeout(() => {
					list.decks.splice(list.removing!.count, 1);
					setTimeout(() => {
						list.removing = undefined;
					}, 200)
				}, 400);
			}
		}
	});

	defineProps(['select']);

	onBeforeMount(list.load)
</script>
<style scoped lang = 'scss'>
	@use '../../style/ground_glass.scss';
	@use '../../style/deck_list.scss';
    @use '../../style/transition.scss';
</style>