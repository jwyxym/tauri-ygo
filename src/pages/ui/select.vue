<template>
	<var-select
		:clearable = 'true'
		text-color = 'white'
		:placeholder = 'select.placeholder'
		:variant = "variant ? variant : 'standard'"
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
	import { reactive, onBeforeMount } from 'vue'
	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	const props = defineProps<{
		name : 'lflist' | 'deck';
		variant ?: 'outlined' | 'standard';
	}>();

	interface items {
		placeholder : string;
		map ?: Map<any, any>;
		array ?: Array<[any, any]>;
		label ?: boolean; 
	};

	const select = reactive<items>({
		placeholder : '',
	});

	onBeforeMount(async () => {
		switch (props.name) {
			case 'lflist':
				select.placeholder = mainGame.get.text(I18N_KEYS.CARD_INFO_LFLIST);
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