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
				<div class = 'title'>
					<span class = 'name'>{{ cardinfo.name }}</span>
					<span class = 'id'>{{ cardinfo.id }}</span>
					<span>{{ cardinfo.subtitle.ot }}</span>
					<span>{{ cardinfo.subtitle.type }}</span>
					<span>{{ cardinfo.subtitle.level }}</span>
					<span>{{ cardinfo.subtitle.link }}</span>
				</div>
				<span class = 'content'>{{ cardinfo.description }}</span>
			</div>
		</div>
		<div
			class = 'deck'
			:elevation = '4'
		>
			<div class = 'head'>
				<Input
					:placeholder = 'mainGame.get.text().deck.name'
					:rules = 'deck.name_rule'
					:variant = 'true'
					v-model = 'deck.name'
				/>
				<div class = 'button_list'>
					<Button @click = 'offdeck' icon_name = 'exit'></Button>
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
		</div>
		<div
			class = 'search'
		>
			<Input
				:placeholder = 'mainGame.get.text().deck.search.name'
				:variant = 'true'
				v-model = 'search.info.desc'
			/>
			<div class = 'button_list'>
				<Button @click = 'search.in_setting' icon_name = 'setting'></Button>
				<Button @click = 'search.on' icon_name = 'search' :loading = 'search.button_loading'></Button>
			</div>
			<var-list
				:finished = 'search.finished'
				v-model:loading = 'search.loading'
				@scroll = 'search.load_on'
				@load = 'search.load'
				:immediate-check = 'false'
			>
				<div v-for = 'card in search.list' class = 'list'>
					<img :src = 'card.pic' class = 'card' @click = 'cardinfo.select(card.id)'></img>
					<div class = 'percard'>
						<div class = 'title'>
							<span>{{ card.name }}</span>
						</div>
						<div class = 'description'>
							<span>{{ card.id }}</span>
						</div>
					</div>
					<!-- <Button icon_name = 'deck'></Button> -->
				</div>
			</var-list>
		</div>
		<var-popup v-model:show = 'search.show_setting' position = 'right'>
			<var-form>
				<Select name = 'attribute' v-model = 'search.info.attribute'></Select>
				<Select name = 'race' v-model = 'search.info.race'></Select>
				<Select name = 'ot' v-model = 'search.form.ot' :multiple = 'true' :chip = 'true'></Select>
				<Select name = 'type' v-model = 'search.form.type' :multiple = 'true' :chip = 'true'></Select>
				<Select name = 'link' v-model = 'search.form.link' :multiple = 'true' :chip = 'true'></Select>
				<Select name = 'category' v-model = 'search.form.category' :multiple = 'true' :chip = 'true'></Select>
				<Input
					:placeholder = 'mainGame.get.text().deck.search.atk'
					:rules = 'search.rule.atk'
					v-model = 'search.info.atk'
				/>
				<Input
					:placeholder = 'mainGame.get.text().deck.search.def'
					:rules = 'search.rule.atk'
					v-model = 'search.info.def'
				/>
				<Input
					:placeholder = 'mainGame.get.text().deck.search.level'
					:rules = 'search.rule.level'
					v-model = 'search.info.level'
				/>
				<Input
					:placeholder = 'mainGame.get.text().deck.search.scale'
					:rules = 'search.rule.level'
					v-model = 'search.info.scale'
				/>
			</var-form>
			<br/>
			<div>
				<Button icon_name = 'exit' @click = 'search.off_setting'></Button>
			</div>
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import Button from '../varlet/button.vue';
	import Select from '../varlet/select.vue';
	import Input from '../varlet/input.vue';
	import Card, { CardInfo, Search } from '../../script/card';
	import toast from '../../script/toast';

	const props = defineProps(['this_deck', 'offdeck']);

	const deck = reactive({
		main : [],
		extra : [],
		side : [],
		name : '',
		get_pic : (card : number) : string => {
			const pic = mainGame.cards.get(card)?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		},
		name_rule : async (name : string) : Promise<string | boolean> => {
			if (name.match(constant.reg.name))
				return mainGame.get.text().deck.rule.name.unlawful;
			if ((await mainGame.load.deck()).filter(i => i.name === name).length > 0 && props.this_deck ? props.this_deck.name !== name : true)
				return mainGame.get.text().deck.rule.name.exist;
			return true;
		}
	})

	const cardinfo = reactive({
		pic : mainGame.textures.get(constant.str.files.textures.unknown),
		name : mainGame.get.text().deck.info,
		id : '',
		description : '',
		subtitle : {
			ot : '',
			type : '',
			level : '',
			link : ''
		},
		select : (i : string | number) : void => {
			i = typeof i === 'string' ? parseInt(i) : i;
			cardinfo.pic = deck.get_pic(i);
			const card = mainGame.cards.get(i);
			cardinfo.name = card?.name ?? '';
			cardinfo.id = card?.id.toString() ?? '';
			cardinfo.description = card?.desc ?? '';
			const info : CardInfo = card?.get_info() ?? {
				ot : '',
				level : '',
				atk : '',
				def : '',
				link : '',
				type : '',
				race : '',
				attribute : '',
				category : '',
				setcode : ''
			};
			cardinfo.subtitle.ot = info.ot.length > 0 ? `【${info.ot}】` : '';
			cardinfo.subtitle.type = `【${info.type}】${info.attribute} ${info.attribute !== '' ? '|' : ''} ${info.race}`;
			cardinfo.subtitle.level = card?.is_monster() ?? false ? `【${info.level}】${info.atk}/${info.def}` : '';
			cardinfo.subtitle.link = info.link.length > 0 ? `【${info.link}】` : '';
		}
	});

	const search = reactive({
		finished : false,
		loading : false,
		button_loading : false,
		show_setting : false,
		list : [] as Array<Card>,
		result : [] as Array<Card>,
		form : {
			ot : [] as Array<number>,
			type : [] as Array<number>,
			link : [] as Array<number>,
			category : [] as Array<number>,
		},
		rule : {
			atk : (atk : string) : string | boolean => {
				if (!atk.match(constant.reg.atk))
					return mainGame.get.text().deck.rule.atk.unlawful;
				return true;
			},
			level : (lv : string) : string | boolean => {
				if (!lv.match(constant.reg.level))
					return mainGame.get.text().deck.rule.level.unlawful;
				return true;
			}
		},
		info : {
			ot : 0,
			alias : 0,
			level : '',
			scale : '',
			atk : '',
			def : '',
			link : 0,
			type : 0,
			race : 0,
			attribute : 0,
			category : 0,
			setcode : 0,
			desc : ''
		} as Search,
		in_setting : () : void => {
			search.show_setting = true;
		},
		off_setting : () : void => {
			search.show_setting = false;
		},
		on : async () : Promise<void> => {
			if (typeof search.rule.level(search.info.scale ?? '') !== 'boolean'
				|| typeof search.rule.level(search.info.level ?? '') !== 'boolean'
				|| typeof search.rule.atk(search.info.atk ?? '') !== 'boolean'
				|| typeof search.rule.atk(search.info.def ?? '') !== 'boolean'
			) {
				search.in_setting();
				toast.error(mainGame.get.text().toast.error.search)
				return;
			}
			search.list = [];
			search.button_loading = true;
			search.result = mainGame.search.cards(search.info);
			search.finished = false;
			await search.load_on();
			search.button_loading = false;
		},
		load_on : async () : Promise<void> => {
			if (search.loading || search.finished) return;
			search.loading = true;
			await search.load();
		},
		load : async () : Promise<void> => {
			const length = search.list.length;
			if (search.list.length < search.result.length) {
				const cards = search.result.slice(length, length + 20 > search.result.length ? search.result.length : length + 20);
				await mainGame.load.pic(cards.map(i => i.id));
				search.list.push(...cards);
			}
			search.loading = false;
			search.finished = search.list.length >= search.result.length;
		}
	});

	const swapy = {
		main : undefined as Swapy | undefined,
		extra : undefined as Swapy | undefined,
		side : undefined as Swapy | undefined,
		search : undefined as Swapy | undefined
	}

	const info : Ref<HTMLElement | null> = ref(null);
	const card : Ref<HTMLElement | null> = ref(null);
	const main : Ref<HTMLElement | null> = ref(null);
	const extra : Ref<HTMLElement | null> = ref(null);
	const side : Ref<HTMLElement | null> = ref(null);
	const main_card : Ref<Array<HTMLElement> | null> = ref(null);
	const extra_card : Ref<Array<HTMLElement> | null> = ref(null);
	const side_card : Ref<Array<HTMLElement> | null> = ref(null);

	onBeforeMount(async () : Promise<void> => {
		if (props.this_deck) {
			deck.main = props.this_deck.main;
			deck.extra = props.this_deck.extra;
			deck.side = props.this_deck.side;
			deck.name = props.this_deck.name;
		}
		await search.on();
	});

	onMounted(() : void => {
		if (mainGame.is_android())
			for (const i of [main, extra, side]) {
				if (i.value === null) continue;
				Sortable.create(i.value, {
					animation : 150,
					draggable : '.card',
				})
			}
	})

	watch(() => { return search.form.ot; }, (n) => {
		search.info.ot = (n ?? []).reduce((a, b) => a + b, 0);
	});
	watch(() => { return search.form.type; }, (n) => {
		search.info.type = (n ?? []).reduce((a, b) => a + b, 0);
	});
	watch(() => { return search.form.link; }, (n) => {
		search.info.link = (n ?? []).reduce((a, b) => a + b, 0);
	});
	watch(() => { return search.form.category; }, (n) => {
		search.info.category = (n ?? []).reduce((a, b) => a + b, 0);
	});

	if (!mainGame.is_android())
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