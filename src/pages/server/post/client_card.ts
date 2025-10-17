import Card, { TYPE } from '../../../script/card';
import mainGame from '../../../script/game';
import constant from '../../../script/constant';
import { POS } from './network';
import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import gsap from '../../../script/gsap';

class Client_Card {
	three : CSS.CSS3DObject;
	code : number;
	alias : number;
	card ?: Card;
	pic ?: string;
	type : number;
	level : number;
	rank : number;
	link : number;
	attribute : number;
	race : number;
	atk : number;
	def : number;
	scale : number;

	constructor(three : CSS.CSS3DObject) {
		this.code = 0;
		this.alias = 0;
		this.card = undefined;
		this.pic = undefined;
		this.code = 0;
		this.alias = 0;
		this.type = 0;
		this.level = 0;
		this.rank = 0;
		this.link = 0;
		this.attribute = 0;
		this.race = 0;
		this.atk = 0;
		this.def = 0;
		this.scale = 0;
		this.three = three;
	};

	update = {
		code : async (code : number) : Promise<void> => {
			if (code === 0) {
				this.clear();
				return;
			}
			const card : Card = mainGame.get.card(code);
			if (card.pic === '')
				await mainGame.load.pic([code]);
			this.card = card;
			this.code = code;
			this.alias = card.alias;
			this.pic = card.pic;
			this.type = card.type;
			this.level = (card.is_xyz() || card.is_link()) ? 0 : card.level;
			this.rank = card.is_xyz() ? card.level : 0;
			this.link = card.is_link() ? card.level : 0;
			this.attribute = card.attribute;
			this.atk = card.atk;
			this.def = card.def;
			this.scale = card.scale;
		},
		alias : (code : number) : void => {
			this.alias = code;
		},
		type : (type : number) : void => {
			this.type = type;
		},
		level : (level : number) : void => {
			this.level = level;
		},
		rank : (rank : number) : void => {
			this.rank = rank;
		},
		attribute : (attribute : number) : void => {
			this.attribute = attribute;
		},
		race : (race : number) : void => {
			this.race = race;
		},
		link : (link : number) : void => {
			this.link = link;
		},
		atk : (atk : number) : void => {
			this.atk = atk;
		},
		def : (def : number) : void => {
			this.def = def;
		},
		scale : (scale : number) : void => {
			this.scale = scale;
		}
	};
	clear = () : void => {
		this.card = undefined;
		this.pic = undefined;
		this.code = 0;
		this.alias = 0;
		this.type = 0;
		this.level = 0;
		this.rank = 0;
		this.link = 0;
		this.attribute = 0;
		this.race = 0;
		this.atk = 0;
		this.def = 0;
		this.scale = 0;
	};
	is_xyz = () : boolean => {
		return this.rank !== undefined && this.rank > 0;
	};
	is_link = () : boolean => {
		return this.link !== undefined && this.link > 0;
	};
	is_tuner = () : boolean => {
		return this.type !== undefined && ((this.type & TYPE.TUNER) === TYPE.TUNER);
	}
	add = {
		xyz : (len : number) : void => {
			let el : HTMLElement = this.three.element.children[2].querySelector('.rank')!;
			el.style.display = 'flex';
			el.querySelector('span')!.innerHTML = this.rank.toString();
			el = this.three.element.children[2].querySelector('.overlay')!;
			el.style.display = 'flex';
			el.querySelector('span')!.innerHTML = len.toString();
		},
		link : () : void => {
			const el : HTMLElement = this.three.element.children[2].querySelector('.link')!;
			el.style.display = 'flex';
			el.querySelector('span')!.innerHTML = this.link.toString();
		},
		tuner : () : void => {
			const el : HTMLElement = this.three.element.children[2].querySelector('.tuner')!;
			el.style.display = 'flex';
			(this.three.element.children[2] as HTMLElement).style.color = 'lightgreen';
		},
		level : () : void => {
			const el : HTMLElement  = this.three.element.children[2].querySelector('.level')!;
			el.style.display = 'flex';
			el.querySelector('span')!.innerHTML = this.level.toString();
		},
		pendulum : () : void => {
			const el : HTMLElement  = this.three.element.children[2].querySelector('.scale')!;
			el.style.display = 'flex';
			el.querySelector('span')!.innerHTML = this.scale.toString();
		},
		atk : () : void => {
			this.three.element.children[1].innerHTML = this.is_link() ? this.atk.toString() : `${this.atk ?? 0}/${this.def ?? 0}`;
		}
	};

	show = {
		on : {
			info : () : void => {
				(this.three.element.children[2] as HTMLElement).style.opacity = '1';
			},
			atk : () : void => {
				(this.three.element.children[1] as HTMLElement).style.opacity = '1';
			}
		},
		off : {
			info : () : void => {
				(this.three.element.children[2] as HTMLElement).style.opacity = '0';
			},
			atk : () : void => {
				(this.three.element.children[1] as HTMLElement).style.opacity = '0';
			}
		}
	};

	change = {
		xyz : (len : number) : void => {
			const el : HTMLElement = this.three.element.children[2].querySelector('.overlay')!;
			if (el.style.display === 'flex')
				el.querySelector('span')!.innerHTML = len.toString();
		}
	};
	remove = () : void => {
		for (const el of Array.from(this.three.element.children[2].children) as Array<HTMLElement>) {
			el.style.display = 'none';
			el.querySelector('span')!.innerHTML = '';
		}
		(this.three.element.children[2] as HTMLElement).style.color = 'white';
	};

	pos = () : number => {
		const rotation = gsap.getProperty(this.three.element.children[0], "rotationZ") === 0;
		const pos = (this.three.element.children[0] as HTMLImageElement).src === mainGame.get.textures(constant.str.files.textures.cover) ?
			rotation ? POS.FACEDOWN_ATTACK : POS.FACEDOWN_DEFENSE : rotation ? POS.FACEUP_ATTACK : POS.FACEUP_DEFENSE;
		return pos;
	}
}

export default Client_Card;