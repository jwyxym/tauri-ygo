<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive } from 'vue';
	import * as THREE from 'three';
	import TWEEN from '@tweenjs/tween.js';
	import gsap from 'gsap';

	import mainGame from '../../script/game';
	import constant from '../../script/constant';

	const canvas : Ref<HTMLElement | null> = ref(null);

	onMounted(() => {
		function random(count : number, min : number, max : number) {
			const numbers = [];
			for (let i = min; i <= max; i++) {
				numbers.push(i);
			}

			for (let i = numbers.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * i);
				[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
			}

			return numbers.slice(0, count);
		}

		const card_size = {
			width : window.innerWidth / 80,
			height : 0
		}
		card_size.height = card_size.width * 2 / 0.684;
		const renderer = new THREE.WebGLRenderer({ alpha: true });
    	renderer.setSize(window.innerWidth, window.innerHeight);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera();

		camera.position.set(-50, 50, 200);
		// camera.position.set(0, 20, 400);
		camera.lookAt(0, 0, 0);

		const geometry = new THREE.PlaneGeometry(card_size.width, card_size.height);

		const texture = new THREE.TextureLoader();

		const cards = new THREE.AnimationObjectGroup();
		const pics = mainGame.get.pics();
		const ct = {
			x : 1,
			y : 1,
			z : 6
		}
		for (let z = 0; z < ct.z; z++) {
			const front_map = texture.load(pics[Math.floor(Math.random() * pics.length)]);
			front_map.colorSpace  = THREE.SRGBColorSpace;
			const front = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : front_map,
				side : THREE.FrontSide,
				transparent: true,
				opacity : 0
			}));
			const back_map = texture.load(mainGame.get.textures(constant.str.files.textures.back));
			back_map.colorSpace = THREE.SRGBColorSpace;
			const back = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : back_map,
				side : THREE.BackSide,
				transparent: true,
				opacity : 0
			}));
			const card = new THREE.Group();
			card.add(front);
			card.add(back);
			scene.add(card);
			card.position.x = 0;
			card.position.y = 0;
			card.position.z = z * -300;
			cards.add(card);
		}

		renderer.render(scene, camera);
		renderer.outputEncoding = THREE.sRGBEncoding;
		const el = renderer.domElement;
		canvas.value!.appendChild(el);

		const animate = () => {
			requestAnimationFrame(animate);
			(cards._objects as Array<any>).forEach((i, v) => {
				(i.children as Array<any>).forEach((el) => {
					if (el.material.opacity < 1)
						el.material.opacity += 0.005;
					if (el.position.z < (v + 1) * 300) {
						el.position.z += 1;
					} else {
						el.position.z = (v + 1) * 300 - ct.z * 300;
						el.material.opacity = 0;
						const pic = new THREE.TextureLoader().load(pics[Math.floor(Math.random() * pics.length)])
						pic.colorSpace  = THREE.SRGBColorSpace;
						i.children[0].material.map = pic;
					}
				});
			});
			renderer.render(scene, camera);
		}

		animate();
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