<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, onUnmounted } from 'vue';
	import * as THREE from 'three';
	import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js'

	import mainGame from '../../script/game';
	import { gsap } from 'gsap';

	const canvas : Ref<HTMLElement | null> = ref(null);

	const three = {
		renderer : new CSS.CSS3DRenderer(),
		scene : new THREE.Scene(),
		camera : new THREE.PerspectiveCamera(),
		resize : () => {
			three.renderer.setSize(window.innerWidth, window.innerHeight);
		},
		render : () => {
			three.renderer.render(three.scene, three.camera);
		}
	}

	onMounted(() => {
		const card_size = {
			width : 0,
			height : 60
		}
		card_size.width = card_size.height / 1.45;
    	three.renderer.setSize(window.innerWidth, window.innerHeight);
		three.camera.position.set(-50, 50, 200);
		three.camera.lookAt(0, 0, 0);
		const pics = mainGame.get.pics();
		const ct = 6
		const tl = gsap.timeline();
		for (let z = 0; z < ct; z++) {
			const dom = document.createElement('div');
			const child = document.createElement('img');
			child.src = pics[Math.floor(Math.random() * pics.length)];
			child.style.width = `${card_size.width}px`;
			child.style.height = `${card_size.height}px`;
			dom.appendChild(child);
			dom.style.opacity = '0';
			const card = new CSS.CSS3DObject(dom);
			three.scene.add(card);
			tl.fromTo(card.position, {
				z : -1200
			}, {
				z : 200,
				duration : ct,
				repeat : -1,
				onRepeat : () => {
					const pics = mainGame.get.pics();
					child.src = pics[Math.floor(Math.random() * pics.length)];
				}
			}, z);
			tl.to(card.element, {
				opacity : 1,
				duration : 1
			}, z);
			tl.fromTo(card.element, {
				opacity : 0
			}, {
				opacity : ct,
				duration : ct,
				repeat : -1
			}, ct + z);
		}

		three.render();
		const el = three.renderer.domElement;
		canvas.value!.appendChild(el);

		const animate = () => {
			requestAnimationFrame(animate);
			three.render();
		}

		animate();

		window.addEventListener("resize", three.resize);
	})

	onUnmounted(() => {
		window.removeEventListener("resize", three.resize);
	})

</script>
<style scoped lang = 'scss'>
	.canvas {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: -9;
	}
</style>