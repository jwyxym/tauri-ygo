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
					icon_name = 'refresh'
				></Button>
			</div>
		</div>
	</var-popup>
</template>
<script setup lang = 'ts'>
	import { reactive, onBeforeMount, onMounted, computed } from 'vue';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import tcp from './post/tcp';

	import Button from '../varlet/button.vue';
	import Input from '../varlet/input.vue';
	import AutoInput from '../varlet/auto_input.vue';

	const page = reactive({
		server : false,
		wait : false,
		exit : async () : Promise<void> => {
			page.server = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			props.select.menu();
		},
		connect : async () : Promise<void> => {
			if (await tcp.connect(server.address ?? '', server.name ?? '', server.pass ?? '')) {
				page.server = false;
				await (new Promise(resolve => setTimeout(resolve, 200)));
				page.wait = true;
			}
		},
		disconnect : async () : Promise<void> => {
			await tcp.disconnect();
			page.wait = false;
			await (new Promise(resolve => setTimeout(resolve, 200)));
			page.server = true;
		},
		start : async () : Promise<void> => {
			// await tcp.disconnect();
			// page.wait = false;
			// await (new Promise(resolve => setTimeout(resolve, 200)));
			// page.server = true;
		}
	});

	const server = reactive({
		name : '',
		address : mainGame.get.system(constant.str.system_conf.string.server) as string,
		pass : '',
		options : computed(() => {
			return Array.from(mainGame.servers).map(([k, v]) => ({ label: k, value: v }));
		}),
	});

	onBeforeMount(() => {
		
	});

	onMounted(() => {
		page.server = true;
	});

	const props = defineProps(['select']);
</script>
<style scoped lang = 'scss'>
	@use './server.scss';
</style>