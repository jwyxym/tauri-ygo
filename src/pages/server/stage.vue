<template>
<div>
	<!-- 按钮能切换demo1的布尔值 -->
	<!-- demo1为true，则执行blue，否则就执行red -->
	<button @click="demo2">点我</button>
	<div class="blue-background" :class="{ animate: demo1 }">
    <div class="blue-text">MAIN PHASE</div>
	</div>
</div>
<div>
	<div class="red-background" :class="{ animate: !demo1 }">
    <div class="red-text">MAIN PHASE</div>
	</div>
</div>
</template>

<script setup>
import { ref } from 'vue'
const demo1 = ref(true)
function demo2() {
	demo1.value = !demo1.value
}
</script>

<style scoped>
.blue-background,
.red-background {
	width: 55%;
	height: 18%;
	position: absolute;
	top: 50%;
	left: -300%;
	display: flex;
	align-items: center;
	transform: translateY(-50%);
}
.blue-background.animate{
	animation: blue-slidein 0.2s ease-in forwards, 
  		blue-stay 0.5s 0.2s forwards, 
  		blue-slideout 0.2s 0.7s ease-out forwards;
}
.red-background.animate{
	animation: red-slidein 0.2s ease-in forwards, 
  		red-stay 0.5s 0.2s forwards, 
  		red-slideout 0.2s 0.7s ease-out forwards;
}
@keyframes blue-slidein {
	from {
    	left: -30%;
	}
	to {
		left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
@keyframes red-slidein {
	from {
		left: 130%;
	}
	to {
		left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
@keyframes blue-stay {
	from, to {
    	left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
@keyframes red-stay {
	from, to {
    	left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
@keyframes blue-slideout {
	from {
    	left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
	to {
    	left: 130%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
@keyframes red-slideout {
	from {
		left: 50%;
    	transform: translateX(-50%) translateY(-50%);
	}
	to {
    	left: -30%;
    	transform: translateX(-50%) translateY(-50%);
	}
}
.blue-background {
	background: linear-gradient(to left, blue, transparent);
}
.red-background {
	background: linear-gradient(to right, red, transparent);
}
.blue-text,
.red-text {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 0;
	right: 0;
	z-index: 1;
	font-weight: bold;
	font-size: 480%;
	font-family: 'title';
	text-shadow: 
    	4px 4px 8px black,
    	0 0 10px wheat,
    	0 0 20px gray;
	letter-spacing: 2px;
	color: gainsboro;
	padding: 15px;
	text-align: center;
}
.blue-text {
	background-color: linear-gradient(to left, rgba(0, 0, 0, 0.3), transparent);
}
.red-text {
	background-color: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
}
</style>