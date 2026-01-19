<template>
	<main
		ref = 'deck'
		:style = "{
			'--height' : `${height}px`,
			'--card_height' : `${page.size.height}px`,
			'--card_width' : `${page.size.width}px`,
			'--box_width' : `${page.size.width * 10}px`
		}"
	>
		<div
			:style = "{
				'--height' : `${
					(
						page.size.main
						+ page.size.extra
						+ page.size.side
					)
					* page.size.height
				}px`
			}"
		>
			<div class = 'card'
				v-for = 'i in [...page.deck.main, ...page.deck.extra, ...page.deck.side]'
				:key = 'i.key'
				:id = 'i.key'
				:class = "{ 'hover' : page.move.card === i, 'show' : !!i.loc }"
				:style = "{
					'--position_x' :  `${(i.index % 10) * page.size.width + 2}px`,
					'--position_y' :  `${(Math.trunc(i.index / 10) + i.y) * page.size.height + i.loc}px`,
					'--hover_x' :  `${page.move.x}px`,
					'--hover_y' :  `${page.move.y}px`,
					'--url' : `url('${mainGame.get.card(i.code).pic}')`,
				}"
				ref = 'cards'
			></div>
			<span ref = 'main_title'>{{ page.title.main }}&nbsp;:&nbsp;{{ page.deck.main.length }}</span>
			<div class = 'box'
				ref = 'main'
				:style = "{
					'--box_height' : `${page.size.main * page.size.height}px`,
				}"
				:class = "{
					'can_in' : page.move.color.deck === 0 && page.move.color.err === true && page.move.card,
					'can_not_in' : page.move.color.deck === 0 && page.move.color.err !== true && page.move.card
				}"
			>
				<span>
					{{ typeof page.move.color.err === 'string' ? page.move.color.err : '' }}
				</span>
			</div>
			<span ref = 'extra_title'>{{ page.title.extra }}&nbsp;:&nbsp;{{ page.deck.extra.length }}</span>
			<div class = 'box'
				ref = 'extra'
				:style = "{
					'--box_height' : `${ page.size.extra * page.size.height}px`
				}"
				:class = "{
					'can_in' : page.move.color.deck === 1 && page.move.color.err === true && page.move.card,
					'can_not_in' : page.move.color.deck === 1 && page.move.color.err !== true && page.move.card
				}"
			>
				<span>
					{{ typeof page.move.color.err === 'string' ? page.move.color.err : '' }}
				</span>
			</div>
			<span ref = 'side_title'>{{ page.title.side }}&nbsp;:&nbsp;{{ page.deck.side.length }}</span>
			<div class = 'box'
				ref = 'side'
				:style = "{
					'--box_height' : `${page.size.side * page.size.height}px`
				}"
				:class = "{
					'can_in' : page.move.color.deck === 2 && page.move.color.err === true && page.move.card,
					'can_not_in' : page.move.color.deck === 2 && page.move.color.err !== true && page.move.card
				}"
			>
				<span>
					{{ typeof page.move.color.err === 'string' ? page.move.color.err : '' }}
				</span>
			</div>
		</div>
	</main>
