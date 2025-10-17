<template>
	<div class = 'canvas' ref = 'canvas'>
	</div>
</template>
<script setup lang = 'ts'>
	import { ref, onMounted, Ref, watch, Reactive, reactive, onUnmounted } from 'vue';
	import * as THREE from 'three';
	import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js'
	
	import mainGame from '../../script/game';
	import constant from '../../script/constant';
	import { LOCATION, POS } from './post/network';
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

	interface Card_From {
		location : number;
		seq : number;
		zone : number;
		pos ?: number;
	};

	const canvas : Ref<HTMLElement | null> = ref(null);

	const hover = {
		on : (e : MouseEvent) : void => {
			let v = three.cards.map.get(LOCATION.HAND)![0].findIndex(i => i.three.element.contains(e.target as HTMLElement));
			let card : Client_Card | undefined = three.cards.map.get(LOCATION.HAND)![0][v];
			if (card && hover.select !== card) {
				(card.three.element.children[0] as HTMLElement).style.transform = 'translateY(-20px)';
				card.three.position.z = v * 0.02 + 0.1;
				return
			}
			v = three.cards.map.get(LOCATION.HAND)![1].findIndex(i => i.three.element.contains(e.target as HTMLElement));
			card = three.cards.map.get(LOCATION.HAND)![1][v];
			if (card) {
				(card.three.element.children[0] as HTMLElement).style.transform = 'translateY(-20px)';
				card.three.position.z = v * 0.02 + 0.1;
				return
			}
		},
		end : (e : MouseEvent) : void => {
			let v = three.cards.map.get(LOCATION.HAND)![0].findIndex(i => i.three.element.contains(e.target as HTMLElement));
			let card : Client_Card | undefined = three.cards.map.get(LOCATION.HAND)![0][v];
			if (card && hover.select !== card) {
				(card.three.element.children[0] as HTMLElement).style.transform = 'translateY(0)';
				card.three.position.z = v * 0.02;
				return
			}
			v = three.cards.map.get(LOCATION.HAND)![1].findIndex(i => i.three.element.contains(e.target as HTMLElement));
			card = three.cards.map.get(LOCATION.HAND)![1][v];
			if (card) {
				(card.three.element.children[0] as HTMLElement).style.transform = 'translateY(0)';
				card.three.position.z = v * 0.02;
				return
			}
		},
		click : (e : MouseEvent) : void => {
			let card : Client_Card | undefined;
			if (hover.select !== undefined) {
				const v = three.cards.map.get(LOCATION.HAND)![0].findIndex(i => i === hover.select);
				(hover.select.three.element.children[0] as HTMLElement).style.transform = 'translateY(0)';
				hover.select.three.position.z = v * 0.02;
			}
			card = three.cards.map.get(LOCATION.HAND)![0].find(i => i.three.element.contains(e.target as HTMLElement));
			hover.select = card && hover.select !== card ? card : undefined;
		},
		select : undefined as Client_Card | undefined
	};

	const three = {
		renderer : new CSS.CSS3DRenderer(),
		scene : new THREE.Scene(),
		camera : new THREE.PerspectiveCamera(),
		src : {
			unknown : mainGame.get.textures(constant.str.files.textures.unknown) as string | undefined ?? '',
			cover : mainGame.get.textures(constant.str.files.textures.cover) as string | undefined ?? ''
		},
		resize : () => {
			three.renderer.setSize(window.innerWidth, window.innerHeight);
		},
		render : () => {
			three.renderer.render(three.scene, three.camera);
		},
		axis : {
			map : new Map([
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
			computed : (owner : number, location : number, seq : number) : Array<number> => {
				const axis : Axis = three.axis.map.get(location)![owner];
				const x : number = (three.create.size.height + three.create.gap) * axis.x;
				let y : number;
				const z : number  = seq * three.create.size.top;
				if (axis.x % 3 === 0 && axis.x !== 0) {
					if (axis.x === -3)
						y = (three.create.size.height + three.create.gap) * axis.y
							+ (axis.y >= 0 ? three.create.offset : -three.create.offset);
					else
						y = (three.create.size.height + three.create.gap) * axis.y
							+ (axis.y <= 0 ? -three.create.offset : three.create.offset);
				} else {
					y = (three.create.size.height + three.create.gap) * axis.y;
				}
				return [x, y, z];
			}
		},
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
			change : (target : Client_Card, owner : number, from : number, location : number, seq : number | undefined) : number => {
				let result = 0;
				if (from > 0) {
					const ct = three.cards.map.get(from)![owner].findIndex(i => i === target);
					three.cards.map.get(from)![owner].splice(ct, 1);
					if (ct > 0 && (from & LOCATION.MZONE) === LOCATION.MZONE)
						result = ct;
					if (ct < three.cards.map.get(from)![owner].length)
						three.sort(owner, from);
				}
				seq === undefined ? three.cards.map.get(location)![owner].push(target) : three.cards.map.get(location)![owner].splice(seq, 0, target);
				return result;
			},
			location : (card : Client_Card | HTMLElement, location : number, owner : number = 2) : boolean => {
				if (card instanceof Client_Card)
					return three.cards.map.get(location)![owner].includes(card);
				else return three.cards.map.get(location)![owner].findIndex(i => i.three.element.contains(card)) > -1;
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
			card : (src : string) : Client_Card => {
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
					backgroundColor : 'rgba(0, 0, 0, 0.3)',
					opacity : '0',
					position : 'absolute',
					bottom : '0',
					left : `-${(three.create.size.height - three.create.size.width) / 2}px`,
					width : `${three.create.size.height}px`,
					color : 'white',
					textShadow : '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
					fontSize : '14px',
					fontFamily : 'atkdef',
					display : 'flex',
					justifyContent : 'center',
					transition : 'all 0.2s ease',
				});
				dom.appendChild(atk);
				const info = document.createElement('div');
				Object.assign(info.style, {
					opacity : '0',
					position : 'absolute',
					bottom : '20px',
					left : '-10px',
					height : '16px',
					width : `${three.create.size.height}px`,
					color : 'white',
					textShadow : '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
					fontSize : '14px',
					display : 'flex',
					gap : '2px',
					alignItems: 'center',
					transition : 'all 0.2s ease',
				});
				for (const [key, src] of Object.entries(constant.str.files.textures.card_info)) {
					const div = document.createElement('div');
					div.classList.add(key);
					Object.assign(div.style, {
						height : '100%',
						display : 'none'
					});
					const img = document.createElement('img');
					img.src = mainGame.get.textures(src) as string | undefined ?? '';
					img.style.height = '100%';
					div.appendChild(img);
					const span = document.createElement('span');
					span.innerText = '';
					if (key === 'tuner')
						span.style.display = 'none';
					else if (key === 'scale') {
						div.style.margin = `0 ${three.create.size.height / 2 - 16}px`;
					}
					div.appendChild(span);
					info.appendChild(div);
				}
				dom.appendChild(info);
				const client_card = new Client_Card(new CSS.CSS3DObject(dom));
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
				to : (target : Client_Card, owner : number, location : number, from : number = 0, seq : number = 0, pos : number = POS.NONE) : void => {
					location === LOCATION.HAND ? three.create.send.hand(target, owner, from) : three.create.send.field(target, owner, location, from, seq, pos);
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
				field : (target : Client_Card, owner : number, location : number, from : number, seq : number, pos : number = POS.NONE) : void => {
					const [x, y, z] = three.axis.computed(owner, location, seq);
					const ct = three.cards.change(target, owner, from, location, seq);
					three.move(target.three, from, owner, x, y, z!);
					three.rotate(target, from, owner, pos);
					if (ct > 0)
						three.cards.map.get(from)![owner][0].change.xyz(three.cards.map.get(from)![owner].length - 1);
					if ((location & LOCATION.MZONE) === LOCATION.MZONE && seq >= three.cards.map.get(location)![owner].length - 1) {
						if ((from & LOCATION.MZONE) === 0)
							target.remove();
						if (target.is_link())
							target.add.link();
						else if (target.is_xyz())
							target.add.xyz(three.cards.map.get(location)![owner].length - 1);
						else {
							if (target.is_tuner())
								target.add.tuner();
							target.add.level();
						}
						target.add.atk();
						target.show.on.info();
						target.show.on.atk();
						three.cards.map.get(location)![owner].slice(0, -1).forEach(card => {
							card.show.off.info();
							card.show.off.atk();
							three.rotate(card, location, owner, (pos & POS.ATTACK) > 0 ? POS.FACEUP_DEFENSE : POS.FACEUP_ATTACK);
						});
					} else if ((location & LOCATION.MZONE) === LOCATION.MZONE) {
						if ((from & LOCATION.MZONE) === LOCATION.MZONE)
							target.remove();
						const len = three.cards.map.get(location)![owner].length - 1;
						three.cards.map.get(location)![owner][len].change.xyz(len);
					} else if ((location & LOCATION.PZONE) === LOCATION.PZONE) {
						if ((from & LOCATION.MZONE) === LOCATION.MZONE) {
							target.show.off.atk();
							target.show.off.info();
							target.remove();
						}
						target.add.pendulum();
						target.show.on.info();
					} else {
						target.show.off.info();
						target.show.off.atk();
					}
					three.sort(owner, from);
					three.sort(owner, location);
				},
				hand : (target : Client_Card, owner : number, from : number = 0) : void => {
					const ct = three.cards.change(target, owner, from, LOCATION.HAND, undefined);
					three.rotate(target, from, owner, POS.FACEUP_ATTACK);
					three.sort(owner, LOCATION.HAND);
					target.show.off.info();
					target.show.off.atk();
					if (ct > 0)
						three.cards.map.get(from)![owner][0].change.xyz(three.cards.map.get(from)![owner].length - 1);
				}
			}
		},
		add : {
			card : (owner : number, location : number, seq : number = 0, pic : string | undefined = undefined) : Client_Card => {
				const card = three.create.card(pic ?? three.src.cover ?? three.src.unknown);
				if (location === LOCATION.MZONE || location === LOCATION.SZONE)
					location |= seq << 16;
				three.create.send.to(card, owner, location, 0, three.cards.map.get(location)![owner].length);
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
		sort : (owner : number, location : number, animation : boolean = false) : number => {
			if (location === 0)
				return 0;
			const tl = gsap.timeline();
			let result = 0;
			if (location === LOCATION.HAND) {
				const width = three.create.size.width * three.cards.hand.max;
				const axis = three.axis.map.get(location)![owner] as Axis;
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
				});
				result += 150;
			} else if (location === LOCATION.DECK && animation) {
				const len = three.cards.map.get(location)![owner].length - 1
				if (len > 0) {
					const ct = Math.max(Math.floor(len / -2), -4);
					for (let v = 0; v < 4; v ++) {
						const card = three.cards.map.get(location)![owner][len];
						tl.to(card.three.position, {
							x : `${!!owner ? '+' : '-'}=${three.create.size.width}px`,
							duration : 0.05
						}, 0 + v * 0.2);
						const z = Math.floor(len / 2) * three.create.size.top;
						tl.to(card.three.position, {
							z : z,
							duration : 0.05
						}, 0.05 + v * 0.2);
						tl.to(card.three.position, {
							x : `${!!owner ? '-' : '+'}=${three.create.size.width}px`,
							duration : 0.05
						}, 0.1 + v * 0.2);
						tl.to(card.three.position, {
							z : len * three.create.size.top,
							duration : 0.05
						}, 0.15 + v * 0.2);
					}
					result += ct * 200;
				}
			} else {
				three.cards.map.get(location)![owner].forEach((card, v) => {
					const z = v * three.create.size.top;
					if (card.three.position.z !== z)
						tl.to(card.three.position, {
							z : z,
							duration : 0.05
						}, 0);
				});
				result += 50;
			}
			tl.then(() => {
				tl.kill();
			});
			return result;
		},
		rotate : (target : Client_Card, from : number, owner : number, pos : number = POS.NONE) => {
			const move = () => {
				const tl = gsap.timeline();
				if (owner === 1)
					tl.to(target.three.rotation, {
						z : Math.PI,
						duration : 0.2
					})
				const pic = target.pic ?? three.src.unknown;
				switch (pos) {
					case POS.FACEDOWN_ATTACK:
						if ((target.three.element.children[0] as HTMLImageElement).src !== three.src.cover)
							gsap.turn(target.three.element.children[0] as HTMLImageElement, three.src.cover, tl);
						break;
					case POS.FACEDOWN_DEFENSE:
						if ((target.three.element.children[0] as HTMLImageElement).src !== three.src.cover)
							gsap.turn(target.three.element.children[0] as HTMLImageElement, three.src.cover, tl);
						gsap.pos(target.three.element.children[0] as HTMLImageElement, pos, tl);
						break;
					case POS.FACEUP_ATTACK:
						if ((target.three.element.children[0] as HTMLImageElement).src !== pic)
							gsap.turn(target.three.element.children[0] as HTMLImageElement, pic, tl);
						break;
					case POS.FACEUP_DEFENSE:
						if ((target.three.element.children[0] as HTMLImageElement).src !== pic)
							gsap.turn(target.three.element.children[0] as HTMLImageElement, pic, tl);
						gsap.pos(target.three.element.children[0] as HTMLImageElement, pos, tl);
						break;
				}
				tl.then(() => {
					tl.kill();
				});
			};
			const set = () => {
				if (owner === 1)
					target.three.rotation.set(0, 0, Math.PI);
				const el = target.three.element.children[0] as HTMLImageElement;
				switch (pos) {
					case POS.FACEDOWN_ATTACK:
						el.src = three.src.cover;
						break;
					case POS.FACEDOWN_DEFENSE:
						el.src = three.src.cover;
						break;
					case POS.FACEUP_ATTACK:
						el.src = target.pic ?? three.src.unknown;
						break;
					case POS.FACEUP_DEFENSE:
						el.src = target.pic ?? three.src.unknown;
						break;
				}
			};
			!!from ? move() : set();
		}
	}

	const duel = {
		cards : new Map([
			[LOCATION.HAND, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.HAND)![0], ...three.cards.map.get(LOCATION.HAND)![1]];
				return three.cards.map.get(LOCATION.HAND)![tp];
			}],
			[LOCATION.DECK, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.DECK)![0], ...three.cards.map.get(LOCATION.DECK)![1]];
				return three.cards.map.get(LOCATION.DECK)![tp];
			}],
			[LOCATION.EXTRA, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.EXTRA)![0], ...three.cards.map.get(LOCATION.EXTRA)![1]];
				return three.cards.map.get(LOCATION.EXTRA)![tp];
			}],
			[LOCATION.FZONE, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.FZONE)![0], ...three.cards.map.get(LOCATION.FZONE)![1]];
				return three.cards.map.get(LOCATION.FZONE)![tp];
			}],
			[LOCATION.GRAVE, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.GRAVE)![0], ...three.cards.map.get(LOCATION.GRAVE)![1]];
				return three.cards.map.get(LOCATION.GRAVE)![tp];
			}],
			[LOCATION.REMOVED, (tp : number) : Array<Client_Card> => {
				if (tp === 2)
					return [...three.cards.map.get(LOCATION.REMOVED)![0], ...three.cards.map.get(LOCATION.REMOVED)![1]];
				return three.cards.map.get(LOCATION.REMOVED)![tp];
			}],
			[LOCATION.MZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (const p of tp === 2 ? [0, 1] : [tp])
					for (let i = 0; i < 7; i ++) {
						const len = three.cards.map.get(LOCATION.MZONE)![tp].length;
						group.push(three.cards.map.get(LOCATION.MZONE | (i << 16))![p][len - 1]);
					}
				return group.filter(i => i !== undefined);
			}],
			[LOCATION.OVERLAY, (tp : number, seq : number) : Array<Client_Card> => {
				return three.cards.map.get(LOCATION.MZONE | (seq << 16))![tp].slice(0, -1);
			}],
			[LOCATION.SZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (const p of tp === 2 ? [0, 1] : [tp])
					for (let i = 0; i < 5; i ++) {
						const len = three.cards.map.get(LOCATION.SZONE)![tp].length;
						group.push(three.cards.map.get(LOCATION.SZONE | (i << 16))![p][len - 1]);
					}
				group.push(...duel.cards.get(LOCATION.FZONE)!(tp));
				return group.filter(i => i !== undefined);
			}],
			[LOCATION.PZONE, (tp : number) : Array<Client_Card> => {
				const group : Array<Client_Card> = [];
				for (const p of tp === 2 ? [0, 1] : [tp])
					for (const i of [0, 4]) {
						const len = three.cards.map.get(LOCATION.SZONE)![p].length;
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
		},
		to : {
			mzone : async (tp : number, from_to : Array<Card_From> | Card_From, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					const loc = LOCATION.MZONE | (i.zone << 16);
					card.update.code(359563)
					three.create.send.to(card, to_tp, loc, i.location, three.cards.map.get(loc)![tp].length, i.pos);
					await mainGame.sleep(150);
				}
			},
			szone : async (tp : number, from_to : Array<Card_From> | Card_From, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					const loc = LOCATION.SZONE | (i.zone << 16);
					three.create.send.to(card, to_tp, loc, i.location, three.cards.map.get(loc)![tp].length, i.pos);
					await mainGame.sleep(150);
				}
			},
			fzone : async (tp : number, i : Card_From, to_tp : number = tp) => {
				const card = three.cards.map.get(i.location)![tp][i.seq];
				three.create.send.to(card, to_tp, LOCATION.FZONE, i.location, three.cards.map.get(LOCATION.FZONE)![tp].length, (i.pos ?? 0 & POS.FACEDOWN) > 0 ? POS.FACEDOWN_ATTACK : POS.FACEUP_ATTACK);
				await mainGame.sleep(150);
			},
			grave : async (tp : number, from_to : Array<Card_From> | Card_From, seq : number, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					three.create.send.to(card, to_tp, LOCATION.GRAVE, i.location, seq, POS.FACEUP_ATTACK);
					await mainGame.sleep(150);
				}
			},
			pzone : async (tp : number, from_to : Array<Card_From> | Card_From, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					const loc = LOCATION.PZONE | (i.zone << 16)
					three.create.send.to(card, to_tp, loc, i.location, three.cards.map.get(loc)![tp].length, POS.FACEUP_ATTACK);
					await mainGame.sleep(150);
				}
			},
			deck : async (tp : number, from_to : Array<Card_From> | Card_From, seq : number, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					three.create.send.to(card, to_tp, LOCATION.DECK, i.location, seq, POS.FACEDOWN_ATTACK);
					await mainGame.sleep(150);
				}
			},
			extra : async (tp : number, from_to : Array<Card_From> | Card_From, seq : number, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					three.create.send.to(card, to_tp, LOCATION.DECK, i.location, seq, (i.pos ?? POS.FACEDOWN & POS.FACEDOWN) > 0 ? POS.FACEDOWN_ATTACK : POS.FACEUP_ATTACK);
					await mainGame.sleep(150);
				}
			},
			overlay : async (tp : number, from_to : Array<Card_From> | Card_From, to_tp : number = tp) => {
				for (const i of 'length' in from_to ? from_to as Array<Card_From>  : [from_to as Card_From]) {
					const card = three.cards.map.get(i.location)![tp][i.seq];
					const loc = LOCATION.MZONE | (i.zone << 16)
					card.update.code(483)
					const len = three.cards.map.get(loc)![tp].length - 1;
					three.create.send.to(card, to_tp, loc, i.location, len, (three.cards.map.get(loc)![tp][len].pos() & POS.ATTACK) > 0 ? POS.FACEUP_DEFENSE : POS.FACEUP_ATTACK);
					await mainGame.sleep(150);
				}
			},
		},
		sort : {
			deck : async (tp : number) : Promise<void> => {
				const ct = three.sort(tp, LOCATION.DECK, true);
				await mainGame.sleep(ct);
			}
		}
	};

	onMounted(async () => {
		emit('update:duel', duel);
		three.axis.map.set(LOCATION.PZONE | (0 << 16), three.axis.map.get(LOCATION.SZONE | (0 << 16))!);
		three.axis.map.set(LOCATION.PZONE | (1 << 16), three.axis.map.get(LOCATION.SZONE | (4 << 16))!);
		three.cards.map.set(LOCATION.PZONE | (0 << 16), three.cards.map.get(LOCATION.SZONE | (0 << 16))!);
		three.cards.map.set(LOCATION.PZONE | (1 << 16), three.cards.map.get(LOCATION.SZONE | (4 << 16))!);
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
		const animate = () => {
			requestAnimationFrame(animate);
			three.render();
		}

		animate();

		window.addEventListener('resize', three.resize);
		document.addEventListener('click', hover.click);
		document.addEventListener('mouseout', hover.end);
		document.addEventListener('mouseover', hover.on);
	})

	onUnmounted(() => {
		window.removeEventListener('resize', three.resize);
		document.removeEventListener('click', hover.click);
		document.removeEventListener('mouseout', hover.end);
		document.removeEventListener('mouseover', hover.on);
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