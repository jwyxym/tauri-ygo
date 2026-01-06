<template>
	<div ref = 'dom' class = 'cardinfo'>
		<div class = 'title'>
			<div class = 'name'>
				<strong>{{ cardinfo.name }}</strong>
			</div>
			<div class = 'attr'>
				<img v-if = "cardinfo.attribute !== ''" :src = 'cardinfo.attribute'/>
			</div>
			<div class = 'race'>
				<img v-if = "cardinfo.race !== ''" :src = 'cardinfo.race'/>
			</div>
		</div>
		<div class = 'subtitle'>
			<div class = 'pic'>
				<img v-if = "cardinfo.pic !== ''" :src = 'cardinfo.pic'/>
			</div>
			<div class = 'info'>
				<div v-for = 'i in cardinfo.info'>
					<img v-if = "i.icon !== ''" :src = 'i.icon'/>
					<span>{{ i.content }}</span>
				</div>
			</div>
		</div>
		<div class = 'buttons'>
			<div v-for = '(i, v) in page.buttons'>
				<img :src = 'i'/>
				<div @click = '[props.deck.push.main, props.deck.push.side][v](cardinfo.id)'>+1</div>
				<div @click = '[props.deck.remove.main, props.deck.remove.side][v](cardinfo.id)'>-1</div>
			</div>
		</div>
		<div v-if = "cardinfo.ot !== ''" class = 'ot'>【{{ cardinfo.ot }}】</div>
		<div v-if = "cardinfo.id !== ''" class = 'id'>【{{ cardinfo.id }}】</div>
		<div v-if = "cardinfo.setcode !== ''" class = 'setcode'>【{{ cardinfo.setcode }}】</div>
		<div v-if = "cardinfo.type !== ''" class = 'type'>【{{ cardinfo.type }}】</div>
		<div v-if = "cardinfo.description !== ''" class = 'desc'>{{ cardinfo.description }}</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { reactive, watch, ref, onUnmounted, onMounted } from 'vue';
	import mainGame from '@/script/game';
	import * as CONSTANT from '@/script/constant';
	import { CardInfo, Info } from '@/script/card';
	const dom = ref<HTMLElement | null>(null);
	const cardinfo = reactive({
		pic : '',
		name : '',
		id : '',
		ot : '',
		type : '',
		attribute : '',
		race : '',
		description : '',
		setcode : '',
		info : [] as Array<Info>
	});

	const props = defineProps(['card', 'deck', 'except', 'unshow']);

	watch(() => { return props.card; }, (n) => {
		const card = mainGame.get.card(n);
		const info : CardInfo = card.get_info();
		cardinfo.pic = card.pic;
		cardinfo.name = card.name;
		cardinfo.id = card.id.toString();
		cardinfo.description = card.desc;
		cardinfo.ot = info.ot.length > 0 ? info.ot : '';
		cardinfo.attribute = info.attribute;
		cardinfo.race = info.race;
		cardinfo.info = info.info;
		cardinfo.type = info.type;
		cardinfo.setcode = info.setcode;
	}, { immediate : true });

	const page = {
		keydown : (e : KeyboardEvent) => {
			if (e.key === 'Escape' && !props.deck.remove.block)
				props.unshow();
		},
		touchstart : (e : TouchEvent) => {
			const target : HTMLElement = e.target as HTMLElement;
			page.block = Array.from(document.getElementsByClassName('Vue-Toastification__container')).findIndex(i => i.contains(target)) > -1;
			page.x = e.touches[0].clientX;
		},
		touchend : (e : TouchEvent) => {
			const target : HTMLElement = e.target as HTMLElement;
			if (!props.deck.remove.block && !page.block) {
				const ct : number = page.x - e.changedTouches[0].clientX;
				if (ct > 50)
					props.unshow();
				else if (Math.abs(ct) < 50 && dom.value && !dom.value.contains(target)
					&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(target)) === -1
					&& !target.classList.contains('var-icon-close-circle')
					&& !target.classList.contains('var-icon')
				)
					props.unshow();
			}
			page.x = 0;
			page.block = false;
		},
		mousedown : (e : MouseEvent) => {
			if (e.button === 0) {
				const target : HTMLElement = e.target as HTMLElement;
				page.block = Array.from(document.getElementsByClassName('Vue-Toastification__container')).findIndex(i => i.contains(target)) > -1;
				page.x = e.clientX;
			}
		},
		mouseup : (e : MouseEvent) => {
			const target : HTMLElement = e.target as HTMLElement;
			if (e.button === 0 && !props.deck.remove.block && !page.block) {
				const ct : number = page.x - e.clientX;
				if (ct > 50)
					props.unshow();
				else if (Math.abs(ct) < 50 && dom.value && !dom.value.contains(target)
					&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(target)) === -1
					&& !target.classList.contains('var-icon-close-circle')
					&& !target.classList.contains('var-icon')
				)
					props.unshow();
			}
			page.x = 0;
			page.block = false;
		},
		block : false,
		x : 0,
		buttons : (mainGame.get.textures(CONSTANT.FILES.TEXTURE_DECK) as Array<string | undefined>)?.filter(i => i !== undefined) ?? []
	};

	defineExpose({
		dom
	});

	onMounted(() => {
		window.addEventListener('touchstart', page.touchstart);
		window.addEventListener('touchend', page.touchend);
		window.addEventListener('mousedown', page.mousedown);
		window.addEventListener('mouseup', page.mouseup);
		window.addEventListener('keydown', page.keydown);
	});

	onUnmounted(() => {
		window.removeEventListener('touchstart', page.touchstart);
		window.removeEventListener('touchend', page.touchend);
		window.removeEventListener('mousedown', page.mousedown);
		window.removeEventListener('mouseup', page.mouseup);
		window.removeEventListener('keydown', page.keydown);
	});
