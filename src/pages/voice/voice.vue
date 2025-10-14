<template>
	<div>
		<audio
			loop
			v-for = '[i, v] in mainGame.bgm.get(constant.str.system_conf.sound.back)'
			:key = 'i'
			:id = 'i'
			:class = 'constant.str.system_conf.sound.back'
			ref = 'audio'
		>
			<source :src = 'v'>
		</audio>
		<audio
			loop
			v-for = '[i, v] in mainGame.bgm.get(constant.str.system_conf.sound.button)'
			:key = 'i'
			:id = 'i'
			:class = 'constant.str.system_conf.sound.button'
			ref = 'audio'
		>
			<source :src = 'v'>
		</audio>
	</div>
</template>
<script setup lang = 'ts'>
	import { onMounted, ref, Ref } from 'vue';
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	
	import voice from './voice';

	const audio : Ref<Array<HTMLAudioElement>> = ref([]);
	onMounted(() => {
		voice.push.music(audio.value);
		voice.back.play();
	});

</script>
<style scoped lang = 'scss'>
</style>