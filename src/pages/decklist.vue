<template>
	<motion.div class = 'deck_list hover_ground'>
		<var-list>
			<var-cell
				v-for = '(i, v) in list.decks'
				class = 'deck ground_glass'
				@click = 'list.selected(v)'
			>{{ i.name }}</var-cell>
		</var-list>
		<div class = 'deck_show'>
			<AnimatePresence :initial = 'false' v-for = '(i, v) in list.decks'>
				<motion.div
					:initial = '{ opacity: 0, scale: 0 }'
					:animate = '{ opacity: 1, scale: 1 }'
					:exit = '{ opacity: 0, scale: 0 }'
					v-if = 'list.select == v'
					class = 'deck'
				>
					<div class = 'cards'>
						<div class = 'card' v-for = 'card in i.main'>
							<img :src = "list.card.get(card)?.pic ?? ''">
						</div>
					</div>
					<div class = 'cards'>
						<div class = 'card' v-for = 'card in i.extra'>
							<img :src = "list.card.get(card)?.pic ?? ''">
						</div>
					</div>
					<div class = 'cards'>
						<div class = 'card' v-for = 'card in i.side'>
							<img :src = "list.card.get(card)?.pic ?? ''">
						</div>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	</motion.div>
</template>
<script setup lang='ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, onBeforeMount } from 'vue';
	import { motion, AnimatePresence } from 'motion-v';

	import mainGame from '../script/game';
	import Deck from '../script/deck';

	let list = reactive({
		card : mainGame.cards,
		select : -1,
		decks : [] as Array<Deck>,
		loading : false,
		load : async () : Promise<void> => {
			list.decks = await mainGame.loadDeck();
			console.log(list.card.get(483))
		},
		selected : async (v : number) : Promise<void> => {
			list.select = -1;
			await (new Promise(resolve => setTimeout(resolve, 400)));
			list.select = v;
		}
	});

	onBeforeMount(list.load)
</script>
<style scoped lang = 'scss'>
	@use '../style/ground_glass.scss';
	@use '../style/deck_list.scss';
</style>