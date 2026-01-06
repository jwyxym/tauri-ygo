<template>
	<div class = 'select_list' ref = 'dom' :class = "{ 'unshow' : !page.show }">
		<div class = 'title'>
			<var-switch v-model = 'page.show'/>
			{{ page.title }} [{{ page.min }} - {{ page.max }}]
		</div>
		<var-checkbox-group v-model = 'page.selects' :max = '1'>
			<TransitionGroup class = 'list'  tag = 'div' name = 'scale'>
				<div v-for = 'i in page.unselected_list' class = 'pics' :key = '`${i.code}${page.loc(i)}`'>
					<div class = 'pic' @click = 'page.select(i)'>
						<img :src = 'mainGame.get.card(i.code).pic'/>
						<span>{{ page.loc(i) }}</span>
					</div>
					<var-checkbox :checked-value = 'i' @change = 'page.select(i, false)'></var-checkbox>
				</div>
				<div v-for = 'i in page.selected_list' class = 'pics selected' :key = '`${i.code}${page.loc(i)}`'>
					<div class = 'pic' @click = 'page.unselect(i)'>
						<img :src = 'mainGame.get.card(i.code).pic'/>
						<span>{{ page.loc(i) }}</span>
					</div>
					<var-checkbox :checked-value = 'i' @change = 'page.unselect(i, false)'></var-checkbox>
				</div>
			</TransitionGroup>
		</var-checkbox-group>
		<div class = 'button_list'>
			<Button @click = 'page.confirm' icon_name = 'confirm'></Button>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, TransitionGroup, watch, onBeforeMount } from 'vue';
	import mainGame from '@/script/game';
	import { I18N_KEYS } from '@/script/language/i18n';
	import { Select_Cards, Select_Card } from '@/pages/server/post/tcp';
	import { LOCATION } from '@/pages/server/post/network';

	import Button from '@/pages/ui/button.vue';

	const page = reactive({
		selected_list : [] as Select_Cards,
		unselected_list : [] as Select_Cards,
		title : '',
		min : 0,
		max : 0,
		selects : [] as Select_Cards,
		this_select : undefined as Select_Card | undefined,
		show : true,
		loc : (i : Select_Card) : string => {
			const players = [I18N_KEYS.DUEL_PLAYER_SELF, I18N_KEYS.DUEL_PLAYER_OPPO];
			const locs = new Map([
				[LOCATION.HAND, I18N_KEYS.DUEL_LOCATION_HAND],
				[LOCATION.DECK, I18N_KEYS.DUEL_LOCATION_DECK],
				[LOCATION.EXTRA, I18N_KEYS.DUEL_LOCATION_EX_DECK],
				[LOCATION.GRAVE, I18N_KEYS.DUEL_LOCATION_GRAVE],
				[LOCATION.REMOVED, I18N_KEYS.DUEL_LOCATION_REMOVED],
				[LOCATION.OVERLAY, I18N_KEYS.DUEL_LOCATION_OVERLAY],
			]);
			return `[${mainGame.get.text(players[i.tp])}]${(() => {
				const [key, seq] = locs.has(i.loc) ? [locs.get(i.loc)!, (i.loc & LOCATION.OVERLAY) === LOCATION.OVERLAY ? i.ct : i.seq]!
					: (i.loc & LOCATION.MZONE) === LOCATION.MZONE ?
						i.seq > 4 ? [I18N_KEYS.DUEL_LOCATION_EX_MZONE, i.seq - 5] : [I18N_KEYS.DUEL_LOCATION_MZONE, i.seq]
						: i.seq > 4 ? [I18N_KEYS.DUEL_LOCATION_FIELD, 0] : [I18N_KEYS.DUEL_LOCATION_SZONE, i.seq];
				return `${mainGame.get.text(key)}[${seq}]`;
			})()}`;
		},
		confirm : () => {
			if (page.this_select === undefined)
				props.cancel();
			else {
				const result = [1];
				const ct = props.list.unselected.indexOf(page.this_select);
				result.push(ct > -1 ? ct : props.list.selected.indexOf(page.this_select) + props.list.unselected.length);
				props.confirm(result);
			}
		},
		select : (i : Select_Card, chk : boolean = true) => {
			if (i === page.this_select) {
				page.this_select = undefined;
				const ct = page.selects.indexOf(i);
				if (ct > -1 && chk)
					page.selects.splice(ct, 1);
				i.card?.select.off();
			} else if (page.this_select === undefined) {
				page.this_select = i;
				if (chk)
					page.selects.push(i);
				i.card?.select.on();
			}
		},
		unselect : (i : Select_Card, chk : boolean = true) => {
			if (i === page.this_select) {
				page.this_select = undefined;
				if (chk)
					page.selects.push(i);
				i.card?.select.on();
			} else if (page.this_select === undefined) {
				page.this_select = i;
				const ct = page.selects.indexOf(i);
				if (ct > -1 && chk)
					page.selects.splice(ct, 1);
				i.card?.select.off();
			}
		},
		sort : (a: Select_Card, b: Select_Card) : number => {
			if (a.tp !== b.tp) return a.tp - b.tp;
			if (a.loc !== b.loc) return a.loc - b.loc;
			if (a.loc === LOCATION.OVERLAY) return a.ct - b.ct;
			return a.seq - b.seq;
		}
	});

	const dom = ref<HTMLElement | null>(null);
	const props = defineProps(['list', 'title', 'min', 'max', 'confirm', 'cancel']);

	watch(() => { return props.list; }, async (n : {
		selected : Select_Cards;
		unselected : Select_Cards;
	}) => {
		page.this_select = undefined;
		page.unselected_list.length = 0;
		page.selected_list.length = 0;
		await mainGame.sleep(100);
		page.unselected_list = n.unselected.sort(page.sort);
		page.selected_list = n.selected.sort(page.sort);
		page.selects = Array.from(n.selected);
		page.unselected_list.forEach(i => i.card?.select.off());
		page.selected_list.forEach(i => i.card?.select.on());
	}, { immediate : true });

	onBeforeMount(() => {
		page.title = props.title;
		page.min = props.min;
		page.max = props.max;
	});

	defineExpose({ dom });
</script>
<style scoped lang = 'scss'>
	@use './select_list.scss';
	.button_list {
		display: grid;
		justify-items: center;
		align-items: center;
	}
	.scale {
		&-enter-active,
		&-leave-active {
			transition: transform 0.1s;
		}

		&-enter-from,
		&-leave-to {
			transform: scale(0);
		}

		&-enter-to,
		&-leave-from {
			transform: scale(1);
		}
	}
</style>