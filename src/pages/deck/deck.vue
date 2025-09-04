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
					<Button @click = 'deck.exit' icon_name = 'exit'></Button>
					<Button @click = 'deck.save' icon_name = 'save'></Button>
				</div>
			</div>
			<div
				class = 'main'
				ref = 'main'
			>
				<TransitionGroup tag = 'div' name = 'opacity' class = 'deck_main'>
					<div
						v-for = '(i, v) in deck.main'
						:data-swapy-slot = '`main_card:${v}:${i}`'
						class = 'card'
						:key = 'i'
						:id = 'i.toString()'
						@dblclick = 'deck.remove'
						@contextmenu = 'deck.remove'
					>
							<div :data-swapy-item = '`main_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
								<img :src = 'deck.get_pic(i)' ref = 'main_card'></img>
							</div>
					</div>
				</TransitionGroup>
			</div>
			<div
				class = 'extra'
				ref = 'extra'
			>
				<TransitionGroup tag = 'div' name = 'opacity' class = 'deck_extra'>
					<div
						v-for = '(i, v) in deck.extra'
						:data-swapy-slot = '`extra_card:${v}:${i}`'
						class = 'card'
						:key = 'i'
						:id = 'i.toString()'
						@dblclick = 'deck.remove'
						@contextmenu = 'deck.remove'
					>
							<div :data-swapy-item = '`extra_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
								<img :src = 'deck.get_pic(i)' ref = 'extra_card'></img>
							</div>
					</div>
				</TransitionGroup>
			</div>
			<div
				class = 'side'
				ref = 'side'
			>
				<TransitionGroup tag = 'div' name = 'opacity' class = 'deck_side'>
					<div
						v-for = '(i, v) in deck.side'
						:data-swapy-slot = '`side_card:${v}:${i}`'
						class = 'card'
						:key = 'i'
						:id = 'i.toString()'
						@dblclick = 'deck.remove'
						@contextmenu = 'deck.remove'
					>
							<div :data-swapy-item = '`side_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
								<img :src = 'deck.get_pic(i)' ref = 'side_card'></img>
							</div>
					</div>
				</TransitionGroup>
			</div>
		</div>
		<div class = 'search'>
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
					<div ref = 'searcher'>
						<img
							:src = 'card.pic'
							:id = 'card.id.toString()'
							class = 'card'
							@click = '($event) => {
								cardinfo.select(card.id);
								if (!mainGame.is_android())
									deck.push($event, card, 0);
							}'
							@contextmenu = 'deck.push($event, card, 1)'
						/>
					</div>
					<div class = 'card_name'>
						<div class = 'title'>
							<span>{{ card.name }}</span>
						</div>
						<div class = 'description'>
							<span>{{ card.id }}</span>
						</div>
					</div>
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
				<Select name = 'lflist' v-model = 'search.info.lflist'></Select>
				<Select name = 'forbidden' v-model = 'search.info.forbidden' :multiple = 'true' :chip = 'true' :readonly = 'search.rule.forbidden()'></Select>
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
		</var-popup>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';
	import { Dialog } from '@varlet/ui';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import Button from '../varlet/button.vue';
	import Select from '../varlet/select.vue';
	import Input from '../varlet/input.vue';
	import Card, { CardInfo, Search } from '../../script/card';
	import Deck from '../../script/deck';
	import toast from '../../script/toast';
	import fs from '../../script/fs';
	import gsap from '../../script/gsap';

	const props = defineProps(['this_deck', 'offdeck']);

	const deck = reactive({
		main : [] as Array<number>,
		extra : [] as Array<number>,
		side : [] as Array<number>,
		name : '',
		get_pic : (card : number) : string => {
			const pic = mainGame.cards.get(card)?.pic;
			return (pic ?? mainGame.textures.get(constant.str.files.textures.unknown)) ?? '';
		},
		name_rule : async (name : string | undefined) : Promise<string | boolean> => {
			if (name === undefined || name.length === 0)
				return mainGame.get.text().deck.rule.name.length;
			if (name.match(constant.reg.name))
				return mainGame.get.text().deck.rule.name.unlawful;
			if ((await mainGame.load.deck()).filter(i => i.name === name).length > 0 && (props.this_deck ? props.this_deck.name !== name : true))
				return mainGame.get.text().deck.rule.name.exist;
			return true;
		},
		get_dom : (v : number, show_all : boolean = true) : Array<HTMLElement> => {
			const get = () : Array<HTMLElement> => {
				switch (v) {
					case 0:
						return Array.from(main.value!.children[0].children) as Array<HTMLElement>;
					case 1:
						return Array.from(extra.value!.children[0].children) as Array<HTMLElement>;
					case 2:
						return Array.from(side.value!.children[0].children) as Array<HTMLElement>;
				}
				return [];
			}
			return show_all ? get() : get().filter(i => i.style.display !== 'none');
		},
		save : async () : Promise<void> => {
			const rule = await deck.name_rule(deck.name);
			if (typeof rule == 'boolean') {
				let main_deck : Array<number>;
				let extra_deck : Array<number>;
				let side_deck : Array<number>;
				if (mainGame.is_android()) {
					main_deck = deck.get_dom(0, false).map(i => parseInt(i.id));
					extra_deck = deck.get_dom(1, false).map(i => parseInt(i.id));
					side_deck = deck.get_dom(2, false).map(i => parseInt(i.id));
				} else {
					main_deck = deck.get_dom(0, false).map(i => parseInt(i.children[0].id));
					extra_deck = deck.get_dom(1, false).map(i => parseInt(i.children[0].id));
					side_deck = deck.get_dom(2, false).map(i => parseInt(i.children[0].id));
				}
				const write_deck = new Deck({
					main : main_deck,
					extra : extra_deck,
					side : side_deck,
					name : deck.name
				});
				const write = await fs.write.ydk(props.this_deck.name, write_deck);
				let rename = true;
				if (write && deck.name !== props.this_deck.name) {
					rename = await fs.rename.ydk(props.this_deck.name, deck.name);
				}
				if (write && rename)
					toast.info(mainGame.get.text().toast.deck.save);
			} else {
				toast.error(rule);
			}
		},
		push : (event: MouseEvent, card : Card, to_deck : number) : void => {
			event.preventDefault();
			switch(to_deck) {
				case 0:
					if (card.is_ex()) {
						deck.extra.push(card.id);
					} else {
						deck.main.push(card.id);
					}
					break;
				case 1:
					deck.side.push(card.id);
					break;
			}
		},
		remove : async (event : MouseEvent) : Promise<void> => {
			event.preventDefault();
			let el = event.target as HTMLElement;
			while (!el.classList.contains('card')) {
				const parent = el.parentElement;
				if (parent)
					el = parent;
				else break;
			}
			if (!el.classList.contains('card')) return;
			Dialog({
				message : mainGame.get.text().deck.remove.replace('{:?}', mainGame.cards.get(parseInt(el.children[0].id))?.name ?? ''),
				dialogClass : 'dialog',
				cancelButtonTextColor : 'white',
				confirmButtonTextColor : 'white',
				onConfirm : () => {
					gsap.leave({
						element : el,
						selector : el
					}, () : void => {
						el.style.display = 'none';
					});
				}
			});
		},
		exit : async () : Promise<void> => {
			Dialog({
				message : mainGame.get.text().deck.exit,
				dialogClass : 'dialog',
				cancelButtonTextColor : 'white',
				confirmButtonTextColor : 'white',
				onConfirm : props.offdeck
			});
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
			category : [] as Array<number>
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
			},
			forbidden : () : boolean => {
				return search.info.lflist === undefined || search.info.lflist === '';
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
			desc : '',
			forbidden : [],
			lflist : ''
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
		search : undefined as Swapy | undefined,
		create : (el : HTMLElement) : Swapy => {
			const s = createSwapy(el, {
				animation : 'dynamic'
			});
			s.enable(true);
			return s;
		}
	}


	interface SortableEvent {
		dragged: HTMLElement;
		draggedRect: DOMRect;
		related: HTMLElement | null;
		relatedRect: DOMRect | null;
		to: HTMLElement;
		from: HTMLElement;
		item: HTMLElement;
		clone: HTMLElement | null;
		oldIndex: number;
		newIndex: number;
		pullMode?: string;
		willInsertAfter?: boolean;
	}

	const sortable = {
		move : (evt : SortableEvent) => {
			if (evt.to.classList.contains('deck_side')) {
				return true;
			}
			const card = mainGame.cards.get(Number(evt.dragged.id));
			if (card && card.is_ex() && evt.to.classList.contains('deck_extra'))
				return true;
			else if (card && !card.is_ex() && evt.to.classList.contains('deck_main'))
				return true;
			return false;
		},
		array : [] as Array<HTMLElement>
	};

	const info : Ref<HTMLElement | null> = ref(null);
	const card : Ref<HTMLElement | null> = ref(null);
	const main : Ref<HTMLElement | null> = ref(null);
	const extra : Ref<HTMLElement | null> = ref(null);
	const side : Ref<HTMLElement | null> = ref(null);
	const searcher : Ref<Array<HTMLElement> | null> = ref(null);
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
		try {
		if (mainGame.is_android()) {
			for (const i of [main, extra, side]) {
				Sortable.create(i.value!.children[0], {
					animation : 150,
					draggable : '.card',
					group : 'deck',
					onMove : sortable.move
				})
			}
		}
	} catch (e) {
		cardinfo.subtitle.level += e
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
	watch(() => { return search.info.lflist; }, () => {
		if (search.rule.forbidden())
			search.info.forbidden = [];
	});

	if (mainGame.is_android()) {
		watch(searcher, (n) => {
			n?.forEach(i => {
				if (!sortable.array.includes(i)) {
					Sortable.create(i, {
						animation : 150,
						draggable : '.card',
						group: {
							name : 'deck',
							pull : 'clone',
							put : false
						},
						sort : false,
						onMove : sortable.move
					});
					sortable.array.push(i);
				}
			});
		}, { deep : true });
	} else {
		for (const i of [
			{ array : main_card, swapy : swapy.main, element : main},
			{ array : extra_card, swapy : swapy.extra, element : extra},
			{ array : side_card, swapy : swapy.side, element : side}
		]) {
			watch(() => { return i.array; }, () => {
				if (i.element.value === null) return;
				if (i.swapy === undefined)
					i.swapy = swapy.create(i.element.value);
				else
					i.swapy.update();
			}, { deep : true });
		}
	}

</script>
<style scoped lang = 'scss'>
	@use '../../style/deck.scss';
	@use '../../style/ground_glass.scss';
	@use '../../style/card.scss';
	@use '../../style/transition.scss';
	.var-card {
		background-color: transparent;
	}
</style>