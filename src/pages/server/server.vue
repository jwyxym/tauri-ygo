<template>
	<div>
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
						:content = mainGame.get.text().server.to.duelist
					></Button>
					<Button
						@click = 'connect.to.watcher'
						:content = mainGame.get.text().server.to.watcher
					></Button>
				</div>
				<div class = 'content'>
					<div class = 'home'>
						<var-list>
							<var-cell
								v-for = '(i, v) in connect.player'
								:title = 'i.name'
								:border = 'true'
								:key = 'v'
							>
								<template #extra>
									<div class = 'extra' v-if = 'i.ready !== undefined'>
										<var-checkbox
											:class = "{ 'readonly' : connect.self !== v}"
											:readonly = 'connect.self !== v'
											v-model = 'i.ready'
										></var-checkbox>
										<var-icon
											v-if = 'connect.is_host'
											:color = "connect.self !== v ? 'white' : '#555'"
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
							v-if = 'connect.is_host'
							@click = 'connect.start'
							icon_name = 'socket'
						></Button>
					</div>
				</div>
			</var-form>
		</var-popup>
		<transition name = 'opacity'>
			<Duel
				v-if = 'page.duel'
			></Duel>
		</transition>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onBeforeMount, onMounted, computed, watch } from 'vue';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import fs from '../../script/fs';
	import Tcp, * as TCP from './post/tcp';

	import Select from '../varlet/select.vue';
	import Button from '../varlet/button.vue';
	import Input from '../varlet/input.vue';
	import AutoInput from '../varlet/auto_input.vue';
	import Deck from '../deck/deck';
	import Duel from './duel.vue';

	interface player {
		name : string;
		ready ?: boolean;
	};

	let tcp : Tcp | null = null;
	const deck = ref<HTMLElement | null>();

	const page = reactive({
		server : false,
		wait : false,
		duel : false,
		loading : false,
		exit : async () : Promise<void> => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			props.select.menu();
		},
		connect : async () : Promise<void> => {
			page.loading = true;
			if (await tcp!.connect(server.address ?? '', server.name ?? '', server.pass ?? '')) {
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
		state : false,
		duel : false,
		is_host : false,
		self : 0,
		chk_deck : undefined as string | boolean | undefined,
		deck : undefined as Deck | undefined,
		player : new Array(4).fill({ name : '' }) as Array<player>,
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
			// await tcp.disconnect();
			// page.wait = false;
			// await (new Promise(resolve => setTimeout(resolve, 200)));
			// page.server = true;
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
				await tcp!.send.to_duelist();
			},
			watcher : async () : Promise<void> => {
				await tcp!.send.to_watcher();
			},
		},
		clear : () => {
			connect.player = [];
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
		}
	});

	const server = reactive({
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

	watch(() => { return connect.state; }, async (n) => {
		const on = async () => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.wait = true;
			page.loading = false;
		}
		const off = async () => {
			page.wait = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.server = true;
			connect.clear();
		}
		n ? await on() : await off();
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>