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
				height : 90,
				top : 0.6
			},
			offset : 0,
			gap : 8,
			color : '#9ed3ff',
			card : (src : string = '') : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				const child = document.createElement('img');
				child.src = src;
				child.style.width = `${three.create.size.width}px`;
				child.style.height = `${three.create.size.height}px`;
				dom.appendChild(child);
				dom.addEventListener('click', () => {
					
				});
				return new CSS.CSS3DObject(dom);
			},
			back : (srcs : Array<string> = []) : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				dom.style.width = `${three.create.size.width * 12}px`;
				for (const [v, src] of srcs.entries()) {
					const child = document.createElement('img');
					child.src = src;
					child.style.display = 'block';
					child.style.width = `${three.create.size.width * 12}px`;
					child.style.height = `${three.create.size.height * 4}px`;
					if (v === 0)
						child.style.transform = 'scaleY(-1)';
					dom.appendChild(child);
				}
				return new CSS.CSS3DObject(dom);
			},
			plaid : () : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				const child = document.createElement('div');
				child.style.width = `${three.create.size.height}px`;
				child.style.height = `${three.create.size.height}px`;
				child.style.border = `2px solid ${three.create.color}`;
				dom.appendChild(child);
				return new CSS.CSS3DObject(dom);
			},
			position : (target : CSS.CSS3DObject, x : number, y : number, z : number, card : boolean = false) => {
				if (x % 3 === 0 && x !== 0) {
					if (x === -3)
						target.position.set((three.create.size.height + three.create.gap) * x,
							(three.create.size.height + three.create.gap) * y
								+ (y >= 0 ? three.create.offset : -three.create.offset),
							z
						);
					else
						target.position.set((three.create.size.height + three.create.gap) * x,
							(three.create.size.height + three.create.gap) * y
								+ (y <= 0 ? -three.create.offset : three.create.offset),
							z
						);
				} else
					target.position.set((three.create.size.height + three.create.gap) * x, (three.create.size.height + three.create.gap) * y, 0);
				if (card && (y > 0 || (y === 0 && x === -3)))
					target.rotation.set(0, 0, Math.PI);
			}
		},
		add : {
			card : (x : number, y : number, z : number, pic : string | undefined = mainGame.get.textures(constant.str.files.textures.cover) as string | undefined) : void => {
				const card = three.create.card(pic);
				three.create.position(card, x, y, z * three.create.size.top);
				three.scene.add(card);
			},
			back : (pic : Array<string | undefined> = mainGame.get.textures(constant.str.files.textures.back) as Array<string>) : void => {
				const card = three.create.back(pic.filter(i => i !== undefined));
				three.create.position(card, 0, 0, 0 * three.create.size.top);
				three.scene.add(card);
			},
			plaid : (x : number, y : number) : void => {
				const dom = three.create.plaid();
				three.create.position(dom, x, y, 0);
    			three.scene.add(dom);
			}
			
		}
	}

	onMounted(() => {
		three.create.size.width = three.create.size.height / 1.45;
		three.create.offset = three.create.size.height / 1.5;
		three.renderer.setSize(window.innerWidth, window.innerHeight);
		three.renderer.domElement.style.position = 'fixed';
  		three.renderer.domElement.style.top = '0';
		three.camera.position.set(0, -200, 630);
		three.camera.lookAt(0, -30, 0);

		three.add.back();
		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++)
				if (y !== 0 || x % 2 !== 0)
    				three.add.plaid(x, y);

			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.back) as string | undefined);
			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.pic[0]) as string | undefined);

		const pos = [
			{ x : 3, y : -2 },
			{ x : -3, y : -2 },
			{ x : 0, y : 0 },
			{ x : -3, y : 2 },
			{ x : 3, y : 2 },
		];
		for (const [v, ct] of props.connect.deck_count.entries())
			if ([0, 1, 3, 4].includes(v))
				for (let z = 1; z <= ct; z++)
					three.add.card(pos[v].x, pos[v].y, z);

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