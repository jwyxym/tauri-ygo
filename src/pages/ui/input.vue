<template>
	<var-input
		:variant = "variant ? 'outlined' : 'standard'"
		:placeholder = 'placeholder'
		:rules = 'rules'
		:clearable = 'true'
		text-color = 'white'
		blur-color = 'white'
		size = 'small'
	/>
</template>
<script setup lang = 'ts'>
	defineProps(['placeholder', 'rules', 'variant']);
</script>