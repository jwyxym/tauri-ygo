<template>
	<var-popup v-model:show = 'page.server' :close-on-key-escape = 'false' :overlay = 'false'>
		<var-form>
			<div class = 'exit'>
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
			<div class = 'exit'>
				<Button
					@click = 'page.disconnect'
					icon_name = 'exit'
				></Button>
			</div>
			<div class = 'content'>
				<div class = 'home'>
					<var-list>
						<TransitionGroup
							name = 'opacity'
							tag = 'div'
						>
							<var-cell
								v-for = 'i in connect.player'
								:key = 'i'
								:title = 'i.name'
								:border = 'true'
							>
								<template #extra>
									<var-checkbox
										:readonly = 'true'
										@change = 'connect.prepare'
									></var-checkbox>
								</template>
							</var-cell>
						</TransitionGroup>
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
					<Select name = 'deck' v-model = 'connect.deck'></Select>
					<Button
						@click = 'connect.start'
						icon_name = 'socket'
					></Button>
				</div>
			</div>
		</var-form>
	</var-popup>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted, computed, watch } from 'vue';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import fs from '../../script/fs';
	import Tcp, * as TCP from './post/tcp';

	import Select from '../varlet/select.vue';
	import Button from '../varlet/button.vue';
	import Input from '../varlet/input.vue';
	import AutoInput from '../varlet/auto_input.vue';
	import Deck from '../deck/deck';

	let tcp : Tcp | null = null;

	const page = reactive({
		server : false,
		wait : false,
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
		deck : undefined as Deck | undefined,
		player : [] as Array<{ name : string}>,
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
		prepare : async () : Promise<void> => {
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
			if (connect.player.length === 0)
				connect.player.push(server)
		}
		n ? await on() : await off();
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>