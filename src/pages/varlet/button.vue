<template>
	<var-button
		text outline container
		type = 'primary'
		text-color = 'white'
		size = 'small'
	>
		<var-icon
			color = 'white'
			:name = 'icon_name'
			:size = '30'
		/>
	</var-button>
</template>
<script setup lang = 'ts'>
	defineProps(['icon_name']);
</script>