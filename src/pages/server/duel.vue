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
		},
		create : {
			size : {
				width : 0,
				height : 90
			},
			offset : 0,
			card : (src : string = '') : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				const child = document.createElement('img');
				child.src = src;
				child.style.width = `${three.create.size.width * 2}px`;
				child.style.height = `${three.create.size.height}px`;
				dom.appendChild(child);
				return new CSS.CSS3DObject(dom);
			},
			plaid : () : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				const child = document.createElement('div');
				child.style.width = `${three.create.size.height}px`;
				child.style.height = `${three.create.size.height}px`;
				child.style.border = '1px solid #9ed3ff';
				dom.appendChild(child);
				return new CSS.CSS3DObject(dom);
			},
			position : (target : CSS.CSS3DObject, x : number, y : number, z : number, card : boolean = false) => {
				if (x % 3 === 0 && x !== 0) {
					if (x === -3)
						target.position.set((three.create.size.height + 5) * x,
							(three.create.size.height + 5) * y
								+ (y >= 0 ? three.create.offset : -three.create.offset),
							z
						);
					else
						target.position.set((three.create.size.height + 5) * x,
							(three.create.size.height + 5) * y
								+ (y <= 0 ? -three.create.offset : three.create.offset),
							z
						);
				} else
					target.position.set((three.create.size.height + 5) * x, (three.create.size.height + 5) * y, 0);
				if (card && (y > 0 || (y === 0 && x === -3)))
					target.rotation.set(0, 0, Math.PI);
			}
		}
	}

	onMounted(() => {
		three.create.size.width = three.create.size.height / 2.9;
		three.create.offset = three.create.size.height / 2;
		three.renderer.setSize(window.innerWidth, window.innerHeight);
		three.renderer.domElement.style.position = 'fixed';
  		three.renderer.domElement.style.top = '0';
		three.camera.position.set(0, -200, 600);
		three.camera.lookAt(0, -30, 0);

		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++) {
				if (y === 0 && x % 2 === 0)
					continue;
				const dom = three.create.plaid();
				three.create.position(dom, x, y, 0);
    			three.scene.add(dom);
			}

			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.back));
			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.pic[0]));

			console.log(props.connect.deck_count)
		for (let z = 1; z < props.connect.deck_count[0]; z++) {
			const card = three.create.card(mainGame.get.textures(constant.str.files.textures.back));
			three.create.position(card, 3, -2, z * 0.2);
			three.scene.add(card);
		}
		for (let z = 1; z < props.connect.deck_count[1]; z++) {
			const card = three.create.card(mainGame.get.textures(constant.str.files.textures.back));
			three.create.position(card, -3, -2, z * 0.2);
			three.scene.add(card);
		}
		for (let z = 1; z < props.connect.deck_count[3]; z++) {
			const card = three.create.card(mainGame.get.textures(constant.str.files.textures.back));
			three.create.position(card, -3, 2, z * 0.2);
			three.scene.add(card);
		}
		for (let z = 1; z < props.connect.deck_count[4]; z++) {
			const card = three.create.card(mainGame.get.textures(constant.str.files.textures.back));
			three.create.position(card, 3, 2, z * 0.2);
			three.scene.add(card);
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

		window.addEventListener('resize', three.resize);
	})

	onUnmounted(() => {
		window.removeEventListener('resize', three.resize);
	});

	const props = defineProps(['connect']);

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