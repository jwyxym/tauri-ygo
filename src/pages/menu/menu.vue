<template>
	<div class = 'menu'>
		<div
			v-for = "
				(i, v) in constant.str.files.textures.menu
					.map(i => mainGame.get.textures(i) as string | undefined ?? '')
			"
			ref = 'item'
		>
			<div
				class = 'menu-cards'
				:style = "{ '--rotate' : `${page.rotate[v]}deg` }"
			>
				<img :src = 'i'/>
			</div>
		</div>
		<div ref = 'button'>
			<Button
				:content = 'page.button'
				@click = 'page.to'
			></Button>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, onMounted, reactive, watch, onUnmounted } from "vue";

	import constant from '../../script/constant';
	import mainGame from '../../script/game';

	import Button from '../varlet/button.vue';

	const props = defineProps(['select']);

	const button : Ref<HTMLElement | null> = ref(null);
	const item : Ref<Array<HTMLElement> | null> = ref(null);

	const page = reactive({
		button : '',
		select : null as HTMLImageElement | null,
		rotate : new Array(mainGame.get.text().menu.length).fill(0),
		click : (e : MouseEvent) : void => {
			if (button.value!.contains(e.target as HTMLElement))
				return;
			const v = item.value!.findIndex(i => i.contains(e.target as HTMLElement));
			if (v > -1 && (e.target as HTMLElement).tagName === 'IMG') {
				const img = item.value![v].querySelector('img');
				page.select = page.select === img ? null : img;
			} else page.select = null;
		},
		to : async () : Promise<void> => {
			switch (item.value!.find(i => i.contains(page.select))) {
				case item.value![0]:
					break;
				case item.value![1]:
					await props.select.server();
					break;
				case item.value![2]:
					await props.select.deck();
					break;
				case item.value![3]:
					await props.select.setting();
					break;
				case item.value![4]:
					await mainGame.exit();
					break;
			}
		}
	});

	onMounted(async () : Promise<void>=> {
		page.button = mainGame.get.text().menu[0];
		document.addEventListener('click', page.click);
	});

	onUnmounted(() => {
		document.removeEventListener('click', page.click);
	});

	watch(item, () => {
		setTimeout(() => {
			for (let i = 0; i < page.rotate.length; i ++) {
				page.rotate[i] += i * (360 / page.rotate.length);
			}
		}, 400);
	});

	watch(() => { return page.select; }, (n, o) => {
		if (o)
			o.style.transform = 'translateY(0)';
		if (n) {
			n.style.transform = 'translateY(-10vh)';
			const v = item.value!.findIndex(i => i.contains(n));
			while (page.rotate[v] % 360 !== 0) {
				for (let i = 0; i < page.rotate.length; i ++) {
					page.rotate[i] -= (360 / page.rotate.length);
				}
			}
			page.button = mainGame.get.text().menu[v];
		} else page.button = '';
	});

</script>
<style scoped lang = 'scss'>
	@use './menu.scss';
</style>