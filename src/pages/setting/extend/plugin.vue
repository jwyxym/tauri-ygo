<template>
	<div class = 'plugin'>
		<Head
			v-model:show = 'page.show'
			:title = 'mainGame.get.text(I18N_KEYS.SETTING_PLUGIN)'
			:icon = 'false'
		/>
		<var-list :style = "{ '--h' : `${page.show
				? page.height
				: 0
			}px`
		}">
			<var-cell
				v-for = 'i in arr'
				:key = 'i.key'
				:title = 'mainGame.get.text(i.i18n)'
			>
				<template #extra>
					<var-switch
						v-model = 'i.value'
						@change = "emit('change', i)"
					/>
				</template>
			</var-cell>
		</var-list>
	</div>
</template>
<script setup lang = 'ts'>
	import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';

	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	import GLOBAL from '@/script/scale';
	import { KEYS } from '@/script/constant';

	import Head from './head.vue';

		
	const arr = ref<Array<{ i18n : number, key : string; value : boolean; }>>([]);
	const page = reactive({
		height : computed(() => arr.value.length * (GLOBAL.SCALE < 0.6 ? 100 : 60) + 1),
		show : false
	});

	const emit = defineEmits<{
		change : [{ i18n : number, key : string; value : any; }]
		open : [number];
	}>();

	onBeforeMount(async () => {
		arr.value = [
			'SETTING_CHK_PLUGIN_GET',
			'SETTING_CHK_PLUGIN_POST',
			'SETTING_CHK_PLUGIN_PUT',
			'SETTING_CHK_PLUGIN_PATCH',
			'SETTING_CHK_PLUGIN_DELETE',
			'SETTING_CHK_PLUGIN_HEAD',
			'SETTING_CHK_PLUGIN_OPTIONS'
		].map(i => {
			return {
				i18n : I18N_KEYS[i as keyof typeof I18N_KEYS],
				key : KEYS[i as keyof typeof KEYS],
				value : mainGame.get.system(KEYS[i as keyof typeof KEYS]) as boolean
			};
		});
	});

	onMounted(() => {
	});

	watch(() => page.show, (n : boolean) => {
		if (n)
			emit('open', page.height);
	});
</script>
<style scoped lang = 'scss'>
	.plugin {
		width: 100%;
		.var-list {
			width: 100%;
			height: var(--h);
			transition: all 0.2s ease;
			overflow: hidden;
		}
	}
</style>