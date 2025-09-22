<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive } from 'vue';
	import * as THREE from 'three';

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

		const clock = new THREE.Clock();
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera();

		camera.position.set(0, 0, 200);
		camera.lookAt(0, 0, 0);

		const geometry = new THREE.PlaneGeometry(card_size.width, card_size.height);

		const texture = new THREE.TextureLoader();

		const cards = new THREE.AnimationObjectGroup();
		const pics = mainGame.get.pics();
		const ct = 10;
		const randoms = random(ct, 0, pics.length);
		for (let i = ct / -2; i < ct / 2; i++) {
			const front_map = texture.load(pics[randoms[i + ct / 2]]);
			front_map.colorSpace  = THREE.SRGBColorSpace;
			const front = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : front_map,
				side : THREE.FrontSide
			}));
			const back_map = texture.load(mainGame.get.textures(constant.str.files.textures.back));
			back_map.colorSpace = THREE.SRGBColorSpace;
			const back = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : back_map,
				side : THREE.BackSide
			}));
			const card = new THREE.Group();
			card.add(front);
			card.add(back);
			scene.add(card);
			if (i !== 0) {
				card.position.x += i * 100;
				card.position.y = window.innerHeight * (1 - Math.random() * 2);
			}
			card.position.z = -1200;

			cards.add(card);
		}

		renderer.render(scene, camera);
		renderer.outputEncoding = THREE.sRGBEncoding;
		const el = renderer.domElement;
		canvas.value!.appendChild(el);

		const ani = new THREE.AnimationClip('ani', 6, [
			new THREE.KeyframeTrack('.position[z]', [0, 6], [-1200, 200]),
			new THREE.KeyframeTrack('.rotation[y]', [0, 2, 4, 6], [0, Math.PI * 2, Math.PI * 4, Math.PI * 6]),
		]);

		const mixer = new THREE.AnimationMixer(cards);
		const action = mixer.clipAction(ani);
		action.play();

		const animate = () => {
			requestAnimationFrame(animate);
			const delta = clock.getDelta();
			mixer.update(delta);
			renderer.render(scene, camera);
		}
		
		mixer.addEventListener('loop', () => {
			const pics = mainGame.get.pics();
			(cards._objects as Array<any>).forEach((i) => {
				const pic = new THREE.TextureLoader().load(pics[Math.floor(Math.random() * pics.length)])
				pic.colorSpace  = THREE.SRGBColorSpace;
				i.children[0].material.map = pic;
				if (i.position.x !== 0 && i.position.y !== 0)
					i.position.y = window.innerHeight * (1 - Math.random() * 2);
			})
		});

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