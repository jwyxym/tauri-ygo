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
		<div class = 'content'>
			<div class = 'button_list'>
				<Button
					@click = 'page.disconnect'
					icon_name = 'exit'
				></Button>
				<Button
					@click = 'page.start'
					icon_name = 'socket'
				></Button>
			</div>
		</div>
	</var-popup>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted, computed, watch } from 'vue';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import fs from '../../script/fs';
	import Tcp from './post/tcp';

	import Button from '../varlet/button.vue';
	import Input from '../varlet/input.vue';
	import AutoInput from '../varlet/auto_input.vue';

	let tcp = new Tcp();

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
			if (!await tcp.connect(server.address ?? '', server.name ?? '', server.pass ?? '', connect))
				page.loading = false;
			else {
				mainGame.push.system(constant.str.system_conf.string.server_address, server.address);
				mainGame.push.system(constant.str.system_conf.string.server_name, server.name);
				mainGame.push.system(constant.str.system_conf.string.server_pass, server.pass);
				fs.write.system();
			}
		},
		disconnect : async () : Promise<void> => {
			await tcp.disconnect(connect);
		},
		start : async () : Promise<void> => {
			// await tcp.disconnect();
			// page.wait = false;
			// await (new Promise(resolve => setTimeout(resolve, 200)));
			// page.server = true;
		}
	});

	const connect = reactive({
		state : false
	});

	const server = reactive({
		name : mainGame.get.system(constant.str.system_conf.string.server_name) as string,
		address : mainGame.get.system(constant.str.system_conf.string.server_address) as string,
		pass : mainGame.get.system(constant.str.system_conf.string.server_pass) as string,
		options : computed(() => {
			return Array.from(mainGame.servers).map(([k, v]) => ({ label: k, value: v }));
		}),
	});

	onBeforeMount(() => {
		
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
			tcp = new Tcp();
		}
		n ? await on() : await off();
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>