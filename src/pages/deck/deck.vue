<template>
	<div class = 'deck_body over_ground'>
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
		<div class = 'deck_show'>
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
			<div class = 'deck'>
				<var-divider :description = '`${mainGame.get.text().deck.main} : ${deck.ct.main}`'/>
				<div
					class = 'main'
					ref = 'main'
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_main'>
						<div
							v-for = '(i, v) in deck.main'
							:data-swapy-slot = '`main_card:${v}:${i}`'
							class = 'card'
							:key = 'i'
							:id = 'i.toString()'
							@dblclick = 'deck.dbl_click($event, i)'
							@contextmenu = 'deck.right_click($event, i)'
						>
								<div :data-swapy-item = '`main_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
									<img :src = 'deck.get_pic(i)' ref = 'main_card' :alt = 'i.toString()'></img>
									<var-badge type = 'primary' v-show = 'deck.get_ct(i) < 3'>
										<template #value>
											{{ deck.get_ct(i) }}
										</template>
									</var-badge>
								</div>
						</div>
					</TransitionGroup>
				</div>
				<var-divider :description = '`${mainGame.get.text().deck.extra} : ${deck.ct.extra}`'/>
				<div
					class = 'extra'
					ref = 'extra'
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_extra'>
						<div
							v-for = '(i, v) in deck.extra'
							:data-swapy-slot = '`extra_card:${v}:${i}`'
							class = 'card'
							:key = 'i'
							:id = 'i.toString()'
							@dblclick = 'deck.dbl_click($event, i)'
							@contextmenu = 'deck.right_click($event, i)'
						>
								<div :data-swapy-item = '`extra_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
									<img :src = 'deck.get_pic(i)' ref = 'extra_card' :alt = 'i.toString()'></img>
									<var-badge type = 'primary' v-show = 'deck.get_ct(i) < 3'>
										<template #value>
											{{ deck.get_ct(i) }}
										</template>
									</var-badge>
								</div>
						</div>
					</TransitionGroup>
				</div>
				<var-divider :description = '`${mainGame.get.text().deck.side} : ${deck.ct.side}`'/>
				<div
					class = 'side'
					ref = 'side'
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_side'>
						<div
							v-for = '(i, v) in deck.side'
							:data-swapy-slot = '`side_card:${v}:${i}`'
							class = 'card'
							:key = 'i'
							:id = 'i.toString()'
							@dblclick = 'deck.dbl_click($event, i)'
							@contextmenu = 'deck.right_click($event, i)'
						>
								<div :data-swapy-item = '`side_card:${v}:${i}`' :id = 'i.toString()' @mousedown = 'cardinfo.select(i)'>
									<img :src = 'deck.get_pic(i)' ref = 'side_card' :alt = 'i.toString()'></img>
									<var-badge type = 'primary' v-show = 'deck.get_ct(i) < 3'>
										<template #value>
											{{ deck.get_ct(i) }}
										</template>
									</var-badge>
								</div>
						</div>
					</TransitionGroup>
				</div>
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
					<div
						ref = 'searcher'
						class = 'searcher'
					>
						<div class = 'card search_card'>
							<div>
								<img
									:src = 'card.pic'
									:id = 'card.id.toString()'
									:alt = 'card.id.toString()'
									@contextmenu = 'deck.right_click($event, card)'
									@dblclick = 'deck.dbl_click($event, card)'
									@mousedown = 'cardinfo.select(card.id)'
								/>
								<var-badge type = 'primary' v-show = 'deck.get_ct(card.id) < 3'>
									<template #value>
										{{ deck.get_ct(card.id) }}
									</template>
								</var-badge>
							</div>
						</div>
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
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount, onUnmounted } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import Button from '../varlet/button.vue';
	import Select from '../varlet/select.vue';
	import Input from '../varlet/input.vue';
	import Card, { CardInfo, Search } from '../../script/card';
	import toast from '../../script/toast';
	import fs from '../../script/fs';
	import gsap from '../../script/gsap';

	import Dialog from '../varlet/dialog';

	import Deck from './deck';

	const props = defineProps(['this_deck', 'offdeck', 'update']);

	const deck = reactive({
		main : [] as Array<number>,
		extra : [] as Array<number>,
		side : [] as Array<number>,
		name : '',
		ct : {
			main : 0,
			extra : 0,
			side : 0,
			remove : (el : HTMLElement) : void => {
				if (el.parentElement?.classList.contains('deck_main'))
					deck.ct.main --;
				else if (el.parentElement?.classList.contains('deck_extra'))
					deck.ct.extra --;
				else if (el.parentElement?.classList.contains('deck_side'))
					deck.ct.side --;
			}
		},
		get_ct : (id : number) : number => {
			return search.rule.forbidden() ? 3 : mainGame.get.lflist(search.info.lflist!, id) as number;
		},
		get_pic : (card : string | number) : string => {
			const pic = mainGame.get.card(card).pic;
			return pic;
		},
		name_rule : async (name : string | undefined) : Promise<string | boolean> => {
			if (name === undefined || name.length === 0)
				return mainGame.get.text().rule.name.length;
			if (name.match(constant.reg.name))
				return mainGame.get.text().rule.name.unlawful;
			if ((await mainGame.load.deck()).filter(i => i.name === name).length > (props.this_deck.new || (props.this_deck.name.length > 0 && props.this_deck.name !== name) ? 0 : 1))
				return mainGame.get.text().rule.name.exist;
			return true;
		},
		get_card : (el : HTMLElement) : HTMLElement | undefined => {
			while (!el.classList.contains('card')) {
				const parent = el.parentElement;
				if (parent)
					el = parent;
				else return undefined;
			}
			return el;
		},
		get_id : (el : HTMLElement) : string => {
			return mainGame.is_android() ? (el!.children[0]!.children[0] as HTMLImageElement).alt : el.children[0].id;
		},
		get_dom : (v : number, show_all : boolean = false) : Array<HTMLElement> => {
			const get = () : Array<HTMLElement | undefined> => {
				switch (v) {
					case 0:
						return Array.from(main.value?.children[0].children ?? []) as Array<HTMLElement>;
					case 1:
						return Array.from(extra.value?.children[0].children ?? []) as Array<HTMLElement>;
					case 2:
						return Array.from(side.value?.children[0].children ?? []) as Array<HTMLElement>;
				}
				return [];
			}
			return show_all ? get().filter(i => i !== undefined) : get().filter(i => i !== undefined).filter(i => {
				const p = i.parentElement?.parentElement ?? undefined;
				return mainGame.is_android() && p !== undefined && p.classList.contains('card') ? p.style.display !== 'none' : i.style.display !== 'none';
			});
		},
		save : async () : Promise<void> => {
			const rule = await deck.name_rule(deck.name);
			if (typeof rule == 'boolean') {
				let main_deck : Array<number>;
				let extra_deck : Array<number>;
				let side_deck : Array<number>;
				main_deck = deck.get_dom(0).map(i => parseInt(deck.get_id(i)));
				extra_deck = deck.get_dom(1).map(i => parseInt(deck.get_id(i)));
				side_deck = deck.get_dom(2).map(i => parseInt(deck.get_id(i)));
				const write_deck = new Deck({
					main : main_deck,
					extra : extra_deck,
					side : side_deck,
					name : deck.name
				});
				const write = await fs.write.ydk(props.this_deck.name?.length ?? 0 > 0 ? props.this_deck.name : deck.name, write_deck);
				let rename = true;
				if (write && deck.name !== props.this_deck.name && (props.this_deck.name?.length ?? 0 > 0)) {
					rename = await fs.rename.ydk(props.this_deck.name, deck.name);
				}
				if (write && rename)
					toast.info(mainGame.get.text().toast.save);
				if (props.this_deck.new)
					props.update(deck.name);
			} else {
				toast.error(rule);
			}
		},
		push : (card : Card, to_deck : number = 3) : void => {
			if (card.is_token()) return;
			const main = deck.get_dom(0);
			const extra = deck.get_dom(1);
			const side = deck.get_dom(2);
			const cards = [...main, ...extra, ...side];
			const ct = search.info.lflist ? mainGame.get.lflist(search.info.lflist, card.id) as number : 3;
			if (cards.filter(i => i.children[0].id === card.id.toString()).length + 1 > ct) {
				toast.error(mainGame.get.text().rule.deck.card_count.replace(constant.str.replace.tauri,ct.toString()));
			} else {
				if (to_deck > 2) {
					to_deck = card.is_ex() ? (extra.length + 1 > 15 ? 2 : 1) : (main.length + 1 > 60 ? 2 : 0);
					if (to_deck == 2 && side.length + 1 > 15) {
						toast.error(mainGame.get.text().rule.deck.deck_count.replace(constant.str.replace.tauri, ''))
						return;
					}
				}
				switch(to_deck) {
					case 0:
						main.length + 1 > 60 ? toast.error(mainGame.get.text().rule.deck.deck_count.replace(constant.str.replace.tauri, '60')) :
							deck.main.push(card.id);
						deck.ct.main ++;
						break;
					case 1:
						extra.length + 1 > 15 ? toast.error(mainGame.get.text().rule.deck.deck_count.replace(constant.str.replace.tauri, '15')) : 
							deck.extra.push(card.id);
						deck.ct.extra ++;
						break;
					case 2:
						side.length + 1 > 15 ? toast.error(mainGame.get.text().rule.deck.deck_count.replace(constant.str.replace.tauri, '15')) : 
							deck.side.push(card.id);
						deck.ct.side ++;
						break;
				}
			}
		},
		move : (el: HTMLElement, card : Card, to_deck : number) : void => {
			const to = deck.get_dom(to_deck);
			if (to.length + 1 > [60, 15, 15][to_deck]) {
				toast.error(mainGame.get.text().rule.deck.deck_count.replace(constant.str.replace.tauri, [60, 15, 15][to_deck].toString()));
			} else {
				gsap.scale(el, () => { el.style.display = 'none'; deck.ct.remove(el); });
				switch(to_deck) {
					case 0:
						deck.main.push(card.id);
						deck.ct.main ++;
						break;
					case 1:
						deck.extra.push(card.id);
						deck.ct.extra ++;
						break;
					case 2:
						deck.side.push(card.id);
						deck.ct.side ++;
						break;
					}
			}
		},
		remove : async (el : HTMLElement, name : string) : Promise<void> => {
			const title = mainGame.get.text().deck.remove.replace(constant.str.replace.tauri, name);
			const leave = () => {
				gsap.leave(el, () : void => {
					el.style.display = 'none';
				});
				deck.ct.remove(el);
			};
			Dialog({
				title : title,
				onConfirm : leave
			}, mainGame.get.system(constant.str.system_conf.chk.deck_delete));
		},
		exit : async () : Promise<void> => {
			console.log(mainGame.get.system(constant.str.system_conf.chk.deck_exit))
			Dialog({
				title : mainGame.get.text().deck.exit,
				onConfirm : props.offdeck
			}, mainGame.get.system(constant.str.system_conf.chk.deck_exit));
		},
		dbl_click : async (event : MouseEvent, card : Card | number) : Promise<void> => {
			if (mainGame.is_android()) return;
			if (typeof card === 'number')
				card = mainGame.get.card(card);
			const el = deck.get_card(event.target as HTMLElement);
			if (!el) return;
			if (el.parentElement!.classList.contains('searcher')) {
				deck.push(card as Card, 2);
			} else {
				const class_list = el.parentElement!.classList;
				const to_deck = class_list.contains('deck_main') || class_list.contains('deck_extra') ? 2 : card.is_ex() ? 1 : 0;
				deck.move(el, card, to_deck);
			}
		},
		right_click : async (event : MouseEvent, card : Card | number) : Promise<void> => {
			if (mainGame.is_android()) return;
			if (typeof card === 'number')
				card = mainGame.get.card(card);
			const el = deck.get_card(event.target as HTMLElement);
			if (!el) return;
			if (el.parentElement!.classList.contains('searcher')) {
				deck.push(card, card.is_ex() ? 1 : 0);
			} else {
				await deck.remove(el, card.name);
			}
		},
	})

	const cardinfo = reactive({
		pic : mainGame.get.textures(constant.str.files.textures.unknown),
		name : mainGame.get.text().deck.info,
		id : '',
		description : '',
		subtitle : {
			ot : '',
			type : '',
			level : '',
			link : ''
		},
		select : (i : string | number, chk : boolean = true) : void => {
			if (mainGame.is_android() && chk) return;
			cardinfo.pic = deck.get_pic(i);
			const card = mainGame.get.card(i);
			cardinfo.name = card.name;
			cardinfo.id = card.id.toString();
			cardinfo.description = card.desc;
			const info : CardInfo = card.get_info()
			cardinfo.subtitle.ot = info.ot.length > 0 ? `【${info.ot}】` : '';
			cardinfo.subtitle.type = `【${info.type}】${info.attribute} ${info.attribute !== '' ? '|' : ''} ${info.race}`;
			cardinfo.subtitle.level = card.is_monster() ? `【${info.level}】${info.atk}/${info.def}` : '';
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
					return mainGame.get.text().rule.atk.unlawful;
				return true;
			},
			level : (lv : string) : string | boolean => {
				if (!lv.match(constant.reg.level))
					return mainGame.get.text().rule.level.unlawful;
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
				toast.error(mainGame.get.text().rule.search)
				return;
			}
			search.list = [];
			search.button_loading = true;
			search.result = mainGame.search.cards(search.info);
			search.finished = false;
			await search.load_on();
			search.button_loading = false;
		},
		load_on : async (event : Event | undefined = undefined) : Promise<void> => {
			if (event) {
				const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;
				if (scrollHeight / search.list.length < scrollHeight - scrollTop - clientHeight)
					return;
			}
			if (!search.loading && !search.finished) {
				search.loading = true;
				await search.load();
			}
		},
		load : async () : Promise<void> => {
			const length = search.list.length;
			if (search.list.length < search.result.length) {
				const cards = search.result.slice(length, length + 250 > search.result.length ? search.result.length : length + 250);
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
		array : [] as Array<HTMLElement>,
		cards : {
			main : [] as Array<HTMLElement>,
			extra : [] as Array<HTMLElement>,
			side : [] as Array<HTMLElement>,
		},
		choose : () : void => {
			sortable.cards.main = deck.get_dom(0) as Array<HTMLImageElement>;
			sortable.cards.extra = deck.get_dom(1) as Array<HTMLImageElement>;
			sortable.cards.side = deck.get_dom(2) as Array<HTMLImageElement>;
		},
		end : () : void => {
			sortable.cards.main = [];
			sortable.cards.extra = [];
			sortable.cards.side = [];
			deck.ct.main = deck.get_dom(0).length;
			deck.ct.extra = deck.get_dom(1).length;
			deck.ct.side = deck.get_dom(2).length;
		},
		move : (evt : SortableEvent) : boolean => {
			const el = deck.get_card(evt.dragged as HTMLElement);
			if (el) {
				const card = mainGame.get.card(deck.get_id(el));
				const ct = search.info.lflist ? mainGame.get.lflist(search.info.lflist, card.id) as number : 3;
				const id = card.id.toString() ?? '';
				if(card.is_token())
					return false;
				if (evt.from.classList.contains('searcher') && [...sortable.cards.main, ...sortable.cards.extra, ...sortable.cards.side].filter(i => deck.get_id(i) === id).length + 1 > ct)
					return false;
				if (evt.to.classList.contains('deck_side') && sortable.cards.side.length + 1 <= 15)
					return true;
				if (card.is_ex() && evt.to.classList.contains('deck_extra') && sortable.cards.extra.length + 1 <= 15)
					return true;
				if (!card.is_ex() && evt.to.classList.contains('deck_main') && sortable.cards.main.length + 1 <= 60)
					return true;
			}
			return false;
		}
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

	const android = {
		dbl_click : async (event : MouseEvent) : Promise<void> => {
			const el = deck.get_card(event.target as HTMLElement);
			if (!el) return;
			const card = mainGame.get.card(deck.get_id(el))!;
			el.parentElement!.classList.contains('searcher') ? deck.push(card) : await deck.remove(el, card.name);
		},
		select : (event : MouseEvent) : void => {
			const el = deck.get_card(event.target as HTMLElement);
			if (!el) return;
			cardinfo.select(deck.get_id(el), false);
		}
	}

	onBeforeMount(async () : Promise<void> => {
		const d = props.this_deck;
		await mainGame.load.pic([...d.main, ...d.extra, ...d.side]);
		if (props.this_deck) {
			deck.main = d.main;
			deck.extra = d.extra;
			deck.side = d.side;
			deck.name = d.name;
			deck.ct.main = d.main.length;
			deck.ct.extra = d.extra.length;
			deck.ct.side = d.side.length;
		}
		await search.on();
	});

	onMounted(() : void => {
		if (mainGame.is_android()) {
			for (const i of [main, extra, side]) {
				Sortable.create(i.value!.children[0], {
					animation : 150,
					draggable : '.card',
					group : 'deck',
					onMove : sortable.move,
					onChoose : sortable.choose,
					onEnd : sortable.end
				})
			}
			document.addEventListener('dblclick', android.dbl_click);
			document.addEventListener('mousedown', android.select);
		}
	})

	onUnmounted(() => {
		if (mainGame.is_android()) {
			document.removeEventListener('dblclick', android.dbl_click);
			document.removeEventListener('mousedown', android.select);
		}
	});

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
						onMove : sortable.move,
						onChoose : sortable.choose,
						onEnd : sortable.end
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
	@use './deck.scss';
</style>