<template>
	<div class = 'deck_body'>
		<transition name = 'move_right'>
			<Float_Buttons
				ref = 'float_buttons'
				:list = "[
					{
						click : deck.show.setting.select,
						icon : 'deck',
						show : true
					}, {
						click : deck.show.searcher.select,
						icon : 'search',
						show : true
					}, {
						click : deck.save,
						icon : 'save',
						show : true
					}, {
						click : deck.exit,
						icon : 'exit',
						show : true
					}
				]"
				v-show = '!deck.show.setting.chk && !deck.show.searcher.chk'
			/>
		</transition>
		<transition name = 'move_left'>
			<Card_Drawer
				:card = 'cardinfo.card'
				:deck = 'deck'
				:except = '[
					...(cards ?? []),
					float_buttons?.dom,
					deck_search?.dom
				]'
				:unshow = 'cardinfo.off'
				v-if = "cardinfo.card !== ''"
				ref = 'card_drawer'
			/>
		</transition>
		<transition name = 'move_right'>
			<Deck_Setting
				:deck = 'deck'
				:except = '[
					...(cards ?? []),
					float_buttons?.dom,
					card_drawer?.dom
				]'
				:unshow = 'deck.show.setting.unselect'
				v-if = 'deck.show.setting.chk'
			/>
		</transition>
		<transition name = 'move_right'>
			<Deck_Search
				:deck = 'deck'
				:search = 'search'
				:cardinfo = 'cardinfo'
				:except = '[
					...(cards ?? []),
					float_buttons?.dom,
					card_drawer?.dom
				]'
				:unshow = 'deck.show.searcher.unselect'
				v-if = 'deck.show.searcher.chk'
				ref = 'deck_search'
			/>
		</transition>
		<div class = 'deck_show'>
			<div class = 'deck'>
				<span>{{ `${mainGame.get.text(I18N_KEYS.DECK_MAIN)} : ${deck.ct.main}` }}</span>
				<div
					class = 'main'
					ref = 'main'
					:style = "{
						'--height' : `${(Math.trunc(deck.ct.main / 20) + 1) * (deck.size.height + 5)}px`,
						'--card_height' : `${deck.size.height}px`,
						'--card_width' : `${deck.size.width}px`
					}"
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_main'>
						<div
							v-for = '(i, v) in deck.main'
							:data-swapy-slot = '`main_card:${v}:${i}`'
							class = 'card'
							ref = 'cards'
							:key = 'i'
							:id = 'i.toString()'
						>
								<div :data-swapy-item = '`main_card:${v}:${i}`' :id = 'i.toString()' @click = 'cardinfo.on(i)'>
									<img :src = 'mainGame.get.card(i).pic' ref = 'main_card' :alt = 'i.toString()'></img>
									<var-badge type = 'primary' v-show = 'deck.get_ct(i) < 3'>
										<template #value>
											{{ deck.get_ct(i) }}
										</template>
									</var-badge>
								</div>
						</div>
					</TransitionGroup>
				</div>
				<span>{{ `${mainGame.get.text(I18N_KEYS.DECK_EXTRA)} : ${deck.ct.extra}` }}</span>
				<div
					class = 'extra'
					ref = 'extra'
					:style = "{
						'--height' : `${(Math.trunc(deck.ct.extra / 20) + 1) * (deck.size.height + 5)}px`,
						'--card_height' : `${deck.size.height}px`,
						'--card_width' : `${deck.size.width}px`
					}"
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_extra'>
						<div
							v-for = '(i, v) in deck.extra'
							:data-swapy-slot = '`extra_card:${v}:${i}`'
							class = 'card'
							ref = 'cards'
							:key = 'i'
							:id = 'i.toString()'
						>
								<div :data-swapy-item = '`extra_card:${v}:${i}`' :id = 'i.toString()' @click = 'cardinfo.on(i)'>
									<img :src = 'mainGame.get.card(i).pic' ref = 'extra_card' :alt = 'i.toString()'></img>
									<var-badge type = 'primary' v-show = 'deck.get_ct(i) < 3'>
										<template #value>
											{{ deck.get_ct(i) }}
										</template>
									</var-badge>
								</div>
						</div>
					</TransitionGroup>
				</div>
				<span>{{ `${mainGame.get.text(I18N_KEYS.DECK_SIDE)} : ${deck.ct.side}` }}</span>
				<div
					class = 'side'
					ref = 'side'
					:style = "{
						'--height' : `${(Math.trunc(deck.ct.side / 20) + 1) * (deck.size.height + 5)}px`,
						'--card_height' : `${deck.size.height}px`,
						'--card_width' : `${deck.size.width}px`
					}"
				>
					<TransitionGroup tag = 'div' name = 'scale' class = 'deck_side'>
						<div
							v-for = '(i, v) in deck.side'
							:data-swapy-slot = '`side_card:${v}:${i}`'
							class = 'card'
							:key = 'i'
							:id = 'i.toString()'
						>
								<div :data-swapy-item = '`side_card:${v}:${i}`' :id = 'i.toString()' @click = 'cardinfo.on(i)'>
									<img :src = 'mainGame.get.card(i).pic' ref = 'side_card' :alt = 'i.toString()'></img>
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
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount, onUnmounted } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';

	import mainGame from '../../script/game';
	import * as CONSTANT from '../../script/constant';
	import { I18N_KEYS } from "../../script/language/i18n";
	import Card, { Search } from '../../script/card';
	import toast from '../../script/toast';
	import fs from '../../script/fs';

	import Dialog from '../varlet/dialog';
	import Card_Drawer from './/card_drawer.vue';
	import Deck_Setting from './deck_setting.vue';
	import Deck_Search from './deck_search.vue';
	import Float_Buttons from '../varlet/float_buttons.vue';

	import Deck from './deck';

	const props = defineProps(['this_deck', 'offdeck', 'update']);

	const float_buttons : Ref<{ dom : HTMLElement } | null> = ref(null);
	const card_drawer : Ref<{ dom : HTMLElement } | null> = ref(null);
	const deck_search : Ref<{ dom : HTMLElement } | null> = ref(null);
	const cards : Ref<Array<HTMLElement> | null> = ref(null);
	const main : Ref<HTMLElement | null> = ref(null);
	const extra : Ref<HTMLElement | null> = ref(null);
	const side : Ref<HTMLElement | null> = ref(null);
	const main_card : Ref<Array<HTMLElement> | null> = ref(null);
	const extra_card : Ref<Array<HTMLElement> | null> = ref(null);
	const side_card : Ref<Array<HTMLElement> | null> = ref(null);

	const deck = reactive({
		main : [] as Array<number>,
		extra : [] as Array<number>,
		side : [] as Array<number>,
		name : '',
		show : {
			setting : {
				chk : false,
				select : () : void => {
					deck.show.setting.chk = true;
				},
				unselect : () : void => {
					deck.show.setting.chk = false;
				}
			},
			searcher : {
				chk : false,
				select : () : void => {
					deck.show.searcher.chk = true;
				},
				unselect : () : void => {
					deck.show.searcher.chk = false;
				}
			},
		},
		size : {
			count : 20,
			width : 0,
			height : 0,
			resize : () => {
				const width = (window.innerWidth * 0.97 * 0.81) / 20;
				deck.size.width = width;
				deck.size.height = width * 1.45; 
			}
		},
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
		name_rule : async (name : string | undefined) : Promise<string | boolean> => {
			if (name === undefined || name.length === 0)
				return mainGame.get.text(I18N_KEYS.DECK_RULE_NAME_LEN);
			if (name.match(CONSTANT.REG.NAME))
				return mainGame.get.text(I18N_KEYS.DECK_RULE_NAME_UNLAWFUL);
			if ((await mainGame.load.deck()).filter(i => i.name === name).length > (props.this_deck.new || (props.this_deck.name.length > 0 && props.this_deck.name !== name) ? 0 : 1))
				return mainGame.get.text(I18N_KEYS.DECK_RULE_NAME_EXIST);
			return true;
		},
		save : async () : Promise<void> => {
			const rule = await deck.name_rule(deck.name);
			if (typeof rule == 'boolean') {
				const write_deck = new Deck({
					main : deck.main,
					extra : deck.extra,
					side : deck.side,
					name : deck.name
				});
				const write = await fs.write.ydk(props.this_deck.name?.length ?? 0 > 0 ? props.this_deck.name : deck.name, write_deck);
				let rename = true;
				if (write && deck.name !== props.this_deck.name && (props.this_deck.name?.length ?? 0 > 0)) {
					rename = await fs.rename.ydk(props.this_deck.name, deck.name);
				}
				if (write && rename)
					toast.info(mainGame.get.text(I18N_KEYS.DECK_SAVE_COMPELETE));
				if (props.this_deck.new)
					props.update(deck.name);
			} else {
				toast.error(rule);
			}
		},
		push : {
			main : (code : string | number) : void => {
				code = typeof code === 'string' ? Number(code) : code;
				const card : Card = mainGame.get.card(code);
				if (card.is_token()) return;
				const cards = [...deck.main, ...deck.extra, ...deck.side];
				const ct = search.info.lflist ? mainGame.get.lflist(search.info.lflist, card.id) as number : mainGame.get.system(CONSTANT.KEYS.SETTING_CT_CARD) as number;
				if (cards.filter(i => i === code).length >= ct) {
					toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_MAX, ct.toString()));
					return;
				}
				if (card.is_ex()) {
					if (deck.extra.length >= 15)
						toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, '15'));
					else deck.extra.push(code);
				} else {
					if (deck.main.length >= 60)
						toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, '60'));
					else deck.main.push(code);
				}
			},
			side : (code : string | number) : void => {
				code = typeof code === 'string' ? Number(code) : code;
				const card : Card = mainGame.get.card(code);
				if (card.is_token()) return;
				const cards = [...deck.main, ...deck.extra, ...deck.side];
				const ct = search.info.lflist ? mainGame.get.lflist(search.info.lflist, card.id) as number : 3;
				if (cards.filter(i => i === code).length >= ct) {
					toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, ct.toString()));
					return;
				}
				if (deck.side.length >= 15)
					toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, '60'));
				else deck.side.push(code);
			}
		},
		remove : {
			on : (func : () => void, title : string) : void => {
				Dialog({
					title : title,
					onConfirm : func
				}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_DELETE_DECK));
			},
			main : (code : string | number) : void => {
				const card : Card = mainGame.get.card(code);
				const title = mainGame.get.text(I18N_KEYS.CARD_REMOVE, card.name);
				const leave = () => {
					const d = card.is_ex() ? deck.extra : deck.main;
					const ct = d.findIndex(i => i == code);
					if (ct > -1)
						d.splice(ct, 1);
					else
						toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_LESS));
				};
				deck.remove.on(leave, title);
			},
			side : (code : string | number) : void => {
				const card : Card = mainGame.get.card(code);
				const title = mainGame.get.text(I18N_KEYS.CARD_REMOVE, card.name);
				const leave = () => {
					const d = deck.side;
					const ct = d.findIndex(i => i == code);
					if (ct > -1)
						d.splice(ct, 1);
					else
						toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_LESS));
				};
				deck.remove.on(leave, title);
			}
		},
		exit : async () : Promise<void> => {
			Dialog({
				title : mainGame.get.text(I18N_KEYS.DECK_EXIT),
				onConfirm : props.offdeck
			}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_EXIT_DECK));
		}
	})

	const cardinfo = reactive({
		card : '' as string | number,
		on : async (i : string | number) : Promise<void> => {
			if (cardinfo.card !== '' && `${cardinfo.card }` !== `${i}`) {
				cardinfo.card = '';
				await mainGame.sleep(500);
			}
			cardinfo.card = i;
		},
		off : () : void => {
			cardinfo.card = '';
		}
	});

	const search = reactive({
		form : {
			ot : [] as Array<number>,
			type : [] as Array<number>,
			link : [] as Array<number>,
			category : [] as Array<number>
		},
		rule : {
			atk : (atk : string) : string | boolean => {
				if (!atk.match(CONSTANT.REG.ATK))
					return mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_ATK);
				return true;
			},
			level : (lv : string) : string | boolean => {
				if (!lv.match(CONSTANT.REG.LV))
					return mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_LV);
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
		} as Search
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
	});

	onMounted(() : void => {
		if (mainGame.is_android()) {
			for (const i of [main, extra, side]) {
				Sortable.create(i.value!.children[0], {
					animation : 150,
					draggable : '.card'
				})
			}
		}
		deck.size.resize();
		window.addEventListener("resize", deck.size.resize);
	})

	onUnmounted(() => {
		window.removeEventListener("resize", deck.size.resize);
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

	if (!mainGame.is_android()) {
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