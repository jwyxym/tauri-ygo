<template>
	<var-select
		:clearable = 'true'
		text-color = 'white'
		:placeholder = 'select.placeholder'
		blur-color = 'white'
	>
		<var-option
			v-if = 'select.map'
			v-for = 'i in select.map'
			:value = 'i[0]'
			:label = 'select.label ? i[0] : i[1]'
		/>
		<var-option
			v-if = 'select.array'
			v-for = 'i in select.array'
			:value = 'i[0]'
			:label = 'select.label ? i[0] : i[1]'
		/>
	</var-select>
</template>
<script setup lang = 'ts'>
	import { reactive, Reactive, onBeforeMount } from 'vue'
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	const props = defineProps(['name']);

	interface items {
		placeholder : string;
		map ?: Map<any, any>;
		array ?: Array<[any, any]>;
		label ?: boolean; 
	};

	const select : Reactive<items> = reactive({
		placeholder : '',
	});

	onBeforeMount(async () => {
		switch (props.name) {
			case 'category':
				select.placeholder = mainGame.get.text().deck.search.category;
				select.map = mainGame.strings.get(constant.str.info_conf.category) ?? new Map;
				break;
			case 'race':
				select.placeholder = mainGame.get.text().deck.search.race;
				select.map = mainGame.strings.get(constant.str.info_conf.race) ?? new Map;
				break;
			case 'attribute':
				select.placeholder = mainGame.get.text().deck.search.attribute;
				select.map = mainGame.strings.get(constant.str.info_conf.attribute) ?? new Map;
				break;
			case 'ot':
				select.placeholder = mainGame.get.text().deck.search.ot;
				select.map = mainGame.strings.get(constant.str.info_conf.ot) ?? new Map;
				break;
			case 'type':
				select.placeholder = mainGame.get.text().deck.search.type;
				select.map = mainGame.strings.get(constant.str.info_conf.type) ?? new Map;
				break;
			case 'link':
				select.placeholder = mainGame.get.text().deck.search.link;
				select.map = mainGame.strings.get(constant.str.info_conf.link) ?? new Map;
				break;
			case 'forbidden':
				select.placeholder = mainGame.get.text().deck.search.forbidden;
				select.map = new Map([
					[0, mainGame.get.text().deck.lflist.forbidden],
					[1, mainGame.get.text().deck.lflist.limit],
					[2, mainGame.get.text().deck.lflist.semi_limit],
					[3, mainGame.get.text().deck.lflist.unlimit]
				]);
				break;
			case 'lflist':
				select.placeholder = mainGame.get.text().deck.search.lflist;
				select.map = mainGame.lflist ?? new Map;
				select.label = true;
				break;
			case 'deck':
				select.placeholder = mainGame.get.text().server.deck;
				select.array = (await mainGame.load.deck()).map(i => [i.name, i]);
				select.label = true;
				break;
		}
	});

</script>