</template>
<script setup lang = 'ts'>
	import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
	import mainGame from '@/script/game';
	import * as CONSTANT from '@/script/constant';
	import { I18N_KEYS } from '@/script/language/i18n';
	import Card from '@/script/card';
	import Deck from '@/pages/deck/deck';

	const deck = ref<HTMLElement | null>(null);
	const main = ref<HTMLElement | null>(null);
	const extra = ref<HTMLElement | null>(null);
	const side = ref<HTMLElement | null>(null);
	const main_title = ref<HTMLElement | null>(null);
	const extra_title = ref<HTMLElement | null>(null);
	const side_title = ref<HTMLElement | null>(null);
	const cards = ref<Array<HTMLElement> | null>(null);

	interface CardPic { code : number; index : number; y : number; loc : number; key : string; };
	type CardPics = Array<CardPic>;	
	
	const page = reactive({
		deck : {
			main : [] as CardPics,
			extra : [] as CardPics,
			side : [] as CardPics,
		},
		title : {
			main : '',
			extra : '',
			side : ''
		},
		size : {
			count : 10,
			width : 0,
			height : 0,
			main : computed(() : number => Math.max((Math.trunc(page.deck.main.length / 10) + 1), 6)),
			extra : computed(() : number => Math.max((Math.trunc(page.deck.extra.length / 10) + 1), 2)),
			side : computed(() : number => Math.max((Math.trunc(page.deck.side.length / 10) + 1), 2)),
			resize : async () : Promise<void> => {
				const width = Math.max(window.innerWidth * 0.04, 30);
				page.size.width = width;
				page.size.height = width * 1.45;
				
				const extra_y = page.size.main;
				const side_y = extra_y + page.size.extra;
				const loc = main_title.value!.getBoundingClientRect().height + 2;
				await mainGame.sleep(100);
				page.deck.main.forEach(i => { i.y = 0; i.loc = loc; }); 
				page.deck.extra.forEach(i => { i.y = extra_y; i.loc = loc * 2 + 4; }); 
				page.deck.side.forEach(i => { i.y = side_y; i.loc = loc * 3 + 6; });
			}
		},
		move : {
			x : 0,
			y : 0,
			index : {
				x : 0,
				y : 0,
				deck : -1,
				from : -1
			},
			color : {
				deck : -1,
				err : true as boolean | string
			},
			main : [] as CardPics,
			extra : [] as CardPics,
			side : [] as CardPics,
			on : undefined as undefined | NodeJS.Timeout ,
			card : undefined as undefined | CardPic,
			sort : (a : CardPic, b : CardPic) : number => a.index - b.index,
			resort : (arr : CardPics) => {
				arr = arr.sort(page.move.sort);
				arr.forEach((i, v) => {
					if (i.index !== v)
						i.index = v;
				});
			},
			check : (code : number | string, deck : 0 | 1 | 2) : boolean | string => {
				const card : Card = mainGame.get.card(code);
				if (card.is_token())
					return mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_TYPE);
				const cards = page.deck.main.concat(page.deck.extra, page.deck.side);
				const ct = props.lflist ? mainGame.get.lflist(props.lflist, card.id) as number : mainGame.get.system(CONSTANT.KEYS.SETTING_CT_CARD) as number;
				if (cards.filter(i => i.code === code).length >= ct)
					return mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_MAX, ct.toString());
				switch (deck) {
					case 0:
						if (page.deck.main.length >= 60)
							return mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, mainGame.get.system(CONSTANT.KEYS.SETTING_CT_DECK_MAIN) as number);
						else if (card.is_ex())
							return mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_TYPE);
						return true;
					case 1:
						if (page.deck.extra.length >= 15)
							return mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, mainGame.get.system(CONSTANT.KEYS.SETTING_CT_DECK_EX) as number);
						else if (!card.is_ex())
							return mainGame.get.text(I18N_KEYS.DECK_RULE_CARD_TYPE);
						return true;
					case 2:
						if (page.deck.side.length >= 15)
							return mainGame.get.text(I18N_KEYS.DECK_RULE_DECK_MAX, mainGame.get.system(CONSTANT.KEYS.SETTING_CT_DECK_SIDE) as number);
						return true;
				}
			},
			start : (target : HTMLElement, x : number, y : number) => {
				const v : number = cards.value?.findIndex(i => i.contains(target)) ?? -1;
				if (v < 0) return;
				cards.value![v].style.transition = 'none';
				page.move.x = x;
				page.move.y = y;
				page.move.main = page.deck.main.slice().sort(page.move.sort);
				page.move.extra = page.deck.extra.slice().sort(page.move.sort);
				page.move.side = page.deck.side.slice().sort(page.move.sort);
				page.move.card = page.move.main.concat(page.move.extra, page.move.side).find(i => target.id === i.key);
				[page.deck.main, page.deck.extra, page.deck.side].forEach((i, v) => {
					if (i.includes(page.move.card!))
						page.move.index.from = v;
				});
			},
			move : (x : number, y : number) => {
				if (!page.move.card) return;
				page.move.x = x;
				page.move.y = y;
				if (!deck.value) return;
				const pos = deck.value.getBoundingClientRect();
				if (y > pos.bottom && !page.move.on) {
					deck.value!.scrollTop += window.innerHeight;
					page.move.on = setInterval(() => {
						deck.value!.scrollTop += window.innerHeight;
					}, 400);
				}
				else if (y < pos.top && !page.move.on) {
					deck.value!.scrollTop -= window.innerHeight;
					page.move.on = setInterval(() => {
						deck.value!.scrollTop -= window.innerHeight;
					}, 400);
				} else {
					if (page.move.on) {
						clearInterval(page.move.on);
						page.move.on = undefined;
					}
					if (x > pos.left && x < pos.right) {
						const pic_x = Math.trunc((x - pos.left) / page.size.width);
						const height = main_title.value!.getBoundingClientRect().height;
						let top = y - height;
						const extra_top = extra_title.value!.getBoundingClientRect().top;
						const side_top = side_title.value!.getBoundingClientRect().top;
						if (y > extra_top)
							top -= height;
						if (y > side_top)
							top -= height;
						const pic_y = Math.trunc((top - pos.top + deck.value!.scrollTop) / page.size.height);
						if (page.move.index.x === pic_x && page.move.index.y === pic_y)
							return;
						page.move.index.x = pic_x;
						page.move.index.y = pic_y;
						const sort = (arr : CardPics, index : number) => {
							if (index >= arr.length) index = arr.length - (arr.includes(page.move.card!) ? 1 : 0);
							let v = 0;
							arr.forEach(i => {
								if (v === index)
									v ++;
								if (page.move.card !== i) {
									i.index = v;
									v ++;
								}
							});
							page.move.card!.index = index;
						}
						const decks = [page.move.main, page.move.extra, page.move.side];
						if (pic_y < page.size.main) {
							const err = page.move.check(page.move.card.code, 0);
							if (page.move.color.deck !== 0)
								page.move.color = {
									deck : 0,
									err : err
								};
							if (typeof err === 'string' || !err)
								return;
							const index = pic_y * 10 + pic_x;
							if (page.move.index.deck > -1 && page.move.index.deck !== 0)
								page.move.resort(decks[page.move.index.deck]);
							page.move.index.deck = 0;
							sort(page.move.main, index);
						} else if (pic_y < page.size.main + page.size.extra) {
							const err = page.move.check(page.move.card.code, 1);
							if (page.move.color.deck !== 1)
								page.move.color = {
									deck : 1,
									err : err
								};
							if (typeof err === 'string' || !err)
								return;
							const index = (pic_y - page.size.main) * 10 + pic_x;
							if (page.move.index.deck > -1 && page.move.index.deck !== 1)
								page.move.resort(decks[page.move.index.deck]);
							page.move.index.deck = 1;
							sort(page.move.extra, index);
						} else {
							const err = page.move.check(page.move.card.code, 2);
							if (page.move.color.deck !== 2)
								page.move.color = {
									deck : 2,
									err : err
								};
							if (typeof err === 'string' || !err)
								return;
							const index = (pic_y - page.size.main - page.size.extra) * 10 + pic_x;
							if (page.move.index.deck > -1 && page.move.index.deck !== 2)
								page.move.resort(decks[page.move.index.deck]);
							page.move.index.deck = 2;
							sort(page.move.side, index);
						}
					}
				}
			},
			end : async (target : HTMLElement) : Promise<void> => {
				if (page.move.index.deck !== page.move.index.from && page.move.index.deck >= 0 && page.move.index.from >= 0) {
					const decks = [page.deck.main, page.deck.extra, page.deck.side];
					decks[page.move.index.deck].push(page.move.card!);
					const ct = decks[page.move.index.from].indexOf(page.move.card!);
					decks[page.move.index.from].splice(ct, 1);
					page.move.resort(decks[page.move.index.from]);
					page.size.resize();
				}
				setTimeout(() => target.style.transition = 'all 0.1s ease', 150);
				await mainGame.sleep(100);
				page.move.color = {
					deck : -1,
					err : true
				};
				page.move.card = undefined;
				page.move.x = 0;
				page.move.y = 0;
				page.move.main.length = 0;
				page.move.extra.length = 0;
				page.move.side.length = 0;
				page.move.index.deck = -1;
				page.move.index.from = -1;
				if (page.move.on) {
					clearInterval(page.move.on);
					page.move.on = undefined;
				}
			},
			touchstart : () => {},
			touchend : () => {},
			mousedown : (e : MouseEvent) => {
				page.move.start(e.target as HTMLElement, e.clientX, e.clientY);
			},
			mousemove : (e : MouseEvent) => {
				page.move.move(e.clientX, e.clientY);
			},
			mouseup : async (e : MouseEvent) : Promise<void> => {
				await page.move.end(e.target as HTMLElement);
			}
		}
	});

	onMounted(async () => {
		await mainGame.load.pic(props.deck);
		for (let i = 0; i < props.deck.main.length; i++)
			page.deck.main.push({ code : props.deck.main[i], index : i, y : 0, loc : 0, key : props.deck.main[i].toString() + i + Math.random()});
		for (let i = 0; i < props.deck.extra.length; i++)
			page.deck.extra.push({ code : props.deck.extra[i], index : i, y : 0, loc : 0, key : props.deck.main[i].toString() + i + Math.random()});
		for (let i = 0; i < props.deck.side.length; i++)
			page.deck.side.push({ code : props.deck.side[i], index : i, y : 0, loc : 0, key : props.deck.main[i].toString() + i + Math.random()});
		
		page.title.main = mainGame.get.text(I18N_KEYS.DECK_MAIN);
		page.title.extra = mainGame.get.text(I18N_KEYS.DECK_EXTRA);
		page.title.side = mainGame.get.text(I18N_KEYS.DECK_SIDE);
		page.size.resize();
		window.addEventListener("resize", page.size.resize);
		window.addEventListener("mousedown", page.move.mousedown);
		window.addEventListener("mousemove", page.move.mousemove);
		window.addEventListener("mouseup", page.move.mouseup);
		
	});

	onUnmounted(() => {
		window.removeEventListener("resize", page.size.resize);
		window.removeEventListener("mousedown", page.move.mousedown);
		window.removeEventListener("mousemove", page.move.mousemove);
		window.removeEventListener("mouseup", page.move.mouseup);
	});

	const props = defineProps<{ height: number; deck: Deck; lflist ?: string }>();
