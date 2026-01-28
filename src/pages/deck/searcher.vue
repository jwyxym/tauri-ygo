<template>
	<main
		:style = "{
			'--height' : `${height}px`,
			'--width' : `${width}px`,
		}"
	>
		<div>
			<Input
				variant = 'outlined'
				:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_NAME)'
				v-model = 'search.info.desc'
			/>
		</div>
		<div class = 'no-scrollbar'>
			<var-list
				:finished = 'page.finished'
				v-model:loading = 'page.loading'
				@scroll = 'page.load_on'
				@load = 'page.load'
				:immediate-check = 'false'
				:style = "{
					'--height' : `${page.size.height + 2}px`,
					'--width' : `${page.size.width + 5}px`,
				}"
				class = 'list'
			>
				<div
					v-for = 'i in page.list'
					:key = 'i.pic.key'
					:id = 'i.pic.key'
				>
					<Pic
						:i = 'i.pic'
						:hover = '{ x : move.x, y : move.y, card : page.card }'
						:size = 'page.size'
						:lflist = 'page.search.lflist'
						ref = 'cards'
					/>
					<div>
						<span>{{ i.card.name }}</span>
						<br>
						<span>{{ i.card.id }}</span>
					</div>
				</div>
				<var-back-top :duration = '300'/>
			</var-list>
		</div>
		<div>
			<Button icon_name = 'search' @click = 'search.search'/>
			<Button icon_name = 'setting' @click = 'search.on'/>
			<Button icon_name = 'deck'/>
			<Button icon_name = 'exit'/>
		</div>
		<div
			class = 'search no-scrollbar'
			:style = "{ '--x' : search.x }"
			ref = 'search_div'
		>
			<div class = 'lflist'>
				<Select
					name = 'lflist'
					v-model = 'search.info.lflist'
				/>
				<Input
					:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_FORBIDDEN)'
					:rules = 'search.rule.number'
					v-model = 'search.info.forbidden'
				/>
			</div>
			<div
				v-for = "j in [
					{ span : I18N_KEYS.CARD_INFO_OT, results : search.info.ot, cards : search.list.ot, key : KEYS.OT, strings : mainGame.get.strings.ot, class : 'ot' },
					{ span : I18N_KEYS.CARD_INFO_TYPE, results : search.info.type[0], cards : search.list.card, key : KEYS.TYPE, strings : mainGame.get.strings.type, value : (i : number) => i - ((i & 0x3) === i ? 0 : (i & 0x3)) },
					{ span : I18N_KEYS.CARD_INFO_SPELL_TRAP_TYPE,  results : search.info.type[1], cards : search.list.spell, key : KEYS.TYPE, strings : mainGame.get.strings.type, value : (i : number) => i - ((i & 0x3) === i ? 0 : (i & 0x3)) },
					{ span : I18N_KEYS.CARD_INFO_MONSTER_TYPE,  results : search.info.type[2], cards : search.list.monster, key : KEYS.TYPE, strings : mainGame.get.strings.type, value : (i : number) => i - ((i & 0x3) === i ? 0 : (i & 0x3)), switchs : 'type' },
					{ span : I18N_KEYS.CARD_INFO_EXCEPT_TYPE,  results : search.info.type[3], cards : search.list.except, key : KEYS.TYPE, strings : mainGame.get.strings.type, value : (i : number) => i - ((i & 0x3) === i ? 0 : (i & 0x3)) },
					{ span : I18N_KEYS.CARD_INFO_ATTRIBUTE, results : search.info.attribute, cards : search.list.attribute, key : KEYS.ATTRIBUTE, strings : mainGame.get.strings.attribute },
					{ span : I18N_KEYS.CARD_INFO_RACE, results : search.info.race, cards : search.list.race, key : KEYS.RACE, strings : mainGame.get.strings.race },
					{ span : I18N_KEYS.CARD_INFO_CATEGORY, results : search.info.category, cards : search.list.category, key : KEYS.CATEGORY, strings : mainGame.get.strings.category, switchs : 'category' },
				]"
				class = 'select'
			>
				<div>
					<span>{{ mainGame.get.text(j.span) }}&nbsp;:</span>
					<var-switch v-model = 'search.switchs[j.switchs as keyof typeof search.switchs]' v-if = 'j.switchs !== undefined'/>
					<span v-if = 'j.switchs !== undefined' class = 'switch'>{{ search.switchs[j.switchs as keyof typeof search.switchs] ? 'and' : 'or' }}</span>
				</div>
				<div>
					<div
						v-for = 'i in j.cards'
						:class = "{ 'selected' : j.results.includes(j.value ? j.value(i) : i), 'ot' : j.class === 'ot' }"
						class = 'cursor'
						@click = 'search.select(j.results, j.value ? j.value(i) : i)'
					>
						<img :src = 'mainGame.get.icon(j.key, i)!'/>
						<span>{{ j.strings(j.value ? j.value(i) : i)}}</span>
					</div>
				</div>
			</div>
			<div class = 'link'>
				<div>
					<span>{{ mainGame.get.text(I18N_KEYS.CARD_INFO_LINK) }}&nbsp;:</span>
					<var-switch v-model = "search.switchs['link' as keyof typeof search.switchs]"/>
					<span class = 'switch'>{{ search.switchs['link' as keyof typeof search.switchs] ? 'and' : 'or' }}</span>
				</div>
				<div></div>
				<div>
					<img
						v-for = '(i, v) in search.list.link[0]'
						:src = "(mainGame.get.textures(FILES.TEXTURE_LINK_PIC[search.info.link.includes(i) ? 1 : 0].replace('{:?}', (v + 1).toString())) as string)"
						@click = 'search.select(search.info.link, i)'
						class = 'cursor'
					/>
					<div></div>
					<img
						v-for = '(i, v) in search.list.link[1]'
						:src = "(mainGame.get.textures(FILES.TEXTURE_LINK_PIC[search.info.link.includes(i) ? 1 : 0].replace('{:?}', (v + 5).toString())) as string)"
						@click = 'search.select(search.info.link, i)'
						class = 'cursor'
					/>
				</div>
			</div>
			<div
				class = 'input'
			>
				<div>
					<img :src = '(mainGame.get.textures(FILES.TEXTURE_INFO_LV_RANK_LINK) as string)'/>
					<Input
						variant = 'outlined'
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_LV)'
						:rules = 'search.rule.number'
						v-model = search.info.lv
					/>
				</div>
				<div>
					<img :src = '(mainGame.get.textures(FILES.TEXTURE_INFO_SCALE) as string)'/>
					<Input
						variant = 'outlined'
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_SCALE)'
						:rules = 'search.rule.number'
						v-model = search.info.scale
					/>
				</div>
				<div>
					<Input
						variant = 'outlined'
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_ATK)'
						:rules = 'search.rule.atk'
						v-model = search.info.atk
					/>
					<Input
						variant = 'outlined'
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_INFO_DEF)'
						:rules = 'search.rule.atk'
						v-model = search.info.def
					/>
				</div>
			</div>
		</div>
	</main>
