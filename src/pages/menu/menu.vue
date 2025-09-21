<template>
	<div class = 'menu'>
		<div class = 'content'>
			<span class = 'title font-title' ref = 'title'>{{ constant.str.title }}</span>
			<div class = 'list'>
				<div v-for = '(i, v) in mainGame.get.text().menu' class = 'item_back' ref = 'item'>
					<span
						class = 'item font-menu'
						@click = 'select(v)'
					>
						{{ i }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, Ref, onMounted } from "vue";

	import constant from '../../script/constant';
	import mainGame from '../../script/game';
	import gsap from '../../script/gsap';

	const props = defineProps(['select']);

	const title : Ref<HTMLElement | null> = ref(null);
	const item : Ref<Array<HTMLElement> | null> = ref(null);

	const select = async (v : number) : Promise<void> => {
		const leave = async () : Promise<void> => {
			switch (v) {
				case 0:
					break;
				case 1:
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
		};
		const array = [title.value!, ...item.value!];
		gsap.move_left(array, leave);
	}

	onMounted(async () : Promise<void>=> {
		const array = [title.value!, ...item.value!];
		gsap.from_left(array);
	})

</script>
<style scoped lang = 'scss'>
	@use './menu.scss';
</style>