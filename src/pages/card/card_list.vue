<template>
	<div class = 'ygopro3__card'>
		<transition name = 'opacity'>
			<main v-show = 'list.cards'>
				<div>
					<div class = 'input'>
						<Input
							:placeholder = 'mainGame.get.text(I18N_KEYS.DECK_INPUT)'
							variant = 'outlined'
							@enter = 'input.confirm'
							v-model = 'input.value'
						/>
						<Button
							:content = 'mainGame.get.text(I18N_KEYS.CONFIRM)'
							@click = 'input.confirm'
							:loading = 'input.loading'
						/>
					</div>
					<RecycleScroller
						class = 'card-list no-scrollbar'
						key-field = 'id'
						:items = 'list.cards'
						:item-size = 'list.size'
					>
						<template v-slot = '{ item }'>
							<div class = 'item'>
								<h2
									:class = "{ 'selected' : list.selected === item }"
									@click = 'list.select(item)'
									class = 'pointer'
								>
									{{ item.name }}
								</h2>
							</div>
						</template>
					</RecycleScroller>
				</div>
				<transition name = 'opacity'>
					<div v-if = 'list.selected' class = 'info'>
						<Card_Info
							:card = 'list.selected'
						/>
					</div>
				</transition>
				<div class = 'button'>
					<Button
						:content = 'mainGame.get.text(I18N_KEYS.EXIT)'
						:loading = 'input.loading'
						@click = "emit('exit')"
						key = '6'
					/>
				</div>
			</main>
		</transition>
	</div>
</template>
<script setup lang = 'ts'>
	import { computed, reactive, onMounted } from 'vue';
	import { RecycleScroller } from 'vue-virtual-scroller';

	import Button from '@/ui/button.vue';
	import Input from '@/ui/input.vue';

	import mainGame from '@/script/game';
	import GLOBAL from '@/script/scale';
	import { I18N_KEYS } from '@/script/language/i18n';
	import Card from '@/script/card';

	import Card_Info from './card_info.vue';

	const list = reactive({
		cards : [] as Array<Card>,
		selected : undefined as undefined | Card,
		size : computed(() => GLOBAL.SCALE < 0.6 ? 64 : 48),
		select : async function (n : Card) {
			if (this.selected === n) {
				list.selected = undefined;
			} else {
				if (this.selected) {
					this.selected = undefined;
					await mainGame.sleep(200, mainGame.load.pic, [[n.id]]);
				}
				this.selected = n;
			}
		}
	});

	const input = reactive({
		loading : false,
		value : '',
		confirm : () : void => {
			if (input.value) {
				list.cards.length = 0;
				const cards = mainGame.cards.values();
				let c = cards.next();
				while (!c.done) {
					const card = c.value;
					if (card.id.toString().includes(input.value) || card.name.includes(input.value))
						list.cards.push(card);
					c = cards.next();
				}
			} else
				list.cards = Array.from(mainGame.cards.values());
			return input.clear();
		},
		clear : () : void => {
			input.value = '';
		}
	});

	onMounted(() => {
		list.cards = Array.from(mainGame.cards.values());
	});
	const emit = defineEmits<{ exit : []; }>();

</script>
<style scoped lang = 'scss'>
	.ygopro3__card {
		height: 100%;
		width: 100%;
		[media = 'mobile'] & {
			:deep(.var-button) {
				transform: scale(140%);
				transform-origin: left top;
			}
			:deep(.var-input) {
				transform: scale(140%);
				transform-origin: left top;
			}
		}
		> * {
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		> main {
			position: relative;
			height: calc(var(--height) * 0.9);
			width: calc(var(--width) * 0.9);
			display: flex;
			color: white;
			> div:first-child {
				width: 40%;
				height: 100%;
				overflow-x: hidden;
				display: flex;
				flex-direction: column;
				[media = 'mobile'] & {
					gap: 40px;
				}
				.input {
					height: 100px;
					margin-top: 10px;
					width: 100%;
					display: flex;
					[media = 'mobile'] & {
						flex-direction: column;
						gap: 30px;
						.var-button {
							width: 10%;
						}
						.var-input {
							width: calc(60%);
						}
					}
					[media = 'pc'] & {
						gap: 10px;
						align-items: center;
						.var-input {
							width: calc(75% - 10px);
						}
					}
				}
				.card-list {
					width: 100%;
					overflow-y: auto;
					[media = 'mobile'] & {
						height: calc(100% - 150px);
					}
					[media = 'pc'] & {
						height: calc(100% - 110px);
					}
					.item {
						width: 100%;
						[media = 'mobile'] & {
							height: 64px;
						}
						[media = 'pc'] & {
							height: 48px;
						}
						> h2 {
							width: 100%;
							margin: 0;
							overflow: hidden;
							text-overflow: ellipsis;
							transition: all 0.2s ease;
							white-space: nowrap;
							[media = 'mobile'] & {
								font-size: 24px;
								line-height: 64px;
							}
							[media = 'pc'] & {
								font-size: 18px;
								line-height: 48px;
							}
						}
						.selected {
							text-shadow:
								0 0 5px aqua,
								0 0 10px aqua;
							transform: translateX(10px);
						}
					}
				}
			}
			.info {
				position: relative;
				width: 60%;
				height: calc(100% - 50px);
			}
			.button {
				position: absolute;
				right: 0;
				bottom: 0;
				.var-button {
					width: 90px;
				}
			}
		}
	}
	.opacity {
		&-enter-active,
		&-leave-active {
			transition: opacity 0.2s ease;
		}

		&-enter-from,
		&-leave-to {
			opacity: 0;
		}

		&-enter-to,
		&-leave-from {
			opacity: 1;
		}
	}
</style>