</template>
<script setup lang = 'ts'>
	import { onMounted, onUnmounted, reactive, watch, ref, ComponentPublicInstance } from 'vue';

	import mainGame from '@/script/game';
	import Card, { TYPE } from '@/script/card';
	import { I18N_KEYS } from '@/script/language/i18n';
	import { FILES, KEYS, REG } from '@/script/constant';
	import Search from '@/script/search';

	import Pic, { CardPic } from '@/pages/ui/pic.vue';
	import Input from '@/pages/ui/input.vue';
	import Button from '@/pages/ui/button.vue';
	import { Hover } from '@/pages/ui/deck.vue';
	import Select from '../ui/select.vue';

	const search_div = ref<HTMLDivElement | null>(null);

	const cards = ref<Array<ComponentPublicInstance> | null>(null);
	const page = reactive({
		card : undefined as undefined | CardPic,
		size : {
			width : 0,
			height : 0,
			resize : () : void => {
				page.size.width = (window.innerWidth - props.width * 2 - 30) / props.count;
				page.size.height = page.size.width * 1.45;
			}
		},
		search : {
			lflist : ''
		},
		mousedown : (e : MouseEvent) : void => {
			if (search.off(e)) return;
			const target = e.target as HTMLElement;
			const v : number = cards.value?.findIndex(i => i.$el.contains(target)) ?? -1;
			if (v < 0) return;
			cards.value![v].$el.style.transition = 'none';
			const card = page.list[v].pic;
			emit('card', card.code);
			props.hover(target, e.clientX, e.clientY, card.code);
			page.card = card;
		},
		mouseup : () : void => page.card = undefined,
		finished : false,
		loading : false,
		button_loading : false,
		list : [] as Array<{ card : Card; pic : CardPic; }>,
		result : [] as Array<{ card : Card; pic : CardPic; }>,
		load_on : async (event : Event | undefined = undefined) : Promise<void> => {
			if (event) {
				const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;
				if (scrollHeight / page.list.length < scrollHeight - scrollTop - clientHeight)
					return;
			}
			if (!page.loading && !page.finished) {
				page.loading = true;
				await page.load();
			}
		},
		load : async () : Promise<void> => {
			const length = page.list.length;
			if (page.list.length < page.result.length) {
				const cards = page.result.slice(length, Math.min(page.result.length, length + 100));
				await mainGame.load.pic(cards.map(i => i.pic.code));
				page.list.push(...cards);
			}
			page.loading = false;
			page.finished = page.list.length >= page.result.length;
		}
	});

	const monster_type = [
		TYPE.NORMAL,
		TYPE.EFFECT,
		TYPE.FUSION,
		TYPE.XYZ,
		TYPE.SYNCHRO,
		TYPE.PENDULUM,
		TYPE.LINK,
		TYPE.RITUAL,
		TYPE.TUNER,
		TYPE.SPSUMMON,
		TYPE.SPIRIT,
		TYPE.TOON,
		TYPE.UNION,
		TYPE.DUAL,
		TYPE.FLIP,
		TYPE.TOKEN
	];

	const search = reactive({
		x : '100vw',
		on : () => search.x = '-50%',
		off : (e : MouseEvent) : boolean => {
			const target = e.target as HTMLElement;
			if (search.x !== '100vw'
				&& search_div.value && !search_div.value.contains(target)
				&& !target.classList.contains('var-option__cover')
			) {
				search.x = '100vw';
				return true;
			}
			return false;
		},
		select : (results : Array<number>, i : number) => {
			const ct = results.indexOf(i);
			if (ct > -1)
				results.splice(ct, 1);
			else
				results.push(i);
		},
		list : {
			card : [
				TYPE.MONSTER,
				TYPE.SPELL,
				TYPE.TRAP
			],
			monster : monster_type,
			spell : [
				TYPE.NORMAL | TYPE.SPELL,
				TYPE.QUICKPLAY,
				TYPE.CONTINUOUS,
				TYPE.RITUAL | TYPE.SPELL,
				TYPE.EQUIP,
				TYPE.FIELD,
				TYPE.COUNTER
			],
			attribute : Array.from(mainGame.strings.get(KEYS.ATTRIBUTE)?.keys() ?? []) as Array<number>,
			race : Array.from(mainGame.strings.get(KEYS.RACE)?.keys() ?? []) as Array<number>,
			category : Array.from(mainGame.strings.get(KEYS.CATEGORY)?.keys() ?? []) as Array<number>,
			ot : Array.from(mainGame.strings.get(KEYS.OT)?.keys() ?? []) as Array<number>,
			except : monster_type.slice(),
			link : (() => {
				const arr = Array.from(mainGame.strings.get(KEYS.LINK)?.keys() ?? []);
				return [
					arr.slice(0, Math.ceil(arr.length / 2)),
					arr.slice(Math.ceil(arr.length / 2))
				];
			})()
		},
		info : {
			ot : [] as Array<number>,
			type : [[], [], [], []] as [Array<number>, Array<number>, Array<number>, Array<number>],
			attribute : [] as Array<number>,
			race : [] as Array<number>,
			category : [] as Array<number>,
			link : [] as Array<number>,
			lflist : '',
			forbidden : '',
			lv : '',
			atk : '',
			def : '',
			scale : '',
			desc : ''
		},
		switchs : {
			'type' : false,
			'category' : false,
			'link' : false,
		},
		rule : {
			number : (lv : string) : string | boolean => {
				if (!lv.match(REG.LV))
					return mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_LV);
				return true;
			},
			atk : (lv : string) : string | boolean => {
				if (!lv.match(REG.ATK))
					return mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_ATK);
				return true;
			}
		},
		search : async () : Promise<void> => {
			page.list = [];
			page.button_loading = true;
			page.finished = false;
			const searcher = new Search()
				.set.cards(mainGame.get.cards())
				.set.ot(search.info.ot)
				.set.type(search.info.type)
				.set.race(search.info.race)
				.set.attribute(search.info.attribute)
				.set.category(search.info.category)
				.set.link(search.info.link)
				.set.lflist(search.info.lflist)
				.set.forbidden(search.info.forbidden)
				.set.lv(search.info.lv)
				.set.scale(search.info.scale)
				.set.atk(search.info.atk)
				.set.def(search.info.def)
				.set.desc(search.info.desc)
				.set.and_or(search.switchs);
			page.result = searcher.search().map(i => {
				return {
					card : i,
					pic : { code : i.id, index : 0, y : 0, loc : 1, key : Math.random().toString() }
				};
			});
			await page.load_on();
			page.button_loading = false;
		}
	});

	const emit = defineEmits<{
		card : [card : number];
		lflist : [lflist : string];
	}>();

	const props = defineProps<{
		height : number;
		width : number;
		count : number;
		move : { x : number; y : number; };
		hover : Hover;
	}>();

	onMounted(async () => {
		window.addEventListener("mousedown", page.mousedown);
		window.addEventListener("mouseup", page.mouseup);
		await search.search();
	});

	onUnmounted(() => {
		window.removeEventListener("mousedown", page.mousedown);
		window.removeEventListener("mouseup", page.mouseup);
	});

	watch(() => props.width, page.size.resize, { immediate : true });
