<template>
	<var-button
		text outline container
		type = 'primary'
		text-color = 'white'
		size = 'small'
	>
		<component :is = "svg" />
	</var-button>
</template>
<script setup lang = 'ts'>
	import { type Component } from 'vue';
	import Deck from'../svg/deck.vue';
	import Save from'../svg/save.vue';
	import Delete from'../svg/delete.vue';
	import Share from'../svg/share.vue';
	import Home from'../svg/home.vue';
	import Add from'../svg/add.vue';
	import Search from'../svg/search.vue';
	import Setting from'../svg/setting.vue';
	import Exit from'../svg/exit.vue';
	import Cancel from'../svg/cancel.vue';
	import Confirm from'../svg/confirm.vue';
	const props = defineProps(['icon_name']);
	const svgs : Map<string, Component> = new Map ([
		['deck', Deck],
		['save', Save],
		['delete', Delete],
		['share', Share],
		['home', Home],
		['add', Add],
		['search', Search],
		['setting', Setting],
		['exit', Exit],
		['cancel', Cancel],
		['confirm', Confirm],
	]);
	const svg : null | Component = svgs.get(props.icon_name) ?? null;
</script>