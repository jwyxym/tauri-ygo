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
			</var-list>
		</div>
		<div>
			<Button icon_name = 'search'/>
			<Button icon_name = 'setting' @click = 'search.on'/>
			<Button icon_name = 'deck'/>
			<Button icon_name = 'exit'/>
		</div>
		<div
			class = 'search no-scrollbar'
			:style = "{ '--x' : search.x }"
			ref = 'search_div'
		>
			<div v-for = 'j in [
				{ span : I18N_KEYS.CARD_INFO_TYPE, ct : 0, cards : search.list.card},
				{ span : I18N_KEYS.CARD_INFO_SPELL_TRAP_TYPE, ct : 2, cards : search.list.spell},
				{ span : I18N_KEYS.CARD_INFO_MONSTER_TYPE, ct : 1, cards : search.list.monster},
			]'>
				<span>{{ mainGame.get.text(j.span) }}&nbsp;:</span>
				<div>
					<div
						v-for = 'i in j.cards'
						:class = "{ 'selected' : search.info.type[j.ct].includes(i) }"
						class = 'cursor'
						@click = 'search.select(i)'
					>
						<img :src = 'mainGame.get.icon(KEYS.TYPE, i)!'/>
						<span>{{ mainGame.get.strings.type(i - ((i & 0x3) === i ? 0 : (i & 0x3)))}}</span>
					</div>
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
	import { KEYS } from '@/script/constant';

	import Input from '@/pages/ui/input.vue';
	import Button from '@/pages/ui/button.vue';
	import Pic, { CardPic } from '@/pages/ui/pic.vue';
	import { Hover } from '@/pages/ui/deck.vue';

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
				const cards = page.result.slice(length, Math.max(page.result.length, length + 100));
				await mainGame.load.pic(cards.map(i => i.pic.code));
				page.list.push(...cards);
			}
			page.loading = false;
			page.finished = page.list.length >= page.result.length;
		}
	});

	const search = reactive({
		x : '100vw',
		on : () => search.x = '-50%',
		off : (e : MouseEvent) : boolean => {
			const target = e.target as HTMLElement;
			if (search.x !== '100vw' && search_div.value && !search_div.value.contains(target)) {
				search.x = '100vw';
				return true;
			}
			return false;
		},
		select : (i : number) => {
			let ct : number;
			const push = (v : number) : void => {
				ct = search.info.type[v].indexOf(i);
				if (ct > -1)
					search.info.type[v].splice(ct, 1);
				else
					search.info.type[v].push(i);
			}
			switch (true) {
				case search.list.card.includes(i):
					push(0);
					break;
				case search.list.monster.includes(i):
					push(1);
					break;
				case search.list.spell.includes(i):
					push(2);
					break;
			}
		},
		list : {
			card : [
				TYPE.MONSTER,
				TYPE.SPELL,
				TYPE.TRAP
			],
			monster : [
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
			],
			spell : [
				TYPE.NORMAL | TYPE.SPELL,
				TYPE.QUICKPLAY,
				TYPE.CONTINUOUS,
				TYPE.RITUAL | TYPE.SPELL,
				TYPE.EQUIP,
				TYPE.FIELD,
				TYPE.COUNTER
			]
		},
		info : {
			type : [[], [], []] as [Array<number>, Array<number>, Array<number>]
		},
		search : async () : Promise<void> => {
			// if (typeof props.search.rule.level(props.search.info.scale ?? '') !== 'boolean'
			// 	|| typeof props.search.rule.level(props.search.info.level ?? '') !== 'boolean'
			// 	|| typeof props.search.rule.atk(props.search.info.atk ?? '') !== 'boolean'
			// 	|| typeof props.search.rule.atk(props.search.info.def ?? '') !== 'boolean'
			// ) {
			// 	search.on();
			// 	toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_INFO))
			// 	return;
			// }
			page.list = [];
			page.button_loading = true;
			page.result = [
				{ card : mainGame.get.card(92559258), pic : { code : 92559258, index : 0, y : 0, loc : 1, key : '0'} },
			];
			page.finished = false;
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
			background-color: rgba(0, 0, 0, 0.5);
			display: flex;
			flex-direction: column;
			gap: 5px;
			color: white;
			overflow-y: auto;
			transition: all 0.1s ease;
			> div {
				display: flex;
				flex-direction: column;
				> div {
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
					}
				}
			}
		}
	}
</style>