</script>
<style lang = 'scss' scoped>
	$head-height: 60px;
	$foot-height: 30px;
	main {
		width: var(--width);
		height: var(--height);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		display: flex;
		flex-direction: column;
		> div {
			margin: 10px;
			width: calc(100% - 20px);
		}
		> div:first-child {
			height: $head-height;
		}
		> div:nth-child(2) {
			height: calc(100% - $head-height - $foot-height);
			width: calc(100% - 10px);
			overflow-y: auto;
			overflow-x: hidden;
			.list {
				position: relative;
				width: calc(100% - 15px);
				> div {
					position: relative;
					height: var(--height);
					> div:last-child {
						position: absolute;
						top: 0;
						left: var(--width);
						width: calc(100% - var(--width));
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						> span:first-child {
							font-weight: bold;
						}
						> span:last-child {
							color: rgb(203, 203, 203);
							font-size: 12px;
						}
					}
				}
			}
		}
		> div:nth-child(3) {
			height: $foot-height;
			display: flex;
			gap: 5px;
		}
		.search {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(var(--x), -50%);
			width: calc(var(--vw) / 2);
			height: calc(var(--vh) * 0.9);
			background-color: rgba(0, 0, 0, 0.8);
			color: white;
			overflow-y: auto;
			transition: all 0.1s ease;
			> div {
				margin-left: 10px;
				max-width: calc(100% - 10px);
			}
			.lflist {
				height: 120px;
				gap: 10px;
				.var-select, .var-input {
					width: 40%;
				}
			}
			.select, .input, .lflist {
				display: flex;
				flex-direction: column;
			}
			.select, .link {
				> div:first-child {
					width: calc(var(--vw) / 2);
					display: flex;
					align-items: center;
					gap: 5px;
					.switch {
						color: rgb(203, 203, 203);
						font-size: 12px;
					}
				}
			}
			.select {
				> div:last-child {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					> div {
						display: flex;
						flex-direction: column;
						align-items: center;
						border: 2px solid white;
						width: 50px;
						height: 60px;
						border-radius: 8px;
						transition: all 0.1s ease;
						img {
							width: 40px;
							height: 40px;
						}
						span {
							font-size: 12px;
						}
					}
					> .selected {
						border: 2px solid #2196f3;
						box-shadow: 0 0 10px white;
					}
					> .ot {
						width: 60px;
						img {
							width: 50px;
							height: 40px;
						}
					}
				}
			}
			.link {
				width: 120px;
				height: 150px;
				position: relative;
				> div:nth-child(2) {
					position: absolute;
					width: 84px;
					height: 84px;
					border: 1px solid rgba($color: white, $alpha: 1);
					top: calc(50% + 8px);
					left: 50%;
					transform: translate(-50%, -50%);
				}
				> div:last-child {
					position: absolute;
					width: 120px;
					height: 120px;
					display: grid;
					grid-template-rows: repeat(3, 1fr);
					grid-template-columns: repeat(3, 1fr);
					img {
						width: 40px;
						height: 40px;
					}
				}
			}
			.input {
				> div {
					display: flex;
					gap: 10px;
					min-height: 50px;
					width: calc(var(--vw) / 2);
					img {
						width: 40px;
						height: 40px;
					}
				}
			}
		}
	}
</style>
<style lang = 'scss'>
	.var-back-top  {
		transform: translateY(-100%);
	}
</style>