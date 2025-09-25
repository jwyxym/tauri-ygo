<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive, onUnmounted } from 'vue';
	import * as THREE from 'three';
	import { OrbitControls } from '@three-ts/orbit-controls';
	
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import { gsap } from 'gsap';

	const canvas : Ref<HTMLElement | null> = ref(null);

	const three = {
		renderer : new THREE.WebGLRenderer({ alpha: true }),
		scene : new THREE.Scene(),
		camera : new THREE.PerspectiveCamera(),
		resize : () => {
			three.renderer.setSize(window.innerWidth, window.innerHeight);
		},
		render : () => {
			three.renderer.render(three.scene, three.camera);
		},
		texture : {
			this : new THREE.TextureLoader(),
			front : (url : string) => {
				const texture = three.texture.this.load(url);
				return texture;
			},
			back : () => {
				const texture = three.texture.this.load(mainGame.get.textures(constant.str.files.textures.back) ?? '');
				return texture;
			}
		}
	}

	onMounted(() => {
		const card_size = {
			width : window.innerWidth / 80,
			height : 0
		}
		card_size.height = card_size.width * 2 / 0.684;
    	three.renderer.setSize(window.innerWidth, window.innerHeight);

		three.camera.position.set(0, -200, 400);
		three.camera.lookAt(0, -40, 0);

		const geometry = new THREE.BoxGeometry(card_size.width, card_size.height, 0.1);
		const bottom = new THREE.PlaneGeometry(card_size.width, card_size.height);
		const boder = new THREE.EdgesGeometry(bottom);
		const boder_material = new THREE.LineBasicMaterial({
			color : 'white'
		});
		const back_map = three.texture.back();
		const back = new THREE.MeshStandardMaterial({ 
			map : back_map,
		});
		const pics = mainGame.get.pics();
		const front_map = pics.map(i => three.texture.front(i));

		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++) {
				if (y === 0 && x % 2 === 0)
					continue;

				const line = new THREE.LineSegments(boder, boder_material);
				line.position.set((card_size.width + 2) * x, (card_size.height + 2) * y, 0);
    			three.scene.add(line);
			}

		for (let z = 1; z < 61; z++) {
			const front = new THREE.MeshStandardMaterial({ 
				map : front_map[Math.floor(Math.random() * front_map.length)],
			});
			const front_boder = new THREE.MeshStandardMaterial({ color: 0x61060d });
			const back_boder = new THREE.MeshStandardMaterial({ color: 0xd99652 });
			const front_materials = [
				front_boder,
				front_boder,
				front_boder,
				front_boder,
				front,
				back
			];
			const back_materials = [
				back_boder,
				back_boder,
				back_boder,
				back_boder,
				front,
				back
			];

			const card = new THREE.Group();
			card.add(new THREE.Mesh(geometry, front_materials));
			card.add(new THREE.Mesh(geometry, back_materials));
			card.position.set((card_size.width + 2) * 3, (card_size.height + 2) * -2, z * 0.2);
			card.rotation.set(0, - Math.PI, 0);
			three.scene.add(card);
		}
		const ambientLight = new THREE.AmbientLight('white', 1);
		three.scene.add(ambientLight);

		three.render();
		const el = three.renderer.domElement;
		canvas.value!.appendChild(el);
		// const controls = new OrbitControls(three.camera, window.document.documentElement);
		// controls.minPolarAngle = 0;
		// controls.maxPolarAngle = Math.PI;
		// controls.minAzimuthAngle = Math.PI / -2;
		// controls.maxAzimuthAngle = Math.PI / 2;
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