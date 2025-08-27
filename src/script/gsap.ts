import { Ref } from "vue";
import { gsap } from 'gsap';
import pos, { posLike } from './position';

interface gsapElement {
	element : HTMLElement;
	selector : string;
	angle ?: number;
};

class Gsap {
	timeline = (vars : gsap.TimelineVars) : gsap.core.Timeline => {
		return gsap.timeline(vars);
	};

	attack = (distance : number,  attacker : gsapElement, defender: gsapElement, complete : Function = () => {}, attackedDistance : number = 300) : gsap.core.Timeline => {
		const p1 = pos.get(attacker.element)
		const p2 = pos.get(defender.element)
		const angle = pos.angle(p1, p2);
		const radians = angle * Math.PI / 180;
		let tl = this.timeline({ repeat : -1, yoyo : true });
		if (attacker.angle !== undefined)
			tl.to(attacker.selector, {
				rotation : attacker.angle,
				duration : 0
			}, 0);
		tl.to(attacker.selector, {
			rotation : angle,
			duration : 0.5
		}, 0.5);
		const distanceX = Math.abs(Math.cos(radians) * distance);
    	const distanceY = Math.abs(Math.sin(radians) * distance);
		const X = Math.abs(pos.oppo(p1, p2));
    	const Y = Math.abs(pos.adjacent(p1, p2));
		tl.to(attacker.selector, {
			x : `${pos.isLeft(p1, p2) ? '-' : '+'}=${distanceX}`,
			y : `${pos.isHigh(p1, p2) ? '-' : '+'}=${distanceY}`,
			duration : 2
		}, 1);
		tl.to(attacker.selector, {
			x : pos.isLeft(p1, p2) ? `+=${X + distanceX}` : `-=${X - distanceX}`,
			y : pos.isHigh(p1, p2) ? `+=${Y - distanceX}` : `-=${Y + distanceY}`,
			duration : 0.25,
			ease : 'power2.inOut'
		}, 3);
		tl.to(attacker.selector, {
			rotation : `+=0`,
			duration : 0.5
		}, 3.25);
		console.log(angle)
		tl.to(defender.selector, {
			// rotation : pos.isLeft(p2, p1) ? `-=${Math.abs(270 - angle)}` : `-=${Math.abs(90 - angle)}`,
			rotation : `${angle > 270 || (angle > 90 && angle <= 180) ? '+' : '-'}=${Math.abs(90 - (angle > 270 ? Math.abs(360 - angle) : angle > 180 ? Math.abs(270 - angle) : angle > 90 ? Math.abs(180 - angle) : angle))}`,
			duration : 0.05
		}, 3.15);
		const attackedRadians = Math.PI / 2 - radians;
		const attackedDistanceX = Math.abs(Math.cos(attackedRadians) * attackedDistance);
    	const attackedDistanceY = Math.abs(Math.sin(attackedRadians) * attackedDistance);
		tl.to(defender.selector, {
			x : `${pos.isLeft(p2, p1) ? '-' : '+'}=${attackedDistanceX}`,
			y : `${pos.isHigh(p2, p1) ? '-' : '+'}=${attackedDistanceY}`,
			duration : 0.2,
			ease : 'power2.out',
			onComplete: () => { complete(); }
		}, 3.2);

		return tl;
	};
};

export default new Gsap();
export type { gsapElement };