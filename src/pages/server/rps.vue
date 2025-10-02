<template>
	<div class = 'rps' ref = 'rps'>
		<TransitionGroup tag = 'div' name = 'scale' class = 'pics'
			:style = "{ '--y' : `${page.height}px`, '--x' : `${page.width}px` }"
		>
			<img
				v-for = '(i, v) in constant.str.files.textures.rps'
				v-if = 'page.show'
				:key = 'i'
				:src = 'mainGame.get.textures(i)'
				@click = 'page.on(v)'
			/>
		</TransitionGroup>
		<img
			class = 'oppo'
			:style = "{ '--x' : `${page.width}px` }"
			ref = 'oppo'
		/>
		<img
			class = 'self'
			:style = "{ '--x' : `${page.width}px` }"
			ref = 'self'
		/>
	</div>
</template>
<script setup lang = 'ts'>
	import { onBeforeMount, onMounted, onUnmounted, reactive, TransitionGroup, ref, watch } from 'vue';

	import constant from '../../script/constant';
	import mainGame from '../../script/game';
	import gsap from '../../script/gsap';
	const oppo = ref<HTMLImageElement | null>(null);
	const self = ref<HTMLImageElement | null>(null);

	const page = reactive({
		height : 0,
		width : 0,
		show : false,
		resize : () => {
			page.height = window.innerHeight - 200;
			page.width = window.innerWidth / 2 - 200;
		},
		on : async (v : number) : Promise<void> => {
			page.show = false;
			await props.connect.rps.select(v);
		}
	});

	onBeforeMount(() => {
		window.addEventListener('resize', page.resize);
	});

	onMounted(() => {
		page.resize();
		page.show = true;
	})

	onUnmounted(() => {
		window.removeEventListener('resize', page.resize);
	});

	const props = defineProps(['connect']);

	watch(() => { return props.connect.rps.result; }, (n) => {
		self.value!.src = mainGame.get.textures(constant.str.files.textures.rps[n[0] - 1]) ?? '';
		oppo.value!.src = mainGame.get.textures(constant.str.files.textures.rps[n[1] - 1]) ?? '';
		gsap.rps(self.value!, oppo.value!, () => {
			if (n[0] === n[1])
				page.show = true;
			else {
				if (n[0] === n[1] + 1 || n[0] === n[1] - 2)
					props.connect.is_first.on();
				props.connect.rps.off();
			}
		});
	}, { deep : true });

</script>
<style scoped lang = 'scss'>
	.rps {
		position: relative;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		.pics {
			position: absolute;
			display: flex;
			gap: 30px;
			transform: translate(var(--x), var(--y));
		}
		img, .oppo, .self {
			width: 100px;
			height: 100px;
			&:hover {
				cursor: pointer;
			}
		}
		.oppo {
			position: absolute;
			transform: translate(var(--x), -100vh);
		}
		.self {
			position: absolute;
			transform: translate(var(--x), 200vh);
		}
	}
</style>