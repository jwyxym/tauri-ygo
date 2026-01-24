<template>
	<var-input
		:variant = "variant ? variant : 'standard'"
		:placeholder = 'placeholder'
		:rules = 'rules'
		:clearable = 'true'
		text-color = 'white'
		blur-color = 'white'
		size = 'small'
	/>
</template>
<script setup lang = 'ts'>
	defineProps<{
		placeholder ?: string;
		variant ?: 'outlined' | 'standard';
		rules ?: (value : string) => string | boolean
	}>();
</script>