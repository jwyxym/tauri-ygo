<template>
	<div class = 'server'>
		<transition name = 'opacity'>
			<div class = 'address' v-if = 'page.server'>
				<var-list>
					<var-cell>
						<template #default>
							<Input
								:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_NAME)'
								v-model = 'server.name'
							/>
						</template>
					</var-cell>
					<var-cell>
						<template #default>
							<AutoInput
								:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_ADDRESS)'
								:options = server.options
								v-model = 'server.address'
							/>
						</template>
					</var-cell>
					<var-cell>
						<template #default>
							<Input
								:placeholder = 'mainGame.get.text(I18N_KEYS.SERVER_PASSWORD)'
								v-model = 'server.pass'
							/>
						</template>
					</var-cell>
				</var-list>
			</div>
		</transition>
		<transition name = 'opacity'>
			<div class = 'wait' v-if = 'page.wait'>
				<var-list>
					<var-cell>
						<template #default>
							<div class = 'buttons'>
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
								{{ `${mainGame.get.text(I18N_KEYS.SERVER_HOME_WATCH)} : ${connect.home.watch}` }}
							</div>
						</template>
					</var-cell>
					<var-cell
						v-for = '(i, v) in connect.player.slice(0, connect.home.mode === 2 ? 4 : 2)'
						:title = 'i.name'
						:border = 'true'
						:key = 'v'
					>
						<template #extra>
							<div class = 'check_ready' v-if = 'i.ready !== undefined'>
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
					<var-cell class = 'select_deck'>
						<template #default>
							<Select
								ref = 'deck'
								name = 'deck'
								v-model = 'connect.deck'
								@change = 'connect.ready'
								:rules = 'connect.rule'
							></Select>
						</template>
					</var-cell>
				</var-list>
			</div>
		</transition>
		<transition name = 'move_right'>
			<div class = 'info' v-if = 'page.info.chk' ref = 'info'>
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
		</transition>
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
		<var-popup v-model:show = 'page.chat.chk' :overlay = 'false' position = 'right'>
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
					<Button
						@click = 'server.voice_input.shift'
						icon_name = 'microphone'
						v-if = 'voice_input.chk()'
						:class = "{ 'voice_input' : server.voice_input.chk }"
					></Button>
				</div>
			</div>
		</var-popup>
		<transition name = 'move_right'>
			<Float_Buttons
				ref = 'float_buttons'
				v-show = '!page.chat.chk && !page.info.chk && (
					page.server || page.wait || page.duel
				)'
				:list = "[
					{
						click : page.server ? page.connect : connect.start,
						loading : page.loading,
						icon : 'socket',
						show : page.server || page.wait
					}, {
						click : page.chat.shift,
						icon : 'chat',
						show : page.wait || page.duel
					}, {
						click : connect.surrender,
						icon : 'flag',
						show : page.duel
					}, {
						click : page.info.shift,
						icon : 'info',
						show : page.wait
					}, {
						click : connect.chat.robot,
						icon : 'add_person',
						show : page.wait
					}, {
						click : page.server ? page.exit : page.disconnect,
						icon : 'exit',
						show : page.server || page.wait
					}
				]"
			/>
		</transition>
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
	import voice_input from '../../script/voice_input';

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
	const info = ref<HTMLElement | null>(null);
	const float_buttons : Ref<{ dom: HTMLElement } | null> = ref(null);

	const page = reactive({
		server : false,
		wait : false,
		duel : false,
		loading : false,
		chat : {
			chk : false,
			shift : () => {
				page.chat.chk = !page.chat.chk;
			}
		},
		info : {
			chk : false,
			shift : () => {
				page.info.chk = !page.info.chk;
			}
		},
		click : (e : MouseEvent) => {
			const target = (e.target as HTMLElement);
			console.log(Array.from(document.getElementsByClassName('var-dialog')))
			if (target.classList.contains('var-icon-close-circle')
				|| (float_buttons.value && float_buttons.value.dom.contains(e.target as HTMLElement))
				|| Array.from(document.getElementsByClassName('var-dialog')).findIndex(i => i.contains(target)) > -1
			)
				return;
			if (page.chat.chk && chat.value && !chat.value.contains(target))
				page.chat.shift();
			if (page.info.chk && info.value && !info.value.contains(target))
				page.info.shift();
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
		}),
		voice_input : {
			chk : false,
			shift : () : void => {
				voice_input.on ? voice_input.stop() : voice_input.start();
				server.voice_input.chk = voice_input.on;
			},
			result : (str : string) : void => {
				Dialog({
					title : str,
					onConfirm : () => { server.chat += str; }
				});
			},
		}
	});

	onBeforeMount(async () => {
		tcp = new Tcp();
		await tcp.listen(connect);
		voice_input.result(server.voice_input.result);
	});

	onMounted(() => {
		page.server = true;
		document.addEventListener('click', page.click);
	});

	onUnmounted(() => {
		document.removeEventListener('click', page.click);
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
			page.chat.chk = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.server = true;
			connect.clear();
			page.loading = false;
			page.chat.chk = false;
			server.chat = '';
		};
		await [off, on, start][n]();
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>