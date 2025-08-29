<template>
	<motion.div class = 'deck_body ground_glass hover_ground'>
		<var-card
			title=""
			subtitle=""
			:description = 'des'
			src=""
			class = 'description'
		/>
		<div
			class = 'deck'
		>
			<div
				class = 'main'
				ref = 'main'
			>
				<div
					v-for = '(i, v) in deck.main.array'
					:data-swapy-slot = '`main_card${v}`'
					class = 'card'
				>
					<div :data-swapy-item = '`main_card${v}`'>
						<img :src = 'i' ref = 'main_card'></img>
					</div>
				</div>
			</div>
			<div
				class = 'extra'
				ref = 'extra'
			>
				<div
					v-for = '(i, v) in deck.extra.array'
					:data-swapy-slot = '`extra_card${v}`'
					class = 'card'
				>
					<div :data-swapy-item = '`extra_card${v}`'>
						<img :src = 'i' ref = 'extra_card'></img>
					</div>
				</div>
			</div>
			<div
				class = 'side'
				ref = 'side'
			>
				<div
					v-for = '(i, v) in deck.side.array'
					:data-swapy-slot = '`side_card${v}`'
					class = 'card'
				>
					<div :data-swapy-item = '`side_card${v}`'>
						<img :src = 'i' ref = 'side_card'></img>
					</div>
				</div>
			</div>
		</div>
		<div
			class = 'search'
			ref = 'search'
		>
			<div
				v-for = '(i, v) in deck.search.array'
				:data-swapy-slot = '`search_card${v}`'
				class = 'card'
			>
				<div :data-swapy-item = '`search_card${v}`'>
					<img :src = 'i' ref = 'search_card'></img>
				</div>
			</div>
		</div>
	</motion.div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, Reactive } from "vue";
	import { motion } from 'motion-v';
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../script/game';

	const src = 'https://jwyxym.top:50028/pics/xiao/66666666.jpg'
	interface deckObject {
		array : Array<string>;
		swapy : Swapy | undefined;
	}
	let deck : Reactive<{
		main : deckObject;
		extra : deckObject;
		side : deckObject;
		search : deckObject;
	}> = reactive({
		main : {
			array : [
				src, src, src, src, src, src, src, src, src, src, src, src
			],
			swapy : undefined
		},
		extra : {
			array : [
				src, src, src, src, src, src, src, src, src, src, src, src
			],
			swapy : undefined
		},
		side : {
			array : [
				src, src, src, src, src, src, src, src, src, src, src, src
			],
			swapy : undefined
		},
		search : {
			array : [
				src, src, src, src, src, src, src, src, src, src, src, src
			],
			swapy : undefined
		},
	})

	let main : Ref<HTMLElement | null> = ref(null);
	let extra : Ref<HTMLElement | null> = ref(null);
	let side : Ref<HTMLElement | null> = ref(null);
	let search : Ref<HTMLElement | null> = ref(null);
	let main_card : Ref<Array<HTMLElement> | null> = ref(null);
	let extra_card : Ref<Array<HTMLElement> | null> = ref(null);
	let side_card : Ref<Array<HTMLElement> | null> = ref(null);
	let search_card : Ref<Array<HTMLElement> | null> = ref(null);

	let des = ref('');

	onMounted(() => {
		if (mainGame.isAnroid())
			for (const i of [main, extra, side, search]) {
				if (i.value === null) continue;
				des.value += '1'
				Sortable.create(i.value, {
					animation : 150,
					draggable : '.card',
				})
			}
	})

	if (!mainGame.isAnroid())
		for (const i of [
			{ array : main_card, swapy : deck.main.swapy, element : main},
			{ array : extra_card, swapy : deck.extra.swapy, element : extra},
			{ array : side_card, swapy : deck.side.swapy, element : side}
		])
			watch(() => { return i.array; }, () => {
				console.log(1)
				if (i.element.value === null) return;
				if (i.swapy === undefined) {
					i.swapy = createSwapy(i.element.value, {
						animation : 'dynamic'
					});
					i.swapy.enable(true);
				} else {
					i.swapy.update();
				}
			}, { deep : true });

</script>
<style lang = 'scss'>
	@use '../style/deck.scss';
	@use '../style/ground_glass.scss';
</style>