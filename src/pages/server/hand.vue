<template>
	<div class = 'hand'>
		<TransitionGroup tag = 'div' v-for = "(i, v) in ['self', 'oppo']" :class = 'i' class = 'cards'>
			<img
				v-for = 'card in connect.cards.hand[v]'
				:src = 'card'
				:key = 'card'
				name = 'scale'
			/>
		</TransitionGroup>
	</div>
</template>
<script setup lang = 'ts'>
	import { TransitionGroup } from 'vue';
	const props = defineProps(['connect']);
</script>
<style scoped lang = 'scss'>
	.hand {
		.cards {
			width: 30vw;
			display: flex;
			flex-wrap: nowrap;
			overflow-x: auto;
		}
		.self, .oppo {
			position: fixed;
			img {
				width: 90px;
			}
		}
		.self {
			transform: translate(35vw, 80vh);
		}
		.oppo {
			top: 10px;
		}
	}
</style>