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
	import { ref, onBeforeMount, Ref, type Component } from 'vue';
	import Deck from'../svg/deck.vue';
	import Save from'../svg/save.vue';
	import Delete from'../svg/delete.vue';
	import Share from'../svg/share.vue';
	import Home from'../svg/home.vue';
	import Add from'../svg/add.vue';
	const props = defineProps(['icon_name']);
	const svgs : Map<string, Component> = new Map ([
		['deck', Deck],
		['save', Save],
		['delete', Delete],
		['share', Share],
		['home', Home],
		['add', Add]
	]);
	const svg : null | Component = svgs.get(props.icon_name) ?? null;
</script>