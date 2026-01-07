import { gsap } from 'gsap';
import { POS } from '@/pages/server/post/network';

class Gsap {
	timeline = (vars : gsap.TimelineVars = {}) : gsap.core.Timeline => {
		return gsap.timeline(vars);
	};

	getProperty = gsap.getProperty

	to = gsap.to

	attack = () : gsap.core.Timeline => {
		const tl = this.timeline();

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