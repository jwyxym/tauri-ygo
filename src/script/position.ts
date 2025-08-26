import { Reactive } from "vue";
import fs from './fs'

interface posLike {
	bottom : number;
	height : number;
	left : number;
	right : number;
	top : number;
	width : number;
	x : number;
	y : number;
};

class Position {
	reactive = {
		get : (pos : Reactive<posLike>, element : HTMLElement) : void => {
			// @ts-ignore
			const p : posLike = element.$el.getBoundingClientRect();
			pos.bottom = p.bottom;
			pos.height = p.height;
			pos.left = p.left;
			pos.right = p.right;
			pos.top = p.top;
			pos.width = p.width;
			pos.x = p.x;
			pos.y = p.y;
		}
	}

	get = (element : HTMLElement) : posLike => {
		try {
			// @ts-ignore
			const p : posLike = element.$el.getBoundingClientRect();
			return p;
		} catch (error) {
			fs.write.log(error)
		}
		return {
			bottom : 0,
			height : 0,
			left : 0,
			right : 0,
			top : 0,
			width : 0,
			x : 0,
			y : 0
		};
	}

	oppo = (p1 : posLike, p2 : posLike) : number => {
		try {
			return p2.left - p1.right;
		} catch (error) {
			fs.write.log(error)
		}
		return 0;
	};

	adjacent = (p1 : posLike, p2 : posLike) : number => {
		try {
			return p1.top - p2.top;
		} catch (error) {
			fs.write.log(error)
		}
		return 0;
	};

	angle = (p1 : posLike, p2 : posLike) : number => {
		try {
			return  Math.atan(this.oppo(p1, p2) / this.adjacent(p1, p2)) * (180 / Math.PI);
		} catch (error) {
			fs.write.log(error)
		}
		return 0;
	};

	compoute = Compoute

	isHigh = (p1 : posLike, p2 : posLike) : boolean => {
		try {
			return  p1.top < p2.top;
		} catch (error) {
			fs.write.log(error)
		}
		return false;
	}

	isLeft = (p1 : posLike, p2 : posLike) : boolean => {
		try {
			return  p1.left < p2.left;
		} catch (error) {
			fs.write.log(error)
		}
		return false;
	}
};

class Compoute {
	attacker : posLike;
	defender : posLike;
	str : {
		x : string;
		y : string;
	};
	func : {
		x : Function;
		y : Function;
	};

	constructor (attacker : posLike, defender : posLike) {
		this.attacker = attacker;
		this.defender = defender;
		this.str = {
			x : new Position().oppo(attacker, defender) > 0 ? '+' : '-',
			y :  new Position().adjacent(attacker, defender) < 0 ? '+' : '-'
		};
		this.func = {
			x : new Position().oppo(attacker, defender) > 0 ? this.add : this.reduce,
			y :  new Position().adjacent(attacker, defender) < 0 ? this.add : this.reduce
		};
	};

	add = (a : number, b : number) : number => {
		return a + b;
	};

	reduce = (a : number, b : number) : number => {
		return a - b;
	};

	antonymy = (str : string) => {
		return str == '+' ? '-' : '+';
	}
}

export default new Position();
export type { posLike };