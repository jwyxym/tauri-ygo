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
	import { LOCATION } from './post/network';
	import gsap from '../../script/gsap';
	import position from '../../script/position';

	interface Axis {
		x : number,
		y : number
	};

	interface Position {
		loc : number,
		owner : number
	};

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
		axis : new Map([
			[LOCATION.HAND, [
				{ x : -2, y : -3 },
				{ x : 2, y : 3 }
			]],
			[LOCATION.DECK, [
				{ x : 3, y : -2 },
				{ x : -3, y : 2 }
			]],
			[LOCATION.EXTRA, [
				{ x : -3, y : -2 },
				{ x : 3, y : 2 }
			]],
			[LOCATION.FZONE, [
				{ x : -3, y : -1 },
				{ x : 3, y : 1 }
			]],
			[LOCATION.GRAVE, [
				{ x : 3, y : -1 },
				{ x : -3, y : 1 }
			]],
			[LOCATION.REMOVED, [
				{ x : 3, y : 0 },
				{ x : -3, y : 0 }
			]],
			[LOCATION.MZONE, [
				[
					{ x : -2, y : -1 },
					{ x : -1, y : -1 },
					{ x : 0, y : -1 },
					{ x : 1, y : -1 },
					{ x : 2, y : -1 },
					{ x : -1, y : 0 },
					{ x : 1, y : 0 }
				],
				[
					{ x : 2, y : 1 },
					{ x : 1, y : 1 },
					{ x : 0, y : 1 },
					{ x : -1, y : 1 },
					{ x : -2, y : 1 },
					{ x : 1, y : 0 },
					{ x : -1, y : 0 }
				]
			]],
			[LOCATION.SZONE, [
				[
					{ x : -2, y : -2 },
					{ x : -1, y : -2 },
					{ x : 0, y : -2 },
					{ x : 1, y : -2 },
					{ x : 2, y : -2 },
				],
				[
					{ x : 2, y : 2 },
					{ x : 1, y : 2 },
					{ x : 0, y : 2 },
					{ x : -1, y : 2 },
					{ x : -2, y : 2 },
				]
			]],
		]),
		cards : {
			hand : [[], []] as Array<Array<CSS.CSS3DObject>>,
			max_hand : 7,
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
					//<--DEBUG//
					const axis : Axis = three.axis.get(LOCATION.HAND)![0] as Axis;
					three.add.card(axis.x, axis.y, 1, { loc : LOCATION.HAND, owner : 0});
					//DEBUG-->//
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
			sendto : {
				field : (target : CSS.CSS3DObject, x : number, y : number, z : number, owner : number = 0, from : number = 0) => {
					let to_x : number = (three.create.size.height + three.create.gap) * x;
					let to_y : number;
					let to_z : number;
					if (x % 3 === 0 && x !== 0) {
						to_z = z;
						if (x === -3)
							to_y = (three.create.size.height + three.create.gap) * y
								+ (y >= 0 ? three.create.offset : -three.create.offset);
						else
							to_y = (three.create.size.height + three.create.gap) * y
									+ (y <= 0 ? -three.create.offset : three.create.offset);
					} else {
						to_y = (three.create.size.height + three.create.gap) * y;
						to_z = 0;
					}
					three.move(target, from, owner, to_x, to_y, to_z);
					three.rotate(target, from, owner);
				},
				hand : (target : CSS.CSS3DObject, owner : number = 0, from : number = 0) => {
					three.cards.hand[owner].push(target);
					three.rotate(target, from, owner);
					three.sort(owner);
				}
			}
		},
		add : {
			card : (x : number, y : number, z : number, position : Position, pic : string | undefined = mainGame.get.textures(constant.str.files.textures.cover) as string | undefined) : void => {
				const card = three.create.card(pic);
				position.loc === LOCATION.HAND ? three.create.sendto.hand(card, position.owner)
					: three.create.sendto.field(card, x, y, z * three.create.size.top, position.owner);
				three.scene.add(card);
			},
			back : (pic : Array<string | undefined> = mainGame.get.textures(constant.str.files.textures.back) as Array<string>) : void => {
				const card = three.create.back(pic.filter(i => i !== undefined));
				three.create.sendto.field(card, 0, 0, 0 * three.create.size.top);
				three.scene.add(card);
			},
			plaid : (x : number, y : number) : void => {
				const dom = three.create.plaid();
				three.create.sendto.field(dom, x, y, 0);
    			three.scene.add(dom);
			}
			
		},
		move : (target : CSS.CSS3DObject, from : number, owner : number, x : number, y : number, z : number) => {
			from > 0 ? gsap.to(target.position, {
				x : x,
				y : y,
				z : z,
				duration : 0.2
			}) : target.position.set(x, y, z);
			if (from === LOCATION.HAND) {
				three.cards.hand[owner].splice(three.cards.hand[owner].findIndex(i => i === target), 1);
				three.sort(owner);
			}
		},
		sort : (owner : number) => {
			const width = three.create.size.width * three.cards.max_hand;
			const axis = three.axis.get(LOCATION.HAND)![owner] as Axis;
			const ct = three.cards.hand[owner].length;
			const tl = gsap.timeline();
			three.cards.hand[owner].forEach((card, v) => {
				tl.to(card.position, {
					x : (three.create.size.height + three.create.gap) * axis.x + Math.min(width / ct, three.create.size.width) * v,
					y : (three.create.size.height + three.create.gap * 2) * axis.y,
					duration : 0.2
				}, 0);
			})
		},
		rotate : (target : CSS.CSS3DObject, from : number, owner : number) => {
			if (owner === 1)
				from > 0 ? gsap.to(target.rotation, {
					z : Math.PI,
					duration : 0.2
				}) : target.rotation.set(0, 0, Math.PI);
		}
	}

	onMounted(() => {
		three.create.size.width = three.create.size.height / 1.45;
		three.create.offset = three.create.size.height / 1.5;
		three.renderer.setSize(window.innerWidth, window.innerHeight);
		three.renderer.domElement.style.position = 'fixed';
  		three.renderer.domElement.style.top = '0';
		three.camera.position.set(0, -300, 630);
		three.camera.lookAt(0, -60, 0);

		three.add.back();
		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++)
				if (y !== 0 || x % 2 !== 0)
    				three.add.plaid(x, y);

			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.back) as string | undefined);
			// gsap.turn(child, mainGame.get.textures(constant.str.files.textures.pic[0]) as string | undefined);

		const deck_axis : Array<Position | undefined> = [
			{ loc : LOCATION.DECK, owner : 0 },
			{ loc : LOCATION.EXTRA, owner : 0 },
			undefined,
			{ loc : LOCATION.DECK, owner : 1 },
			{ loc : LOCATION.EXTRA, owner : 1 }
		];
		for (const [v, ct] of props.connect.deck_count.entries())
			for (let z = 1; z <= ct; z++)
				if (deck_axis[v] !== undefined) {
					const axis : Axis = three.axis.get(deck_axis[v].loc)![deck_axis[v].owner] as Axis;
					three.add.card(axis.x, axis.y, z, deck_axis[v]);
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