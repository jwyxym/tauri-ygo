import Card, { TYPE } from '../../../script/card';
import mainGame from '../../../script/game';
import * as CONSTANT from '../../../script/constant';
import { COMMAND, EDESC, POS } from './network';
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
	size : {
		width : number;
		height : number;
	}

	constructor (src : string, size : {
		width : number; height : number;
	}, hover : {
		on : Function; end : Function; click : Function;
	}) {
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
		this.size = size;
		this.three = this.init(src, hover);
	};

	init = (src : string, hover : {
		on : Function; end : Function; click : Function;
	}) : CSS.CSS3DObject => {
		const size = this.size;
		const dom = document.createElement('div');
		dom.style.opacity = '0';
		const child = document.createElement('img');
		child.src = src;
		Object.assign(child.style, {
			width : `${size.width}px`,
			height : `${size.height}px`,
			transition : 'all 0.2s ease'
		});
		child.addEventListener('mouseenter', hover.on.bind(null, this));
		child.addEventListener('mouseout', hover.end.bind(null, this));
		child.addEventListener('click', hover.click.bind(null, this));
		dom.appendChild(child);
		const atk = document.createElement('div');
		atk.innerText = '';
		Object.assign(atk.style, {
			backgroundColor : 'rgba(0, 0, 0, 0.3)',
			opacity : '0',
			position : 'absolute',
			bottom : '0',
			left : `-${(size.height - size.width) / 2}px`,
			width : `${size.height}px`,
			color : 'white',
			textShadow : '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
			fontSize : '14px',
			fontFamily : 'AtkDef',
			display : 'flex',
			justifyContent : 'center',
			transition : 'all 0.2s ease',
			userSelect: 'none'
		});
		dom.appendChild(atk);
		const info = document.createElement('div');
		Object.assign(info.style, {
			opacity : '0',
			position : 'absolute',
			bottom : '20px',
			left : '-10px',
			height : '16px',
			width : `${size.height}px`,
			color : 'white',
			textShadow : '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
			fontSize : '14px',
			display : 'flex',
			gap : '2px',
			alignItems: 'center',
			transition : 'all 0.2s ease',
			userSelect: 'none'
		});
		for (const [key, src] of [
			['link', CONSTANT.FILES.TEXTURE_TYPE_LINK],
			['rank', CONSTANT.FILES.TEXTURE_TYPE_RANK],
			['overlay', CONSTANT.FILES.TEXTURE_TYPE_OVERLAY],
			['scale', CONSTANT.FILES.TEXTURE_TYPE_SCALE],
			['tuner', CONSTANT.FILES.TEXTURE_TYPE_TUNER],
			['level', CONSTANT.FILES.TEXTURE_TYPE_LV],
		]) {
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
				div.style.margin = `0 ${size.height / 2 - 16}px`;
			}
			div.appendChild(span);
			info.appendChild(div);
		}
		dom.appendChild(info);
		const btn = document.createElement('div');
		Object.assign(btn.style, {
			opacity : '1',
			height : '48px',
			minWidth : '0px',
			display : 'none',
			gap : '2px',
			justifyContent: 'center',
			position : 'absolute',
			top : '0px',
			left : '50%',
			transform: 'translateX(-50%)',
			transition : 'all 0.2s ease'
		});
		for (const i of [
			['activate', CONSTANT.FILES.TEXTURE_BTN_ACTIVATE],
			['attack', CONSTANT.FILES.TEXTURE_BTN_ATTACK],
			['mset', CONSTANT.FILES.TEXTURE_BTN_MSET],
			['sset', CONSTANT.FILES.TEXTURE_BTN_SSET],
			['pos_attack', CONSTANT.FILES.TEXTURE_BTN_POS_ATTACK],
			['pos_defence', CONSTANT.FILES.TEXTURE_BTN_POS_DEFENCE],
			['summon', CONSTANT.FILES.TEXTURE_BTN_SUMMON],
			['psummon', CONSTANT.FILES.TEXTURE_BTN_PSUMMON],
			['spsummon', CONSTANT.FILES.TEXTURE_BTN_SPSUMMON],
			['scale', CONSTANT.FILES.TEXTURE_BTN_SCALE],
		]) {
			const [key, src] = i as [string, Array<string>];
			const img = document.createElement('img');
			img.classList.add(key);
			img.classList.add('btn');
			Object.assign(img.style, {
				height : '100%',
				display : 'none'
			});
			const srcs = mainGame.get.textures(src) as Array<string> | undefined ?? ['', ''];
			img.src = srcs[0];
			img.addEventListener('mouseenter', () => {
				img.src = srcs[1];
			});
			img.addEventListener('mouseout', () => {
				img.src = srcs[0];
			});
			btn.appendChild(img);
		}
		dom.appendChild(btn);
		return new CSS.CSS3DObject(dom);
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
			},
			btn: () : void => {
				(this.three.element.children[3] as HTMLElement).style.display = 'flex';
				setTimeout(() => {
					Object.assign((this.three.element.children[3] as HTMLElement).style, {
						opacity : '1',
						top : '-50px'
					});
				}, 50);
			}
		},
		off : {
			info : () : void => {
				(this.three.element.children[2] as HTMLElement).style.opacity = '0';
			},
			atk : () : void => {
				(this.three.element.children[1] as HTMLElement).style.opacity = '0';
			},
			btn: () : void => {
				Object.assign((this.three.element.children[3] as HTMLElement).style, {
					opacity : '0',
					top : '0px'
				});
				setTimeout(() => {
					(this.three.element.children[3] as HTMLElement).style.display = 'none';
				}, 200);
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
		const pos = (this.three.element.children[0] as HTMLImageElement).src === mainGame.get.textures(CONSTANT.FILES.TEXTURE_COVER) ?
			rotation ? POS.FACEDOWN_ATTACK : POS.FACEDOWN_DEFENSE : rotation ? POS.FACEUP_ATTACK : POS.FACEUP_DEFENSE;
		return pos;
	}

	activatable = {
		desc : [] as Array<{desc : number; flag : number;}>,
		flag : 0,
		on : (i : number | {desc : number; flag : number;} | undefined) => {
			if (i === undefined) return;
			typeof i === 'number' ? (() => {
				if (i > 0)
					this.activatable.flag |= i;
			})() : (() => {
				if (i.flag === EDESC.NONE) {
					const flags = new Map([
						[1160, COMMAND.SCALE]
					]);
					this.activatable.flag |= flags.get(i.desc) ?? COMMAND.ACTIVATE;
				}
			})()
			const style = (this.three.element.children[0] as HTMLElement).style;
			style.boxShadow = `0 0 8px ${
				(this.activatable.flag & (COMMAND.ACTIVATE + COMMAND.SPSUMMON + COMMAND.PSUMMON + COMMAND.SCALE)) > 0 ?
					'yellow' : (this.activatable.flag > 0 ? 'rgba(119, 166, 255, 1)' : 'initial')
			}`;
			const map = new Map([
				[COMMAND.ACTIVATE, 'activate'],
				[COMMAND.ATTACK, 'attack'],
				[COMMAND.MSET, 'mset'],
				[COMMAND.SSET, 'sset'],
				[COMMAND.REPOS, 'pos_attack'],
				[COMMAND.REPOS, 'pos_defence'],
				[COMMAND.SUMMON, 'summon'],
				[COMMAND.PSUMMON, 'psummon'],
				[COMMAND.SPSUMMON, 'spsummon'],
				[COMMAND.SCALE, 'scale']
			]);
			for (const [_, i] of Object.entries(COMMAND)) {
				if (!map.has(i))
					continue;
				const btn = this.three.element.children[3].querySelector(`.${map.get(i)!}`)! as HTMLElement;
				btn.style.display = (this.activatable.flag & i) === i ? 'initial' : 'none';
			}
		},
		clear : () => {
			this.activatable.flag = 0;
			const style = (this.three.element.children[0] as HTMLElement).style;
			style.boxShadow = 'initial';
			(Array.from(this.three.element.children[3].children) as Array<HTMLElement>).forEach(btn => {
				btn.style.display = 'none';
			});
		},
	};
}

export default Client_Card;