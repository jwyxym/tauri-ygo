<template>
	<div>
		<audio
			loop
			v-for = '[i, v] in mainGame.bgm'
			:key = 'i'
			:id = 'i'
			:ref = '($el) => voice.set_elements($el as HTMLAudioElement | null, i)'
		>
			<source :src = 'v'>
		</audio>
	</div>
</template>
<script setup lang = 'ts'>
	import mainGame from '@/script/game';
	import voice from './voice';
</script>
<style scoped lang = 'scss'>
</style>