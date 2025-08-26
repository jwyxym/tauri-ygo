import { gsap } from 'gsap';
import pos from './position';

interface gsapElement {
	element : HTMLElement;
	selector : string
}

class Gsap {
	timeline = (vars : gsap.TimelineVars | undefined = undefined) : gsap.core.Timeline => {
		return gsap.timeline(vars);
	};

	attack = (charge : number,  attacker : gsapElement, defender: gsapElement) : gsap.core.Timeline => {
		let tl = gsap.timeline({ repeat : -1, yoyo : true });
		const p1 = pos.get(attacker.element)
		const p2 = pos.get(defender.element)
		const angle = pos.angle(p1, p2);
		const compoute = new pos.compoute(p1, p2);
		if (pos.isHigh(p1, p2))
			tl.to(attacker.selector, {
				rotation : 180,
				duration: 0
			});
		tl.to(attacker.selector, {
			rotation : `${compoute.str.x}=${angle}`,
			x : `${compoute.antonymy(compoute.str.x)}=${30 * Math.tan(angle)}`,
			y : `${compoute.antonymy(compoute.str.y)}=${30}`,
			duration: 0.5
		}, 0.5);
		tl.to(attacker.selector, {
			x : `${compoute.str.x}=${compoute.func.x(pos.oppo(p1, p2), charge * Math.tan(angle))}`,
			y : `${compoute.str.y}=${compoute.func.y(pos.adjacent(p1, p2), charge)}`,
			duration: 0.25
		}, 1);
		tl.to(attacker.selector, {
			rotation : `+=0`,
			duration: 0.5
		}, 1.25);
		tl.to(defender.selector, {
			rotation : `${compoute.antonymy(compoute.str.x)}=${angle / 8}`,
			duration: 0.15
		}, 1.2);
		console.log(compoute.str.y)
		tl.to(defender.selector, {
			x : `${compoute.str.x}=30`,
			// y : `+=${charge / Math.tan(angle / 8)}`,
			y : `${compoute.antonymy(compoute.str.y)}=${charge / Math.tan(angle / 8)}`,
			duration: 0.15
		}, 1.25);
		return tl;
	};
}

export default new Gsap();
export type { gsapElement };