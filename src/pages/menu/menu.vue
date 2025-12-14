<template>
	<div class = 'menu font-menu'>
		<h1>
			{{ page.time.hour }} : {{ page.time.minute }} : {{ page.time.second }}
		</h1>
		<div class = 'menu-items'>
			<span
				v-for = '(i, v) in page.menu'
				:style = "{ '--shadow' : `${page.items[v]}` }"
				ref = 'items'
				@click = 'page.click(v, true)'
			>{{ mainGame.get.text(i) }}</span>
		</div>
		<div class = 'menu-pointer'
			:style = "{ '--x' : `${page.pointer[0]}px`, '--y' : `${page.pointer[1]}px` }"
		>
			<span>&lt;</span>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, onMounted, reactive, watch, onUnmounted, onBeforeMount } from "vue";

	import mainGame from '../../script/game';
	import { I18N_KEYS } from "../../script/language/i18n";

	import position from "../../script/position";

	const props = defineProps(['select']);

	const items : Ref<Array<HTMLElement> | null> = ref(null);

	const page = reactive({
		time : {
			y : -1,
			hour : '',
			minute : '',
			second : '',
			interval : null as null | number
		},
		select : -1,
		menu : [I18N_KEYS.MENU_SINGLE, I18N_KEYS.MENU_CONENCT, I18N_KEYS.MENU_DECK, I18N_KEYS.MENU_SETTING, I18N_KEYS.MENU_EXIT],
		items : [] as Array<string>,
		pointer : new Array(2).fill(-1000),
		click : (v : number, item : boolean = false) : void => {
			if (item && page.select === v) {
				page.to();
				return;
			}
			page.select = v;
		},
		pointer_size : () : void => {
			if (items.value) {
				const pos = position.get(items.value[page.select]);
				page.pointer[0] = pos.right;
				page.pointer[1] = pos.top - pos.height / 7;
				if (page.time.y < 0)
					page.time.y = pos.top
			}
		},
		resize : () : void => {
			page.pointer_size();
		},
		keydown : (event : KeyboardEvent) : void => {
			const len = page.menu.length - 1;
			if (['PageDown', 'ArrowDown'].includes(event.key))
				page.select >= len ? page.select = 0 : page.select ++;
			else if (['PageUp', 'ArrowUp'].includes(event.key))
				page.select <= 0 ? page.select = len : page.select --;
			else if (event.key === 'Enter')
				page.click(page.select, true);
		},
		to : async () : Promise<void> => {
			switch (page.select) {
				case 0:
					break;
				case 1:
					await props.select.server();
					break;
				case 2:
					await props.select.deck();
					break;
				case 3:
					await props.select.setting();
					break;
				case 4:
					await mainGame.exit();
					break;
			}
		}
	});

	onBeforeMount(() : void => {
		page.items = new Array(page.menu.length).fill('');
		window.addEventListener('resize', page.resize);
		window.addEventListener('keydown', page.keydown);
		const time = () => {
			const now = new Date();
			const hour = now.getHours().toString();
			const minute = now.getMinutes().toString();
			const second = now.getSeconds().toString();
			page.time.hour = `${hour.length > 1 ? '' : '0'}${hour}`;
			page.time.minute = `${minute.length > 1 ? '' : '0'}${minute}`;
			page.time.second = `${second.length > 1 ? '' : '0'}${second}`;
		}
		time();
		page.time.interval = setInterval(time, 1000);
	})

	onMounted(()=> {
		page.select = 0;
	});

	onUnmounted(() => {
		window.removeEventListener('resize', page.resize);
		window.removeEventListener('keydown', page.keydown);
		if (page.time.interval)
			clearInterval(page.time.interval);
	});

	watch(() => { return page.select; }, (v) => {
		page.items.forEach((_, vaule) => {
			page.items[vaule] = vaule === v ? `
					0 0 5px #00ffff,
					0 0 10px #00ffff,
					0 0 20px #00ffff,
					0 0 40px #00ffff
			` : '';
		});
		page.pointer_size();
	}, { immediate : true });

</script>
<style scoped lang = 'scss'>
	@use './menu.scss';
</style>