</script>
<style scoped lang = 'scss'>
	main {
		width: calc(var(--box_width) + 20px);
		height: var(--height);
		overflow-y: auto;
		overflow-x: hidden;
		scroll-behavior: smooth;
		color: white;
		> div {
			position: relative;
			width: var(--box_width);
			height: var(--height);
			.box {
				height: var(--box_height);
				width: 100%;
				transition: all 0.2s ease;
				border: white 2px solid;
				user-select: none;
				color: rgba($color: red, $alpha: 0);
				display: flex;
				justify-content: center;
				align-items: center;
				&::after {
					content: '';
					background: rgba(255, 255, 255, 0);
				}
			}
			.can_in {
				border: blue 2px solid;
			}
			.can_not_in {
				border: red 2px solid;
				color: red;
				position: relative;
				&::after {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 100%;
					height: 100%;
					background: rgba(255, 255, 255, 0.3);
				}
			}
			.card {
				position: absolute;
				left: 0;
				top: 0;
				opacity: 0;
				height: var(--card_height);
				width: var(--card_width);
				transform: translate(var(--position_x), var(--position_y));
				background-image: var(--url);
				z-index: 0;
				background-size: cover;
				transition: all 0.1s ease;
			}
			.show {
				opacity: 1;
			}
			.hover {
				position: fixed;
				left: 0;
				top: 0;
				transform: translate(var(--hover_x), var(--hover_y));
				z-index: 1;
			}
		}
		&::-webkit-scrollbar {
			opacity: 0;
			height: 10px;
		}
		&::-webkit-scrollbar-thumb {
			background: black;
			border: 2px solid gray;
			border-radius: 8px;
		}
	}
</style>