<template>
	<main class = 'deck'>
		<Card_Box
			:height = 'page.height'
			:width = 'page.width[0]'
			:code = 'page.card'
			@card = 'page.oncard'
		/>
		<Deck_Box
			:height = 'page.height'
			:width = 'page.width[1]'
			:count = '10'
			:deck = 'this_deck'
			:lflist = 'search.info.lflist'
			@card = 'page.oncard'
			@move = 'page.move.on'
			@hover = '(hover : Hover) => page.hover = hover'
		/>
		<Search_Box
			:height = 'page.height'
			:width = 'page.width[0]'
			:count = '10'
			:hover = 'page.hover!'
			:move = 'page.move'
			@card = 'page.oncard'
			@lflist = '(lflist : string) => search.info.lflist = lflist'
		/>
	</main>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, Ref, watch, onBeforeMount, onUnmounted } from "vue";
	import { createSwapy, Swapy } from 'swapy';
	import Sortable from 'sortablejs';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';

	import mainGame from '@/script/game';
	import * as CONSTANT from '@/script/constant';
	import { I18N_KEYS } from "@/script/language/i18n";
	import Card, { Search } from '@/script/card';
	import toast from '@/script/toast';
	import fs from '@/script/fs';

	import Dialog from '@/pages/ui/dialog';
	import Deck_Box, { Hover } from '@/pages/ui/deck.vue';
	import Card_Box from '@/pages/ui/card_info.vue';
	import Float_Buttons from '@/pages/ui/float_buttons.vue';
	import Card_Drawer from './card.vue';
	import Deck_Setting from './setting.vue';
	import Deck_Search from './search.vue';

	import Deck from './deck';
	import Search_Box from './searcher.vue';

	const page = reactive({
		height : 0,
		width : new Array(2).fill(0),
		resize : () : void => {
			page.height = window.innerHeight * 0.9;
			const width = Math.max(window.innerWidth * 0.4, 300) + 30;
			page.width[0] = (window.innerWidth - width) / 2;
			page.width[1] = width;
		},
		card : 0,
		move : {
			x : 0,
			y : 0,
			on : (x : number, y : number) => {
				page.move.x = x;
				page.move.y = y;
			}
		},
		hover : undefined as undefined | Hover,
		oncard : (card : number) => page.card = card
	});

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
				block : false,
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
		get_ct : (id : number) : number => {
			return (search.rule.forbidden() ? mainGame.get.system(CONSTANT.KEYS.SETTING_CT_CARD) : mainGame.get.lflist(search.info.lflist!, id)) as number;
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
		to_deck : () : Deck => {
			return new Deck({
				main : Array.from(main.value!.querySelectorAll('img') ?? []).map(i => parseInt(i.alt)),
				extra : Array.from(extra.value!.querySelectorAll('img') ?? []).map(i => parseInt(i.alt)),
				side : Array.from(side.value!.querySelectorAll('img') ?? []).map(i => parseInt(i.alt)),
				name : deck.name
			});
		},
		save : async () : Promise<void> => {
			const rule = await deck.name_rule(deck.name);
			if (typeof rule == 'boolean') {
				const write_deck = deck.to_deck();
				const write = await fs.write.ydk(props.this_deck.name?.length ?? 0 > 0 ? props.this_deck.name : deck.name, write_deck);
				let rename = true;
				if (write && deck.name !== props.this_deck.name && (props.this_deck.name?.length ?? 0 > 0))
					rename = await fs.rename.ydk(props.this_deck.name, deck.name);
				if (write && rename)
					toast.info(mainGame.get.text(I18N_KEYS.DECK_SAVE_COMPELETE));
				if (props.this_deck.new)
					props.update(deck.name);
				deck.show.setting.unselect();
			} else {
				toast.error(rule);
			}
		},
		copy : async () : Promise<void> => {
			const d = deck.to_deck();
			const text = d.toYGOMobileDeckURL();
			await writeText(text);
			toast.info(mainGame.get.text(I18N_KEYS.DECK_COPY_COMPELETE));
		},
		clear : async (chk : boolean = true) : Promise<void> => {
			const on = async () : Promise<void> => {
				deck.main.length = 0;
				deck.extra.length = 0;
				deck.side.length = 0;
			};
			deck.show.setting.block = true;
			await Dialog({
				title : mainGame.get.text(I18N_KEYS.DECK_CLEAR),
				onConfirm : on,
				onClose : () => {
					setTimeout(() => {
						deck.show.setting.block = false;
					}, 200);
				}
			}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_CLEAR_DECK) && chk);
		},
		sort : async () : Promise<void> => {
			const on = async () : Promise<void> => {
				const d = deck.to_deck();
				await deck.clear(false);
				await mainGame.sleep(500);
				const sort = (a : number, b : number) : number => {
					const card = {
						a : mainGame.get.card(a),
						b : mainGame.get.card(b)
					};
					return card.a.level === card.b.level ? card.a.id - card.b.id : card.b.level - card.a.level;
				};
				deck.main.push(...d.main.sort(sort));
				deck.extra.push(...d.extra.sort(sort));
				deck.side.push(...d.side.sort(sort));
			};
			deck.show.setting.block = true;
			await Dialog({
				title : mainGame.get.text(I18N_KEYS.DECK_SORT),
				onConfirm : on,
				onClose : () => {
					setTimeout(() => {
						deck.show.setting.block = false;
					}, 200);
				}
			}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_SORT_DECK));
		},
		disrupt : async () : Promise<void> => {
			const on = async () : Promise<void> => {
				const d = deck.to_deck();
				await deck.clear(false);
				await mainGame.sleep(500);
				const sort = () : number =>  Math.random() - 0.5;
				deck.main.push(...d.main.sort(sort));
				deck.extra.push(...d.extra.sort(sort));
				deck.side.push(...d.side.sort(sort));
			};
			deck.show.setting.block = true;
			await Dialog({
				title : mainGame.get.text(I18N_KEYS.DECK_DISRUPT),
				onConfirm : on,
				onClose : () => {
					setTimeout(() => {
						deck.show.setting.block = false;
					}, 200);
				}
			}, mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_DISRUPT_DECK));
		},
		push : {
			main : (code : string | number) : void => {
				code = typeof code === 'string' ? Number(code) : code;
				const card : Card = mainGame.get.card(code);
				if (card.is_token()) return;
				const cards = deck.main.concat(deck.extra, deck.side);
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
				const cards = deck.main.concat(deck.extra, deck.side);
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
			block : false,
			on : (func : () => void, title : string) : void => {
				deck.remove.block = true;
				Dialog({
					title : title,
					onConfirm : func,
					onClose : () => {
						setTimeout(() => {
							deck.remove.block = false;
						}, 200);
					}
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
			await Dialog({
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
				await mainGame.sleep(200);
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

	const swapy = reactive({
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
		},
		random : (head : string, v : number, i : number) => {
			return `${head}:${v}:${i}:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
		}
	});

	onBeforeMount(async () : Promise<void> => {
		page.resize();
		window.addEventListener("resize", page.resize);
	});

	onUnmounted(() => {
		window.removeEventListener("resize", page.resize);
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

	if (mainGame.get.system(CONSTANT.KEYS.SETTING_SELECT_SORT) === 0) {
		watch(() => { return main_card; }, () => {
			if (main_card.value === null || main.value === null) return;
			swapy.main === undefined ? swapy.main = swapy.create(main.value) : swapy.main.update();
		}, { deep : true });

		watch(() => { return extra_card; }, () => {
			if (extra_card.value === null || extra.value === null) return;
			swapy.extra === undefined ? swapy.extra = swapy.create(extra.value) : swapy.extra.update();
		}, { deep : true });

		watch(() => { return side_card; }, () => {
			if (side_card.value === null || side.value === null) return;
			swapy.side === undefined ? swapy.side = swapy.create(side.value) : swapy.side.update();
		}, { deep : true });
	}

</script>
<style scoped lang = 'scss'>
	@use './deck.scss';
</style>