import { Reactive } from "vue";
import fs from './fs'

interface POS_Like {
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
		get : (pos : Reactive<POS_Like>, element : HTMLElement) : void => {
			// @ts-ignore
			const p : POS_Like = element.$el !== undefined ? element.$el.getBoundingClientRect() : element.getBoundingClientRect();
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

	get = (element : HTMLElement) : POS_Like => {
		try {
			// @ts-ignore
			const p : POS_Like = element.$el !== undefined ? element.$el.getBoundingClientRect() : element.getBoundingClientRect();
			return p;
		} catch (error) {
			fs.write.log(error);
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

	oppo = (p1 : POS_Like, p2 : POS_Like) : number => {
		try {
			return p2.left - p1.left;
		} catch (error) {
			fs.write.log(error);
		}
		return 0;
	};

	adjacent = (p1 : POS_Like, p2 : POS_Like) : number => {
		try {
			return p1.top - p2.top;
		} catch (error) {
			fs.write.log(error);
		}
		return 0;
	};

	angle = (p1 : POS_Like, p2 : POS_Like) : number => {
		try {
			const adjacent = this.adjacent(p1, p2);
			const oppo = this.oppo(p1, p2);
			if (adjacent == 0) return this.isLeft(p1, p2) ? 270 : 90;
			else if (oppo == 0) return this.isHigh(p1, p2) ? 180 : 0;
			const angle = Math.atan2(oppo, adjacent) * (180 / Math.PI)
			return  angle > 0 ? angle : 360 + angle;
		} catch (error) {
			fs.write.log(error);
		}
		return 0;
	};

	compoute = Compoute

	isHigh = (p1 : POS_Like, p2 : POS_Like) : boolean => {
		try {
			return  p1.top < p2.top;
		} catch (error) {
			fs.write.log(error);
		}
		return false;
	}

	isLeft = (p1 : POS_Like, p2 : POS_Like) : boolean => {
		try {
			return  p1.left < p2.left;
		} catch (error) {
			fs.write.log(error);
		}
		return false;
	}

	isLeftorHigh = (p1 : POS_Like, p2 : POS_Like) : boolean => {
		return this.isLeft(p1, p2) || this.isHigh(p1, p2)
	}
};

class Compoute {
	attacker : POS_Like;
	defender : POS_Like;
	str : {
		x : string;
		y : string;
	};
	func : {
		x : Function;
		y : Function;
	};

	constructor (attacker : POS_Like, defender : POS_Like) {
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
export type { POS_Like };