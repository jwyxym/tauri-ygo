<template>
    <div class = 'ground_glass'>
        <var-icon
            color = 'white'
            :name = 'icon_name'
            :size = '30'
        />
    </div>
</template>
<script setup lang = 'ts'>
    defineProps(['icon_name']);
</script>
<style lang = 'scss'>
	@use '../../style/ground_glass.scss';
</style>