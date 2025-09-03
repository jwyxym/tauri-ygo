<template>
	<var-select
		:clearable = 'true'
		text-color = 'white'
		:placeholder = 'select.placeholder'
		blur-color = 'white'
	>
		<var-option 
			v-for = 'i in select.map'
			:value = 'i[0]'
			:label = 'select.label ? i[0] : i[1]'
		/>
	</var-select>
</template>
<script setup lang = 'ts'>
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	const props = defineProps(['name']);
	const selects : Map<string, {
		placeholder : string;
		map : Map<any, any>;
		label ?: boolean; 
	}> = new Map ([
		['category', {
			placeholder : mainGame.get.text().deck.search.category,
			map : mainGame.strings.get(constant.str.info_conf.category) ?? new Map
		}],
		['race', {
			placeholder : mainGame.get.text().deck.search.race,
			map : mainGame.strings.get(constant.str.info_conf.race) ?? new Map
		}],
		['attribute', {
			placeholder : mainGame.get.text().deck.search.attribute,
			map : mainGame.strings.get(constant.str.info_conf.attribute) ?? new Map
		}],
		['ot', {
			placeholder : mainGame.get.text().deck.search.ot,
			map : mainGame.strings.get(constant.str.info_conf.ot) ?? new Map
		}],
		['type', {
			placeholder : mainGame.get.text().deck.search.type,
			map : mainGame.strings.get(constant.str.info_conf.type) ?? new Map
		}],
		['link', {
			placeholder : mainGame.get.text().deck.search.link,
			map : mainGame.strings.get(constant.str.info_conf.link) ?? new Map
		}],
		['forbidden', {
			placeholder : mainGame.get.text().deck.search.forbidden,
			map : new Map([
				[0, mainGame.get.text().deck.lflist.forbidden],
				[1, mainGame.get.text().deck.lflist.limit],
				[2, mainGame.get.text().deck.lflist.semi_limit],
				[3, mainGame.get.text().deck.lflist.unlimit]
			])
		}],
		['lflist', {
			placeholder : mainGame.get.text().deck.search.lflist,
			map : mainGame.lflist ?? new Map,
			label : true
		}]
	])
	const select : {
		placeholder : string;
		map : Map<any, any>;
		label ?: boolean; 
	} = selects.get(props.name)!;
</script>