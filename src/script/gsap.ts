import { gsap } from 'gsap';
import pos from './position';

class Gsap {
	timeline = (vars : gsap.TimelineVars = {}) : gsap.core.Timeline => {
		return gsap.timeline(vars);
	};

	to = gsap.to

	attack = (obj : {
		distance : number;
		attacker : HTMLElement;
		defender: HTMLElement;
		complete ?: Function;
		attacked_distance ?: number;
		angle : {
			attacker ?: number;
			defender ?: number;
		}
	}) : gsap.core.Timeline => {
		const attacker = obj.attacker;
		const defender = obj.defender;
		const distance = obj.distance;
		const complete = obj.complete;
		const attacker_angle = obj.angle.attacker;
		const defender_angle = obj.angle.defender;
		const attacked_distance = obj.attacked_distance ?? 300;
		const tl = this.timeline();
		const p1 = pos.get(attacker)
		const p2 = pos.get(defender)
		const angle = pos.angle(p1, p2);
		const radians = angle * Math.PI / 180;
		if (attacker_angle !== undefined)
			tl.set(attacker, {
				rotation : attacker_angle
			}, 0);
		if (defender_angle !== undefined)
			tl.set(defender, {
				rotation : defender_angle
			}, 0);
		tl.to(attacker, {
			rotation : angle,
			duration : 0.5
		}, 0.5);
		const distanceX = Math.abs(Math.cos(radians) * distance);
    	const distanceY = Math.abs(Math.sin(radians) * distance);
		const X = Math.abs(pos.oppo(p1, p2));
    	const Y = Math.abs(pos.adjacent(p1, p2));
		tl.to(attacker, {
			x : `${pos.isLeft(p1, p2) ? '-' : '+'}=${distanceX}`,
			y : `${pos.isHigh(p1, p2) ? '-' : '+'}=${distanceY}`,
			duration : 0.5
		}, 0.75);
		tl.to(attacker, {
			x : pos.isLeft(p1, p2) ? `+=${X + distanceX}` : `-=${X + distanceX}`,
			y : pos.isHigh(p1, p2) ? `+=${Y + distanceX}` : `-=${Y + distanceY}`,
			duration : 0.25,
			ease : 'power2.inOut'
		}, 1.25);
		tl.to(attacker, {
			rotation : `+=0`,
			duration : 0.5
		}, 1.5);
		const attackedRadians = Math.PI / 2 - radians;
		const attacked_distanceX = Math.abs(Math.cos(attackedRadians) * attacked_distance);
    	const attacked_distanceY = Math.abs(Math.sin(attackedRadians) * attacked_distance);
		tl.to(defender, {
			x : `${pos.isLeft(p2, p1) ? '-' : '+'}=${attacked_distanceX}`,
			y : `${pos.isHigh(p2, p1) ? '-' : '+'}=${attacked_distanceY}`,
			duration : 0.4,
			ease : 'power2.out',
			onComplete: () => { if (complete !== undefined) complete(); }
		}, 1.4);
		let rotation : string = (defender_angle && Math.abs(defender_angle) == 90) ? angle > 270 || (angle > 90 && angle <= 180) ? '-' : '+' : angle > 270 || (angle > 90 && angle <= 180) ? '+' : '-';
		tl.to(defender, {
			rotation : `${rotation}=${360 * 1}`,
			duration : 0.5,
		}, 1.4);

		return tl;
	};

	leave = (el : HTMLElement, complete : Function = () => {}) : gsap.core.Timeline => {
		const tl = this.timeline();
		tl.to(el, {
			x : '+=50vw',
			y : '-=50vh',
			duration : 0.5,
		});
		tl.to(el, {
			opacity: 0,
			duration : 0.3,
			onComplete: () => { complete(); }
		}, 0.2);
		return tl;
	};

	opacity = (el : HTMLElement, complete : Function = () => {}) : gsap.core.Timeline => {
		const tl = this.timeline();
		tl.to(el, {
			opacity: 0,
			duration : 0.5,
			onComplete: () => { complete(); }
		});
		return tl;
	};

	scale = (el : HTMLElement, complete : Function = () => {}) : gsap.core.Timeline => {
		const tl = this.timeline();
		tl.to(el, {
			scale: 0,
			duration: 0.5,
			onComplete: () => { complete(); }
		});
		return tl;
	};

	move_left = (array : Array<HTMLElement>, complete : Function = () => {}) : gsap.core.Timeline => {
		const tl = this.timeline();
		for (const [v, i] of array.entries()) {
			tl.to(i, {
				x : '-80vw',
				duration : 0.5,
				onComplete: () => {
					if (v === array.length - 1) complete();
				}
			}, 0.2 * v);
		}
		return tl;
	};

	from_left = (array : Array<HTMLElement>, complete : Function = () => {}) : gsap.core.Timeline => {
		const tl = this.timeline();
		for (const [v, i] of array.entries()) {
			tl.to(i, {
				x : '-=80vw',
				duration : 0.2,
				onComplete: () => { i.style.display = 'block'; }
			}, 0);
			tl.to(i, {
				x : '+=80vw',
				duration : 0.5,
				onComplete: () => {
					if (v === array.length - 1) complete();
				}
			}, 0.2 * (v + 1));
		}
		return tl;
	};

	turn = (el : HTMLImageElement, pic : string | undefined) => {
		const tl = this.timeline();
		tl.set(el, {
			rorationY : 0
		})
		tl.to(el, {
			rotationY : 90,
			duration : 0.4,
			onComplete: () => {
				el.src = pic ?? '';
			}
		});
		tl.to(el, {
			rotationY : 180,
			duration : 0.4
		});
	}

	rps = (el : HTMLImageElement, el_oppo : HTMLImageElement, complete : Function = () => {}) => {
		const tl = this.timeline();
		tl.to(el, {
			y : `-=${window.innerHeight * 1.5}`,
			duration : 0.9
		}, 0.1);
		tl.to(el_oppo, {
			y : `+=${window.innerHeight * 1.5 - 180}`,
			duration : 0.9
		}, 0.1);
		tl.call(() => {
			complete();
			gsap.to(el, { 
				y : `+=${window.innerHeight * 1.5}`, 
				duration : 0.9
			});
			gsap.to(el_oppo, {
				y : `-=${window.innerHeight * 1.5 - 180}`,
				duration : 0.9
			});
		});
	}
};

export default new Gsap();