import { gsap } from 'gsap';

import { POS } from '@/pages/server/post/network';

import Client_Card from './client_card';

class Gsap {
	timeline = (vars : gsap.TimelineVars = {}) : gsap.core.Timeline => {
		return gsap.timeline(vars);
	};

	getProperty = gsap.getProperty

	to = gsap.to

	attack = (
		a : { card : Client_Card, loc : Array<number> },
		d : { card ?: Client_Card, loc : Array<number> },
		size : { width : number; height : number; }
	) : gsap.core.Timeline => {
		const tl = this.timeline();
		const direct = {
			x : d.loc[0] > a.loc[0] ? -1 : 1,
			y : d.loc[1] > a.loc[1] ? -1 : 1
		};
		const y = a.loc[1] - d.loc[1];
		const x = a.loc[0] - d.loc[0] + size.width * direct.x;
		let time = 0;
		if (y === 0) {
			tl.to(a.card.three.rotation, {
				z : Math.PI / - 2,
				duration : 0.1,
			}, time);
			if (d.card)
				tl.to(d.card.three.rotation, {
					z : Math.PI / 2,
					duration : 0.1,
				}, time);
			time += 0.1;
		} else {
			tl.to(a.card.three.rotation, {
				z : Math.atan(- x / y),
				duration : 0.1,
			}, time);
			if (d.card)
				tl.to(d.card.three.rotation, {
					z : Math.atan(- x / y) + Math.PI * direct.y,
					duration : 0.1,
				}, time);
			time += 0.1;
		}
		let move : {
			x ?: string | number,
			y ?: string | number,
			z ?: string | number,
			duration : number
		} = {
			x : `+= ${20 * direct.x}`,
			z : '+= 100',
			duration : 0.2,
		};
		if (d.loc[1] !== a.loc[1])
			Object.assign(move, {
				y : `+= ${20 * direct.y}`
			});
		tl.to(a.card.three.position, move, time);
		time += 0.1;
		move = {
			x : d.loc[0] + size.width * direct.x,
			z : d.loc[2] + 1,
			duration : 0.2,
		};
		if (d.loc[1] !== a.loc[1])
			Object.assign(move, {
				y : d.loc[1] + ((size.height / 2) * direct.y)
			});
		tl.to(a.card.three.position, move, time);
		time += 0.2;
		if (d.card) {
			const move = {
				x : `+= ${40 * - direct.x}`,
				duration : 0.1,
			};
			if (d.loc[1] !== a.loc[1])
				Object.assign(move, {
					y : `+= ${40 * - direct.y}`
				});
			tl.to(d.card.three.position, move, time);
		}
		time += 0.1;
		tl.to(a.card.three.rotation, {
			z : 0,
			duration : 0.1,
		}, time);
		tl.to(a.card.three.position, {
			x : a.loc[0],
			y : a.loc[1],
			z : a.loc[2],
			duration : 0.2,
		}, time);
		time += 0.1;
		if (d.card) {
			tl.to(d.card.three.rotation, {
				z : y === 0 ? Math.PI : 0,
				duration : 0.1,
			}, time);
			time += 0.1;
			tl.to(d.card.three.position, {
				x : d.loc[0],
				y : d.loc[1],
				z : d.loc[2],
				duration : 0.1,
			}, time);
		}
		return tl;
	};

	opacity = (el : HTMLElement, to : number, complete : Function = () => {}) : gsap.core.Tween => {
		return gsap.to(el, {
			opacity: to,
			duration : 0.2,
			onComplete: () => { complete(); }
		});
	};

	pos = (el : HTMLImageElement, pos : number, tl : gsap.core.Timeline = this.timeline()) : gsap.core.Timeline => {
		tl.to(el, {
			rotationZ : (pos & POS.DEFENSE) > 0 ? -90 : 0,
			duration : 0.1,
		}, 0);
		return tl;
	}

	turn = (el : HTMLImageElement, pic : string | undefined, tl : gsap.core.Timeline = this.timeline()) : gsap.core.Timeline => {
		tl.set(el, {
			rotationY : 0
		})
		tl.to(el, {
			rotationY : 90,
			duration : 0.1,
			onComplete: () => {
				el.src = pic ?? '';
			}
		}, 0);
		tl.set(el, {
			rotationY : -90
		}, 0.125)
		tl.to(el, {
			rotationY : 0,
			duration : 0.1
		}, 0.125);
		return tl;
	}
};

export default new Gsap();