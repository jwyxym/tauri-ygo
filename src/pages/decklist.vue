<template>
	<motion.div class = 'deck_list hover_ground'>
		<div class = 'list'>
			<div class = 'button_list'>
				<div class = 'ground_glass'>
					<var-icon
						color = 'white'
						name = 'home'
						:size = '30'
						@click = 'select.menu'
					/>
				</div>
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
				<var-cell
					v-for = '(i, v) in list.decks'
					class = 'ground_glass'
					@click = 'list.selected(v)'
				>
					<span>{{ i.name }}</span>
				</var-cell>
			</var-list>
		</div>
		<div class = 'deck_show'>
			<AnimatePresence :initial = 'false' v-for = '(i, v) in list.decks'>
				<motion.div
					:initial = '{ opacity: 0, scale: 0 }'
					:animate = '{ opacity: 1, scale: 1 }'
					:exit = '{ opacity: 0, scale: 0 }'
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
				</motion.div>
			</AnimatePresence>
		</div>
		<AnimatePresence :initial = 'false'>
			<motion.div
				:initial = '{ opacity: 0 }'
				:animate = '{ opacity: 1 }'
				:exit = '{ opacity: 0 }'
				v-if = 'list.select > -1'
				class = 'deck_button'
			>
				<div class = 'ground_glass'>
					<var-icon
						color = 'white'
						name = 'share'
						:size = '30'
						@click = 'list.copy()'
					/>
				</div>
				<div class = 'ground_glass'>
					<var-icon
						color = 'white'
						name = 'delete'
						:size = '30'
						@click = 'select.menu'
					/>
				</div>
				<div class = 'ground_glass'>
					<var-icon
						color = 'white'
						name = 'wrench'
						:size = '30'
						@click = 'select.menu'
					/>
				</div>
			</motion.div>
		</AnimatePresence>
	</motion.div>
</template>
<script setup lang='ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, onBeforeMount } from 'vue';
	import { motion, AnimatePresence } from 'motion-v';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager'

	import mainGame from '../script/game';
	import Deck from '../script/deck';
	import constant from '../script/constant';
	import toast from '../script/toast';

	let list = reactive({
		card : mainGame.cards,
		select : -1,
		decks : [] as Array<Deck>,
		loading : false,
		load : async () : Promise<void> => {
			list.decks = await mainGame.load_deck();
		},
		selected : async (v : number) : Promise<void> => {
			list.select = -1;
			const deck = list.decks[v];
			await mainGame.load_pic([...deck.main, ...deck.side, ...deck.extra]);
			setTimeout(() => {
				list.select = v;
			}, 400);
		},
		get_pic : (card : number) : string => {
			const pic = list.card.get(card)?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		},
		copy : async() : Promise<void> => {
			if (list.select <= -1) return;
			const text = list.decks[list.select].toYGOMobileDeckURL();
			await writeText(text);
			toast.info(mainGame.get_text().toast.copy)
		},
	});

	defineProps(['select']);

	onBeforeMount(list.load)
</script>
<style scoped lang = 'scss'>
	@use '../style/ground_glass.scss';
	@use '../style/deck_list.scss';
</style>