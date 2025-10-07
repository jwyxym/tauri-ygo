<template>
	<div ref = 'info' class = 'cardinfo'>
		<var-card
			:elevation = '0'
			:src = 'cardinfo.pic'
			image-height = '15.3vw'
			image-width = '10.5vw'
			:title = 'cardinfo.name'
			:subtitle = '`${cardinfo.id}\n${cardinfo.type}\n${cardinfo.ot}\n${cardinfo.level}\n${cardinfo.link}`'
			:description = 'cardinfo.description'
		/>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch, ref, onUnmounted, onMounted } from 'vue';
	import mainGame from '../../script/game';
	import { CardInfo } from '../../script/card';
	const info = ref<HTMLElement | null>(null);
	const cardinfo = reactive({
		pic : '',
		name : '',
		id : '',
		ot : '',
		type : '',
		level : '',
		link : '',
		description : ''
	});

	const props = defineProps(['card', 'cards', 'unshow']);

	watch(() => { return props.card; }, (n) => {
		const card = mainGame.get.card(n);
		const info : CardInfo = card.get_info();
		cardinfo.pic = card.pic;
		cardinfo.name = card.name;
		cardinfo.id = card.id.toString();
		cardinfo.description = card.desc;
		cardinfo.ot = info.ot.length > 0 ? `【${info.ot}】` : '';
		cardinfo.type = `${info.attribute} ${info.attribute !== '' ? '|' : ''} ${info.race}\n【${info.type}】`;
		cardinfo.level = card.is_monster() ? `【${info.level}】${info.atk}/${info.def}` : '';
		cardinfo.link = info.link.length > 0 ? `【${info.link}】` : '';
	}, { immediate : true });

	const page = {
		click : (e : MouseEvent) => {
			console.log(info.value)
			if (info.value && !info.value.contains(e.target as HTMLElement) && props.cards.findIndex((i : HTMLElement) => i!.contains(e.target as HTMLElement)) === -1)
				props.unshow();
		}
	}

	onMounted(() => {
		document.addEventListener('click', page.click);
	})

	onUnmounted(() => {
		document.removeEventListener('click', page.click);
	})
</script>
<style lang = 'scss'>
	.cardinfo {
		position: fixed;
		left: 0;
		top: 0;
		width: 40vw;
		height: 100vh;
		white-space: pre-line;
		background-color: rgba(0, 0, 0, 0.5);
		.var-card {
			position: absolute;
			transform: translate(20px, 0);
			width: calc(100% - 20px);
			height: 100%;
			.var-card__container {
				overflow-y: auto;
				&::-webkit-scrollbar {
					display: none;
				}
			}
		}
		z-index: 10;
	}
</style>