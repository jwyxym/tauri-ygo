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
	import Client_Card from './post/client_card';
	import gsap from '../../script/gsap';

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

	const hover = {
		on : (card : Client_Card) : void => {
			(card.three.element.children[0] as HTMLElement).style.transform = `translateY(-20px)`;
		},
		end : (card : Client_Card) : void => {
			(card.three.element.children[0] as HTMLElement).style.transform = `translateY(0)`;
		},
		select : [undefined, undefined] as Array<Client_Card | undefined>
	};

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
			[LOCATION.MZONE | (0 << 16), [
				{ x : -2, y : -1 },
				{ x : 2, y : 1 }
			]],
			[LOCATION.MZONE | (1 << 16), [
				{ x : -1, y : -1 },
				{ x : 1, y : 1 }
			]],
			[LOCATION.MZONE | (2 << 16), [
				{ x : 0, y : -1 },
				{ x : 0, y : 1 }
			]],
			[LOCATION.MZONE | (3 << 16), [
				{ x : 1, y : -1 },
				{ x : -1, y : 1 }
			]],
			[LOCATION.MZONE | (4 << 16), [
				{ x : 2, y : -1 },
				{ x : -2, y : 1 }
			]],
			[LOCATION.MZONE | (5 << 16), [
				{ x : -1, y : 0 },
				{ x : 1, y : 0 }
			]],
			[LOCATION.MZONE | (6 << 16), [
				{ x : 1, y : 0 },
				{ x : -1, y : 0 }
			]],
			[LOCATION.SZONE | (0 << 16), [
				{ x : -2, y : -2 },
				{ x : 2, y : 2 }
			]],
			[LOCATION.SZONE | (1 << 16), [
				{ x : -1, y : -2 },
				{ x : 1, y : 2 }
			]],
			[LOCATION.SZONE | (2 << 16), [
				{ x : 0, y : -2 },
				{ x : 0, y : 2 }
			]],
			[LOCATION.SZONE | (3 << 16), [
				{ x : 1, y : -2 },
				{ x : -1, y : 2 }
			]],
			[LOCATION.SZONE | (4 << 16), [
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
				[LOCATION.MZONE | (0 << 16), [[], []]],
				[LOCATION.MZONE | (1 << 16), [[], []]],
				[LOCATION.MZONE | (2 << 16), [[], []]],
				[LOCATION.MZONE | (3 << 16), [[], []]],
				[LOCATION.MZONE | (4 << 16), [[], []]],
				[LOCATION.MZONE | (5 << 16), [[], []]],
				[LOCATION.MZONE | (6 << 16), [[], []]],
				[LOCATION.SZONE | (0 << 16), [[], []]],
				[LOCATION.SZONE | (1 << 16), [[], []]],
				[LOCATION.SZONE | (2 << 16), [[], []]],
				[LOCATION.SZONE | (3 << 16), [[], []]],
				[LOCATION.SZONE | (4 << 16), [[], []]]
			]) as Map<number, Array<Array<Client_Card>>>,
			change : (target : Client_Card, owner : number, from : number, location : number, seq : number | undefined = undefined) => {
				if (from > 0) {
					const ct = three.cards.map.get(from)![owner].findIndex(i => i === target);
					three.cards.map.get(from)![owner].splice(ct, 1);
					if (ct < three.cards.map.get(from)![owner].length)
						three.sort(owner, from);
				}
				seq === undefined ? three.cards.map.get(location)![owner].push(target) : three.cards.map.get(location)![owner].splice(seq, 0, target);
			},
			location : (card : Client_Card, location : number, owner : number) : boolean => {
				return three.cards.map.get(location)![owner].includes(card);
			},
			hand : {
				max : 7
			}
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
			card : (src : string = '') : Client_Card => {
				const dom = document.createElement('div');
				dom.style.opacity = '0';
				const child = document.createElement('img');
				child.src = src;
				Object.assign(child.style, {
					width : `${three.create.size.width}px`,
					height : `${three.create.size.height}px`,
					transition : 'all 0.2s ease'
				});
				dom.appendChild(child);
				const atk = document.createElement('div');
				atk.innerText = '';
				Object.assign(atk.style, {
					backgroundColor : 'rgba(0, 0, 0, 0.5)',
					opacity : '0',
					position : 'absolute',
					bottom : '0',
					left : '-10px',
					width : `${three.create.size.height}px`,
					color : 'white',
					fontSize : '14px',
					fontFamily : 'atkdef',
					display : 'flex',
					justifyContent : 'center',
					transition : 'all 0.2s ease',
				});
				dom.appendChild(atk);
				const client_card = new Client_Card(new CSS.CSS3DObject(dom));
				dom.addEventListener('mouseover', hover.on.bind(null, client_card));
				dom.addEventListener('mouseout', hover.end.bind(null, client_card));
				return client_card;
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
			send : {
				to : (target : Client_Card, owner : number, location : number, from : number = 0, seq : number = 0) : void => {
					location === LOCATION.HAND ? three.create.send.hand(target, owner, from) : three.create.send.field(target, owner, location, from, seq);
				},
				back : (target : CSS.CSS3DObject, axis : Axis) : void => {
					let x : number = (three.create.size.height + three.create.gap) * axis.x;
					let y : number = axis.y;
					let z : number = axis.z!;
					if (axis.x % 3 === 0 && axis.x !== 0) {
						if (axis.x === -3)
							y = (three.create.size.height + three.create.gap) * axis.y
								+ (axis.y >= 0 ? three.create.offset : -three.create.offset);
						else
							y = (three.create.size.height + three.create.gap) * axis.y
									+ (axis.y <= 0 ? -three.create.offset : three.create.offset);
					} else {
						y = (three.create.size.height + three.create.gap) * axis.y;
						z = 0;
					}
					target.position.set(x, y, z);
				},
				field : (target : Client_Card, owner : number, location : number, from : number = 0, seq : number = 0) : void => {
					const axis : Axis = three.axis.get(location)![owner];
					let x : number = (three.create.size.height + three.create.gap) * axis.x;
					let y : number = axis.y;
					let z : number  = three.cards.map.get(location)![owner].length * three.create.size.top;
					if (axis.x % 3 === 0 && axis.x !== 0) {
						if (axis.x === -3)
							y = (three.create.size.height + three.create.gap) * axis.y
								+ (axis.y >= 0 ? three.create.offset : -three.create.offset);
						else
							y = (three.create.size.height + three.create.gap) * axis.y
									+ (axis.y <= 0 ? -three.create.offset : three.create.offset);
					} else {
						y = (three.create.size.height + three.create.gap) * axis.y;
						if (seq > 0)
							z -= seq * three.create.size.top;
					}
					three.cards.change(target, owner, from, location);
					three.move(target.three, from, owner, x, y, z!);
					three.rotate(target.three, from, owner);
					(target.three.element.children[1] as HTMLElement).style.opacity =
						(location & LOCATION.MZONE) === LOCATION.MZONE ? '1' : '0';
				},
				hand : (target : Client_Card, owner : number, from : number = 0) : void => {
					three.cards.change(target, owner, from, LOCATION.HAND);
					three.rotate(target.three, from, owner);
					three.sort(owner, LOCATION.HAND);
					(target.three.element.children[1] as HTMLElement).style.opacity = '0';
				}
			}
		},
		add : {
			card : (owner : number, location : number, seq : number = 0, pic : string | undefined = mainGame.get.textures(constant.str.files.textures.cover) as string | undefined) : Client_Card => {
				const card = three.create.card(pic);
				if (location === LOCATION.MZONE || location === LOCATION.SZONE)
					location |= seq << 16;
				three.create.send.to(card, owner, location, 0);
				three.scene.add(card.three);
				gsap.opacity(card.three.element, 1)
				return card;
			},
			back : (pic : Array<string | undefined> = mainGame.get.textures(constant.str.files.textures.back) as Array<string>) : void => {
				const back = three.create.back(pic.filter(i => i !== undefined));
				three.create.send.back(back, { x : 0, y : 0, z : 0 * three.create.size.top });
				gsap.opacity(back.element, 1)
				three.scene.add(back);
			},
			plaid : (x : number, y : number) : void => {
				const dom = three.create.plaid();
				three.create.send.back(dom, { x : x, y : y, z : 0 });
    			three.scene.add(dom);
			}
			
		},
		move : (target : CSS.CSS3DObject, from : number, owner : number, x : number, y : number, z : number) => {
			const move = () => {
				const tl = gsap.timeline();
				if (target.position.z < z) {
					tl.to(target.position, {
						z : z,
						duration : 0.05
					})
					tl.to(target.position, {
						x : x,
						y : y,
						duration : 0.15
					}, 0.05)
				} else {
					tl.to(target.position, {
						x : x,
						y : y,
						duration : 0.15
					})
					tl.to(target.position, {
						z : z,
						duration : 0.05
					}, 0.15)
				}
				tl.then(() => {
					tl.kill();
				});
			}
			!!from ? move() : target.position.set(x, y, z);
			if (from === LOCATION.HAND) {
				three.sort(owner, from);
			}
		},
		sort : (owner : number, location : number) => {
			const tl = gsap.timeline();
			if (location === LOCATION.HAND) {
				const width = three.create.size.width * three.cards.hand.max;
				const axis = three.axis.get(location)![owner] as Axis;
				const ct = three.cards.map.get(location)![owner].length;
				three.cards.map.get(location)![owner].forEach((card, v) => {
					const x = (three.create.size.height + three.create.gap) * axis.x + Math.min(width / ct, three.create.size.width) * v * (!!owner ? -1 : 1);
					const y = (three.create.size.height + three.create.gap * 2) * axis.y;
					const z = v * 0.02;
					if (card.three.position.x !== x || card.three.position.y !== y || card.three.position.z !== z)
						tl.to(card.three.position, {
							x : x,
							y : y,
							z : z,
							duration : 0.15
						}, 0);
					if (owner === 0 && card.pic && card.pic !== (card.three.element.children[0] as HTMLImageElement).src)
						gsap.turn(card.three.element.children[0] as HTMLImageElement, card.pic, tl);
				});
			} else {
				three.cards.map.get(location)![owner].forEach((card, v) => {
					const z = v * three.create.size.top;
					if (card.three.position.z !== z)
						tl.to(card.three.position, {
							z : z,
							duration : 0.05
						}, 0);
				});
			}
			tl.then(() => {
				tl.kill();
			});
		},
		rotate : (target : CSS.CSS3DObject, from : number, owner : number) => {
			if (owner === 1)
				!!from ? gsap.to(target.rotation, {
					z : Math.PI,
					duration : 0.2
				}) : target.rotation.set(0, 0, Math.PI);
		}
	}

	const duel = {
		cards : new Map([
			[LOCATION.HAND, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.HAND)![tp];
			}],
			[LOCATION.DECK, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.DECK)![tp];
			}],
			[LOCATION.EXTRA, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.EXTRA)![tp];
			}],
			[LOCATION.FZONE, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.FZONE)![tp];
			}],
			[LOCATION.GRAVE, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.GRAVE)![tp];
			}],
			[LOCATION.REMOVED, (tp : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.REMOVED)![tp];
			}],
			[LOCATION.MZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (let i = 0; i < 7; i ++) {
					const len = three.cards.map.get(LOCATION.MZONE)![tp].length;
					group.push(three.cards.map.get(LOCATION.MZONE | (i << 16))![tp][len - 1]);
				}
				return group.filter(i => i !== undefined);
			}],
			[LOCATION.OVERLAY, (tp : number, seq : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.MZONE | (seq << 16))![tp].slice(0, -1);
			}],
			[LOCATION.SZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (let i = 0; i < 5; i ++) {
					const len = three.cards.map.get(LOCATION.SZONE)![tp].length;
					group.push(three.cards.map.get(LOCATION.SZONE | (i << 16))![tp][len - 1]);
				}
				group.push(...duel.cards.get(LOCATION.FZONE)!(tp));
				return group.filter(i => i !== undefined);
			}],
			[LOCATION.PZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (const i of [0, 4]) {
					const len = three.cards.map.get(LOCATION.SZONE)![tp].length;
					group.push(three.cards.map.get(LOCATION.SZONE | (i << 16))![tp][len - 1]);
				}
				return group.filter(i => i !== undefined);
			}],
			[LOCATION.ONFIELD, (tp : number) : Array<Client_Card> => {
				return [...duel.cards.get(LOCATION.MZONE)!(tp), ...duel.cards.get(LOCATION.SZONE)!(tp)];
			}]
		]) as Map<number, Function>,
		draw : async (tp : number, ct : number) => {
			const len = three.cards.map.get(LOCATION.DECK)![tp].length - 1;
			for (let i = len; i > len - ct; i --) {
				if (len - ct < 0)
					break;
				const card = three.cards.map.get(LOCATION.DECK)![tp][i];
				three.create.send.to(card, tp, LOCATION.HAND, LOCATION.DECK);
				await mainGame.sleep(150);
			}
		}
	};

	onMounted(() => {
		emit('update:duel', duel);
		three.create.size.width = three.create.size.height / 1.45;
		three.create.offset = three.create.size.height / 1.5;
		three.renderer.setSize(window.innerWidth * 0.9, window.innerHeight);
		three.renderer.domElement.style.position = 'fixed';
  		three.renderer.domElement.style.top = '0';
		three.camera.position.set(0, -300, 630);
		three.camera.lookAt(0, -60, 0);

		three.add.back();
		for (let x = -3; x < 4; x++)
			for (let y = -2; y < 3; y++)
				if (y !== 0 || x % 2 !== 0)
    				three.add.plaid(x, y);

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
	const emit = defineEmits(['update:duel']);

</script>
<style scoped lang = 'scss'>
	.canvas {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>