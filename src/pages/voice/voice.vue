<template>
	<div>
		<audio
			loop
			v-for = '[i, v] in mainGame.bgm'
			:key = 'i'
			:id = 'i'
			ref = 'audio'
		>
			<source :src = 'v'>
		</audio>
	</div>
</template>
<script setup lang = 'ts'>
	import { onMounted, ref, Ref } from 'vue';
	import mainGame from '@/script/game';
	
	import voice from './voice';

	const audio : Ref<Array<HTMLAudioElement>> = ref([]);
	onMounted(() => {
		voice.push.music(audio.value);
		voice.back.play();
	});

</script>
<style scoped lang = 'scss'>
</style>