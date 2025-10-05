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
		y : number,
		z ?: number
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
			[LOCATION.MZONE | 0 << 16, [
				{ x : -2, y : -1 },
				{ x : 2, y : 1 }
			]],
			[LOCATION.MZONE | 1 << 16, [
				{ x : -1, y : -1 },
				{ x : 1, y : 1 }
			]],
			[LOCATION.MZONE | 2 << 16, [
				{ x : 0, y : -1 },
				{ x : 0, y : 1 }
			]],
			[LOCATION.MZONE | 3 << 16, [
				{ x : 1, y : -1 },
				{ x : -1, y : 1 }
			]],
			[LOCATION.MZONE | 4 << 16, [
				{ x : 2, y : -1 },
				{ x : -2, y : 1 }
			]],
			[LOCATION.MZONE | 5 << 16, [
				{ x : -1, y : 0 },
				{ x : 1, y : 0 }
			]],
			[LOCATION.MZONE | 6 << 16, [
				{ x : 1, y : 0 },
				{ x : -1, y : 0 }
			]],
			[LOCATION.SZONE | 0 << 16, [
				{ x : -2, y : -2 },
				{ x : 2, y : 2 }
			]],
			[LOCATION.SZONE | 1 << 16, [
				{ x : -1, y : -2 },
				{ x : 1, y : 2 }
			]],
			[LOCATION.SZONE | 2 << 16, [
				{ x : 0, y : -2 },
				{ x : 0, y : 2 }
			]],
			[LOCATION.SZONE | 3 << 16, [
				{ x : 1, y : -2 },
				{ x : -1, y : 2 }
			]],
			[LOCATION.SZONE | 4 << 16, [
				{ x : 2, y : -2 },
				{ x : -2, y : 2 }
			]]
		]) as Map<number, Array<Axis>>,
		cards : {
			map : new Map([
				[LOCATION.HAND, [[], []]],
				[LOCATION.DECK, [[], []]],
				[LOCATION.EXTRA, [[], []]],
				[LOCATION.FZONE, [[], []]],
				[LOCATION.GRAVE, [[], []]],
				[LOCATION.REMOVED, [[], []]],
				[LOCATION.MZONE | 0 << 16, [[], []]],
				[LOCATION.MZONE | 1 << 16, [[], []]],
				[LOCATION.MZONE | 2 << 16, [[], []]],
				[LOCATION.MZONE | 3 << 16, [[], []]],
				[LOCATION.MZONE | 4 << 16, [[], []]],
				[LOCATION.MZONE | 5 << 16, [[], []]],
				[LOCATION.MZONE | 6 << 16, [[], []]],
				[LOCATION.SZONE | 0 << 16, [[], []]],
				[LOCATION.SZONE | 1 << 16, [[], []]],
				[LOCATION.SZONE | 2 << 16, [[], []]],
				[LOCATION.SZONE | 3 << 16, [[], []]],
				[LOCATION.SZONE | 4 << 16, [[], []]]
			]) as Map<number, Array<Array<CSS.CSS3DObject>>>,
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
				dom.style.opacity = '0';
				dom.addEventListener('click', async () => {
					//<--DEBUG//
					const card = three.add.card(0, LOCATION.DECK, three.cards.map.get(LOCATION.DECK)![0].length);
					await mainGame.sleep(200);
					three.create.sendto.hand(card, 0, LOCATION.DECK)
					//DEBUG-->//
				});
				return new CSS.CSS3DObject(dom);
			},
			back : (srcs : Array<string> = []) : CSS.CSS3DObject => {
				const dom = document.createElement('div');
				dom.style.width = `${three.create.size.width * 12}px`;
				dom.style.opacity = '0';
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
				field : (target : CSS.CSS3DObject, location : number | Axis, owner : number = -1, from : number = 0, seq : number | undefined = undefined) => {
					const axis : Axis = typeof location === 'number' ? three.axis.get(location)![owner] : location;
					let x : number = (three.create.size.height + three.create.gap) * axis.x;
					let y : number = axis.y;
					let z : number | undefined = axis.z;
					if (axis.x % 3 === 0 && axis.x !== 0) {
						if (typeof location === 'number')
							z = three.cards.map.get(location)![owner].length * three.create.size.top;
						if (axis.x === -3)
							y = (three.create.size.height + three.create.gap) * axis.y
								+ (axis.y >= 0 ? three.create.offset : -three.create.offset);
						else
							y = (three.create.size.height + three.create.gap) * axis.y
									+ (axis.y <= 0 ? -three.create.offset : three.create.offset);
					} else {
						y = (three.create.size.height + three.create.gap) * axis.y;
						if (typeof location === 'number')
							z = 0;
					}
					if (from > 0) {
						const group = three.cards.map.get(from)![owner];
						three.cards.map.get(from)![owner] = group.filter(i => i !== target);
					}
					if (typeof location === 'number' && owner >= 0)
						seq === undefined ? three.cards.map.get(location)![owner].push(target) : three.cards.map.get(location)![owner].splice(seq, 0, target);
					three.move(target, from, owner, x, y, z!);
					three.rotate(target, from, owner);
				},
				hand : (target : CSS.CSS3DObject, owner : number, from : number = 0) => {
					if (from > 0) {
						const group = three.cards.map.get(from)![owner];
						three.cards.map.get(from)![owner] = group.filter(i => i !== target);
					}
					three.cards.map.get(LOCATION.HAND)![owner].push(target);
					three.rotate(target, from, owner);
					three.sort(owner);
				}
			}
		},
		add : {
			card : (owner : number, location : number, seq : number = 0, pic : string | undefined = mainGame.get.textures(constant.str.files.textures.cover) as string | undefined) : CSS.CSS3DObject => {
				const card = three.create.card(pic);
				if (location === LOCATION.MZONE || location === LOCATION.SZONE)
					location |= seq << 16;
				three.cards.map.get(location)![owner].splice(seq, 0, card);
				location === LOCATION.HAND ? three.create.sendto.hand(card, owner)
					: three.create.sendto.field(card, location, owner, 0);
				three.scene.add(card);
				gsap.opacity(card.element, 1)
				return card;
			},
			back : (pic : Array<string | undefined> = mainGame.get.textures(constant.str.files.textures.back) as Array<string>) : void => {
				const back = three.create.back(pic.filter(i => i !== undefined));
				three.create.sendto.field(back, { x : 0, y : 0, z : 0 * three.create.size.top });
				gsap.opacity(back.element, 1)
				three.scene.add(back);
			},
			plaid : (x : number, y : number) : void => {
				const dom = three.create.plaid();
				three.create.sendto.field(dom, { x : x, y : y, z : 0 });
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
				three.sort(owner);
			}
		},
		sort : (owner : number) => {
			const width = three.create.size.width * three.cards.max_hand;
			const axis = three.axis.get(LOCATION.HAND)![owner] as Axis;
			const ct = three.cards.map.get(LOCATION.HAND)![owner].length;
			const tl = gsap.timeline();
			three.cards.map.get(LOCATION.HAND)![owner].forEach((card, v) => {
				tl.to(card.position, {
					x : (three.create.size.height + three.create.gap) * axis.x + Math.min(width / ct, three.create.size.width) * v,
					y : (three.create.size.height + three.create.gap * 2) * axis.y,
					z : v * 0.01,
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
			for (let z = 0; z < ct; z++)
				if (deck_axis[v] !== undefined)
					three.add.card(deck_axis[v].owner, deck_axis[v].loc, z);

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