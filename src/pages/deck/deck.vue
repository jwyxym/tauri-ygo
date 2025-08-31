<template>
	<div class = 'deck_body hover_ground'>
		<div class = 'cardinfo'>
			<var-card
				:elevation = '0'
				:title = 'cardinfo.name'
				:subtitle = 'cardinfo.name'
				:src = 'cardinfo.pic'
				image-height = '15.3vw'
				image-width = '10.5vw'
			/>
			<div class = 'description'>
				{{ cardinfo.description }}
			</div>
		</div>
		<var-card
			class = 'deck'
			:elevation = '4'
		>
			<div
				class = 'main'
				ref = 'main'
			>
				<div
					v-for = '(i, v) in deck.main'
					:data-swapy-slot = '`main_card:${v}:${i}`'
					class = 'card'
				>
					<div :data-swapy-item = '`main_card:${v}:${i}`' @mousedown = 'cardinfo.select(i)'>
						<img :src = 'deck.get_pic(i)' ref = 'main_card'></img>
					</div>
				</div>
			</div>
			<div
				class = 'extra'
				ref = 'extra'
			>
				<div
					v-for = '(i, v) in deck.extra'
					:data-swapy-slot = '`extra_card:${v}:${i}`'
					class = 'card'
				>
					<div :data-swapy-item = '`extra_card:${v}:${i}`' @mousedown = 'cardinfo.select(i)'>
						<img :src = 'deck.get_pic(i)' ref = 'extra_card'></img>
					</div>
				</div>
			</div>
			<div
				class = 'side'
				ref = 'side'
			>
				<div
					v-for = '(i, v) in deck.side'
					:data-swapy-slot = '`side_card:${v}:${i}`'
					class = 'card'
				>
					<div :data-swapy-item = '`side_card:${v}:${i}`' @mousedown = 'cardinfo.select(i)'>
						<img :src = 'deck.get_pic(i)' ref = 'side_card'></img>
					</div>
				</div>
			</div>
		</var-card>
		<div
			class = 'search'
			ref = 'search'
		>
			<div
				v-for = '(i, v) in deck.search'
				:data-swapy-slot = '`search_card${v}`'
				class = 'card'
			>
				<div :data-swapy-item = '`search_card${v}`'>
					<img :src = 'deck.get_pic(i)' ref = 'search_card'></img>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch, Reactive, onBeforeMount } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';

	const props = defineProps(['this_deck']);

	let deck = reactive({
		main : [],
		extra : [],
		side : [],
		search : [],
		get_pic : (card : string) : string => {
			const pic = mainGame.cards.get(parseInt(card))?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		}
	})

	let cardinfo = reactive({
		pic : '',
		description : '',
		name : '',
		select : (i : string) : void => {
			cardinfo.pic = deck.get_pic(i);
			const card = mainGame.cards.get(parseInt(i));
			cardinfo.name = card?.name ?? '';
			cardinfo.description = card?.desc ?? '';
		}
	});

	let swapy = {
		main : undefined as Swapy | undefined,
		extra : undefined as Swapy | undefined,
		side : undefined as Swapy | undefined,
		search : undefined as Swapy | undefined
	}

	let main : Ref<HTMLElement | null> = ref(null);
	let extra : Ref<HTMLElement | null> = ref(null);
	let side : Ref<HTMLElement | null> = ref(null);
	let search : Ref<HTMLElement | null> = ref(null);
	let main_card : Ref<Array<HTMLElement> | null> = ref(null);
	let extra_card : Ref<Array<HTMLElement> | null> = ref(null);
	let side_card : Ref<Array<HTMLElement> | null> = ref(null);
	let search_card : Ref<Array<HTMLElement> | null> = ref(null);

	onBeforeMount(() => {
		console.log(props.this_deck)
		if (props.this_deck) {
			deck.main = props.this_deck.main;
			deck.extra = props.this_deck.extra;
			deck.side = props.this_deck.side;
		}
	});

	onMounted(() => {
		if (mainGame.isAnroid())
			for (const i of [main, extra, side, search]) {
				if (i.value === null) continue;
				Sortable.create(i.value, {
					animation : 150,
					draggable : '.card',
				})
			}
	})

	if (!mainGame.isAnroid())
		for (const i of [
			{ array : main_card, swapy : swapy.main, element : main},
			{ array : extra_card, swapy : swapy.extra, element : extra},
			{ array : side_card, swapy : swapy.side, element : side}
		])
			watch(() => { return i.array; }, () => {
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
	@use '../../style/deck.scss';
	@use '../../style/ground_glass.scss';
	.var-card {
		background-color: transparent;
	}
</style>