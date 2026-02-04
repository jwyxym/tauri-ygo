<template>
	<div class = 'card'
		:class = "{ 'hover' : hover.card === i, 'show' : !!i.loc }"
		:style = "{
			'--position_x' :  `${(i.index % 10) * size.width + 2}px`,
			'--position_y' :  `${(Math.trunc(i.index / 10) + i.y) * size.height + i.loc}px`,
			'--hover_x' :  `${hover.x}px`,
			'--hover_y' :  `${hover.y}px`,
			'--url' : `url('${mainGame.get.card(i.code).pic}')`,
			'--card_height' : `${size.height}px`,
			'--card_width' : `${size.width}px`
		}"
		ref = 'cards'
	>
		<var-badge
			type = 'info'
			v-if = 'lflist && mainGame.get.lflist(lflist, i.code) !== mainGame.get.system(KEYS.SETTING_CT_CARD)'
			:value = 'mainGame.get.lflist(lflist, i.code)'
		/>
	</div>
</template>
<script setup lang = 'ts'>
	import mainGame from '@/script/game';
	import { KEYS } from '@/script/constant';

	interface CardPic { code : number; index : number; y : number; loc : number; key : string; };
	type CardPics = Array<CardPic>;	

	defineProps<{
		i : CardPic;
		hover : { x : number; y : number; card ?: CardPic; };
		size : { width : number; height : number; }
		lflist ?: string;
	}>();

	export type { CardPic, CardPics };
</script>
<style lang = 'scss' scoped>
	.card {
		will-change: transform;
		position: absolute;
		left: 0;
		top: 0;
		opacity: 0;
		height: var(--card_height);
		width: var(--card_width);
		transform: translate(var(--position_x), var(--position_y));
		background-image: var(--url);
		background-size: cover;
		z-index: 0;
		transition: all 0.1s ease;
	}
	.show {
		opacity: 1;
	}
	.hover {
		position: fixed;
		left: 0;
		top: 0;
		transform: translate(calc(var(--hover_x) - 50%), calc(var(--hover_y) - 50%));
		z-index: 1;
	}
</style>