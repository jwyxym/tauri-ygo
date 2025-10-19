<template>
	<div class = 'menu'>
		<div
			class = 'menu-cards'
		>
			<div
				v-for = "(i, v) in constant.str.files.textures.menu
					.map(i => mainGame.get.textures(i) as string | undefined ?? '')"
				:style = "{ '--rotate' : `${page.rotate[v]}deg` }"
				class = 'cards'
				ref = 'cards'
				@click = 'page.click(v)'
			>
				<img :src = 'i'/>
			</div>
		</div>
		<div class = 'menu-items font-menu'>
			<span
				v-for = '(i, v) in mainGame.get.text().menu'
				:style = "{ '--shadow' : `${page.items[v]}` }"
				ref = 'items'
				@click = 'page.click(v, true)'
			>{{ i }}</span>
		</div>
		<div class = 'menu-pointer'
			:style = "{ '--x' : `${page.pointer[0]}px`, '--y' : `${page.pointer[1]}px` }"
		>
			<span>&lt;</span>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, onMounted, reactive, watch, onUnmounted } from "vue";

	import constant from '../../script/constant';
	import mainGame from '../../script/game';

	import position from "../../script/position";

	const props = defineProps(['select']);

	const cards : Ref<Array<HTMLElement> | null> = ref(null);
	const items : Ref<Array<HTMLElement> | null> = ref(null);

	const page = reactive({
		select : 0,
		rotate : new Array(mainGame.get.text().menu.length).fill(0),
		items : new Array(mainGame.get.text().menu.length).fill(''),
		pointer : new Array(2).fill(-100),
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
			}
		},
		resize : () : void => {
			page.pointer_size();
		},
		keydown : (event : KeyboardEvent) : void => {
			const len = mainGame.get.text().menu.length - 1;
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

	onMounted(async () : Promise<void>=> {
		window.addEventListener('resize', page.resize);
		window.addEventListener('keydown', page.keydown);
	});

	onUnmounted(() => {
		window.removeEventListener('resize', page.resize);
		window.removeEventListener('keydown', page.keydown);
	});

	watch(cards, () => {
		setTimeout(() => {
			for (let i = 0; i < page.rotate.length; i ++) {
				page.rotate[i] += i * (360 / page.rotate.length);
			}
		}, 400);
	});
	watch(items, (n) => {
		const pos = position.get(n![0]);
		page.pointer[0] = pos.right;
		setTimeout(() => {
			page.pointer[1] = pos.top - pos.height / 7;
		}, 400);
	});

	watch(() => { return page.select; }, (v) => {
		while (page.rotate[v] % 360 !== 0) {
			for (let i = 0; i < page.rotate.length; i ++) {
				page.rotate[i] -= (360 / page.rotate.length);
			}
		}
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