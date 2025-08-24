<template>
	<starry-sky :stars-count = '500' :distance = '800' />
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { invoke } from "@tauri-apps/api/core";
	import { useToast } from 'vue-toastification'
</script>
<style scoped>

</style>
<style>

</style>