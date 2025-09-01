<template>
	<div class = 'deck_body hover_ground'>
		<div class = 'cardinfo' ref = 'info'>
			<var-card
				:elevation = '0'
				:src = 'cardinfo.pic'
				image-height = '15.3vw'
				image-width = '10.5vw'
				ref = 'card'
			/>
			<div class = 'description'>
				<h2>{{ cardinfo.name }}</h2>
				<span>{{ cardinfo.name }}</span>
				<br></br>
				<span>{{ cardinfo.description }}</span>
			</div>
		</div>
		<var-card
			class = 'deck'
			:elevation = '4'
		>
			<div class = 'head'>
				<var-input
					variant = 'outlined'
					:placeholder = 'mainGame.get_text().deck.name'
					:rules = 'deck.name_rule'
					:clearable = 'true'
					v-model = 'deck.name'
					text-color = 'white'
					size = 'small'
				/>
				<div class = 'button_list'>
					<Button @click = 'offdeck' icon_name = 'home'></Button>
					<Button @click = 'offdeck' icon_name = 'save'></Button>
				</div>
			</div>
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
		>
			<var-input
				variant = 'outlined'
				:placeholder = 'mainGame.get_text().deck.search.name'
				:clearable = 'true'
				v-model = 'search.name'
				text-color = 'white'
				size = 'small'
			/>
			<!-- <div
				v-for = '(i, v) in deck.search'
				:data-swapy-slot = '`search_card${v}`'
				class = 'card'
			>
				<div :data-swapy-item = '`search_card${v}`'>
					<img :src = 'deck.get_pic(i)' ref = 'search_card'></img>
				</div>
			</div> -->
			<var-list
				:finished = 'search.finished'
				v-model:loading = 'search.loading'
				@scroll = 'search.load_on'
				@load = 'search.load'
			>
				<var-cell :key="item" v-for="item in search.list">
				列表项: {{ item }}
				</var-cell>
			</var-list>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import pos, { posLike } from '../../script/position';
	import Button from '../varlet/button.vue';

	const props = defineProps(['this_deck', 'offdeck']);

	let deck = reactive({
		main : [],
		extra : [],
		side : [],
		name : '',
		get_pic : (card : string) : string => {
			const pic = mainGame.cards.get(parseInt(card))?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		},
		name_rule : async (name : string) : Promise<string | boolean> => {
			if (name.match(constant.reg.name))
				return mainGame.get_text().deck.name_rule.unlawful;
			if ((await mainGame.load_deck()).filter(i => i.name === name).length > 0 && props.this_deck ? props.this_deck.name !== name : true)
				return mainGame.get_text().deck.name_rule.exist;
			return true;
		}
	})

	let cardinfo = reactive({
		pic : mainGame.textures.get(constant.str.files.textures.unknown),
		name : mainGame.get_text().deck.info,
		description : '',
		select : (i : string) : void => {
			cardinfo.get_height();
			cardinfo.pic = deck.get_pic(i);
			const card = mainGame.cards.get(parseInt(i));
			cardinfo.name = card?.name ?? '';
			cardinfo.description = card?.desc ?? '';
		},
		get_height : () : void => {
			let info_pos : posLike = {} as posLike;
			let card_pos : posLike = {} as posLike;
			pos.reactive.get(info_pos, info.value!)
			pos.reactive.get(card_pos, card.value!)
			height.value = info_pos.height - card_pos.height;
		}
	});

	let search = reactive({
		name : '',
		finished : false,
		loading : false,
		list : [] as Array<number>,
		result : [] as Array<number>,
		load_on : () => {
			if (search.loading || search.finished) return;
			search.loading = true;
			search.load();
		},
		load : () => {
			console.log(search.loading)
			setTimeout(() => {
				// for (let i = 0; i < 20; i++) {
				// 	search.list.push(list.value.length + 1)
				// }
				let i = 0;
				const length = search.list.length;
				while (search.list.length < search.result.length) {
					search.list.push(search.result[length + i]);
					i++;
					if (i == 20) break;
				}

				search.loading = false;
				search.finished = search.list.length >= search.result.length;
			}, 1000)
		}
	});

	let swapy = {
		main : undefined as Swapy | undefined,
		extra : undefined as Swapy | undefined,
		side : undefined as Swapy | undefined,
		search : undefined as Swapy | undefined
	}

	let height = ref(0);
	const info : Ref<HTMLElement | null> = ref(null);
	const card : Ref<HTMLElement | null> = ref(null);
	let main : Ref<HTMLElement | null> = ref(null);
	let extra : Ref<HTMLElement | null> = ref(null);
	let side : Ref<HTMLElement | null> = ref(null);
	let main_card : Ref<Array<HTMLElement> | null> = ref(null);
	let extra_card : Ref<Array<HTMLElement> | null> = ref(null);
	let side_card : Ref<Array<HTMLElement> | null> = ref(null);
	let search_card : Ref<Array<HTMLElement> | null> = ref(null);

	onBeforeMount(() => {
		if (props.this_deck) {
			deck.main = props.this_deck.main;
			deck.extra = props.this_deck.extra;
			deck.side = props.this_deck.side;
			deck.name = props.this_deck.name;
		}
	});

	onMounted(() => {
		cardinfo.get_height();
		if (mainGame.isAnroid())
			for (const i of [main, extra, side]) {
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
<style scoped lang = 'scss'>
	@use '../../style/deck.scss';
	@use '../../style/ground_glass.scss';
	@use '../../style/card.scss';
	.var-card {
		background-color: transparent;
	}
</style>