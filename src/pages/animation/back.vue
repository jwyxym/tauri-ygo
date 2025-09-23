<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive, onUnmounted } from 'vue';
	import * as THREE from 'three';

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
				texture.colorSpace = THREE.SRGBColorSpace;
				return texture;
			},
			back : () => {
				const texture = three.texture.this.load(mainGame.get.textures(constant.str.files.textures.back));
				texture.colorSpace = THREE.SRGBColorSpace;
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

		three.camera.position.set(-50, 50, 200);
		three.camera.lookAt(0, 0, 0);

		const geometry = new THREE.PlaneGeometry(card_size.width, card_size.height);

		const cards = new THREE.AnimationObjectGroup();
		const pics = mainGame.get.pics();
		const ct = {
			x : 1,
			y : 1,
			z : 6
		}
		for (let z = 0; z < ct.z; z++) {
			const front_map = three.texture.front(pics[Math.floor(Math.random() * pics.length)]);
			const front = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : front_map,
				side : THREE.FrontSide,
				transparent: true,
				opacity : 0
			}));
			const back_map = three.texture.back();
			const back = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
				map : back_map,
				side : THREE.BackSide,
				transparent: true,
				opacity : 0
			}));
			const card = new THREE.Group();
			card.add(front);
			card.add(back);
			three.scene.add(card);
			card.position.x = 0;
			card.position.y = 0;
			card.position.z = z * -300;
			cards.add(card);
			gsap.to(card.position, {
				z : 200,
				duration : z,
				onComplete : () => {
					const pics = mainGame.get.pics();
					card.children[0].material.map = three.texture.front(pics[Math.floor(Math.random() * pics.length)])
					gsap.fromTo(card.position,{
						z : ct.z * -300
					}, {
						z : 200,
						duration : ct.z,
						repeat : -1
					});
					(card.children as Array<any>).forEach((el) => {
						const tl = gsap.timeline({
							repeat : -1
						})
						tl.fromTo(el.material, {
							opacity : 0
						}, {
							opacity : 1,
							duration : 1,
						});
						tl.to({}, {duration : ct.z - 1});
					});
				}
			});
			(card.children as Array<any>).forEach((el) => {
				gsap.to(el.material, {
					opacity : 1,
					duration : 1
				});
			});
		}

		three.render();
		three.renderer.outputEncoding = THREE.sRGBEncoding;
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