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
	import mainGame from '@/script/game';
	import * as CONSTANT from '@/script/constant';
	import { I18N_KEYS } from '@/script/language/i18n';
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
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_CATEGORY);
				select.map = mainGame.strings.get(CONSTANT.KEYS.CATEGORY) ?? new Map;
				break;
			case 'race':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_RACE);
				select.map = mainGame.strings.get(CONSTANT.KEYS.RACE) ?? new Map;
				break;
			case 'attribute':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_ATTRIBUTE);
				select.map = mainGame.strings.get(CONSTANT.KEYS.ATTRIBUTE) ?? new Map;
				break;
			case 'ot':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_OT);
				select.map = mainGame.strings.get(CONSTANT.KEYS.OT) ?? new Map;
				break;
			case 'type':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_TYPE);
				select.map = mainGame.strings.get(CONSTANT.KEYS.TYPE) ?? new Map;
				break;
			case 'link':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_LINK);
				select.map = mainGame.strings.get(CONSTANT.KEYS.LINK) ?? new Map;
				break;
			case 'forbidden':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_FORBIDDEN);
				select.map = new Map([
					[0, mainGame.get.text(I18N_KEYS.DECK_LFLIST_FORBIDDEN)],
					[1, mainGame.get.text(I18N_KEYS.DECK_LFLIST_LIMIT)],
					[2, mainGame.get.text(I18N_KEYS.DECK_LFLIST_SEMI_LIMIT)],
					[3, mainGame.get.text(I18N_KEYS.DECK_LFLIST_UNLIMIT)]
				]);
				break;
			case 'lflist':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_SEARCH_LFLIST);
				select.map = mainGame.lflist ?? new Map;
				select.label = true;
				break;
			case 'deck':
				select.placeholder = mainGame.get.text(I18N_KEYS.SERVER_DECK);
				select.array = (await mainGame.load.deck()).map(i => [i, i.name]);
				break;
		}
	});

</script>