</script>
<style scoped lang = 'scss'>
	.cardinfo {
		color: white;
		position: fixed;
		left: 0;
		top: 0;
		width: 40vw;
		height: var(--vh);
		white-space: pre-line;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		gap: 5px;
		overflow-y: auto;
		&::-webkit-scrollbar {
			display: none;
		}
		.title, .subtitle, .desc, .type, .id, .setcode, .ot, .buttons {
			transform: translateY(10px);
			font-size: max(2.5vh, 12px);
			margin-left: 10px;
			width: calc(100% - 20px);
		}
		.title {
			display: flex;
			align-items: center;
			.name {
				width: calc(100% - max(5vh, 24px) * 2);
				font-size: max(3vh, 16px);
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			.attr, .race {
				width: max(5vh, 24px);
				img {
					width: 100%;
				}
			}
		}
		.subtitle {
			height: calc((100% - 10px) * 0.3 * 1.2);
			display: flex;
			gap: 10px;
			.pic {
				width: 30%;
				img {
					width: 100%;
					max-height: 100%;
				}
			}
			.info {
				font-size: max(2.5vh, 12px);
				width: calc(70% - 10px);
				height: 100%;
				display: flex;
				flex-direction: column;
				gap: 5px;
				div {
					display: flex;
					gap: 5px;
					height: max(5vh, 24px);
					width: 100%;
					img {
						height: 100%;
					}
				}
			}
		}
		.buttons {
			font-size: max(2.5vh, 6px);
			width: 100%;
			display: flex;
			gap: 5px;
			div {
				display: flex;
				gap: 5px;
				height: max(5vh, 10px);
				width: calc(max(5vh, 10px) * 3 + 15px);
				div {
					height: 100%;
					min-width: max(5vh, 10px);
					width: max(5vh, 10px);
					border: 1px solid white;
					border-radius: 50%;
					display: grid;
					justify-content: center;
					align-items: center;
					&:hover {
						cursor: pointer;
					}
				}
			}
			img {
				height: 100%;
			}
		}
		z-index: 10;
	}
</style>