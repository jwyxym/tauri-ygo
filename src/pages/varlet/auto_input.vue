<template>
	<var-auto-complete
		:variant = "variant ? 'outlined' : 'standard'"
		:placeholder = 'placeholder'
		:rules = 'rules'
		:clearable = 'true'
		text-color = 'white'
		blur-color = 'white'
		size = 'small'
		ref = 'input'
		:get-show = '() => { return true; }'
	/>
</template>
<script setup lang = 'ts'>
	defineProps(['placeholder', 'rules', 'variant']);
</script>