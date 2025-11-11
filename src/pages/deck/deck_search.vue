<template>
	<div class = 'search' ref = 'dom'>
		<Input
			:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_SEARCH_NAME)'
			:variant = 'true'
			v-model = 'search.info.desc'
			@keydown = 'page.press'
		/>
		<div class = 'button_list'>
			<Button @click = 'page.setting.on' icon_name = 'setting'></Button>
			<Button @click = 'page.on' icon_name = 'search' :loading = 'page.button_loading'></Button>
		</div>
		<var-list
			:finished = 'page.finished'
			v-model:loading = 'page.loading'
			@scroll = 'page.load_on'
			@load = 'page.load'
			:immediate-check = 'false'
		>
			<var-card 
				v-for = 'card in page.list'
				:title = 'card.name'
				:subtitle = 'card.id.toString()'
				layout = 'row'
				elevation = '0'
				:style = "{
					'--height' : `${page.height}px`,
					'--width' : `${page.width}px`,
				}"
			>
				<template #image>
					<div class = 'image'>
						<img
							v-lazy = 'card.pic'
							:id = 'card.id.toString()'
							:alt = 'card.id.toString()'
							@click = 'cardinfo.on(card.id)'
						/>
						<var-badge type = 'primary' v-show = 'deck.get_ct(card.id) < 3'>
							<template #value>
								{{ deck.get_ct(card.id) }}
							</template>
						</var-badge>
					</div>
				</template>
			</var-card>
			<var-back-top :duration = '800'/>
		</var-list>
		<transition name = 'move_right'>
			<div class = 'search_setting' v-if = 'page.setting.chk'>
				<TransitionGroup
					tag = 'div'
					name = 'move_right'
					class = 'select'
					:style = "{
						'--height' : `${page.select_height}px`
					}"
				>
					<Select
						key = 'attribute'
						name = 'attribute'
						v-model = 'search.info.attribute'
					></Select>
					<Select
						key = 'race'
						name = 'race'
						v-model = 'search.info.race'
					></Select>
					<Select
						key = 'ot'
						name = 'ot'
						v-model = 'search.form.ot'
						:multiple = 'true'
						:chip = 'true'
					></Select>
					<Select
						key = 'type'
						name = 'type'
						v-model = 'search.form.type'
						:multiple = 'true'
						:chip = 'true'
					></Select>
					<Select
						key = 'link'
						name = 'link'
						v-model = 'search.form.link'
						:multiple = 'true'
						:chip = 'true'
					></Select>
					<Select
						key = 'category'
						name = 'category'
						v-model = 'search.form.category'
						:multiple = 'true'
						:chip = 'true'
					></Select>
					<Select
						key = 'lflist'
						name = 'lflist'
						v-model = 'search.info.lflist'
					></Select>
					<Select
						key = 'forbidden'
						name = 'forbidden'
						v-model = 'search.info.forbidden'
						:multiple = 'true'
						:chip = 'true'
						v-show = '!search.rule.forbidden()'
					></Select>
				</TransitionGroup>
				<div class = 'input'>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_SEARCH_ATK)'
						:rules = 'search.rule.atk'
						v-model = 'search.info.atk'
					/>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_SEARCH_DEF)'
						:rules = 'search.rule.atk'
						v-model = 'search.info.def'
					/>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_SEARCH_LV)'
						:rules = 'search.rule.level'
						v-model = 'search.info.level'
					/>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.CARD_SEARCH_SCALE)'
						:rules = 'search.rule.level'
						v-model = 'search.info.scale'
					/>
					<Button
						@click = 'page.setting.off();'
						icon_name = 'exit'
					></Button>
				</div>
			</div>
		</transition>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onUnmounted, onMounted, reactive, watch } from 'vue';
	import mainGame from '../../script/game';
	import { I18N_KEYS } from '../../script/language/i18n';
	import Input from '../varlet/input.vue';
	import Button from '../varlet/button.vue';
	import Select from '../varlet/select.vue';
	import Card from '../../script/card';
	import toast from '../../script/toast';

	const dom = ref<HTMLElement | null>(null);
	const props = defineProps(['deck', 'search', 'cardinfo', 'except', 'unshow']);

	const page = reactive({
		click : (e : MouseEvent) => {
			if (dom.value && !dom.value.contains(e.target as HTMLElement)
				&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(e.target as HTMLElement)) === -1
				&& !(e.target as HTMLElement).classList.contains('var-icon-close-circle')
				&& !props.deck.remove.block
			)
				props.unshow();
		},
		keydown : (e : KeyboardEvent) => {
			if (e.key === 'Escape' && !props.deck.remove.block)
				props.unshow();
		},
		press : async (event : KeyboardEvent) : Promise<void> => {
			if (event.key === 'Enter')
				await page.on();
		},
		select_height : 0,
		height : 0,
		width : 0,
		size : () : void => {
			const width = (window.innerWidth * 0.97 * 0.81) / 15;
			page.width = Math.max(width, 45);
			page.height = page.width * 1.45;
			page.select_height = (props.search.rule.forbidden() ? 7 : 8) * 50;
		},
		finished : false,
		loading : false,
		button_loading : false,
		list : [] as Array<Card>,
		result : [] as Array<Card>,
		on : async () : Promise<void> => {
			if (typeof props.search.rule.level(props.search.info.scale ?? '') !== 'boolean'
				|| typeof props.search.rule.level(props.search.info.level ?? '') !== 'boolean'
				|| typeof props.search.rule.atk(props.search.info.atk ?? '') !== 'boolean'
				|| typeof props.search.rule.atk(props.search.info.def ?? '') !== 'boolean'
			) {
				page.setting.on();
				toast.error(mainGame.get.text(I18N_KEYS.DECK_RULE_SEARCH_INFO))
				return;
			}
			page.list = [];
			page.button_loading = true;
			page.result = mainGame.search.cards(props.search.info);
			page.finished = false;
			await page.load_on();
			page.button_loading = false;
		},
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
				const cards = page.result.slice(length, length + 100 > page.result.length ? page.result.length : length + 100);
				await mainGame.load.pic(cards.map(i => i.id));
				page.list.push(...cards);
			}
			page.loading = false;
			page.finished = page.list.length >= page.result.length;
		},
		setting : {
			chk : false,
			on : () : void => {
				page.setting.chk = true;
			},
			off : () : void => {
				page.setting.chk = false;
			}
		}
	});

	defineExpose({
		dom
	});

	onMounted(async () => {
		document.addEventListener('click', page.click);
		window.addEventListener("resize", page.size);
		window.addEventListener('keydown', page.keydown);
		page.size();
		await page.on();
	});

	onUnmounted(() => {
		document.removeEventListener('click', page.click);
		window.removeEventListener("resize", page.size);
		window.removeEventListener('keydown', page.keydown);
	});

	watch(() => { return props.search.info.lflist; }, () => {
		page.select_height = (props.search.rule.forbidden() ? 7 : 8) * 50;
	});
