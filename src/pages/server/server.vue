<template>
	<div class = 'server'>
		<var-popup v-model:show = 'page.server' :close-on-key-escape = 'false' :overlay = 'false'>
			<var-form>
				<div class = 'button_list'>
					<Button
						@click = 'page.exit'
						icon_name = 'exit'
					></Button>
				</div>
				<div class = 'content'>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_NAME)'
						v-model = 'server.name'
					/>
					<AutoInput
						:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_ADDRESS)'
						:options = server.options
						v-model = 'server.address'
					/>
					<div class = 'pass'>
						<Input
							:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_PASSWORD)'
							v-model = 'server.pass'
						/>
						<Button
							:loading = 'page.loading'
							@click = 'page.connect'
							icon_name = 'socket'
						></Button>
					</div>
				</div>
			</var-form>
		</var-popup>
		<var-popup v-model:show = 'page.wait' :close-on-key-escape = 'false' :overlay = 'false'>
			<var-form>
				<div class = 'button_list'>
					<Button
						@click = 'page.disconnect'
						icon_name = 'exit'
					></Button>
					<Button
						@click = 'connect.to.duelist'
						:content = 'mainGame.get.text(I18N_KEYS.SERVER_TO_DUELIST)'
						:class = "{ 'readonly' : connect.self < 4 && connect.home.mode !== 2 }"
					></Button>
					<Button
						@click = 'connect.to.watcher'
						:content = 'mainGame.get.text(I18N_KEYS.SERVER_TO_WATCHER)'
						:class = "{ 'readonly' : connect.self >= 4 }"
					></Button>
				</div>
				<div class = 'content'>
					<div class = 'home'>
						<var-list>
							<var-cell
								v-for = '(i, v) in connect.player.slice(0, connect.home.mode === 2 ? 4 : 2)'
								:title = 'i.name'
								:border = 'true'
								:key = 'v'
							>
								<template #extra>
									<div class = 'extra' v-if = 'i.ready !== undefined'>
										<var-checkbox
											class = 'readonly'
											:readonly = 'true'
											v-model = 'i.ready'
										></var-checkbox>
										<var-icon
											v-if = 'connect.is_host'
											:color = "connect.self === v ? '#555' : 'white'"
											name = 'close-circle-outline'
											@click = 'connect.kick(v)'
										/>
									</div>
								</template>
							</var-cell>
						</var-list>
						<div class = 'info'>
							<span>{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_LFLIST)} : ${mainGame.get.lflist(connect.home.lflist)}` }}</span>
							<span>
								{{
									`${mainGame.get.text(I18N_KEYS.SERVER_HOME_RULE)} : ${mainGame.get.text([
										I18N_KEYS.SERVER_RULE_OCG, I18N_KEYS.SERVER_RULE_TCG, I18N_KEYS.SERVER_RULE_SC, I18N_KEYS.SERVER_RULE_CUSTOM, I18N_KEYS.SERVER_RULE_NO_EXCLUSIVE, I18N_KEYS.SERVER_RULE_ALL
									][connect.home.rule] ?? I18N_KEYS.UNKNOW)}`
								}}
							</span>
							<span>
								{{
									`${mainGame.get.text(I18N_KEYS.SERVER_HOME_MODE)} : ${mainGame.get.text([
										I18N_KEYS.SERVER_MODE_SINGLE, I18N_KEYS.SERVER_MODE_MATCH, I18N_KEYS.SERVER_MODE_TAG
									][connect.home.mode] ?? I18N_KEYS.UNKNOW)}`
								}}
							</span>
							<span>{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_TIME_LIMIT)} : ${connect.home.time_limit}` }}</span>
							<span>{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_START_LP)} : ${connect.home.start_lp}` }}</span>
							<span>{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_START_HAND)} : ${connect.home.start_hand}` }}</span>
							<span v-show = 'connect.home.no_check_deck'>{{ mainGame.get.text(I18N_KEYS.SERVER_NO_CHECK_DECK) }}</span>
							<span v-show = 'connect.home.no_shuffle_deck'>{{ mainGame.get.text(I18N_KEYS.SERVER_NO_SHUFFLE_DECK) }}</span>
						</div>
					</div>
					<div class = 'start'>
						<span>{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_WATCH)} : ${connect.home.watch}` }}</span>
						<Select
							ref = 'deck'
							name = 'deck'
							v-model = 'connect.deck'
							@change = 'connect.ready'
							:rules = 'connect.rule'
						></Select>
						<Button
							:loading = 'page.loading'
							v-if = 'connect.is_host'
							@click = 'connect.start'
							icon_name = 'socket'
						></Button>
					</div>
				</div>
			</var-form>
		</var-popup>
		<TransitionGroup tag = 'div' name = 'opacity'>
			<Duel
				v-if = 'page.duel && connect.deck_count.length > 0'
				key = 'Duel'
				:connect = 'connect'
				@update:duel = 'connect.duel = $event'
			></Duel>
			<RPS
				v-if = 'page.duel && connect.rps.chk'
				key = 'RPS'
				:connect = 'connect'
			></RPS>
		</TransitionGroup>
		<var-popup v-model:show = 'connect.is_first.selecting' :overlay = 'false' :close-on-key-escape = 'false' :close-on-click-overlay = 'false'>
			<div class = 'select_tp'>
				<Button
					@click = 'connect.is_first.select(1)'
					:content = 'mainGame.get.text(I18N_KEYS.SERVER_PLAYER_FIRST)'
				></Button>
				<Button
					@click = 'connect.is_first.select(0)'
					:content = 'mainGame.get.text(I18N_KEYS.SERVER_PLAYER_NEXT)'
				></Button>
			</div>
		</var-popup>
		<var-popup v-model:show = 'page.chat' :overlay = 'false' position = 'right'>
			<div class = 'chat' ref = 'chat'>
				<ConversationBlock
					class = 'message'
					:list = 'connect.chat.list'
					:userOptions = "{ position: 'left' }"
					:answerOptions = "{ position: 'right' }"
				/>
				<div class = 'send'>
					<Input
						:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_CHAT)'
						v-model = 'server.chat'
						@keydown = 'connect.chat.press'
					/>
					<Button
						@click = 'connect.chat.send'
						icon_name = 'chat'
					></Button>
				</div>
			</div>
		</var-popup>
		<Float_Buttons
			ref = 'float_buttons'
			:show = '(page.wait || page.duel) && !page.chat'
			:list = "[
				{
					click : page.chatting,
					icon : 'chat',
					show : true
				}, {
					click : connect.chat.robot,
					icon : 'add_person',
					show : page.wait
				}, {
					click : connect.surrender,
					icon : 'flag',
					show : page.duel
				}
			]"
		/>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, reactive, onBeforeMount, onMounted, computed, watch, TransitionGroup, onUnmounted } from 'vue';
	import { ConversationBlock } from 'conversation-vue'

	import mainGame from '../../script/game';
	import { I18N_KEYS } from '../../script/language/i18n';
	import * as CONSTANT from '../../script/constant';
	import fs from '../../script/fs';
	import Tcp, * as TCP from './post/tcp';
	import toast from '../../script/toast';

	import Select from '../varlet/select.vue';
	import Button from '../varlet/button.vue';
	import Input from '../varlet/input.vue';
	import AutoInput from '../varlet/auto_input.vue';
	import Deck from '../deck/deck';
	import Duel from './duel.vue';
	import RPS from './rps.vue';
	import Dialog from '../varlet/dialog';
	import Float_Buttons from '../varlet/float_buttons.vue';

	let tcp : Tcp | null = null;
	const deck = ref<HTMLElement | null>(null);
	const chat = ref<HTMLElement | null>(null);
	const float_buttons : Ref<{ dom: HTMLElement } | null> = ref(null);

	const page = reactive({
		server : false,
		wait : false,
		duel : false,
		chat : false,
		loading : false,
		chatting : () => {
			page.chat = !page.chat;
		},
		chat_click : (e : MouseEvent) => {
			if (page.chat &&
				chat.value && !chat.value.contains(e.target as HTMLElement)
				&& float_buttons.value && !float_buttons.value!.dom.contains(e.target as HTMLElement)
				&& !(e.target as HTMLElement).classList.contains('var-icon-close-circle')
			)
				page.chatting();
		},
		exit : async () : Promise<void> => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			props.select.menu();
		},
		connect : async () : Promise<void> => {
			page.loading = true;
			if (await tcp!.connect(server.address ?? '', server.name ?? '', server.pass ?? '', connect)) {
				mainGame.push.system(CONSTANT.KEYS.SETTING_SERVER_ADDRESS, server.address);
				mainGame.push.system(CONSTANT.KEYS.SETTING_SERVER_PLAYER_NAME, server.name);
				mainGame.push.system(CONSTANT.KEYS.SETTING_SERVER_PASS, server.pass);
				fs.write.system();
			} else {
				page.loading = false;
			}
		},
		disconnect : async () : Promise<void> => {
			await tcp!.disconnect(connect);
		}
	});

	const connect = reactive({
		state : 0,
		is_host : false,
		self : -1,
		chk_deck : undefined as string | boolean | undefined,
		deck : undefined as Deck | undefined,
		player : new Array(4).fill({ name : '' }) as Array<TCP.Player>,
		deck_count : [] as Array<number>,
		duel : {},
		chat : {
			list : [] as TCP.Chats,
			send : async () : Promise<void> => {
				if (server.chat === '') return;
				await tcp!.send.chat(server.chat);
				server.chat = '';
			},
			press : async (event : KeyboardEvent) : Promise<void> => {
				if (event.key === 'Enter')
					await connect.chat.send();
			},
			robot : async () : Promise<void> => {
				await tcp!.send.chat('/ai');
			}
		},
		home : {
			lflist : 0,
			rule : 0,
			mode : 0,
			duel_rule : 0,
			no_check_deck : false,
			no_shuffle_deck : false,
			start_lp : 0,
			start_hand : 0,
			draw_count : 0,
			time_limit : 0,
			watch : 0
		} as TCP.HostInfo,
		start : async () : Promise<void> => {
			if (connect.deck && connect.player.filter(i => i.ready).length === (connect.home.mode === 2 ? 4 : 2)) {
				page.loading = true;
				await tcp!.send.start();
				await mainGame.load.pic(connect.deck);
			} else if (!connect.deck)
				toast.error(mainGame.get.text(I18N_KEYS.SERVER_DECK_ERROR))
			else
				toast.error(mainGame.get.text(I18N_KEYS.SERVER_PLAYER_ERROR))
		},
		ready : async (deck : Deck | undefined) : Promise<void> => {
			deck ? await tcp!.send.ready(deck) : await tcp!.send.un_ready();
		},
		rule : async (deck : Deck | undefined) : Promise<string | boolean> => {
			if (deck) {
				while (connect.chk_deck === undefined)
					await (new Promise(resolve => setTimeout(resolve, 200)));
				const result = connect.chk_deck;
				connect.chk_deck = undefined;
				return result;
			} else {
				return true;
			}
		},
		kick : async (v : number) : Promise<void> => {
			if (connect.self !== v)
				await tcp!.send.kick(v);
		},
		to : {
			duelist : async () : Promise<void> => {
				if (connect.self >= 4 || connect.home.mode === 2) {
					await tcp!.send.to_duelist();
				}
			},
			watcher : async () : Promise<void> => {
				if (connect.self < 4) {
					await tcp!.send.to_watcher();
				}
			},
		},
		rps : {
			chk : false,
			result : [0, 0],
			select : async (v : number) : Promise<void> => {
				await tcp!.send.rps(v);
			},
			off : () : void => {
				connect.rps.chk = false;
			},
		},
		is_first : {
			chk : undefined as boolean | undefined,
			selecting : false,
			on : () => {
				connect.is_first.selecting = true;
			},
			select : async (v : number) : Promise<void> => {
				await tcp!.send.select_tp(v);
				connect.is_first.chk = v === 1;
				connect.is_first.selecting = false;
			},
		},
		surrender : async () : Promise<void> => {
			Dialog({
				title : mainGame.get.text(I18N_KEYS.SERVER_SURRENDER),
				onConfirm : tcp!.send.surrender
			});
		},
		clear : () => {
			connect.player = new Array(4).fill({ name : '' }) as Array<TCP.Player>;
			connect.home = {
				lflist : 0,
				rule : 0,
				mode : 0,
				duel_rule : 0,
				no_check_deck : false,
				no_shuffle_deck : false,
				start_lp : 0,
				start_hand : 0,
				draw_count : 0,
				time_limit : 0,
				watch : 0
			};
			connect.deck = undefined;
			connect.chat.list = [] as TCP.Chats;
			connect.deck_count = [];
			connect.is_first.chk = undefined;
		}
	});

	const server = reactive({
		chat : '',
		name : mainGame.get.system(CONSTANT.KEYS.SETTING_SERVER_PLAYER_NAME) as string,
		address : mainGame.get.system(CONSTANT.KEYS.SETTING_SERVER_ADDRESS) as string,
		pass : mainGame.get.system(CONSTANT.KEYS.SETTING_SERVER_PASS) as string,
		options : computed(() => {
			return Array.from(mainGame.servers).map(([k, v]) => ({ label: k, value: v }));
		})
	});

	onBeforeMount(async () => {
		tcp = new Tcp();
		await tcp.listen(connect);
	});

	onMounted(() => {
		console.log(0)
		page.server = true;
		console.log(1)
		document.addEventListener('click', page.chat_click);
	});

	onUnmounted(() => {
		document.removeEventListener('click', page.chat_click);
	})

	watch(() => {return page.chat}, (n) => {
		n ? toast.off() : toast.on();
	});

	watch(() => { return connect.state; }, async (n) => {
		if (![0, 1, 2].includes(n)) return;
		const on = async () => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.wait = true;
			page.loading = false;
		};
		const start = async () => {
			page.wait = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.duel = true;
			page.loading = false;
		};
		const off = async () => {
			page.wait = false;
			page.duel = false;
			page.chat = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.server = true;
			connect.clear();
			page.loading = false;
			page.chat = false;
			server.chat = '';
		};
		await [off, on, start][n]();
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>