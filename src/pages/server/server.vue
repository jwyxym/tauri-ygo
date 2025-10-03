<template>
	<div class = 'server over_ground'>
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
						:placeholder = 'mainGame.get.text().server.name'
						v-model = 'server.name'
					/>
					<AutoInput
						:placeholder = 'mainGame.get.text().server.address'
						:options = server.options
						v-model = 'server.address'
					/>
					<div class = 'pass'>
						<Input
							:placeholder = 'mainGame.get.text().server.password'
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
						:content = 'mainGame.get.text().server.to.duelist'
						:class = "{ 'readonly' : connect.self < 4 && connect.home.mode !== 2 }"
					></Button>
					<Button
						@click = 'connect.to.watcher'
						:content = 'mainGame.get.text().server.to.watcher'
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
							<span>{{ `${mainGame.get.text().server.home.lflist} : ${mainGame.get.lflist(connect.home.lflist)}` }}</span>
							<span>{{ `${mainGame.get.text().server.home.rule} : ${mainGame.get.text().server.rule[connect.home.rule] ?? mainGame.get.text().unknow}` }}</span>
							<span>{{ `${mainGame.get.text().server.home.mode} : ${mainGame.get.text().server.mode[connect.home.mode] ?? mainGame.get.text().unknow}` }}</span>
							<span>{{ `${mainGame.get.text().server.home.time_limit} : ${connect.home.time_limit}` }}</span>
							<span>{{ `${mainGame.get.text().server.home.start_lp} : ${connect.home.start_lp}` }}</span>
							<span>{{ `${mainGame.get.text().server.home.start_hand} : ${connect.home.start_hand}` }}</span>
							<span v-show = 'connect.home.no_check_deck'>{{ mainGame.get.text().server.no_check_deck }}</span>
							<span v-show = 'connect.home.no_shuffle_deck'>{{ mainGame.get.text().server.no_shuffle_deck }}</span>
						</div>
					</div>
					<div class = 'start'>
						<span>{{ `${mainGame.get.text().server.home.watch} : ${connect.home.watch}` }}</span>
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
				:connect = 'connect'
			></Duel>
			<RPS
				v-if = 'page.duel && connect.rps.chk'
				:connect = 'connect'
			></RPS>
			<var-popup v-model:show = 'connect.is_first.selecting' :overlay = 'false' :close-on-key-escape = 'false' :close-on-click-overlay = 'false'>
				<div class = 'select_tp'>
					<Button
						@click = 'connect.is_first.select(1)'
						:content = 'mainGame.get.text().server.is_first[0]'
					></Button>
					<Button
						@click = 'connect.is_first.select(0)'
						:content = 'mainGame.get.text().server.is_first[1]'
					></Button>
				</div>
			</var-popup>
		</TransitionGroup>
		<var-popup v-model:show = 'page.chat' :overlay = 'false' position = 'right'>
			<div class = 'chat'>
				<div class = 'exit_button'>
					<Button
						@click = 'page.chatting'
						icon_name = 'exit'
					></Button>
				</div>
				<ConversationBlock
					class = 'message'
					:list = 'connect.chat.list'
					:userOptions = "{ position: 'left' }"
					:answerOptions = "{ position: 'right' }"
				/>
				<div class = 'send'>
					<Input
						:placeholder = 'mainGame.get.text().server.chat'
						v-model = 'server.chat'
					/>
					<Button
						@click = 'connect.chat.send'
						icon_name = 'chat'
					></Button>
				</div>
			</div>
		</var-popup>
		<transition name = 'move_right'>
			<div class = 'ui' v-show = '(page.wait || page.duel) && !page.chat'>
				<Button
					@click = 'page.chatting'
					icon_name = 'chat'
				></Button>
				<Button
					v-show = 'page.duel'
					@click = 'connect.surrender'
					icon_name = 'flag'
				></Button>
			</div>
		</transition>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onBeforeMount, onMounted, computed, watch, TransitionGroup } from 'vue';
	import { ConversationBlock } from 'conversation-vue'

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
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

	let tcp : Tcp | null = null;
	const deck = ref<HTMLElement | null>();

	const page = reactive({
		server : false,
		wait : false,
		duel : false,
		chat : false,
		loading : false,
		chatting : () => {
			page.chat = !page.chat;
		},
		exit : async () : Promise<void> => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			props.select.menu();
		},
		connect : async () : Promise<void> => {
			page.loading = true;
			if (await tcp!.connect(server.address ?? '', server.name ?? '', server.pass ?? '', connect)) {
				mainGame.push.system(constant.str.system_conf.string.server_address, server.address);
				mainGame.push.system(constant.str.system_conf.string.server_name, server.name);
				mainGame.push.system(constant.str.system_conf.string.server_pass, server.pass);
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
		duel : false,
		is_host : false,
		self : -1,
		chk_deck : undefined as string | boolean | undefined,
		deck : undefined as Deck | undefined,
		player : new Array(4).fill({ name : '' }) as Array<TCP.Player>,
		deck_count : [] as Array<number>,
		chat : {
			list : [] as TCP.Chats,
			send : async () : Promise<void> => {
				await tcp!.send.chat(server.chat);
				server.chat = '';
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
				toast.error(mainGame.get.text().toast.error.deck)
			else
				toast.error(mainGame.get.text().toast.error.player)
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
			chk : true,
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
				title : mainGame.get.text().server.surrender,
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
		}
	});

	const server = reactive({
		chat : '',
		name : mainGame.get.system(constant.str.system_conf.string.server_name) as string,
		address : mainGame.get.system(constant.str.system_conf.string.server_address) as string,
		pass : mainGame.get.system(constant.str.system_conf.string.server_pass) as string,
		options : computed(() => {
			return Array.from(mainGame.servers).map(([k, v]) => ({ label: k, value: v }));
		})
	});

	onBeforeMount(async () => {
		tcp = new Tcp();
		await tcp.listen(connect);
	});

	onMounted(() => {
		page.server = true;
	});

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