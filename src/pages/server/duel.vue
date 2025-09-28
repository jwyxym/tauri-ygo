<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive, onUnmounted } from 'vue';
	import * as THREE from 'three';
	import { OrbitControls } from '@three-ts/orbit-controls';
	import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js'
	
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import gsap from '../../script/gsap';
	import position from '../../script/position';

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
			height : 90
		}
		card_size.width = card_size.height / 2.9;
		three.renderer.setSize(window.innerWidth, window.innerHeight);
		three.renderer.domElement.style.position = 'fixed';
  		three.renderer.domElement.style.top = '0';
		three.camera.position.set(0, -200, 600);
		three.camera.lookAt(0, -30, 0);

		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++) {
				if (y === 0 && x % 2 === 0)
					continue;
				const dom = document.createElement('div');
				const child = document.createElement('div');
				child.style.width = `${card_size.height}px`;
				child.style.height = `${card_size.height}px`;
				child.style.border = '1px solid #9ed3ff';
				dom.appendChild(child);
				const css = new CSS.CSS3DObject(dom);
				css.position.set((card_size.height + 5) * x, (card_size.height + 5) * y, 0);
    			three.scene.add(css);
			}

		for (let z = 1; z < 61; z++) {
			const dom = document.createElement('div');
			const child = document.createElement('img');
			child.src = mainGame.get.textures(constant.str.files.textures.pic[0]) ?? '';
			child.style.width = `${card_size.width * 2}px`;
			child.style.height = `${card_size.height}px`;
			dom.appendChild(child);
			const css = new CSS.CSS3DObject(dom);
			css.position.set((card_size.height + 5) * -3, (card_size.height + 5) * 2, z * 0.2);
			three.scene.add(css);
			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.back));
			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.pic[0]));
		}
		for (let z = 1; z < 61; z++) {
			const dom = document.createElement('div');
			const child = document.createElement('img');
			child.style.width = `${card_size.width * 2}px`;
			child.style.height = `${card_size.height}px`;
			child.src = mainGame.get.textures(constant.str.files.textures.back) ?? '';
			dom.appendChild(child);
			const css = new CSS.CSS3DObject(dom);
			css.position.set((card_size.height + 5) * 3, (card_size.height + 5) * -2, z * 0.2);
			three.scene.add(css);
		}
		const ambientLight = new THREE.AmbientLight('white', 1);
		three.scene.add(ambientLight);

		three.render();
		canvas.value!.appendChild(three.renderer.domElement);
		// const controls = new OrbitControls(three.camera, window.document.documentElement);
		// controls.minPolarAngle = 0;
		// controls.minDistance = 0;
		// controls.maxDistance = Infinity;

		const animate = () => {
			requestAnimationFrame(animate);
			// controls.update();
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
		z-index: -8;
	}
</style>