</script>
<style lang = 'scss'>
	.search {
		position: fixed;
		right: 0;
		top: 0;
		width: 40vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
		.var-input {
			transform: translate(10px, 15px);
			width: calc(90% - 10px);
		}
		.button_list {
			display: flex;
			align-items: center;
			transform: translate(10px, 15px);
			gap: 10px;
		}
		.var-list {
			transform: translate(10px, 15px);
			color: white;
			width: 100%;
			height: 90%;
			overflow-y: auto;
			&::-webkit-scrollbar {
				display: none;
			}
			.var-card  {
				width: 100%;
				height: calc(var(--height));
				position: relative;
				--card-title-padding: 0 0;
				--card-subtitle-color: rgb(204, 204, 204);
				.var-card__container {
					width: 100%;
					.var-card__title {
						margin-left: 10px;
					}
				}
				.image {
					height: var(--height);
					width: var(--width);
					img {
						height: 100%;
						width: 100%;
					}
				}
				.var-badge {
					position: absolute;
					transform: translateX(-50%);
				}
			}
		}
		.search_setting {
			position: absolute;
			right: 0;
			top: 0;
			height: 100%;
			width: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			.select {
				width: 100%;
				transform: translateX(4%);
				transition: all 0.15s ease;
				height: var(--height);
			}
			.input {
				width: 100%;
				transform: translateX(4%);
			}
			.var-select, .var-input {
				width: 80%;
			}
			.var-input {
				transform: translateX(-0.1px);
			}
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>