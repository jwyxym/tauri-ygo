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
	import mainGame from '../../script/game';
	import * as CONSTANT from '../../script/constant';
	import { CardInfo, Info } from '../../script/card';
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
		click : (e : MouseEvent) => {
			if (dom.value && !dom.value.contains(e.target as HTMLElement)
				&& props.except.findIndex((i : HTMLElement | null) => i && i.contains(e.target as HTMLElement)) === -1
				&& !(e.target as HTMLElement).classList.contains('var-icon-close-circle')
			)
				props.unshow();
		},
		keydown : (e : KeyboardEvent) => {
			if (e.key === 'Escape')
				props.unshow();
		},
		buttons : (mainGame.get.textures(CONSTANT.FILES.TEXTURE_DECK) as Array<string | undefined>)?.filter(i => i !== undefined) ?? []
	};

	defineExpose({
		dom
	});

	onMounted(() => {
		window.addEventListener('click', page.click);
		window.addEventListener('keydown', page.keydown);
	});

	onUnmounted(() => {
		window.removeEventListener('click', page.click);
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
		height: 100vh;
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