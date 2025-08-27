<template>
	<motion.div class = 'deck_body'>
		<var-card
			title=""
			subtitle=""
			description=""
			src=""
			class = 'description'
		/>
		<!-- <div
			class = 'card'
		></div> -->
		<div
			class = 'deck'
		>
			<Container
				class = 'main'
				groupName = 'deck'
				@drop="onDrop"
				:animation-duration = '100'
				:drag-begin-delay = '20'
				:removeOnDropOut = 'true'
				:getChildPayload = "(i : number) => { return payload(i, 'main'); }"
			>
				<Draggable v-for = '(i, v) in deck.main' :key = 'v'>
					<div class = 'card'>
						<img :src = 'i'></img>
					</div>
				</Draggable>
			</Container>
			<Container
				class = 'extra'
				groupName = 'deck'
				@drop="onDrop"
				:animation-duration = '100'
				:drag-begin-delay = '20'
				:removeOnDropOut = 'true'
				:getChildPayload = "(i : number) => { return payload(i, 'extra'); }"
			>
				<Draggable v-for = '(i, v) in deck.extra' :key = 'v'>
					<div class = 'card'>
						<img :src = 'i'></img>
					</div>
				</Draggable>
			</Container>
			<Container
				class = 'side'
				groupName = 'deck'
				@drop="onDrop"
				:animation-duration = '100'
				:drag-begin-delay = '20'
				:removeOnDropOut = 'true'
				:getChildPayload = "(i : number) => { return payload(i, 'side'); }"
			>
				<Draggable v-for = '(i, v) in deck.side' :key = 'v'>
					<div class = 'card'>
						<img :src = 'i'></img>
					</div>
				</Draggable>
			</Container>
		</div>
		<Container
			class = 'search'
			groupName = 'deck'
			@drop="onDrop"
			:animation-duration = '100'
			:drag-begin-delay = '20'
			:removeOnDropOut = 'true'
			:getChildPayload = "(i : number) => { return payload(i, 'search'); }"
		>
			<Draggable v-for = '(i, v) in deck.search' :key = 'v'>
				<div class = 'card'>
					<img :src = 'i'></img>
				</div>
			</Draggable>
		</Container>
	</motion.div>
</template>
<script setup lang = 'ts'>
	import { ref, reactive, onMounted, onUnmounted, Ref, watch } from "vue";
	import { motion, AnimatePresence } from 'motion-v';
	import { Container, Draggable} from "vue3-smooth-dnd";

	const src = 'https://jwyxym.top:50028/pics/xiao/66666666.jpg'
	let deck = reactive({
		main : [
			src, src, src, src, src, src, src, src, src, src
		],
		extra : [],
		side : [],
		search : [],
	})

	function payload(i : number, str : string) : string | undefined {
		switch (str) {
			case 'main':
				return deck.main[i];
			case 'extra':
				return deck.extra[i];
			case 'side':
				return deck.side[i];
			case 'search':
				return deck.search[i];
		}
	}

	function onDrop(dropResult : {
		removedIndex : number
		addedIndex : number
		payload : string
	}) {
		const removedIndex = dropResult.removedIndex;
		const addedIndex = dropResult.addedIndex;
		const payload = dropResult.payload;
		console.log(dropResult)
		// if (payload !== undefined && addedIndex !== null && removedIndex === null) {
		// 	items2.value.splice(addedIndex, 0, payload);
		// }
		// else if (addedIndex === null && removedIndex !== null) {
		// 	items2.value.splice(removedIndex, 1);
		// }
	}
</script>
<style lang = 'scss'>
	@use '../style/deck.scss';
</style>